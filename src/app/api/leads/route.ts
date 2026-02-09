import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { saveLead, type Lead } from "@/lib/leads-db";

type LeadInput = {
  email: string;
  createdAt: string;
  ua?: string;
  monthlyVolume?: "1-5" | "6-20" | "20+";
  currentProcess?: "Manual/Spreadsheets" | "Existing Tool" | "No Process";
  primaryFormats?: "SOC 2" | "SIG" | "DDQ" | "ISO 27001" | "CAIQ" | "Custom";
  role?: "GRC" | "Security" | "Compliance" | "Procurement" | "Other";
  tier?: "tier1" | "tier2" | "tier3";
};

function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@");
  if (at === -1) return "";
  return email.slice(at + 1).trim().toLowerCase();
}

function calculateLeadTier(monthlyVolume?: "1-5" | "6-20" | "20+"): "tier1" | "tier2" | "tier3" {
  if (monthlyVolume === "20+") return "tier1"; // tier1: 20+
  if (monthlyVolume === "6-20") return "tier2"; // tier2: 6-20  
  return "tier3"; // tier3: 1-5 or unknown
}

function guessIndustryFromDomain(domain: string): string {
  const industryKeywords = [
    { keywords: ["bank", "financial", "finance", "credit", "capital"], industry: "Financial Services" },
    { keywords: ["tech", "software", "cloud", "data", "ai", "ml"], industry: "Technology" },
    { keywords: ["health", "medical", "pharma", "bio", "care"], industry: "Healthcare" },
    { keywords: ["energy", "oil", "gas", "power", "electric"], industry: "Energy" },
    { keywords: ["retail", "commerce", "shop", "store"], industry: "Retail" },
    { keywords: ["gov", "government", "state", "federal"], industry: "Government" },
    { keywords: ["edu", "university", "school", "college"], industry: "Education" },
  ];
  
  const lowerDomain = domain.toLowerCase();
  for (const { keywords, industry } of industryKeywords) {
    if (keywords.some(keyword => lowerDomain.includes(keyword))) {
      return industry;
    }
  }
  
  return "Unknown";
}

function buildLinkedInDomainSearch(domain: string) {
  // NOTE: LinkedIn often requires login; still useful as a one-click starting point.
  const q = encodeURIComponent(`${domain} GRC security compliance`);
  return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
}

function buildLinkedInComposeMessage(email: string, domain: string, tier: string, industry: string) {
  const message = `Hi! I noticed you signed up for VaultFill from ${domain}. As a ${industry} professional dealing with security questionnaires, I thought you'd appreciate seeing how we're helping teams like yours reduce questionnaire time by 80%. 

Our RAG-powered system turns your existing policies and audit artifacts into citation-backed responses that reviewers actually trust.

Would you be open to a brief call to see if VaultFill could streamline your compliance workflow?

Best regards,
VaultFill Team`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://www.linkedin.com/messaging/compose/?message=${encodedMessage}`;
}

function isHoustonLocalDomain(domain: string) {
  // Lightweight heuristic + a few known Houston-area targets.
  const known = new Set([
    "pros.com",
    "highradius.com",
    "crowncastle.com",
    "kbr.com",
    "cheniere.com",
    "conocophillips.com",
    "oxy.com",
    "halliburton.com",
    "slb.com",
    "bakerhughes.com",
  ]);
  if (known.has(domain)) return true;
  return domain.includes("houston");
}

async function telegramAlert(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  }).catch(() => null);
}

function isValidEmail(email: string) {
  // pragmatic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      monthlyVolume?: LeadInput["monthlyVolume"];
      currentProcess?: LeadInput["currentProcess"];
      primaryFormats?: LeadInput["primaryFormats"];
      role?: LeadInput["role"];
    };
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const tier = calculateLeadTier(body.monthlyVolume);
    const lead: Lead = {
      email,
      createdAt: new Date().toISOString(),
      ua: req.headers.get("user-agent") ?? undefined,
      monthlyVolume: body.monthlyVolume,
      currentProcess: body.currentProcess,
      primaryFormats: body.primaryFormats,
      role: body.role,
      tier,
      source: "web",
    };

    // DATABASE-FIRST: Write to secure database BEFORE any notifications
    try {
      const saved = await saveLead(lead);
      if (!saved) {
        console.warn("[VaultFill] Lead save returned false for:", email);
      }
    } catch (err) {
      console.error("[VaultFill] Lead database write failed:", err);
      // Continue — we still want to attempt notifications
    }

    // Legacy JSON fallback (kept for backward compat, but DB is primary)
    const filePath = path.join(process.cwd(), "data", "leads.json");
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      let existing: LeadInput[] = [];
      try {
        const raw = await fs.readFile(filePath, "utf8");
        existing = JSON.parse(raw || "[]") as LeadInput[];
        if (!Array.isArray(existing)) existing = [];
      } catch { existing = []; }
      const next = [lead, ...existing.filter((l) => (l?.email ?? "") !== email)];
      await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf8");
    } catch { /* best effort */ }

    try {
      // Lead alerts (tier2 and tier1) — Telegram Bot API 2.0
      if (lead.tier === "tier1" || lead.tier === "tier2") {
        const domain = getEmailDomain(lead.email);
        const industry = guessIndustryFromDomain(domain);
        const linkedin = buildLinkedInDomainSearch(domain);
        const actionLink = buildLinkedInComposeMessage(lead.email, domain, lead.tier, industry);
        const houstonTag = isHoustonLocalDomain(domain) ? "📍 HOUSTON LOCAL\n" : "";

        const tierEmoji = lead.tier === "tier1" ? "🔥" : "⭐";
        const msg =
          `${houstonTag}${tierEmoji} New VaultFill lead (${lead.tier.toUpperCase()})\n` +
          `Email: ${lead.email}\n` +
          `Volume: ${lead.monthlyVolume}\n` +
          `Tier: ${lead.tier} (${lead.tier === "tier1" ? "20+" : lead.tier === "tier2" ? "6-20" : "1-5"})\n` +
          `Industry: ${industry}\n` +
          `Process: ${lead.currentProcess ?? "(not provided)"}\n` +
          `Formats: ${lead.primaryFormats ?? "(not provided)"}\n` +
          `Role: ${lead.role ?? "(not provided)"}\n\n` +
          `🔍 Search: ${linkedin}\n` +
          `💬 Action: ${actionLink}`;

        await telegramAlert(msg);
      }

      // Optional generic webhook (kept for future)
      if (lead.monthlyVolume === "20+" && process.env.LEAD_ALERT_WEBHOOK_URL) {
        try {
          await fetch(process.env.LEAD_ALERT_WEBHOOK_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              kind: "high-volume-lead",
              email: lead.email,
              monthlyVolume: lead.monthlyVolume,
              currentProcess: lead.currentProcess,
              primaryFormats: lead.primaryFormats,
              createdAt: lead.createdAt,
            }),
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      // Best-effort only
      console.warn("[VaultFill] lead capture write failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
