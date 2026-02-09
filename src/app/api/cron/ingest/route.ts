import { NextResponse } from "next/server";

/**
 * Cron endpoint: Auto-index new vault files.
 * Protected by CRON_SECRET header check.
 * Vercel cron calls this hourly.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Verify cron secret (Vercel automatically sends this for cron jobs)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Dynamic import to avoid bundling issues
    const { autoIndex } = await import("../../../../../scripts/auto-index");
    const result = await autoIndex();
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error("Cron ingest error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
