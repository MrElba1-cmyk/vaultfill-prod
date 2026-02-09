#!/usr/bin/env npx tsx
/**
 * ingest-vault.ts — Chunks markdown files from data/sample-vault into ~500-token segments,
 * generates OpenAI embeddings, and writes a vector index JSON file.
 */

import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required");
  process.exit(1);
}

const VAULT_DIR = path.join(process.cwd(), "data", "sample-vault");
const INDEX_PATH = path.join(process.cwd(), "data", "vector-index.json");
const CHUNK_SIZE = 500; // ~500 tokens ≈ 2000 chars
const EMBEDDING_MODEL = "text-embedding-3-small";

interface Chunk {
  id: string;
  filename: string;
  title: string;
  content: string;
  charCount: number;
}

interface VectorEntry {
  id: string;
  filename: string;
  title: string;
  content: string;
  embedding: number[];
}

function chunkMarkdown(filename: string, text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const lines = text.split("\n");
  let currentTitle = filename.replace(".md", "");
  let currentContent = "";
  let chunkIdx = 0;

  function flush() {
    const trimmed = currentContent.trim();
    if (trimmed.length > 50) {
      // ~4 chars per token, so 500 tokens ≈ 2000 chars
      const maxChars = CHUNK_SIZE * 4;
      for (let i = 0; i < trimmed.length; i += maxChars) {
        const segment = trimmed.slice(i, i + maxChars);
        chunks.push({
          id: `${filename}-${chunkIdx++}`,
          filename,
          title: currentTitle,
          content: segment,
          charCount: segment.length,
        });
      }
      currentContent = "";
    }
  }

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      flush();
      currentTitle = line.replace(/^#+\s+/, "").trim();
      currentContent = line + "\n";
    } else {
      currentContent += line + "\n";
    }
  }
  flush();
  return chunks;
}

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI embeddings error: ${resp.status} ${err}`);
  }
  const data = await resp.json();
  return data.data.map((d: any) => d.embedding);
}

async function main() {
  console.log("📂 Reading vault files...");
  const files = fs.readdirSync(VAULT_DIR).filter((f) => f.endsWith(".md"));
  console.log(`  Found ${files.length} files: ${files.join(", ")}`);

  const allChunks: Chunk[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(VAULT_DIR, file), "utf-8");
    const chunks = chunkMarkdown(file, content);
    allChunks.push(...chunks);
    console.log(`  ${file}: ${chunks.length} chunks`);
  }

  console.log(`\n🧩 Total chunks: ${allChunks.length}`);
  console.log("🔢 Generating embeddings...");

  const texts = allChunks.map((c) => `${c.title}\n${c.content}`);
  const embeddings = await getEmbeddings(texts);

  const index: VectorEntry[] = allChunks.map((chunk, i) => ({
    id: chunk.id,
    filename: chunk.filename,
    title: chunk.title,
    content: chunk.content,
    embedding: embeddings[i],
  }));

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✅ Vector index written to ${INDEX_PATH}`);
  console.log(`   ${index.length} entries, ${embeddings[0]?.length} dimensions each`);
}

main().catch(console.error);
