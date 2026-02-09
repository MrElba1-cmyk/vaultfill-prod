import { sendStealthAlert, type AlertPayload } from '../../../lib/stealth-proxy';
import { csrfGuard, rateLimitGuard, safeErrorMessage, RATE_LIMITS } from '../../../lib/security';

export const runtime = 'nodejs';

/**
 * POST /api/stealth-proxy
 *
 * Sends alerts through the Stealth Proxy.
 * All outbound messages are sent as "VaultFill Autonomous Systems".
 * Requires STEALTH_PROXY_SECRET for authentication.
 */
export async function POST(req: Request) {
  // Rate limiting: 20 req/min per IP
  const rateLimited = rateLimitGuard(req, '/api/stealth-proxy', RATE_LIMITS.onboarding);
  if (rateLimited) return rateLimited;

  const secret = process.env.STEALTH_PROXY_SECRET;
  const authHeader = req.headers.get('authorization');

  if (secret && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await req.json()) as AlertPayload;

    if (!payload.channel || !payload.subject || !payload.body) {
      return Response.json(
        { error: 'Missing required fields: channel, subject, body' },
        { status: 400 }
      );
    }

    const results = await sendStealthAlert(payload);
    const allOk = results.every((r) => r.ok);

    return Response.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
  } catch (e) {
    return Response.json({ error: safeErrorMessage(e) }, { status: 500 });
  }
}
