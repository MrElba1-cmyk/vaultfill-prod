/**
 * Lead Capture Database Layer — Prisma-backed
 * 
 * Uses Prisma with PostgreSQL as the primary store.
 * Falls back to append-only JSON file when DATABASE_URL is not configured.
 * 
 * SECURITY: Lead data is NEVER exposed via public APIs or logs.
 */
import { promises as fs } from "fs";
import path from "path";

export interface Lead {
  email: string;
  createdAt: string;
  ua?: string;
  monthlyVolume?: string;
  currentProcess?: string;
  primaryFormats?: string;
  role?: string;
  tier?: string;
  source?: string;
  companyName?: string;
  status?: string;
}

// ---------- Prisma path ----------

async function getPrisma() {
  try {
    const { prisma } = await import("./db");
    return prisma;
  } catch {
    return null;
  }
}

async function upsertLeadPrisma(lead: Lead): Promise<boolean> {
  const prisma = await getPrisma();
  if (!prisma) return false;

  await prisma.lead.upsert({
    where: { email: lead.email },
    create: {
      email: lead.email,
      createdAt: new Date(lead.createdAt),
      userAgent: lead.ua || null,
      monthlyVolume: lead.monthlyVolume || null,
      currentProcess: lead.currentProcess || null,
      primaryFormats: lead.primaryFormats || null,
      role: lead.role || null,
      tier: lead.tier || null,
      source: lead.source || "web",
      companyName: lead.companyName || null,
      status: lead.status || "new",
    },
    update: {
      userAgent: lead.ua || undefined,
      monthlyVolume: lead.monthlyVolume || undefined,
      currentProcess: lead.currentProcess || undefined,
      primaryFormats: lead.primaryFormats || undefined,
      role: lead.role || undefined,
      tier: lead.tier || undefined,
      companyName: lead.companyName || undefined,
      status: lead.status || undefined,
    },
  });
  return true;
}

async function getAllLeadsPrisma(): Promise<Lead[]> {
  const prisma = await getPrisma();
  if (!prisma) return [];

  const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    email: r.email,
    createdAt: r.createdAt.toISOString(),
    ua: r.userAgent || undefined,
    monthlyVolume: r.monthlyVolume || undefined,
    currentProcess: r.currentProcess || undefined,
    primaryFormats: r.primaryFormats || undefined,
    role: r.role || undefined,
    tier: r.tier || undefined,
    source: r.source || undefined,
    companyName: r.companyName || undefined,
    status: r.status || undefined,
  }));
}

// ---------- JSON fallback path ----------

const LEADS_PATH = path.join(process.cwd(), "data", "leads-secure.json");

async function upsertLeadJson(lead: Lead): Promise<boolean> {
  await fs.mkdir(path.dirname(LEADS_PATH), { recursive: true });

  let existing: Lead[] = [];
  try {
    const raw = await fs.readFile(LEADS_PATH, "utf8");
    existing = JSON.parse(raw || "[]");
    if (!Array.isArray(existing)) existing = [];
  } catch { /* empty */ }

  const next = [lead, ...existing.filter((l) => l.email !== lead.email)];
  await fs.writeFile(LEADS_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  return true;
}

async function getAllLeadsJson(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(LEADS_PATH, "utf8");
    const data = JSON.parse(raw || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ---------- Single-lead lookup ----------

async function getLeadByEmailPrisma(email: string): Promise<Lead | null> {
  const prisma = await getPrisma();
  if (!prisma) return null;

  const row = await prisma.lead.findUnique({ where: { email } });
  if (!row) return null;

  return {
    email: row.email,
    createdAt: row.createdAt.toISOString(),
    ua: row.userAgent || undefined,
    monthlyVolume: row.monthlyVolume || undefined,
    currentProcess: row.currentProcess || undefined,
    primaryFormats: row.primaryFormats || undefined,
    role: row.role || undefined,
    tier: row.tier || undefined,
    source: row.source || undefined,
    companyName: row.companyName || undefined,
    status: row.status || undefined,
  };
}

async function getLeadByEmailJson(email: string): Promise<Lead | null> {
  const all = await getAllLeadsJson();
  return all.find((l) => l.email === email) || null;
}

// ---------- Billing tier helpers ----------

/**
 * Canonical billing tiers derived from Lead.status.
 * "free" means no paid entitlement detected.
 */
export type BillingTier = "free" | "core" | "growth";

/**
 * Parse a billing tier from the Lead.status string.
 *
 * Convention: status = "paid:<tier>" (e.g. "paid:core", "paid:growth").
 * Anything else (null, "new", etc.) → "free".
 */
export function parseBillingTier(status: string | null | undefined): BillingTier {
  if (!status) return "free";
  const match = status.match(/^paid:(\w+)$/);
  if (!match) return "free";
  const raw = match[1].toLowerCase();
  if (raw === "growth") return "growth";
  if (raw === "core") return "core";
  // Unknown paid tier — treat as core (safe default)
  return "core";
}

// ---------- Public API ----------

function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * Save a lead to the database. Returns true on success.
 * Database write happens BEFORE any external notifications.
 */
export async function saveLead(lead: Lead): Promise<boolean> {
  if (hasDatabase()) {
    try {
      return await upsertLeadPrisma(lead);
    } catch (err) {
      console.error("[LeadDB] Prisma write failed, falling back to JSON:", err);
    }
  }
  return await upsertLeadJson(lead);
}

/**
 * Get all leads (admin only — never expose publicly).
 */
export async function getAllLeads(): Promise<Lead[]> {
  if (hasDatabase()) {
    try {
      return await getAllLeadsPrisma();
    } catch (err) {
      console.error("[LeadDB] Prisma read failed, falling back to JSON:", err);
    }
  }
  return await getAllLeadsJson();
}

/**
 * Fetch a single lead by email. Returns null if not found.
 */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
  const normalized = email.toLowerCase().trim();
  if (hasDatabase()) {
    try {
      return await getLeadByEmailPrisma(normalized);
    } catch (err) {
      console.error("[LeadDB] Prisma lookup failed, falling back to JSON:", err);
    }
  }
  return await getLeadByEmailJson(normalized);
}

/**
 * Convenience: resolve billing tier for an email address.
 * Returns "free" if lead not found or not paid.
 */
export async function getBillingTier(email: string): Promise<BillingTier> {
  const lead = await getLeadByEmail(email);
  return parseBillingTier(lead?.status);
}
