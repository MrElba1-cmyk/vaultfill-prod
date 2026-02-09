import { NextResponse } from "next/server";
import {
  extractEvidence,
  chunkEvidence,
  getFileType,
  getSupportedExtensions,
} from "@/lib/evidence-extractor";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMBEDDING_MODEL = "text-embedding-3-small";

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Embeddings error: ${resp.status} ${err}`);
  }
  const data = await resp.json();
  return data.data.map((d: any) => d.embedding);
}

/**
 * POST /api/evidence/upload
 * Accepts multipart form data with an evidence file.
 * Extracts text (PDF/OCR/markdown), chunks, embeds, and stores in vector index.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Send a file via multipart form data." },
        { status: 400 }
      );
    }

    const filename = file.name;
    const fileType = getFileType(filename);

    if (fileType === "unsupported") {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${filename}`,
          supported: getSupportedExtensions(),
        },
        { status: 400 }
      );
    }

    // Size check: 10MB max
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text
    const extraction = await extractEvidence(buffer, filename, file.type);

    if (extraction.error && !extraction.text) {
      return NextResponse.json(
        {
          error: extraction.error,
          sourceType: extraction.sourceType,
        },
        { status: 422 }
      );
    }

    // Chunk the extracted text
    const chunks = chunkEvidence(filename, extraction.text, extraction.sourceType);

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          error: "No meaningful content could be extracted from this file.",
          sourceType: extraction.sourceType,
          warning: extraction.error,
        },
        { status: 422 }
      );
    }

    // Generate embeddings
    const texts = chunks.map((c) => `${c.title}\n${c.content}`);
    let embeddings: number[][] = [];

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-placeholder-key-needs-to-be-set") {
      const BATCH_SIZE = 20;
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await getEmbeddings(batch);
        embeddings.push(...batchEmbeddings);
      }
    }

    // Store in vector index (append to existing JSON index file)
    const fs = await import("fs");
    const path = await import("path");
    const indexPath = path.join(process.cwd(), "data", "vector-index.json");

    let existingIndex: any[] = [];
    try {
      existingIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    } catch {
      // No existing index, start fresh
    }

    // Remove any previous entries from the same file
    existingIndex = existingIndex.filter(
      (entry: any) => entry.filename !== filename
    );

    // Add new entries
    for (let i = 0; i < chunks.length; i++) {
      existingIndex.push({
        id: chunks[i].id,
        filename: chunks[i].filename,
        title: chunks[i].title,
        content: chunks[i].content,
        sourceType: chunks[i].sourceType,
        embedding: embeddings[i] || [],
      });
    }

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(indexPath, JSON.stringify(existingIndex, null, 2));

    return NextResponse.json({
      ok: true,
      filename,
      sourceType: extraction.sourceType,
      pageCount: extraction.pageCount,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddings.length,
      warning: extraction.error, // partial errors (e.g., low confidence OCR)
      message: `Successfully ingested ${filename}: ${chunks.length} chunks indexed.`,
    });
  } catch (error: any) {
    console.error("Evidence upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}
