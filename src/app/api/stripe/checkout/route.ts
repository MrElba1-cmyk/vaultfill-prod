import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * Create a Stripe Checkout Session (self-serve).
 *
 * ENV (server-only):
 * - STRIPE_SECRET_KEY
 * - STRIPE_PRICE_ID
 * - STRIPE_SUCCESS_URL (optional)
 * - STRIPE_CANCEL_URL (optional)
 */
export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { ok: false, error: 'stripe_not_configured' },
      { status: 400 },
    );
  }

  // Use the SDK's pinned API version type.
  const stripe = new Stripe(secretKey);

  const origin = req.headers.get('origin') || 'https://vaultfill.com';
  const successUrl = process.env.STRIPE_SUCCESS_URL || `${origin}/?checkout=success`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${origin}/?checkout=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
