/**
 * evidence-extractor.ts — Extract text from Vanta-style evidence files
 * Supports: PDF (.pdf), Images (.png, .jpg, .jpeg, .webp, .gif)
 * 
 * PDFs: uses pdf-parse for text extraction
 * Images: uses OpenAI Vision API for OCR (serverless-friendly, no native deps)
 */

export interface ExtractionResult {
  text: string;
  sourceType: "pdf" | "image" | "markdown";
  pageCount?: number;
  confidence?: string;
  error?: string;
}

export interface EvidenceChunk {
  id: string;
  filename: string;
  title: string;
  content: string;
  sourceType: string;
}

const SUPPORTED_IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const SUPPORTED_PDF_EXTS = [".pdf"];
const SUPPORTED_MD_EXTS = [".md"];

export function getSupportedExtensions(): string[] {
  return [...SUPPORTED_IMAGE_EXTS, ...SUPPORTED_PDF_EXTS, ...SUPPORTED_MD_EXTS];
}

export function getFileType(filename: string): "pdf" | "image" | "markdown" | "unsupported" {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  if (SUPPORTED_PDF_EXTS.includes(ext)) return "pdf";
  if (SUPPORTED_IMAGE_EXTS.includes(ext)) return "image";
  if (SUPPORTED_MD_EXTS.includes(ext)) return "markdown";
  return "unsupported";
}

/**
 * Extract text from a PDF buffer.
 * Primary: pdf-parse (if it works in the current runtime)
 * Fallback: lightweight binary text extraction for non-compressed jsPDF PDFs.
 */
export async function extractPdfText(buffer: Buffer, filename: string): Promise<ExtractionResult> {
  // Fallback first for our synthetic/demo PDFs to avoid pdfjs worker issues.
  // This keeps /api/analysis/deep stable even when pdf-parse breaks in dev/serverless.
  try {
    const { extractPdfTextFallback } = await import('@/lib/pdf-text-fallback');
    const quick = extractPdfTextFallback(buffer);
    if (quick && /\bRTO\b|Breach Notification|Audit Log Retention/i.test(quick)) {
      return { text: quick, sourceType: 'pdf' };
    }
  } catch {
    // ignore
  }

  try {
    // Some pdfjs builds reference DOMMatrix even when we disable page rendering.
    if (!(globalThis as any).DOMMatrix) {
      (globalThis as any).DOMMatrix = class DOMMatrix {};
    }

    const pdfParseMod = require('pdf-parse');
    const PDFParse = (pdfParseMod?.PDFParse || pdfParseMod?.default?.PDFParse) as any;
    if (!PDFParse) throw new Error('pdf-parse: PDFParse class not found');

    const parser = new PDFParse({ verbosity: 0 });
    await parser.load(buffer);
    const text = (await parser.getText()) || '';
    const info = await parser.getInfo().catch(() => null);
    const pageCount = info?.numpages || info?.pages || undefined;

    if (!text || text.trim().length === 0) {
      return {
        text: '',
        sourceType: 'pdf',
        pageCount,
        error: 'PDF contains no extractable text (may be image-only). Consider converting to image and re-uploading.',
      };
    }

    return {
      text: text.trim(),
      sourceType: 'pdf',
      pageCount,
    };
  } catch (err: any) {
    // Last resort fallback (best effort)
    try {
      const { extractPdfTextFallback } = await import('@/lib/pdf-text-fallback');
      const quick = extractPdfTextFallback(buffer);
      if (quick) return { text: quick, sourceType: 'pdf', error: `Primary PDF extraction failed: ${err.message}` };
    } catch {
      // ignore
    }

    return {
      text: '',
      sourceType: 'pdf',
      error: `PDF extraction failed: ${err.message}`,
    };
  }
}

/**
 * Extract text from an image using OpenAI Vision API (GPT-4o)
 */
export async function extractImageText(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-placeholder-key-needs-to-be-set") {
    return {
      text: "",
      sourceType: "image",
      error: "OpenAI API key required for image OCR via Vision API",
    };
  }

  const mime = mimeType || guessMime(filename);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an OCR specialist. Extract ALL visible text from this compliance/security evidence screenshot.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl, detail: "high" },
              },
              {
                type: "text",
                text: `Extract all text and data from this evidence file: ${filename}`,
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return {
        text: "",
        sourceType: "image",
        error: `Vision API error (${resp.status}): ${errText.slice(0, 200)}`,
      };
    }

    const data = await resp.json();
    const extracted = data.choices?.[0]?.message?.content?.trim() || "";

    return {
      text: extracted,
      sourceType: "image",
      confidence: extracted.length > 50 ? "high" : "low",
    };
  } catch (err: any) {
    return {
      text: "",
      sourceType: "image",
      error: `Image OCR failed: ${err.message}`,
    };
  }
}

/**
 * Extract text from any supported evidence file
 */
export async function extractEvidence(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ExtractionResult> {
  const fileType = getFileType(filename);

  switch (fileType) {
    case "pdf":
      return extractPdfText(buffer, filename);
    case "image":
      return extractImageText(buffer, filename, mimeType);
    case "markdown":
      return { text: buffer.toString("utf-8"), sourceType: "markdown" };
    case "unsupported":
      return {
        text: "",
        sourceType: "markdown",
        error: `Unsupported file type: ${filename}. Supported: ${getSupportedExtensions().join(", ")}`,
      };
  }
}

/**
 * Chunk extracted evidence text into embeddable pieces
 */
export function chunkEvidence(
  filename: string,
  text: string,
  sourceType: string,
  chunkSize = 2000
): EvidenceChunk[] {
  const chunks: EvidenceChunk[] = [];
  if (!text || text.trim().length < 20) return chunks;

  const cleanName = filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
  const lines = text.split("\n");
  let currentTitle = cleanName;
  let currentContent = "";
  let idx = 0;

  function flush() {
    const trimmed = currentContent.trim();
    if (trimmed.length > 30) {
      for (let i = 0; i < trimmed.length; i += chunkSize) {
        chunks.push({
          id: `evidence-${filename}-${idx++}`,
          filename,
          title: currentTitle,
          content: trimmed.slice(i, i + chunkSize),
          sourceType,
        });
      }
      currentContent = "";
    }
  }

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line) || /^[A-Z][A-Z\s]{5,}$/.test(line.trim())) {
      flush();
      currentTitle = line.replace(/^#+\s+/, "").trim() || cleanName;
      currentContent = line + "\n";
    } else {
      currentContent += line + "\n";
    }
  }
  flush();

  return chunks;
}

function guessMime(filename: string): string {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return map[ext] || "image/png";
}
