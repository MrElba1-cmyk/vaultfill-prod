/**
 * Vector similarity search using pre-computed embeddings.
 * Drop-in replacement for keyword search — uses cosine similarity on OpenAI embeddings.
 */
import fs from "fs";
import path from "path";

interface VectorEntry {
  id: string;
  filename: string;
  title: string;
  content: string;
  embedding: number[];
}

export interface SearchResult {
  title: string;
  content: string;
  filename: string;
  score: number;
}

let cachedIndex: VectorEntry[] | null = null;

function loadIndex(): VectorEntry[] {
  if (cachedIndex) return cachedIndex;
  const indexPath = path.join(process.cwd(), "data", "vector-index.json");
  try {
    cachedIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    return cachedIndex!;
  } catch {
    console.error("Vector index not found. Run: npx tsx scripts/ingest-vault.ts");
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

export async function semanticSearch(query: string, topK = 6): Promise<SearchResult[]> {
  const index = loadIndex();
  if (index.length === 0) return [];

  const queryEmb = await getQueryEmbedding(query);

  const scored = index.map((entry) => ({
    title: entry.title,
    content: entry.content,
    filename: entry.filename,
    score: cosineSimilarity(queryEmb, entry.embedding),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.3); // minimum relevance threshold
}
