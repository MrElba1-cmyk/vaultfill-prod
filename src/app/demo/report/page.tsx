'use client';

import { useEffect, useMemo, useState } from 'react';

type DemoReport = {
  ok?: boolean;
  complianceScore?: number;
  highlights?: string[];
  gaps?: string[];
  files?: Array<{ filename: string; sourceType?: string; pageCount?: number; warning?: string }>;
};

type DeepAnalysis = {
  ok?: boolean;
  unifiedTruthScore?: number;
  sourceA?: { filename: string; pageCount?: number };
  sourceB?: { filename: string; pageCount?: number };
  rows?: Array<{
    finding: string;
    sourceAValue: string;
    sourceBValue: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'VERIFIED' | 'REMEDIATION REQUIRED';
    reconciledLanguage?: string;
  }>;
  error?: string;
};

export default function DemoReportPage() {
  const [tab, setTab] = useState<'report' | 'analysis'>('report');
  const [report, setReport] = useState<DemoReport | null>(null);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vaultfill_demo_report');
      if (raw) setReport(JSON.parse(raw));
    } catch {
      setReport(null);
    }

    try {
      const rawA = localStorage.getItem('vaultfill_deep_analysis');
      if (rawA) setAnalysis(JSON.parse(rawA));
    } catch {
      setAnalysis(null);
    }
  }, []);

  const score = report?.complianceScore;

  const summary = useMemo(() => {
    if (!report || typeof score !== 'number') return null;
    if (score >= 90) return 'Strong baseline controls present. Focus on evidence + cadence to harden auditability.';
    if (score >= 75) return 'Moderate baseline controls. Prioritize encryption scope, logging cadence, and IR artifacts.';
    return 'Insufficient coverage. Upload core policies for access control, encryption, logging, and incident response.';
  }, [report, score]);

  async function runDeepAnalysis() {
    setAnalysisLoading(true);
    try {
      const resp = await fetch('/api/analysis/deep', { method: 'POST' });
      const json = (await resp.json().catch(() => ({}))) as DeepAnalysis;
      setAnalysis(json);
      try {
        localStorage.setItem('vaultfill_deep_analysis', JSON.stringify(json));
      } catch {
        // ignore
      }
      setTab('analysis');
    } finally {
      setAnalysisLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 backdrop-blur-xl shadow-[var(--shadow-natural)]">
        <p className="text-xs tracking-widest text-[var(--muted-2)] font-bold uppercase">DEMO OUTPUT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--fg)]">Executive Remediation Report</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Generated from your uploaded artifacts. Demo-grade heuristics — not a compliance attestation.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab('report')}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all ${
              tab === 'report' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'border-[var(--border)] bg-[var(--card-2)] text-[var(--muted)]'
            }`}
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => setTab('analysis')}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all ${
              tab === 'analysis'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'border-[var(--border)] bg-[var(--card-2)] text-[var(--muted)]'
            }`}
          >
            Analysis
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => void runDeepAnalysis()}
            disabled={analysisLoading}
            className="rounded-2xl bg-emerald-500 px-6 py-2 text-sm font-bold text-black shadow-[0_0_30px_rgba(52,211,153,0.25)] disabled:opacity-60 hover:bg-emerald-400 transition-colors"
          >
            {analysisLoading ? 'Running Deep Analysis…' : 'Run Deep Analysis'}
          </button>
        </div>

        {tab === 'report' ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 sm:p-5">
                <div className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-300 uppercase">COMPLIANCE SCORE</div>
                <div className="mt-2 text-4xl font-semibold tracking-tight text-[var(--fg)]">
                  {typeof score === 'number' ? `${score}/100` : '—'}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {summary || 'Upload artifacts from /demo to generate a score.'}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 sm:p-5">
                <div className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-300 uppercase">FILES INGESTED</div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  {report?.files?.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {report.files.slice(0, 6).map((f) => (
                        <li key={f.filename} className="text-[var(--fg)]">
                          {f.filename}
                          {f.warning ? <span className="text-amber-500 font-medium"> (warning)</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--fg)]">
              <section>
                <h2 className="text-lg font-bold tracking-tight border-b border-[var(--border)] pb-2 mb-4">1) Highlights</h2>
                {report?.highlights?.length ? (
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
                    {report.highlights.map((h) => (
                      <li key={h} className="pl-2">{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[var(--muted)]">Upload files from /demo to populate highlights.</p>
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold tracking-tight border-b border-[var(--border)] pb-2 mb-4">2) Priority Gaps</h2>
                {report?.gaps?.length ? (
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
                    {report.gaps.map((g) => (
                      <li key={g} className="pl-2">{g}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[var(--muted)]">Upload files from /demo to populate gaps.</p>
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold tracking-tight border-b border-[var(--border)] pb-2 mb-4">3) Next Best Upload</h2>
                <p className="mt-2 text-[var(--muted)]">
                  Add one artifact that proves operational cadence (e.g., log review evidence, tabletop IR exercise
                  record, backup/DR test result). This is the fastest way to move from policy language to audit-ready
                  proof.
                </p>
              </section>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 pt-6 border-t border-[var(--border)]">
              <a
                href="/demo"
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] px-6 py-3 text-sm font-bold text-[var(--fg)] hover:bg-[var(--card)] transition-colors"
              >
                Back to Demo
              </a>
              <a
                href="/pricing"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:bg-emerald-400 transition-all"
              >
                Unlock Full Report →
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 sm:p-5 sm:col-span-1">
                <div className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-300 uppercase">UNIFIED TRUTH</div>
                <div className="mt-2 text-4xl font-semibold tracking-tight text-[var(--fg)]">
                  {typeof analysis?.unifiedTruthScore === 'number' ? `${analysis.unifiedTruthScore}/100` : '—'}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Alignment score based on RTO, breach timelines, and audit log retention consistency.
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 sm:p-5 sm:col-span-2">
                <div className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-300 uppercase">ANALYSIS BUFFER</div>
                <div className="mt-2 text-sm text-[var(--muted)] space-y-1">
                  <div>
                    <span className="font-bold text-[var(--fg)]">Source A:</span> {analysis?.sourceA?.filename || 'security-policy.pdf'}
                  </div>
                  <div>
                    <span className="font-bold text-[var(--fg)]">Source B:</span> {analysis?.sourceB?.filename || 'IR-Plan.pdf'}
                  </div>
                  {analysis?.error ? <div className="mt-2 text-rose-600 dark:text-rose-400 font-medium italic">{analysis.error}</div> : null}
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card-2)] shadow-inner">
              <table className="min-w-[880px] w-full text-sm">
                <thead className="bg-[var(--card)] border-b border-[var(--border)]">
                  <tr className="text-left text-xs tracking-widest text-[var(--muted-2)] font-bold uppercase">
                    <th className="p-4">FINDING</th>
                    <th className="p-4">SOURCE A VALUE</th>
                    <th className="p-4">SOURCE B VALUE</th>
                    <th className="p-4">RISK</th>
                    <th className="p-4">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis?.rows?.length ? (
                    analysis.rows.map((r) => (
                      <tr key={r.finding} className="border-t border-[var(--border)] align-top hover:bg-[var(--card)] transition-colors">
                        <td className="p-4 font-bold text-[var(--fg)]">{r.finding}</td>
                        <td className="p-4 text-[var(--muted)]">{r.sourceAValue}</td>
                        <td className="p-4 text-[var(--muted)]">{r.sourceBValue}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${
                              r.riskLevel === 'HIGH'
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                                : r.riskLevel === 'MEDIUM'
                                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300'
                                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                            }`}
                          >
                            {r.riskLevel}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${
                              r.status === 'VERIFIED'
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                                : 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-8 text-[var(--muted)] text-center italic font-medium" colSpan={5}>
                        Click “Run Deep Analysis” to generate contradiction findings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {analysis?.rows?.some((r) => r.status === 'REMEDIATION REQUIRED') ? (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-bold tracking-tight text-[var(--fg)] border-b border-[var(--border)] pb-2">Reconciled Language Suggestions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {(analysis?.rows || [])
                    .filter((r) => r.status === 'REMEDIATION REQUIRED')
                    .map((r) => (
                      <div key={r.finding} className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{r.finding}</div>
                        <div className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap font-medium">{r.reconciledLanguage || '—'}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3 pt-6 border-t border-[var(--border)]">
              <a
                href="/demo"
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] px-6 py-3 text-sm font-bold text-[var(--fg)] hover:bg-[var(--card)] transition-colors"
              >
                Back to Demo
              </a>
              <a
                href="/pricing"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:bg-emerald-400 transition-all"
              >
                Unlock Full Report →
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
