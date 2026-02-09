import { NextResponse } from "next/server";

/**
 * Hourly health check cron for:
 * 1. Shield Bot API (/api/chat)
 * 2. SendGrid Identity Proxy (contact@vaultfill.com email sending)
 * 
 * Sends Telegram alerts on failure.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

interface CheckResult {
  service: string;
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  error?: string;
}

async function checkShieldBot(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const url = `${APP_URL}/api/chat`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "health check ping" }),
      signal: AbortSignal.timeout(15000),
    });
    const latencyMs = Date.now() - start;

    if (resp.ok || resp.status === 200) {
      return { service: "Shield Bot API", status: "ok", latencyMs };
    }
    return {
      service: "Shield Bot API",
      status: "degraded",
      latencyMs,
      error: `HTTP ${resp.status}`,
    };
  } catch (err: any) {
    return {
      service: "Shield Bot API",
      status: "down",
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}

async function checkSendGrid(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    return {
      service: "SendGrid Identity Proxy",
      status: "degraded",
      latencyMs: 0,
      error: "SENDGRID_API_KEY not configured",
    };
  }

  try {
    // Verify sender identity exists for contact@vaultfill.com
    const resp = await fetch("https://api.sendgrid.com/v3/verified_senders", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Date.now() - start;

    if (!resp.ok) {
      return {
        service: "SendGrid Identity Proxy",
        status: "down",
        latencyMs,
        error: `HTTP ${resp.status}`,
      };
    }

    const data = await resp.json();
    const verified = data.results?.some(
      (s: any) => s.from_email === "contact@vaultfill.com" && s.verified
    );

    return {
      service: "SendGrid Identity Proxy",
      status: verified ? "ok" : "degraded",
      latencyMs,
      error: verified ? undefined : "contact@vaultfill.com not verified",
    };
  } catch (err: any) {
    return {
      service: "SendGrid Identity Proxy",
      status: "down",
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}

async function telegramAlert(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  }).catch(() => null);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all([checkShieldBot(), checkSendGrid()]);
  const failures = results.filter((r) => r.status !== "ok");

  if (failures.length > 0) {
    const alertLines = failures.map(
      (f) => `🚨 ${f.service}: ${f.status.toUpperCase()} — ${f.error || "unknown"} (${f.latencyMs}ms)`
    );
    await telegramAlert(
      `⚠️ VaultFill Health Alert\n${new Date().toISOString()}\n\n${alertLines.join("\n")}`
    );
  }

  return NextResponse.json({
    ok: failures.length === 0,
    timestamp: new Date().toISOString(),
    checks: results,
  });
}
