import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { extractEvidence } from '@/lib/evidence-extractor';
import { buildContradictionRows, DeepAnalysisRow } from '@/lib/deep-analysis';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function suggestReconciledLanguage(args: {
  finding: string;
  sourceAName: string;
  sourceBName: string;
  sourceAValue: string;
  sourceBValue: string;
  sourceASnippet?: string;
  sourceBSnippet?: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-placeholder-key-needs-to-be-set') {
    // Deterministic fallback (still useful for demo)
    return `Reconciled Language (template): Align ${args.finding} across ${args.sourceAName} and ${args.sourceBName}. Choose a single authoritative target, define scope (critical vs non-critical), and state one timeline/retention value with an exception process and approval owner.`;
  }

  const prompt = {
    role: 'system',
    content:
      'You are an enterprise security policy editor. Write reconciled policy language that resolves contradictions between two documents. Output a single concise paragraph suitable for insertion into BOTH documents. Be specific, enforceable, and avoid marketing.'
  };

  const user = {
    role: 'user',
    content:
      `Finding: ${args.finding}\n` +
      `${args.sourceAName} value: ${args.sourceAValue}\n` +
      `${args.sourceBName} value: ${args.sourceBValue}\n\n` +
      `Source A snippet: ${args.sourceASnippet || 'N/A'}\n` +
      `Source B snippet: ${args.sourceBSnippet || 'N/A'}\n\n` +
      'Task: Propose reconciled language that makes the two documents consistent. If one value should be stricter, prefer the stricter value, but include scope qualifiers (e.g., Severity 1 vs baseline) when appropriate.'
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [prompt, user],
      temperature: 0.2,
      max_tokens: 260,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return `Reconciled Language (fallback): Unable to generate via AI (${resp.status}). Align ${args.finding} by selecting a single authoritative value and documenting scope + approval.`;
  }

  const data: any = await resp.json();
  return (data?.choices?.[0]?.message?.content || '').trim() || 'Reconciled Language: (no output)';
}

/**
 * POST /api/analysis/deep
 * Optional multipart form-data with two files: securityPolicy + irPlan.
 * If omitted, loads /public/security-policy.pdf and /public/IR-Plan.pdf.
 */
export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || '';

    let aName = 'security-policy.pdf';
    let bName = 'IR-Plan.pdf';
    let aBuffer: Buffer | null = null;
    let bBuffer: Buffer | null = null;

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const a = form.get('securityPolicy') as File | null;
      const b = form.get('irPlan') as File | null;
      if (a) {
        aName = a.name || aName;
        aBuffer = Buffer.from(await a.arrayBuffer());
      }
      if (b) {
        bName = b.name || bName;
        bBuffer = Buffer.from(await b.arrayBuffer());
      }
    }

    if (!aBuffer) {
      const aPath = path.join(process.cwd(), 'public', 'security-policy.pdf');
      aBuffer = fs.readFileSync(aPath);
    }
    if (!bBuffer) {
      const bPath = path.join(process.cwd(), 'public', 'IR-Plan.pdf');
      bBuffer = fs.readFileSync(bPath);
    }

    const [aExtract, bExtract] = await Promise.all([
      extractEvidence(aBuffer, aName, 'application/pdf'),
      extractEvidence(bBuffer, bName, 'application/pdf'),
    ]);

    if (!aExtract.text || !bExtract.text) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Could not extract text from one or both PDFs.',
          sourceAError: aExtract.error,
          sourceBError: bExtract.error,
        },
        { status: 422 }
      );
    }

    const { rows, unifiedTruthScore } = buildContradictionRows({
      sourceAText: aExtract.text,
      sourceBText: bExtract.text,
      sourceAName: aName,
      sourceBName: bName,
    });

    // AI reconciled language for conflicts only
    const enriched: DeepAnalysisRow[] = [];
    for (const row of rows) {
      if (row.status === 'REMEDIATION REQUIRED') {
        const reconciledLanguage = await suggestReconciledLanguage({
          finding: row.finding,
          sourceAName: aName,
          sourceBName: bName,
          sourceAValue: row.sourceAValue,
          sourceBValue: row.sourceBValue,
          sourceASnippet: row.sourceASnippet,
          sourceBSnippet: row.sourceBSnippet,
        });
        enriched.push({ ...row, reconciledLanguage });
      } else {
        enriched.push(row);
      }
    }

    const payload = {
      ok: true,
      unifiedTruthScore,
      sourceA: { filename: aName, pageCount: aExtract.pageCount },
      sourceB: { filename: bName, pageCount: bExtract.pageCount },
      rows: enriched.map((r) => ({
        finding: r.finding,
        sourceAValue: r.sourceAValue,
        sourceBValue: r.sourceBValue,
        riskLevel: r.riskLevel,
        status: r.status,
        reconciledLanguage: r.reconciledLanguage,
      })),
    };

    // Persistence (Mission 11): save every run for the current Clerk user.
    try {
      const { userId } = await auth();
      if (userId) {
        await prisma.auditRecord.create({
          data: {
            userId,
            score: unifiedTruthScore,
            findings: payload,
          },
        });
      }
    } catch (e) {
      // Non-fatal: analysis still returns; DB may be misconfigured/unreachable.
      console.warn('[deep-analysis] persist skipped:', (e as any)?.message || e);
    }

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('[deep-analysis] error', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Deep analysis failed.' },
      { status: 500 }
    );
  }
}
