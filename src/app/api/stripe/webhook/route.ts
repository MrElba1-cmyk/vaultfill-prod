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
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ ok: false, error: 'stripe_not_configured' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ ok: false, error: 'missing_signature' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 400 });
  }

  // Handle subscription checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
    const tier = (session.metadata?.tier || 'core').toLowerCase();

    // NOTE: We avoid schema migrations in the hot path.
    // For now, we persist entitlement into Lead.status in a structured way.
    // Example: status = "paid:core" or "paid:growth".
    if (email) {
      await saveLead({
        email,
        createdAt: new Date().toISOString(),
        source: 'stripe',
        status: `paid:${tier}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
