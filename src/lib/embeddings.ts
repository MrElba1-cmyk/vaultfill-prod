/**
 * pgvector-ready Embedding & RAG Engine
 *
 * Strategy: Uses OpenAI embeddings for semantic search.
 * - When DATABASE_URL with pgvector is available → uses Postgres
 * - Otherwise → in-memory cosine similarity (zero-config fallback)
 *
 * This gives us high-precision RAG that's pgvector-ready from day one.
 */

import { openai } from '@ai-sdk/openai';
import { embedMany, embed } from 'ai';
import fs from 'node:fs/promises';
import path from 'node:path';

export type EmbeddedChunk = {
  id: string;
  source: string;
  content: string;
  embedding: number[];
};

let vectorStore: EmbeddedChunk[] | null = null;
let pgPool: any = null;
let usePg = false;

// ---------- pgvector setup ----------

async function initPgVector(): Promise<boolean> {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) return false;

  try {
    const { Pool } = await import('pg' as any);
    pgPool = new Pool({ connectionString: connStr, max: 5 });

    await pgPool.query('CREATE EXTENSION IF NOT EXISTS vector');
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS vault_embeddings (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536) NOT NULL
      )
    `);
    await pgPool.query(`
      CREATE INDEX IF NOT EXISTS vault_embeddings_hnsw_idx
      ON vault_embeddings USING hnsw (embedding vector_cosine_ops)
    `);

    console.log('[RAG] pgvector connected');
    return true;
  } catch (e) {
    console.warn('[RAG] pgvector unavailable, falling back to in-memory:', (e as Error).message);
    return false;
  }
}

// ---------- text chunking ----------

function splitIntoChunks(text: string, maxChars = 800, overlap = 150): string[] {
  const clean = text.trim();
  if (!clean) return [];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars);
    out.push(clean.slice(i, end));
    if (end === clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return out;
}

// ---------- embedding ----------

async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  });
  return embeddings;
}

async function embedSingle(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

// ---------- cosine similarity ----------

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

// ---------- load & index knowledge vault ----------

async function loadAndIndex(): Promise<void> {
  const candidates = [
    path.join(process.cwd(), 'data', 'sample-vault'),
    path.join(process.cwd(), 'vaultfill', 'data', 'sample-vault'),
  ];

  let vaultDir: string | null = null;
  for (const c of candidates) {
    try {
      if ((await fs.stat(c)).isDirectory()) { vaultDir = c; break; }
    } catch { /* skip */ }
  }

  if (!vaultDir) { vectorStore = []; return; }

  const entries = await fs.readdir(vaultDir);
  const files = entries.filter(f => f.endsWith('.md') || f.endsWith('.txt'));

  const allChunks: { id: string; source: string; content: string }[] = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(vaultDir, file), 'utf8');
    const parts = splitIntoChunks(raw.replace(/\r\n/g, '\n'));
    parts.forEach((p, idx) => {
      allChunks.push({ id: `${file}:${idx}`, source: file, content: p });
    });
  }

  if (allChunks.length === 0) { vectorStore = []; return; }

  // Batch embed
  const embeddings = await embedTexts(allChunks.map(c => c.content));

  const embedded: EmbeddedChunk[] = allChunks.map((c, i) => ({
    ...c,
    embedding: embeddings[i],
  }));

  if (usePg && pgPool) {
    // Upsert into pgvector
    for (const chunk of embedded) {
      await pgPool.query(
        `INSERT INTO vault_embeddings (id, source, content, embedding)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET content = $3, embedding = $4`,
        [chunk.id, chunk.source, chunk.content, `[${chunk.embedding.join(',')}]`]
      );
    }
    console.log(`[RAG] Indexed ${embedded.length} chunks into pgvector`);
  }

  vectorStore = embedded;
  console.log(`[RAG] Indexed ${embedded.length} chunks in-memory`);
}

// ---------- query ----------

export async function queryKnowledgeVault(query: string, topK = 4): Promise<string> {
  // Lazy init
  if (vectorStore === null) {
    usePg = await initPgVector();
    await loadAndIndex();
  }

  const queryEmb = await embedSingle(query);

  if (usePg && pgPool) {
    try {
      const res = await pgPool.query(
        `SELECT source, content, 1 - (embedding <=> $1::vector) AS score
         FROM vault_embeddings
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [`[${queryEmb.join(',')}]`, topK]
      );
      if (res.rows.length > 0) {
        return res.rows
          .map((r: any) => `SOURCE: ${r.source}\n---\n${r.content.trim()}\n---`)
          .join('\n\n');
      }
    } catch (e) {
      console.warn('[RAG] pgvector query failed, falling back:', (e as Error).message);
    }
  }

  // In-memory fallback
  if (!vectorStore || vectorStore.length === 0) return '';

  const scored = vectorStore
    .map(ch => ({ ch, score: cosine(queryEmb, ch.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(x => x.score > 0.15);

  if (scored.length === 0) return '';

  return scored
    .map(({ ch }) => `SOURCE: ${ch.source}\n---\n${ch.content.trim()}\n---`)
    .join('\n\n');
}
