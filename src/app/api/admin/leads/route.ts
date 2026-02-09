import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leads-db";

/**
 * Private admin endpoint to retrieve leads.
 * Protected by ADMIN_API_KEY — never exposed publicly.
 */
export async function GET(req: Request) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Admin API not configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await getAllLeads();
    return NextResponse.json({ ok: true, count: leads.length, leads });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
