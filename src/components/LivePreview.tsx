"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────
   MOCK DATA — self-contained, zero API dependency
   ───────────────────────────────────────────────────────────────────── */

const DOCS = [
  {
    id: "soc2",
    name: "SOC2_Type2_Report_v2.pdf",
    size: "2.4 MB",
    pages: 48,
  },
  {
    id: "iso27001",
    name: "ISO27001_Policy.pdf",
    size: "1.1 MB",
    pages: 32,
  },
  {
    id: "privacy",
    name: "Global_Privacy_Policy.pdf",
    size: "840 KB",
    pages: 18,
  },
];

interface FieldDef {
  id: string;
  label: string;
  answer: string;
  citation: string;
}

const FIELDS: FieldDef[] = [
  {
    id: "roles",
    label: "Information Security roles & responsibilities",
    answer:
      "A dedicated CISO reports to the CEO. Security roles are defined in §3.1 of the ISMS policy with annual review.",
    citation: "ISO27001_Policy.pdf § 3.1",
  },
  {
    id: "asset",
    label: "Asset management & classification",
    answer:
      "All assets are classified (Public, Internal, Confidential, Restricted) with owners assigned in the CMDB.",
    citation: "SOC2_Type2_Report_v2.pdf § 5.4",
  },
  {
    id: "access",
    label: "Access control & identity management",
    answer:
      "RBAC with SSO/MFA enforced for all systems. Access reviews are performed quarterly per SOC 2 CC6.1.",
    citation: "SOC2_Type2_Report_v2.pdf § CC6.1",
  },
  {
    id: "audit",
    label: "Evidence & audit trail",
    answer:
      "Immutable audit logs retained 12 months. SIEM alerts on anomalous access. Annual external penetration tests.",
    citation: "SOC2_Type2_Report_v2.pdf § CC7.2",
  },
];

/* ─────────────────────────────────────────────────────────────────────
   PHASE DEFINITIONS — the 4-act story
   ───────────────────────────────────────────────────────────────────── */

type Phase = "upload" | "extract" | "draft" | "cite";

const PHASES: { key: Phase; label: string; microcopy: string; duration: number }[] = [
  {
    key: "upload",
    label: "Upload",
    microcopy: "Uploading evidence to Knowledge Vault…",
    duration: 2000,
  },
  {
    key: "extract",
    label: "Extract",
    microcopy: "AI extracting security controls…",
    duration: 2200,
  },
  {
    key: "draft",
    label: "Draft",
    microcopy: "Drafting evidence-backed responses…",
    duration: 2800,
  },
  {
    key: "cite",
    label: "Cite",
    microcopy: "Linking citations to source evidence…",
    duration: 2400,
  },
];

/* ─────────────────────────────────────────────────────────────────────
   MOTION PRESETS — reusable, premium easing
   ───────────────────────────────────────────────────────────────────── */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];

const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };
const springGentle = { type: "spring" as const, stiffness: 200, damping: 24 };

/* ─────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────── */

