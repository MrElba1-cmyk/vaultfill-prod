#!/usr/bin/env npx tsx
/**
 * auto-index.ts — Watches data/sample-vault for new/modified files
 * and triggers re-ingestion only when needed.
 * 
 * Uses a manifest file to track file hashes and skip unchanged files.
 * Can run as: npx tsx scripts/auto-index.ts
 * Or called from the Vercel cron API route.
 */
import fs from "fs";
import crypto from "crypto";
import path from "path";

const VAULT_DIR = path.join(process.cwd(), "data", "sample-vault");
const MANIFEST_PATH = path.join(process.cwd(), "data", "index-manifest.json");
const INDEX_PATH = path.join(process.cwd(), "data", "vector-index.json");
const EMBEDDING_MODEL = "text-embedding-3-small";
const CHUNK_SIZE = 500;

interface ManifestEntry {
  filename: string;
  hash: string;
  indexedAt: string;
  chunkCount: number;
}

interface Manifest {
  lastRun: string;
  files: ManifestEntry[];
}

interface Chunk {
  id: string;
  filename: string;
  title: string;
  content: string;
}

interface VectorEntry {
  id: string;
  filename: string;
  title: string;
  content: string;
  embedding: number[];
}

function fileHash(filepath: string): string {
  const content = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function loadManifest(): Manifest {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return { lastRun: "", files: [] };
  }
}

function saveManifest(manifest: Manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function chunkMarkdown(filename: string, text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const lines = text.split("\n");
  let currentTitle = filename.replace(".md", "");
  let currentContent = "";
  let chunkIdx = 0;
  const maxChars = CHUNK_SIZE * 4;

  function flush() {
    const trimmed = currentContent.trim();
    if (trimmed.length > 50) {
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY required");

  // Batch in groups of 100
  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });
    if (!resp.ok) throw new Error(`Embeddings error: ${resp.status} ${await resp.text()}`);
    const data = await resp.json();
    all.push(...data.data.map((d: any) => d.embedding));
  }
  return all;
}

export async function autoIndex(): Promise<{
  indexed: string[];
  removed: string[];
  unchanged: string[];
  totalChunks: number;
}> {
  const manifest = loadManifest();
  const manifestMap = new Map(manifest.files.map((f) => [f.filename, f]));

  // Scan vault directory
  const currentFiles = fs.readdirSync(VAULT_DIR).filter((f) => f.endsWith(".md"));
  const currentHashes = new Map<string, string>();
  for (const file of currentFiles) {
    currentHashes.set(file, fileHash(path.join(VAULT_DIR, file)));
  }

  // Determine what changed
  const newOrChanged: string[] = [];
  const unchanged: string[] = [];
  for (const [file, hash] of currentHashes) {
    const existing = manifestMap.get(file);
    if (!existing || existing.hash !== hash) {
      newOrChanged.push(file);
    } else {
      unchanged.push(file);
    }
  }

  const removed = manifest.files
    .filter((f) => !currentHashes.has(f.filename))
    .map((f) => f.filename);

  if (newOrChanged.length === 0 && removed.length === 0) {
    console.log("✅ No changes detected. Index is up to date.");
    return { indexed: [], removed: [], unchanged, totalChunks: 0 };
  }

  console.log(`📂 Changes: ${newOrChanged.length} new/modified, ${removed.length} removed`);

  // Load existing index, remove entries for changed/removed files
  let existingIndex: VectorEntry[] = [];
  try {
    existingIndex = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  } catch { /* empty */ }

  const filesToRemove = new Set([...newOrChanged, ...removed]);
  const keptEntries = existingIndex.filter((e) => !filesToRemove.has(e.filename));

  // Chunk and embed new/changed files
  const newChunks: Chunk[] = [];
  const newManifestEntries: ManifestEntry[] = [];

  for (const file of newOrChanged) {
    const content = fs.readFileSync(path.join(VAULT_DIR, file), "utf-8");
    const chunks = chunkMarkdown(file, content);
    newChunks.push(...chunks);
    newManifestEntries.push({
      filename: file,
      hash: currentHashes.get(file)!,
      indexedAt: new Date().toISOString(),
      chunkCount: chunks.length,
    });
    console.log(`  📄 ${file}: ${chunks.length} chunks`);
  }

  let newEntries: VectorEntry[] = [];
  if (newChunks.length > 0) {
    console.log(`🔢 Generating embeddings for ${newChunks.length} chunks...`);
    const texts = newChunks.map((c) => `${c.title}\n${c.content}`);
    const embeddings = await getEmbeddings(texts);
    newEntries = newChunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));
  }

  // Merge and save
  const finalIndex = [...keptEntries, ...newEntries];
  fs.writeFileSync(INDEX_PATH, JSON.stringify(finalIndex, null, 2));

  // Update manifest
  const updatedManifest: Manifest = {
    lastRun: new Date().toISOString(),
    files: [
      ...manifest.files.filter((f) => !filesToRemove.has(f.filename)),
      ...newManifestEntries,
    ],
  };
  saveManifest(updatedManifest);

  console.log(`✅ Index updated: ${finalIndex.length} total entries`);
  return {
    indexed: newOrChanged,
    removed,
    unchanged,
    totalChunks: finalIndex.length,
  };
}

// CLI entry
if (require.main === module) {
  autoIndex()
    .then((r) => console.log("Result:", JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error("❌ Auto-index failed:", e);
      process.exit(1);
    });
}
