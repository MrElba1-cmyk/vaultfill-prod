/**
 * Lead Capture Database Layer
 * 
 * Uses Vercel Postgres (@vercel/postgres) when POSTGRES_URL is configured.
 * Falls back to append-only JSON file for local dev / hobby plan without DB.
 * 
 * SECURITY: Lead data is NEVER exposed via public APIs or logs.
 * Only the private admin endpoint can read lead data.
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
}

// ---------- Vercel Postgres path ----------

let pgPool: any = null;

async function getPgPool() {
  if (pgPool) return pgPool;
  try {
    const { createPool } = await import("@vercel/postgres");
    pgPool = createPool();
    return pgPool;
  } catch {
    return null;
  }
}

async function ensureLeadsTable(pool: any) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      user_agent TEXT,
      monthly_volume TEXT,
      current_process TEXT,
      primary_formats TEXT,
      role TEXT,
      tier TEXT,
      source TEXT DEFAULT 'web',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function upsertLeadPg(pool: any, lead: Lead): Promise<boolean> {
  await ensureLeadsTable(pool);
  const result = await pool.query(
    `INSERT INTO leads (email, created_at, user_agent, monthly_volume, current_process, primary_formats, role, tier, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email) DO UPDATE SET
       user_agent = EXCLUDED.user_agent,
       monthly_volume = EXCLUDED.monthly_volume,
       current_process = EXCLUDED.current_process,
       primary_formats = EXCLUDED.primary_formats,
       role = EXCLUDED.role,
       tier = EXCLUDED.tier,
       updated_at = NOW()
     RETURNING id`,
    [
      lead.email,
      lead.createdAt,
      lead.ua || null,
      lead.monthlyVolume || null,
      lead.currentProcess || null,
      lead.primaryFormats || null,
      lead.role || null,
      lead.tier || null,
      lead.source || "web",
    ]
  );
  return result.rowCount > 0;
}

async function getAllLeadsPg(pool: any): Promise<Lead[]> {
  await ensureLeadsTable(pool);
  const result = await pool.query(
    "SELECT email, created_at as \"createdAt\", user_agent as ua, monthly_volume as \"monthlyVolume\", current_process as \"currentProcess\", primary_formats as \"primaryFormats\", role, tier FROM leads ORDER BY created_at DESC"
  );
  return result.rows;
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

// ---------- Public API ----------

function hasPostgres(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

/**
 * Save a lead to the database. Returns true on success.
 * Database write happens BEFORE any external notifications.
 */
export async function saveLead(lead: Lead): Promise<boolean> {
  if (hasPostgres()) {
    const pool = await getPgPool();
    if (pool) {
      try {
        return await upsertLeadPg(pool, lead);
      } catch (err) {
        console.error("[LeadDB] Postgres write failed, falling back to JSON:", err);
      }
    }
  }
  return await upsertLeadJson(lead);
}

/**
 * Get all leads (admin only — never expose publicly).
 */
export async function getAllLeads(): Promise<Lead[]> {
  if (hasPostgres()) {
    const pool = await getPgPool();
    if (pool) {
      try {
        return await getAllLeadsPg(pool);
      } catch (err) {
        console.error("[LeadDB] Postgres read failed, falling back to JSON:", err);
      }
    }
  }
  return await getAllLeadsJson();
}
