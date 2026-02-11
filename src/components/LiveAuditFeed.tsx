'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';

/* ────────────────────────────────────────────────────────────
   Deterministic audit entries — no API, no randomness.
   Each entry represents an AI control-mapping event.
   ──────────────────────────────────────────────────────────── */

interface AuditEntry {
  id: number;
  ts: string;          // fake timestamp (HH:MM:SS)
  control: string;     // framework control ID
  framework: string;   // short framework label
  action: string;      // what the AI did
  status: 'mapped' | 'verified' | 'analyzing';
}

const ENTRIES: AuditEntry[] = [
  { id: 1,  ts: '14:32:07', control: 'CC6.1',   framework: 'SOC 2',     action: 'Mapped logical access controls',            status: 'mapped'    },
  { id: 2,  ts: '14:32:09', control: 'A.9.4.1',  framework: 'ISO 27001', action: 'Verified access restriction policy',         status: 'verified'  },
  { id: 3,  ts: '14:32:12', control: 'AC-2',      framework: 'NIST 800-53', action: 'Analyzing account management controls',   status: 'analyzing' },
  { id: 4,  ts: '14:32:15', control: 'CC7.2',   framework: 'SOC 2',     action: 'Mapped system monitoring activities',        status: 'mapped'    },
  { id: 5,  ts: '14:32:18', control: 'PR.AC-1',  framework: 'NIST CSF',  action: 'Verified identity management alignment',    status: 'verified'  },
  { id: 6,  ts: '14:32:21', control: 'A.12.4.1', framework: 'ISO 27001', action: 'Mapped event logging procedures',           status: 'mapped'    },
  { id: 7,  ts: '14:32:24', control: 'SC-28',     framework: 'NIST 800-53', action: 'Verified encryption at rest controls',    status: 'verified'  },
  { id: 8,  ts: '14:32:27', control: 'CC8.1',   framework: 'SOC 2',     action: 'Analyzing change management process',       status: 'analyzing' },
  { id: 9,  ts: '14:32:30', control: 'DE.CM-1',  framework: 'NIST CSF',  action: 'Mapped continuous monitoring strategy',     status: 'mapped'    },
  { id: 10, ts: '14:32:33', control: 'A.14.2.9', framework: 'ISO 27001', action: 'Verified system acceptance testing',        status: 'verified'  },
  { id: 11, ts: '14:32:36', control: 'IA-5',      framework: 'NIST 800-53', action: 'Mapped authenticator management',        status: 'mapped'    },
  { id: 12, ts: '14:32:39', control: 'CC6.3',   framework: 'SOC 2',     action: 'Analyzing role-based access controls',      status: 'analyzing' },
  { id: 13, ts: '14:32:42', control: 'RS.RP-1',  framework: 'NIST CSF',  action: 'Verified incident response plan',          status: 'verified'  },
  { id: 14, ts: '14:32:45', control: 'A.8.2.3',  framework: 'ISO 27001', action: 'Mapped asset handling procedures',          status: 'mapped'    },
  { id: 15, ts: '14:32:48', control: 'CM-7',      framework: 'NIST 800-53', action: 'Verified least-functionality config',    status: 'verified'  },
  { id: 16, ts: '14:32:51', control: 'CC9.1',   framework: 'SOC 2',     action: 'Mapped risk mitigation activities',         status: 'mapped'    },
];

const VISIBLE_COUNT = 6;           // rows shown at once
const TICK_MS = 2400;              // new entry every 2.4 s

const statusColor: Record<AuditEntry['status'], string> = {
  mapped:    'text-emerald-400',
  verified:  'text-blue-400',
  analyzing: 'text-amber-400',
};

const statusDot: Record<AuditEntry['status'], string> = {
  mapped:    'bg-emerald-400',
  verified:  'bg-blue-400',
  analyzing: 'bg-amber-400',
};

const statusLabel: Record<AuditEntry['status'], string> = {
  mapped:    'MAPPED',
  verified:  'VERIFIED',
  analyzing: 'ANALYZING',
};

/* ── Row animation variants ── */
const rowVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -14, filter: 'blur(2px)' },
};

/* ── Scanline pulse (analyzing dot) ── */
function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-50`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

function StaticDot({ color }: { color: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

/* ════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════ */

export default function LiveAuditFeed() {
  const prefersReduced = useReducedMotion();
  const [cursor, setCursor] = useState(VISIBLE_COUNT); // index of next entry to push
  const [visible, setVisible] = useState<AuditEntry[]>(
    ENTRIES.slice(0, VISIBLE_COUNT),
  );
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  /* ── Intersection Observer: only run when visible ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Tick: push newest, drop oldest ── */
  useEffect(() => {
    if (prefersReduced || !inView) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setCursor((prev) => {
        const next = prev >= ENTRIES.length ? VISIBLE_COUNT : prev;
        const entry = ENTRIES[next % ENTRIES.length];
        setVisible((v) => [...v.slice(1), entry]);
        return next + 1;
      });
    }, TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [prefersReduced, inView]);

  /* ── Static fallback for reduced-motion ── */
  if (prefersReduced) {
    return (
      <section ref={containerRef} aria-label="Live audit feed (paused — reduced motion)" className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
        <Header />
        <div className="mt-3 space-y-2">
          {ENTRIES.slice(0, VISIBLE_COUNT).map((e) => (
            <StaticRow key={e.id} entry={e} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      aria-label="Live audit feed"
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 overflow-hidden"
    >
      <Header />

      {/* Feed rows */}
      <div className="mt-3 space-y-[1px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((entry) => (
            <motion.div
              key={`${entry.id}-${cursor}`}
              layout
              variants={rowVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-mono transition-colors hover:bg-white/[0.04]"
            >
              {/* Timestamp */}
              <span className="hidden sm:inline-block shrink-0 text-white/25 w-16">
                {entry.ts}
              </span>

              {/* Status dot */}
              <span className="shrink-0">
                {entry.status === 'analyzing' ? (
                  <PulseDot color={statusDot[entry.status]} />
                ) : (
                  <StaticDot color={statusDot[entry.status]} />
                )}
              </span>

              {/* Framework badge */}
              <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/40">
                {entry.framework}
              </span>

              {/* Control ID */}
              <span className="shrink-0 font-semibold text-white/70 w-16 sm:w-20">
                {entry.control}
              </span>

              {/* Action */}
              <span className="truncate text-white/45 flex-1">
                {entry.action}
              </span>

              {/* Status label */}
              <span
                className={`shrink-0 text-[10px] font-bold tracking-wider ${statusColor[entry.status]}`}
              >
                {statusLabel[entry.status]}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Header ── */
function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <h2 className="text-sm font-semibold text-white">
          Live Audit Feed
        </h2>
      </div>
      <span className="text-[10px] font-mono text-white/25 tracking-wide">
        AI CONTROL MAPPER
      </span>
    </div>
  );
}

/* ── Static row (reduced-motion fallback) ── */
function StaticRow({ entry }: { entry: AuditEntry }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-mono">
      <span className="hidden sm:inline-block shrink-0 text-white/25 w-16">{entry.ts}</span>
      <StaticDot color={statusDot[entry.status]} />
      <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/40">
        {entry.framework}
      </span>
      <span className="shrink-0 font-semibold text-white/70 w-16 sm:w-20">{entry.control}</span>
      <span className="truncate text-white/45 flex-1">{entry.action}</span>
      <span className={`shrink-0 text-[10px] font-bold tracking-wider ${statusColor[entry.status]}`}>
        {statusLabel[entry.status]}
      </span>
    </div>
  );
}
