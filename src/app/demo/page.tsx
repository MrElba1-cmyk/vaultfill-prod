'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import AINodeIcon from '@/components/icons/AINodeIcon';

type UploadResult = {
  filename: string;
  ok: boolean;
  message?: string;
  error?: string;
  chunksCreated?: number;
  sourceType?: string;
};

type Phase = 'idle' | 'uploading' | 'scanning' | 'mapping' | 'reportReady';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function DemoPage() {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const steps = useMemo(
    () => [
      { key: 'uploading', label: 'Securing upload' },
      { key: 'scanning', label: 'Mock audit: extracting controls' },
      { key: 'mapping', label: 'Mapping to SOC 2 (demo)' },
      { key: 'reportReady', label: 'Sample report ready' },
    ],
    [],
  );

  async function ingestMany(files: File[]): Promise<{ api: any; results: UploadResult[] }> {
    const form = new FormData();
    for (const f of files) form.append('file', f);

    const resp = await fetch('/api/evidence/upload', { method: 'POST', body: form });
    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const err = json?.error || `Upload failed (${resp.status})`;
      return {
        api: { ok: false, error: err },
        results: files.map((f) => ({ filename: f.name, ok: false, error: err })),
      };
    }

    const apiFiles: Array<any> = Array.isArray(json?.files) ? json.files : [];
    const results: UploadResult[] = apiFiles.length
      ? apiFiles.map((f: any) => ({
          filename: f.filename,
          ok: true,
          message: json?.message,
          sourceType: f.sourceType,
        }))
      : files.map((f) => ({ filename: f.name, ok: true, message: json?.message }));

    return { api: json, results };
  }

  async function runMockAudit(files: File[]) {
    setFileNames(files.map((f) => f.name));
    setUploadResults([]);
    setPhase('uploading');

    // Optional “boot-up” click sound (user gesture triggered)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 220;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      o.stop(ctx.currentTime + 0.18);
    } catch {
      // ignore if audio blocked
    }

    await sleep(reduceMotion ? 100 : 350);
    setPhase('scanning');

    const { api, results } = await ingestMany(files);
    setUploadResults(results);

    // Persist a merged report payload for /demo/report
    try {
      localStorage.setItem('vaultfill_demo_report', JSON.stringify(api));
    } catch {
      // ignore
    }

    await sleep(reduceMotion ? 100 : 450);
    setPhase('mapping');
    await sleep(reduceMotion ? 100 : 450);
    setPhase('reportReady');
  }

  return (
    <main className="min-h-screen px-6 py-16 bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      <motion.div
        className="mx-auto max-w-4xl glass-card border border-[var(--border)] shadow-[var(--shadow-natural)]"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="p-1 sm:p-2 relative overflow-hidden">
          <div className="vault-power opacity-20" />
          
          <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="bento-kicker text-[var(--apex-emerald)]">SANDBOX</p>
                <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold text-[var(--fg)]">
                  <span className="text-[var(--apex-emerald)]">
                    <AINodeIcon variant="vault" size={24} glow />
                  </span>
                  Autonomous Compliance Demo
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                  Experience the Emerald Stealth engine. Upload one or more artifacts to trigger a high-fidelity
                  mock audit and generate a merged, board-ready context.
                </p>
              </div>

              <div className="flex flex-col gap-2 min-w-[240px]">
                <div className="text-[10px] font-bold text-[var(--muted-2)] uppercase tracking-widest mb-1">Sample Artifacts</div>
                <a
                  className="inline-flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] transition-all hover:bg-[var(--card)] group"
                  href="/security-policy.pdf"
                  download
                >
                  Security Policy (M6)
                  <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
                <a
                  className="inline-flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] transition-all hover:bg-[var(--card)] group"
                  href="/IR-Plan.pdf"
                  download
                >
                  Incident Response (M6)
                  <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Upload zone */}
              <div className="group relative rounded-3xl border border-[var(--border)] bg-[var(--card-2)] p-8 transition-all hover:border-[var(--apex-emerald)]/40 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--apex-emerald)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--apex-emerald)]/10 border border-[var(--apex-emerald)]/20 shadow-sm">
                      <AINodeIcon variant="upload" size={24} className="text-[var(--apex-emerald)]" glow />
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight text-[var(--fg)] uppercase">Artifact Ingestion</div>
                      <div className="text-xs text-[var(--muted-2)] font-medium">PDF / DOCX / TXT</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mt-8 w-full rounded-2xl bg-[var(--apex-emerald)] py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-[#4ade80] active:scale-[0.98] shadow-[0_10px_40px_rgba(52,211,153,0.3)] cursor-pointer"
                  >
                    Select Evidence Files →
                  </button>
                  <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted-2)]">
                    Multi-file selection enabled
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) void runMockAudit(files);
                    }}
                  />

                  {fileNames.length > 0 && (
                    <div className="mt-4 space-y-2 text-xs text-emerald-700 dark:text-[var(--apex-emerald)] bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold uppercase tracking-tight">Locked: {fileNames.length} artifact(s)</span>
                      </div>
                      <ul className="space-y-1 text-[var(--muted)] font-medium">
                        {fileNames.slice(0, 6).map((n) => (
                          <li key={n} className="truncate">• {n}</li>
                        ))}
                        {fileNames.length > 6 && <li className="italic opacity-60">…and {fileNames.length - 6} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Mock audit */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-2)] p-8 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-sm">
                    <AINodeIcon variant="shield" size={24} className="text-blue-500" glow />
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight text-[var(--fg)] uppercase">Audit Engine Status</div>
                    <div className="text-xs text-[var(--muted-2)] font-medium">
                      {phase === 'idle'
                        ? 'System Standby'
                        : phase === 'reportReady'
                          ? 'Analysis Concluded'
                          : 'Processing Intelligence…'}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {steps.map((s) => {
                    const active = phase === s.key;
                    const done =
                      steps.findIndex((x) => x.key === phase) >
                      steps.findIndex((x) => x.key === s.key);

                    return (
                      <div
                        key={s.key}
                        className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                          active 
                            ? 'border-[var(--apex-emerald)]/30 bg-[var(--card)] shadow-lg' 
                            : 'border-[var(--border)] bg-[var(--bg)]/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                              done
                                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                : active
                                  ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'
                                  : 'bg-[var(--muted-2)] opacity-20'
                            }`}
                          />
                          <span className={`text-sm font-bold ${active ? 'text-[var(--fg)]' : 'text-[var(--muted)]'}`}>
                            {s.label}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--muted-2)] opacity-40'}`}>
                          {done ? 'VERIFIED' : active ? 'SYNCING' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {phase === 'reportReady' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <a
                      href="/demo/report"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--fg)] px-6 py-4 text-sm font-bold text-[var(--bg)] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                      Access Executive Summary →
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
