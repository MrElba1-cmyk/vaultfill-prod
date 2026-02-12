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
    const files = (formData.getAll("file") as File[]).filter(Boolean);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No file(s) provided. Send one or more files via multipart form data (field name: file)." },
        { status: 400 }
      );
    }

    // Size check: 10MB max per file
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large: ${f.name}. Maximum size is 10MB per file.` },
          { status: 400 }
        );
      }
      const ft = getFileType(f.name);
      if (ft === "unsupported") {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${f.name}`,
            supported: getSupportedExtensions(),
          },
          { status: 400 }
        );
      }
    }

    // Extract + chunk per file (in parallel)
    const extracted = await Promise.all(
      files.map(async (file) => {
        const filename = file.name;
        const buffer = Buffer.from(await file.arrayBuffer());
        const extraction = await extractEvidence(buffer, filename, file.type);
        if (extraction.error && !extraction.text) {
          return { filename, ok: false, error: extraction.error, sourceType: extraction.sourceType, chunks: [] as any[], text: "" };
        }
        const chunks = chunkEvidence(filename, extraction.text, extraction.sourceType);
        return {
          filename,
          ok: chunks.length > 0,
          warning: extraction.error,
          sourceType: extraction.sourceType,
          pageCount: extraction.pageCount,
          chunks,
          text: extraction.text || "",
        };
      })
    );

    const okFiles = extracted.filter((x) => x.ok);
    if (okFiles.length === 0) {
      // Return first error (or generic)
      const first = extracted[0];
      return NextResponse.json(
        { error: first?.error || "No meaningful content could be extracted from the uploaded files." },
        { status: 422 }
      );
    }

    // Merge chunks
    const chunks = okFiles.flatMap((x) => x.chunks);

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

    // Remove any previous entries from the same uploaded files
    const fileNames = okFiles.map((f) => f.filename);
    existingIndex = existingIndex.filter(
      (entry: any) => !fileNames.includes(entry.filename)
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

    // --- Compliance Score (heuristic, demo-only) ---
    const mergedText = okFiles.map((f) => `[[${f.filename}]]\n${f.text}`).join('\n\n');
    const lower = mergedText.toLowerCase();
    const signals: Array<{ key: string; label: string; weight: number; hit: boolean }> = [
      { key: 'mfa', label: 'MFA / strong auth', weight: 12, hit: /\bmfa\b|multi-factor|2fa/.test(lower) },
      { key: 'rbac', label: 'RBAC / least privilege', weight: 10, hit: /rbac|least privilege|role-based/.test(lower) },
      { key: 'encrypt_rest', label: 'AES-256 at rest', weight: 14, hit: /aes-256|aes256|encryption at rest/.test(lower) },
      { key: 'encrypt_transit', label: 'TLS in transit', weight: 10, hit: /tls\s*1\.3|tls|encryption in transit/.test(lower) },
      { key: 'logging', label: 'Logging/monitoring', weight: 10, hit: /logging|monitoring|alerting|siem/.test(lower) },
      { key: 'ir', label: 'Incident response', weight: 12, hit: /incident response|tabletop|containment/.test(lower) },
      { key: 'backup', label: 'Backups/DR', weight: 8, hit: /backup|disaster recovery|bcp|continuity/.test(lower) },
      { key: 'vendor', label: 'Vendor management', weight: 8, hit: /vendor|third party|subprocessor/.test(lower) },
      { key: 'retention', label: 'Retention/minimization', weight: 8, hit: /retention|minimization|purpose limitation/.test(lower) },
      { key: 'audit', label: 'Auditability', weight: 8, hit: /audit trail|auditability|evidence/.test(lower) },
    ];

    const base = 40;
    const earned = signals.filter((s) => s.hit).reduce((sum, s) => sum + s.weight, 0);
    const score = Math.min(100, base + earned);

    const missing = signals.filter((s) => !s.hit).slice(0, 4).map((s) => s.label);
    const highlights = signals.filter((s) => s.hit).slice(0, 5).map((s) => s.label);

    return NextResponse.json({
      ok: true,
      files: okFiles.map((f) => ({ filename: f.filename, sourceType: f.sourceType, pageCount: f.pageCount, warning: f.warning })),
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddings.length,
      complianceScore: score,
      highlights,
      gaps: missing,
      message: `Successfully ingested ${okFiles.length} file(s): ${chunks.length} chunks indexed.`,
    });
  } catch (error: any) {
    console.error("Evidence upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}
