#!/usr/bin/env npx tsx
/**
 * ingest-vault.ts — Chunks markdown files from docs/ directory,
 * generates OpenAI embeddings, and stores them in PostgreSQL via Prisma (pgvector).
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required");
  process.exit(1);
}

const prisma = new PrismaClient();
const DOCS_DIRS = [
  path.join(process.cwd(), "docs"),
  path.join(process.cwd(), "data", "sample-vault"),
];
const CHUNK_SIZE = 500; // ~500 tokens ≈ 2000 chars
const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 20; // embeddings per API call

interface Chunk {
  id: string;
  filename: string;
  title: string;
  content: string;
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
      const maxChars = CHUNK_SIZE * 4;
      for (let i = 0; i < trimmed.length; i += maxChars) {
        const segment = trimmed.slice(i, i + maxChars);
        chunks.push({
          id: `${filename}-${chunkIdx++}`,
          filename,
          title: currentTitle,
          content: segment,
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
  // Read from all configured directories, dedup by filename
  const seenFiles = new Set<string>();
  const allChunks: Chunk[] = [];

  for (const docsDir of DOCS_DIRS) {
    if (!fs.existsSync(docsDir)) {
      console.log(`📂 Skipping (not found): ${docsDir}`);
      continue;
    }
    console.log(`📂 Reading files from ${docsDir}...`);
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      if (seenFiles.has(file)) {
        console.log(`  ⏭️  Skipping duplicate: ${file}`);
        continue;
      }
      seenFiles.add(file);
      const content = fs.readFileSync(path.join(docsDir, file), "utf-8");
      const chunks = chunkMarkdown(file, content);
      allChunks.push(...chunks);
      console.log(`  ${file}: ${chunks.length} chunks`);
    }
  }

  if (allChunks.length === 0) {
    console.error("No markdown files found in any directory");
    process.exit(1);
  }

  console.log(`\n🧩 Total chunks: ${allChunks.length}`);
  console.log("🔢 Generating embeddings...");

  // Process in batches
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => `${c.title}\n${c.content}`);
    const embeddings = await getEmbeddings(texts);
    allEmbeddings.push(...embeddings);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)} done`);
  }

  console.log("\n💾 Storing in database...");

  // Clear existing data
  await prisma.documentSection.deleteMany();

  // Insert chunks with embeddings using raw SQL for vector type
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const embedding = allEmbeddings[i];
    const vectorStr = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "DocumentSection" (id, content, embedding, metadata, source)
       VALUES ($1, $2, $3::vector, $4::jsonb, $5)`,
      chunk.id,
      chunk.content,
      vectorStr,
      JSON.stringify({ title: chunk.title, filename: chunk.filename }),
      chunk.filename
    );
  }

  console.log(`\n✅ Ingested ${allChunks.length} document sections into database`);
  console.log(`   ${allEmbeddings[0]?.length} dimensions per embedding`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
