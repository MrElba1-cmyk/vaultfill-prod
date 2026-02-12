'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   LiveAuditFeed — deterministic, stealth-style audit ticker
   • Dark + emerald palette (premium "stealth" vibe)
   • Cycles through a fixed set of events in order
   • Respects prefers-reduced-motion
   • GPU-only transforms (translate/opacity) for perf
   ───────────────────────────────────────────────────────── */

interface AuditEvent {
  id: string;
  icon: string;          // small SVG indicator type
  label: string;
  detail: string;
  status: 'pass' | 'match' | 'verified' | 'flagged';
  timestamp: string;     // static HH:MM display
}

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'a1', icon: 'shield',   label: 'SOC 2 CC6.1',            detail: 'Logical access control verified',              status: 'pass',     timestamp: '09:14' },
  { id: 'a2', icon: 'link',     label: 'Evidence Match',          detail: 'vendor-security-policy.pdf → Q.42',            status: 'match',    timestamp: '09:14' },
  { id: 'a3', icon: 'lock',     label: 'Encryption Check',        detail: 'AES-256-GCM at rest — validated',              status: 'verified', timestamp: '09:15' },
  { id: 'a4', icon: 'eye',      label: 'ISO 27001 A.12.4',       detail: 'Log monitoring review completed',              status: 'pass',     timestamp: '09:15' },
  { id: 'a5', icon: 'doc',      label: 'Citation Index',          detail: 'IR-Plan.pdf § Appendix A indexed',             status: 'match',    timestamp: '09:16' },
  { id: 'a6', icon: 'shield',   label: 'SOC 2 CC7.2',            detail: 'Incident response readiness confirmed',        status: 'pass',     timestamp: '09:16' },
  { id: 'a7', icon: 'alert',    label: 'Low-Confidence Flag',     detail: 'Q.38 — vendor SLA detail needs review',        status: 'flagged',  timestamp: '09:17' },
  { id: 'a8', icon: 'link',     label: 'Evidence Match',          detail: 'pen-test-2024.pdf → Q.15',                     status: 'match',    timestamp: '09:17' },
  { id: 'a9', icon: 'lock',     label: 'TLS Verification',        detail: 'All endpoints — TLS 1.3 enforced',             status: 'verified', timestamp: '09:18' },
  { id: 'a10', icon: 'doc',     label: 'Knowledge Vault',         detail: '142 artifacts indexed, 0 stale',               status: 'verified', timestamp: '09:18' },
  { id: 'a11', icon: 'shield',  label: 'SOC 2 CC8.1',            detail: 'Change management control verified',           status: 'pass',     timestamp: '09:19' },
  { id: 'a12', icon: 'eye',     label: 'GDPR Art. 32',           detail: 'Processing security measures validated',       status: 'pass',     timestamp: '09:19' },
];

const VISIBLE_COUNT = 5;
const TICK_MS = 2800;

