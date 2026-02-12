'use client';

import { motion } from 'framer-motion';

const prompts = [
  'How does encryption at rest work?',
  'What are your MFA requirements?',
  'Tell me about SOC 2 compliance',
];

export default function TryItCTA() {
  return (
    <motion.section
      className="py-14 sm:py-20"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/5 p-8 text-center backdrop-blur sm:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_55%)]" />

        <h2 className="relative text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-3xl">
          Try it yourself
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Experience Autonomous Compliance. Upload a sample policy and watch the engine work.
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/demo"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400 animate-[pulse_2.4s_ease-in-out_infinite]"
          >
            Enter the Sandbox →
          </a>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('vaultfill:prompt', { detail: p }));
              }}
              className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-4 py-2 text-xs font-medium text-[var(--muted)] transition-all hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-[var(--fg)]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
