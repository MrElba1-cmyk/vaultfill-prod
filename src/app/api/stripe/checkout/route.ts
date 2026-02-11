import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * Create a Stripe Checkout Session (self-serve).
 *
 * ENV (server-only):
 * - STRIPE_SECRET_KEY
 * - STRIPE_PRICE_ID_CORE
 * - STRIPE_PRICE_ID_GROWTH
 * - STRIPE_SUCCESS_URL (optional)
 * - STRIPE_CANCEL_URL (optional)
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const corePriceId = process.env.STRIPE_PRICE_ID_CORE;
  const growthPriceId = process.env.STRIPE_PRICE_ID_GROWTH;

  const body = (await req.json().catch(() => ({}))) as { tier?: 'core' | 'growth'; email?: string; successUrl?: string; cancelUrl?: string };
  const tier = body?.tier || 'core';

  const priceId = tier === 'growth' ? growthPriceId : corePriceId;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { ok: false, error: 'stripe_not_configured' },
      { status: 400 },
    );
  }

  // Use the SDK's pinned API version type.
  const stripe = new Stripe(secretKey);

  const origin = req.headers.get('origin') || 'https://vaultfill.com';
  const successUrl = body?.successUrl || process.env.STRIPE_SUCCESS_URL || `${origin}/?checkout=success`;
  const cancelUrl = body?.cancelUrl || process.env.STRIPE_CANCEL_URL || `${origin}/?checkout=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: body?.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: { tier },
  });

  return NextResponse.json({ ok: true, url: session.url });
}
