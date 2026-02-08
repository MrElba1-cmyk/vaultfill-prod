"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

const DOCS = [
  { id: "soc2type2reportv2", name: "SOC2_Type2_Report_v2.md" },
  { id: "iso27001policy", name: "ISO27001_Policy.md" },
  { id: "globalprivacypolicy", name: "Global_Privacy_Policy.md" },
];

const FIELDS = [
  { id: "roles", label: "Information Security roles" },
  { id: "asset", label: "Asset management" },
  { id: "access", label: "Access control" },
  { id: "audit", label: "Evidence / audit trail" },
];

// Fetch doc answers from API (client-safe). We use a tiny in-memory cache to avoid repeats.
const _answersCache = new Map<string, Record<string, string>>();

async function getDocumentAnswers(docId: string): Promise<Record<string, string>> {
  const cached = _answersCache.get(docId);
  if (cached) return cached;

  const response = await fetch(`/api/knowledge?docId=${encodeURIComponent(docId)}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch document answers`);
  }
  const data = await response.json();
  const answers = (data?.answers ?? {}) as Record<string, string>;
  _answersCache.set(docId, answers);
  return answers;
}

export default function LivePreview({
  onCta,
}: {
  onCta: () => void;
}) {
  console.log("LivePreview Rendered");
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.18, once: false });

  const [activeDoc, setActiveDoc] = React.useState(0);
  const [filled, setFilled] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Start the demo automatically (and also when it scrolls into view)
  React.useEffect(() => {
    if (reduceMotion) return;
    setIsAnimating(true);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (reduceMotion) return;
    if (inView) setIsAnimating(true);
  }, [inView, reduceMotion]);

  // Drive the autoplay loop by advancing activeDoc.
  React.useEffect(() => {
    if (reduceMotion) return;
    if (!isAnimating) return;

    const tick = () => {
      setFilled(false);
      setActiveDoc((d) => (d + 1) % DOCS.length);
      // success state: 500ms after the document "lands"
      window.setTimeout(() => setFilled(true), 500);
    };

    tick();
    const id = window.setInterval(tick, 2600);
    return () => window.clearInterval(id);
  }, [isAnimating, reduceMotion]);

  const doc = DOCS[activeDoc];

  // Fetch answers whenever the active doc changes.
  React.useEffect(() => {
    if (!doc) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    getDocumentAnswers(doc.id)
      .then((docAnswers) => {
        if (cancelled) return;
        setAnswers(docAnswers);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message ?? "failed_to_load");
        setAnswers({});
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doc?.id]);

  return (
    <section ref={ref} className="py-14 md:py-16">
      <div className="grid gap-6 md:grid-cols-12 md:items-stretch">
        <div className="md:col-span-12">
          <div className="bento-card">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div
                  className="text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--vault-blue)" }}
                >
                  Live Preview
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">
                  Search & Fill — from Knowledge Vault to Questionnaire
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  See how VaultFill maps your security posture to any questionnaire in seconds, not weeks.
                </p>
              </div>

              <button
                type="button"
                onClick={onCta}
                className="group relative mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(59,130,246,0.30)] ring-1 ring-blue-300/30 transition-all hover:brightness-110 md:mt-0"
              >
                Get Early Access
                <span className="vault-power" aria-hidden="true" />
              </button>
            </div>

            {/* Split screen */}
            <div
              className="mt-8 grid gap-5 md:grid-cols-2"
              onClick={() => {
                console.log("LivePreview clicked");
                setIsAnimating(true);
              }}
              style={{ overflow: "visible" }}
            >
              {/* Left: Knowledge Vault */}
              <div className="min-h-[320px] rounded-2xl border border-[var(--border)] bg-black/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--fg)]">The Knowledge Vault</div>
                  <div className="text-[11px] font-semibold text-[var(--muted-2)]">Encrypted</div>
                </div>

                <div className="mt-4 space-y-2">
                  {DOCS.map((d, idx) => {
                    const isActive = idx === activeDoc;
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => {
                          setIsAnimating(false);
                          setActiveDoc(idx);
                          setFilled(false);
                          // simulate fill shortly after click
                          window.setTimeout(() => setFilled(true), 420);
                        }}
                        className={
                          "w-full text-left flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-colors " +
                          (isActive
                            ? "border-blue-500/25 bg-blue-500/10"
                            : "border-[var(--border)] bg-white/5 hover:bg-white/8")
                        }
                        style={isActive ? { color: "var(--vault-blue)" } : { color: "var(--muted)" }}
                      >
                        <span className="truncate">{d.name}</span>
                        <span className="text-[10px]" style={{ color: "var(--muted-2)" }}>
                          {isActive ? "mapping" : "open"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Questionnaire */}
              <div className="relative min-h-[340px] rounded-2xl border border-[var(--border)] bg-black/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[var(--fg)]">The Questionnaire</div>
                  <div className="text-[11px] font-semibold text-[var(--muted-2)]">Auto-fill</div>
                </div>

                <div className="mt-4 space-y-2">
                  {FIELDS.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-[var(--muted)]">{f.label}</div>
                        <div
                          className={
                            "rounded-lg px-2 py-1 text-[10px] font-semibold ring-1 transition-colors " +
                            (filled
                              ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20"
                              : "bg-white/5 text-[var(--muted-2)] ring-white/10")
                          }
                        >
                          {filled ? "filled" : "pending"}
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed text-[var(--muted-2)]">
                        {filled && answers[f.id] ? answers[f.id] : "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flying doc chip */}
                {!reduceMotion && (
                  <AnimatePresence mode="wait">
                    {(inView || isAnimating) && (
                      <motion.div
                        key={doc.id}
                        className="pointer-events-none absolute left-5 top-16"
                        style={{ zIndex: 100 }}
                        initial={{ opacity: 0, x: -30, y: -6, scale: 0.98 }}
                        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <motion.div
                          initial={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                          animate={{ x: 260, opacity: 0, filter: "blur(0.6px)" }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-semibold"
                          style={{ color: "var(--vault-blue)", boxShadow: "0 0 40px rgba(59,130,246,0.24)", willChange: "transform, opacity, filter" }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          <span className="max-w-[190px] truncate">{doc.name}</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="mt-6 text-xs text-[var(--muted-2)]">
              Tip: Click “Get Early Access” to join the Founding Member cohort.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
