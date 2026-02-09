/**
 * Vector similarity search — pgvector via Prisma (primary) with JSON fallback.
 */
import fs from "fs";
import path from "path";

export interface SearchResult {
  title: string;
  content: string;
  filename: string;
  score: number;
}

// ---------- Embedding helper ----------

async function getQueryEmbedding(query: string): Promise<number[]> {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
    }),
  });
  if (!resp.ok) throw new Error(`Embedding API error: ${resp.status}`);
  const data = await resp.json();
  return data.data[0].embedding;
}

// ---------- pgvector path ----------

async function searchPgVector(query: string, topK: number): Promise<SearchResult[]> {
  const { prisma } = await import("./db");
  const embedding = await getQueryEmbedding(query);
  const vectorStr = `[${embedding.join(",")}]`;

  const rows = await prisma.$queryRawUnsafe<
    { content: string; source: string; metadata: any; similarity: number }[]
  >(
    `SELECT content, source, metadata,
            1 - (embedding <=> $1::vector) as similarity
     FROM "DocumentSection"
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    vectorStr,
    topK
  );

  return rows
    .filter((r) => r.similarity > 0.3)
    .map((r) => ({
      title: r.metadata?.title || r.source,
      content: r.content,
      filename: r.metadata?.filename || r.source,
      score: r.similarity,
    }));
}

// ---------- JSON fallback path ----------

interface VectorEntry {
  id: string;
  filename: string;
  title: string;
  content: string;
  embedding: number[];
}

let cachedIndex: VectorEntry[] | null = null;

function loadIndex(): VectorEntry[] {
  if (cachedIndex) return cachedIndex;
  const indexPath = path.join(process.cwd(), "data", "vector-index.json");
  try {
    cachedIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    return cachedIndex!;
  } catch {
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchJsonFallback(query: string, topK: number): Promise<SearchResult[]> {
  const index = loadIndex();
  if (index.length === 0) return [];
  const queryEmb = await getQueryEmbedding(query);

  return index
    .map((entry) => ({
      title: entry.title,
      content: entry.content,
      filename: entry.filename,
      score: cosineSimilarity(queryEmb, entry.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.3);
}

// ---------- Public API ----------

function hasPgVector(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function semanticSearch(query: string, topK = 6): Promise<SearchResult[]> {
  if (hasPgVector()) {
    try {
      return await searchPgVector(query, topK);
    } catch (err) {
      console.error("pgvector search failed, falling back to JSON:", err);
    }
  }
  return searchJsonFallback(query, topK);
}
