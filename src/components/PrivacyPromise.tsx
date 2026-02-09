'use client';

import { motion } from 'framer-motion';

export default function PrivacyPromise() {
  return (
    <motion.section
      className="py-14 sm:py-20"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 backdrop-blur-sm sm:p-12">
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-400/10" />

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-[var(--fg)] sm:text-2xl">
            Our Privacy Promise
          </h2>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          VaultFill is built on a <span className="font-semibold text-emerald-400">zero-knowledge architecture</span>.
          Your data stays yours — always.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Ephemeral Sessions', desc: 'No data is stored server-side after your session ends. Every interaction is transient.' },
            { title: 'No Model Training', desc: 'We never train on your documents, queries, or responses. Your evidence is never used to improve our models.' },
            { title: 'Tenant Isolation', desc: 'Processing is fully isolated per tenant. No cross-contamination, no shared context, no data leakage.' },
          ].map((item) => (
            <li key={item.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-[var(--fg)]">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
