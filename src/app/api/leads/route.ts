/**
 * /api/leads — Lead capture REST endpoint
 *
 * POST: Record a new lead (email required, company/name optional)
 * GET:  List all leads (admin, requires ADMIN_API_KEY header)
 */

import { recordLead, getAllLeads, type Lead } from '../../../lib/leads';
import { rateLimitGuard, RATE_LIMITS } from '../../../lib/security/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const limited = rateLimitGuard(req, 'chat', RATE_LIMITS.chat);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { email, company, name, sessionId } = body as Partial<Lead>;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const isNew = recordLead({
      email: email.trim().toLowerCase(),
      company: company || undefined,
      name: name || undefined,
      sessionId: sessionId || 'api',
      capturedAt: Date.now(),
      source: 'api',
    });

    return Response.json({ ok: true, isNew }, { status: isNew ? 201 : 200 });
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const key = req.headers.get('x-admin-api-key');
  const expected = process.env.ADMIN_API_KEY;

  if (!expected || key !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ leads: getAllLeads() });
}
