#!/usr/bin/env npx tsx
/**
 * ingest-evidence.ts — Ingest Vanta-style evidence files (PDFs, screenshots, markdown)
 * into the VaultFill vector index. Extends ingest-vault.ts to support non-markdown files.
 *
 * Usage:
 *   npx tsx scripts/ingest-evidence.ts [directory|file...]
 *   npx tsx scripts/ingest-evidence.ts docs/evidence/
 *   npx tsx scripts/ingest-evidence.ts screenshot.png report.pdf
 */
import fs from "fs";
import path from "path";
import {
  extractEvidence,
  chunkEvidence,
  getFileType,
  getSupportedExtensions,
  type EvidenceChunk,
} from "../src/lib/evidence-extractor";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required");
  process.exit(1);
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 20;

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

function collectFiles(inputs: string[]): string[] {
  const files: string[] = [];
  const supported = getSupportedExtensions();

  for (const input of inputs) {
    const resolved = path.resolve(input);
    if (!fs.existsSync(resolved)) {
      console.warn(`⚠️  Not found: ${input}`);
      continue;
    }
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      for (const f of fs.readdirSync(resolved)) {
        const ext = path.extname(f).toLowerCase();
        if (supported.includes(ext)) {
          files.push(path.join(resolved, f));
        }
      }
    } else {
      const ext = path.extname(resolved).toLowerCase();
      if (supported.includes(ext)) {
        files.push(resolved);
      } else {
        console.warn(`⚠️  Unsupported: ${input} (supported: ${supported.join(", ")})`);
      }
    }
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    // Default: look for evidence/ directory, then docs/
    const defaults = ["evidence", "docs/evidence", "data/evidence"];
    const found = defaults.find((d) => fs.existsSync(d));
    if (found) {
      args.push(found);
    } else {
      console.log("Usage: npx tsx scripts/ingest-evidence.ts [directory|file...]");
      console.log(`Supported: ${getSupportedExtensions().join(", ")}`);
      process.exit(0);
    }
  }

  const files = collectFiles(args);
  if (files.length === 0) {
    console.log("No supported evidence files found.");
    process.exit(0);
  }

  console.log(`📂 Found ${files.length} evidence file(s):`);
  files.forEach((f) => console.log(`   ${path.basename(f)} (${getFileType(path.basename(f))})`));

  const allChunks: EvidenceChunk[] = [];
  const errors: string[] = [];

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const buffer = fs.readFileSync(filePath);
    console.log(`\n🔍 Processing: ${filename}...`);

    const result = await extractEvidence(buffer, filename);

    if (result.error) {
      if (!result.text) {
        console.error(`   ❌ ${result.error}`);
        errors.push(`${filename}: ${result.error}`);
        continue;
      }
      console.warn(`   ⚠️  ${result.error}`);
    }

    const chunks = chunkEvidence(filename, result.text, result.sourceType);
    console.log(`   ✅ Extracted ${result.text.length} chars → ${chunks.length} chunks`);
    if (result.pageCount) console.log(`   📄 ${result.pageCount} pages`);
    allChunks.push(...chunks);
  }

  if (allChunks.length === 0) {
    console.error("\n❌ No chunks generated. Check errors above.");
    process.exit(1);
  }

  console.log(`\n🧩 Total chunks: ${allChunks.length}`);
  console.log("🔢 Generating embeddings...");

  const allEmbeddings: number[][] = [];
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => `${c.title}\n${c.content}`);
    const embeddings = await getEmbeddings(texts);
    allEmbeddings.push(...embeddings);
    console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)}`);
  }

  // Merge into vector index
  const indexPath = path.join(process.cwd(), "data", "vector-index.json");
  let existingIndex: any[] = [];
  try {
    existingIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  } catch {}

  // Remove old entries for files we just processed
  const processedFilenames = new Set(files.map((f) => path.basename(f)));
  existingIndex = existingIndex.filter((e: any) => !processedFilenames.has(e.filename));

  // Add new entries
  for (let i = 0; i < allChunks.length; i++) {
    existingIndex.push({
      id: allChunks[i].id,
      filename: allChunks[i].filename,
      title: allChunks[i].title,
      content: allChunks[i].content,
      sourceType: allChunks[i].sourceType,
      embedding: allEmbeddings[i],
    });
  }

  const dataDir = path.dirname(indexPath);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(existingIndex));

  console.log(`\n✅ Ingested ${allChunks.length} evidence chunks into vector index`);
  console.log(`   Total index size: ${existingIndex.length} entries`);
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`   - ${e}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
