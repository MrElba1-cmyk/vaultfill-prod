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
      <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] to-indigo-500/[0.04] p-8 text-center backdrop-blur-sm sm:p-12">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-3xl">
          Try it yourself
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          Use the chat bubble in the corner to ask a security question.
          VaultFill will generate a citation-backed answer in real time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('vaultfill:prompt', { detail: p }));
              }}
              className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-4 py-2 text-xs font-medium text-[var(--muted)] transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-[var(--fg)]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
