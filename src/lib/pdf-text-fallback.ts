// Minimal PDF text fallback extractor.
// Purpose: make synthetic/demo PDFs (jsPDF compress:false) extractable in Node/serverless without pdfjs workers.

export function extractPdfTextFallback(buffer: Buffer): string {
  // Read as latin1 so we preserve byte values without UTF-8 decode errors.
  const s = buffer.toString('latin1');

  // Very simple extractor: collect literal strings inside parentheses used by PDF text operators.
  // This works reliably for our jsPDF-generated PDFs with compress:false.
  const out: string[] = [];
  const re = /\((?:\\\\|\\\(|\\\)|[^()])*\)\s*Tj/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const rawWithParens = m[0];
    const inner = rawWithParens.replace(/\)\s*Tj$/, '').replace(/^\(/, '').replace(/\)$/, '');
    const decoded = inner
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    out.push(decoded);
  }

  // Also capture headings that may be emitted without Tj in some generators (best-effort)
  if (out.length === 0) {
    const asciiRuns = s.match(/[\x20-\x7E]{6,}/g) || [];
    for (const run of asciiRuns) out.push(run);
  }

  return out.join('\n').replace(/\s+\n/g, '\n').trim();
}
