import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveLead } from '@/lib/leads-db';

export const runtime = 'nodejs';

/**
 * Stripe webhook handler.
 *
 * ENV:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 *
 * Entitlement is stored in Lead.status as "paid:<tier>" (e.g. "paid:growth").
 * No schema migration required — use getBillingTier() from leads-db to read.
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.warn('[stripe:webhook] Missing env: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.warn('[stripe:webhook] Request missing stripe-signature header');
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe:webhook] Signature verification failed:', err?.message);
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
  }

  // Safe structured log — no secrets, no PII beyond obfuscated email
  const obfuscate = (e: string) => {
    const [local, domain] = e.split('@');
    if (!domain) return '***';
    return `${local.slice(0, 2)}***@${domain}`;
  };

  console.log(
    JSON.stringify({
      kind: 'stripe_webhook',
      eventType: event.type,
      eventId: event.id,
      livemode: event.livemode,
      ts: new Date().toISOString(),
    }),
  );

  // Handle subscription checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
    const tier = (session.metadata?.tier || 'core').toLowerCase();
    const status = `paid:${tier}`;

    console.log(
      JSON.stringify({
        kind: 'stripe_checkout_completed',
        email: email ? obfuscate(email) : '(none)',
        tier,
        status,
        sessionMode: session.mode,
        paymentStatus: session.payment_status,
        livemode: event.livemode,
        ts: new Date().toISOString(),
      }),
    );

    if (email) {
      try {
        await saveLead({
          email,
          createdAt: new Date().toISOString(),
          source: 'stripe',
          status,
        });
        console.log(`[stripe:webhook] Lead upserted → status="${status}" for ${obfuscate(email)}`);
      } catch (err: any) {
        console.error('[stripe:webhook] Failed to save lead:', err?.message);
        // Return 500 so Stripe retries
        return NextResponse.json({ ok: false, error: 'db_write_failed' }, { status: 500 });
      }
    } else {
      console.warn('[stripe:webhook] checkout.session.completed but no email found on session');
    }
  }

  return NextResponse.json({ ok: true });
}
