import { NextResponse } from "next/server";
import { getLeadByEmail, parseBillingTier } from "@/lib/leads-db";

/**
 * Debug endpoint: look up a lead's billing tier by email.
 *
 * Protected by ADMIN_API_KEY, ADMIN_SECRET, or CRON_SECRET.
 *
 * GET /api/admin/lead-tier?email=user@example.com
 *   Header: Authorization: Bearer <secret>
 *
 * Response: { ok, email, billingTier, status }
 */
export async function GET(req: Request) {
  // Accept any of these secrets
  const validSecret =
    process.env.ADMIN_API_KEY ||
    process.env.ADMIN_SECRET ||
    process.env.CRON_SECRET;

  if (!validSecret) {
    return NextResponse.json(
      { error: "No admin/cron secret configured on server" },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${validSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { error: "Missing ?email= query parameter" },
      { status: 400 },
    );
  }

  try {
    const lead = await getLeadByEmail(email);

    if (!lead) {
      return NextResponse.json({
        ok: true,
        email,
        found: false,
        billingTier: "free",
        status: null,
      });
    }

    return NextResponse.json({
      ok: true,
      email,
      found: true,
      billingTier: parseBillingTier(lead.status),
      status: lead.status,
      source: lead.source,
      companyName: lead.companyName || null,
      createdAt: lead.createdAt,
    });
  } catch (err: any) {
    console.error("[admin/lead-tier] Error:", err?.message);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
