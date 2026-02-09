'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SandboxBanner() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 backdrop-blur-sm"
        >
          {/* Subtle animated border glow */}
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-emerald-400/10" />

          <div className="flex items-start gap-3">
            {/* Shield + Incognito icon */}
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="10" r="2" />
                <path d="M12 12v2" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sandbox Mode
                </span>
                <span className="text-[10px] text-white/30">Anonymous Session</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                You&apos;re in a <span className="text-emerald-400/80 font-medium">private sandbox</span>. No account needed. Nothing is tracked, stored, or linked to you. Explore freely — this session is ephemeral.
              </p>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="mt-0.5 shrink-0 rounded-md p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
              aria-label="Dismiss sandbox banner"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