export default function LivePreview({ onCta }: { onCta: () => void }) {
  const reduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.15, once: false });

  const [activeDoc, setActiveDoc] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("upload");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0); // 0–100 for upload bar
  const [visibleFields, setVisibleFields] = React.useState(0); // 0–4, staggered reveal
  const [typedChars, setTypedChars] = React.useState(0); // typewriter effect
  const [citedCount, setCitedCount] = React.useState(0); // citation chips revealed

  // Start when scrolled into view
  React.useEffect(() => {
    if (inView && !isPlaying) setIsPlaying(true);
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Phase sequencer ─────────────────────────────────────────────── */
  React.useEffect(() => {
    if (!isPlaying) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
      return id;
    };

    // Reset
    setPhase("upload");
    setProgress(0);
    setVisibleFields(0);
    setTypedChars(0);
    setCitedCount(0);

    /* Phase 1 — Upload */
    {
      let p = 0;
      const iv = setInterval(() => {
        if (cancelled) return;
        p = Math.min(p + 2 + Math.random() * 4, 100);
        setProgress(p);
        if (p >= 100) clearInterval(iv);
      }, 40);
      intervals.push(iv);
    }

    /* Phase 2 — Extract (starts after upload duration) */
    const t1 = PHASES[0].duration;
    schedule(() => {
      setPhase("extract");
      // Stagger field labels
      for (let i = 0; i < FIELDS.length; i++) {
        schedule(() => setVisibleFields(i + 1), i * 350);
      }
    }, t1);

    /* Phase 3 — Draft (starts after extract duration) */
    const t2 = t1 + PHASES[1].duration;
    schedule(() => {
      setPhase("draft");
      // Typewriter: type out the longest answer's char count
      const maxLen = Math.max(...FIELDS.map((f) => f.answer.length));
      let charIdx = 0;
      const iv = setInterval(() => {
        if (cancelled) return;
        charIdx += 2;
        setTypedChars(charIdx);
        if (charIdx >= maxLen) clearInterval(iv);
      }, 18);
      intervals.push(iv);
    }, t2);

    /* Phase 4 — Cite (starts after draft duration) */
    const t3 = t2 + PHASES[2].duration;
    schedule(() => {
      setPhase("cite");
      for (let i = 0; i < FIELDS.length; i++) {
        schedule(() => setCitedCount(i + 1), i * 300);
      }
    }, t3);

    /* Loop — advance doc + restart after cite */
    const totalDuration = t3 + PHASES[3].duration;
    schedule(() => {
      setActiveDoc((d) => (d + 1) % DOCS.length);
      // Reset and replay
      setPhase("upload");
      setProgress(0);
      setVisibleFields(0);
      setTypedChars(0);
      setCitedCount(0);
    }, totalDuration + 600);

    // Re-trigger by toggling isPlaying off then on
    const loopId = setTimeout(() => {
      if (!cancelled) {
        setIsPlaying(false);
        requestAnimationFrame(() => setIsPlaying(true));
      }
    }, totalDuration + 700);
    timers.push(loopId);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [isPlaying, activeDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  const doc = DOCS[activeDoc];
  const phaseIndex = PHASES.findIndex((p) => p.key === phase);
  const currentPhase = PHASES[phaseIndex];

  /* ── Reduced motion: show final state statically ──────────────── */
  if (reduceMotion) {
    return (
      <section ref={containerRef} className="py-14 md:py-16">
        <div className="bento-card">
          <SectionHeader onCta={onCta} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <VaultPanel doc={doc} phase="cite" progress={100} />
            <QuestionnairePanel
              phase="cite"
              visibleFields={FIELDS.length}
              typedChars={999}
              citedCount={FIELDS.length}
            />
          </div>
          <Tip />
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-14 md:py-16">
      <div className="bento-card">
        <SectionHeader onCta={onCta} />

        {/* Phase progress indicator */}
        <div className="mt-6 flex items-center gap-1 sm:gap-2">
          {PHASES.map((p, i) => {
            const isActive = i === phaseIndex;
            const isDone = i < phaseIndex;
            return (
              <React.Fragment key={p.key}>
                {i > 0 && (
                  <div
                    className="h-px flex-1 transition-colors duration-500"
                    style={{
                      background: isDone
                        ? "var(--vault-blue)"
                        : "var(--border)",
                    }}
                  />
                )}
                <motion.div
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:py-1.5 sm:text-[11px]"
                  animate={{
                    borderColor: isActive
                      ? "rgba(0,212,255,0.4)"
                      : isDone
                      ? "rgba(52,211,153,0.3)"
                      : "var(--border)",
                    background: isActive
                      ? "rgba(0,212,255,0.08)"
                      : isDone
                      ? "rgba(52,211,153,0.06)"
                      : "transparent",
                    color: isActive
                      ? "var(--vault-blue)"
                      : isDone
                      ? "rgb(52,211,153)"
                      : "var(--muted-2)",
                  }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                >
                  {isDone ? (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  ) : isActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                  )}
                  <span className="hidden sm:inline">{p.label}</span>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Microcopy */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            className="mt-3 text-xs font-medium"
            style={{ color: "var(--vault-blue)" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          >
            {currentPhase.microcopy}
          </motion.p>
        </AnimatePresence>

        {/* Split panels */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 live-preview-container">
          {/* LEFT: Knowledge Vault */}
          <VaultPanel doc={doc} phase={phase} progress={progress} />

          {/* RIGHT: Questionnaire */}
          <QuestionnairePanel
            phase={phase}
            visibleFields={visibleFields}
            typedChars={typedChars}
            citedCount={citedCount}
          />
        </div>

        {/* Flying doc chip — crosses from left to right panel */}
        <AnimatePresence>
          {phase === "upload" && (
            <motion.div
              className="pointer-events-none absolute left-[12%] top-[52%] z-50 sm:left-[18%] md:top-[50%]"
              initial={{ opacity: 0, scale: 0.9, x: 0 }}
              animate={{ opacity: [0, 1, 1, 0], x: [0, 20, 80, 140], scale: [0.9, 1, 1, 0.95] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: EASE_OUT_QUART, times: [0, 0.15, 0.7, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/12 px-3 py-2 text-[11px] font-semibold backdrop-blur-sm"
                style={{
                  color: "var(--vault-blue)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.25), 0 4px 12px rgba(0,0,0,0.15)",
                  willChange: "transform, opacity",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span className="max-w-[160px] truncate">{doc.name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tip />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function SectionHeader({ onCta }: { onCta: () => void }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <div
          className="text-xs font-semibold tracking-[0.18em] uppercase"
          style={{ color: "var(--vault-blue)" }}
        >
          Live Preview
        </div>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-2xl">
          From Knowledge Vault to Questionnaire — in Seconds
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Watch VaultFill map your security evidence to any questionnaire, with
          citations a reviewer can trust.
        </p>
      </div>
      <button
        type="button"
        onClick={onCta}
        className="group relative mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_22px_70px_rgba(0,212,255,0.25)] ring-1 ring-cyan-400/20 transition-all hover:brightness-110 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:mt-0"
      >
        Get Early Access
        <span className="vault-power" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─── Left: Knowledge Vault ──────────────────────────────────────── */

function VaultPanel({
  doc,
  phase,
  progress,
}: {
  doc: (typeof DOCS)[number];
  phase: Phase;
  progress: number;
}) {
  const uploading = phase === "upload";
  const phaseIdx = PHASES.findIndex((p) => p.key === phase);

  return (
    <div className="relative min-h-[200px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-3 backdrop-blur-[14px] sm:min-h-[320px] sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--fg)]">
          Knowledge Vault
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted-2)]">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          Encrypted
        </div>
      </div>

      {/* Document list */}
      <div className="mt-4 space-y-2">
        {DOCS.map((d, idx) => {
          const isCurrent = d.id === doc.id;
          return (
            <motion.div
              key={d.id}
              className={
                "flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition-colors " +
                (isCurrent
                  ? "border-cyan-500/25 bg-cyan-500/8"
                  : "border-[var(--border)] bg-[var(--card-2)]")
              }
              animate={{
                borderColor: isCurrent
                  ? "rgba(0,212,255,0.25)"
                  : "var(--border)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--border)]">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke={isCurrent ? "var(--vault-blue)" : "var(--muted-2)"}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div
                    className="truncate font-semibold"
                    style={{
                      color: isCurrent ? "var(--vault-blue)" : "var(--muted)",
                    }}
                  >
                    {d.name}
                  </div>
                  <div className="text-[10px] text-[var(--muted-2)]">
                    {d.size} · {d.pages} pages
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                {isCurrent && phaseIdx >= 1 ? (
                  <motion.span
                    className="text-[10px] font-semibold text-emerald-400"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={springSnappy}
                  >
                    ✓ indexed
                  </motion.span>
                ) : isCurrent && uploading ? (
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "var(--vault-blue)" }}
                  >
                    uploading…
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--muted-2)]">
                    ready
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload progress bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center justify-between text-[10px] text-[var(--muted-2)]">
              <span>Parsing & indexing</span>
              <span>{Math.round(Math.min(progress, 100))}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI scanning indicator */}
      <AnimatePresence>
        {phase === "extract" && (
          <motion.div
            className="mt-4 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-4 w-4 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--vault-blue)", borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "var(--vault-blue)" }}>
              Scanning {doc.pages} pages for controls…
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Right: Questionnaire ──────────────────────────────────────── */

function QuestionnairePanel({
  phase,
  visibleFields,
  typedChars,
  citedCount,
}: {
  phase: Phase;
  visibleFields: number;
  typedChars: number;
  citedCount: number;
}) {
  const phaseIdx = PHASES.findIndex((p) => p.key === phase);
  const showAnswers = phaseIdx >= 2; // draft or cite
  const showCitations = phaseIdx >= 3; // cite

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-3 backdrop-blur-[14px] sm:min-h-[340px] sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--fg)]">
          Questionnaire
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="text-[11px] font-semibold"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            style={{
              color: showCitations ? "rgb(52,211,153)" : "var(--vault-blue)",
            }}
          >
            {phase === "upload"
              ? "Waiting for evidence…"
              : phase === "extract"
              ? "Controls detected"
              : phase === "draft"
              ? "AI drafting…"
              : "✓ Complete"}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 space-y-2">
        {FIELDS.map((f, idx) => {
          const isVisible = idx < visibleFields || phaseIdx >= 2;
          const isFilled = showCitations && idx < citedCount;
          const answerText =
            showAnswers && idx < visibleFields
              ? f.answer.slice(0, typedChars)
              : "";
          const showCitation = showCitations && idx < citedCount;

          return (
            <motion.div
              key={f.id}
              className="rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: isVisible ? 1 : 0.35,
                y: isVisible ? 0 : 8,
                borderColor: isFilled
                  ? "rgba(52,211,153,0.3)"
                  : isVisible
                  ? "var(--border)"
                  : "var(--border)",
                background: isFilled
                  ? "rgba(52,211,153,0.04)"
                  : "var(--card-2)",
              }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-[var(--muted)] sm:text-xs">
                  {f.label}
                </div>
                <span
                  className={
                    "shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold ring-1 transition-colors duration-300 sm:text-[10px] " +
                    (isFilled
                      ? "bg-emerald-500/12 text-emerald-400 ring-emerald-500/25"
                      : "bg-transparent text-[var(--muted-2)] ring-[var(--border)]")
                  }
                >
                  {isFilled ? "✓ filled" : "pending"}
                </span>
              </div>

              {/* Answer text with typewriter */}
              <div className="mt-1 min-h-[16px] text-[10px] leading-relaxed text-[var(--muted-2)] sm:text-[11px]">
                {answerText ? (
                  <>
                    {answerText}
                    {answerText.length < f.answer.length && (
                      <motion.span
                        className="inline-block h-3 w-[2px] align-middle"
                        style={{ background: "var(--vault-blue)" }}
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    )}
                  </>
                ) : (
                  <span className="opacity-30">—</span>
                )}
              </div>

              {/* Citation chip */}
              <AnimatePresence>
                {showCitation && (
                  <motion.div
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/8 px-2 py-0.5 text-[9px] font-semibold sm:text-[10px]"
                    style={{ color: "var(--vault-blue)" }}
                    initial={{ opacity: 0, x: -8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springGentle}
                  >
                    <svg
                      className="h-2.5 w-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                      />
                    </svg>
                    {f.citation}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Tip() {
  return (
    <div className="mt-6 text-xs text-[var(--muted-2)]">
      Tip: Click &ldquo;Get Early Access&rdquo; to join the Founding Member cohort.
    </div>
  );
}