/* Status → colour mapping (emerald-forward stealth palette) */
const STATUS_STYLES: Record<AuditEvent['status'], { dot: string; badge: string; badgeBorder: string; text: string }> = {
  pass:     { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10', badgeBorder: 'border-emerald-500/20', text: 'text-emerald-400' },
  match:    { dot: 'bg-cyan-400',    badge: 'bg-cyan-500/10',    badgeBorder: 'border-cyan-500/20',    text: 'text-cyan-400' },
  verified: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/10', badgeBorder: 'border-emerald-500/20', text: 'text-emerald-400' },
  flagged:  { dot: 'bg-amber-400',   badge: 'bg-amber-500/10',   badgeBorder: 'border-amber-500/20',   text: 'text-amber-400' },
};

const STATUS_LABELS: Record<AuditEvent['status'], string> = {
  pass: 'PASS',
  match: 'MATCHED',
  verified: 'VERIFIED',
  flagged: 'REVIEW',
};

/* Micro SVG icons — kept inline for zero layout shift */
function AuditIcon({ type, className }: { type: string; className?: string }) {
  const cn = `w-3.5 h-3.5 ${className ?? ''}`;
  switch (type) {
    case 'shield':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'lock':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      );
    case 'link':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'eye':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'doc':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'alert':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LiveAuditFeed() {
  const prefersReduced = useReducedMotion();
  const [cursor, setCursor] = useState(VISIBLE_COUNT);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Deterministic visible window — always the same sequence */
  const visibleEvents = useMemo(() => {
    const items: (AuditEvent & { key: string })[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const idx = (cursor - VISIBLE_COUNT + i + AUDIT_EVENTS.length) % AUDIT_EVENTS.length;
      items.push({ ...AUDIT_EVENTS[idx], key: `${AUDIT_EVENTS[idx].id}-${cursor}-${i}` });
    }
    return items;
  }, [cursor]);

  /* Tick forward */
  const tick = useCallback(() => {
    setCursor((c) => (c + 1) % (AUDIT_EVENTS.length * 100)); // large cycle to avoid key collisions
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(tick, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  /* Pause when out of viewport */
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!intervalRef.current) intervalRef.current = setInterval(tick, TICK_MS);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [tick]);

  return (
    <section ref={containerRef} className="py-10 sm:py-14" aria-label="Live audit monitoring feed">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Live Audit Feed
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
        <span className="font-mono text-[10px] text-[var(--muted-2)]">
          {AUDIT_EVENTS.length} checks cycling
        </span>
      </div>

      {/* Feed container */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-[#070C14] p-1 shadow-[0_0_80px_rgba(16,185,129,0.06)]">
        {/* Top / bottom fade masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#070C14] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#070C14] to-transparent" />

        {/* Subtle scan-line overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(52,211,153,0.08) 2px, rgba(52,211,153,0.08) 4px)',
          }}
        />

        <div className="relative space-y-0.5 py-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleEvents.map((event, i) => {
              const styles = STATUS_STYLES[event.status];
              const isNewest = i === VISIBLE_COUNT - 1;

              return (
                <motion.div
                  key={event.key}
                  layout={!prefersReduced}
                  initial={prefersReduced ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
                  animate={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReduced ? undefined : { opacity: 0, y: -16, scale: 0.97 }}
                  transition={
                    prefersReduced
                      ? undefined
                      : {
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                          layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                        }
                  }
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3
                    transition-colors duration-300
                    ${isNewest ? 'bg-emerald-500/[0.06]' : 'bg-transparent hover:bg-white/[0.02]'}
                  `}
                >
                  {/* Timestamp */}
                  <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-[var(--muted-2)]/60 sm:block">
                    {event.timestamp}
                  </span>

                  {/* Icon */}
                  <div className={`shrink-0 rounded-md border p-1.5 ${styles.badge} ${styles.badgeBorder}`}>
                    <AuditIcon type={event.icon} className={styles.text} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs font-semibold text-[var(--fg)]/90 sm:text-sm">
                        {event.label}
                      </span>
                      {isNewest && !prefersReduced && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400"
                        >
                          new
                        </motion.span>
                      )}
                    </div>
                    <p className="truncate text-[11px] leading-snug text-[var(--muted-2)] sm:text-xs">
                      {event.detail}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`
                      hidden shrink-0 items-center gap-1.5 rounded-md border px-2 py-1
                      ${styles.badge} ${styles.badgeBorder}
                      sm:flex
                    `}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                    <span className={`text-[10px] font-bold tracking-wide ${styles.text}`}>
                      {STATUS_LABELS[event.status]}
                    </span>
                  </div>

                  {/* Mobile status dot */}
                  <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot} sm:hidden`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer micro-text */}
      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-[10px] text-[var(--muted-2)]/50">
          Simulated feed — real audits run continuously in production
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-500/40" />
          <span className="h-1 w-1 rounded-full bg-emerald-500/25" />
          <span className="h-1 w-1 rounded-full bg-emerald-500/10" />
        </div>
      </div>
    </section>
  );
}
