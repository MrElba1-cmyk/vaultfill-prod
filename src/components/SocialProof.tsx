'use client';

import { motion } from 'framer-motion';

const companies = [
  'Meridian Health', 'NovaPay', 'Spektra Cloud', 'Ironclad Labs',
  'ClearVault', 'Apex Financial', 'SentryOps', 'TrueNorth Cyber',
];

const stats = [
  { value: '400+', label: 'Hours saved per quarter' },
  { value: '12,000+', label: 'Questionnaires completed' },
  { value: '200+', label: 'Enterprise customers' },
];

const testimonials = [
  {
    quote: 'VaultFill cut our questionnaire turnaround from two weeks to under a day. The citations alone saved our reviewers hours.',
    name: 'Sarah Chen',
    role: 'CISO, Meridian Health',
  },
  {
    quote: 'We used to dread DDQs. Now our compliance team actually looks forward to them — the drafts are that good.',
    name: 'James Okafor',
    role: 'Compliance Lead, NovaPay',
  },
  {
    quote: 'The RAG-powered citations are a game-changer. Every answer maps back to a real source. Auditors love it.',
    name: 'Anna Lindqvist',
    role: 'Security Engineer, Spektra Cloud',
  },
];

export default function SocialProof() {
  return (
    <motion.section
      className="py-14 sm:py-20 md:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 text-center mb-14">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs text-[var(--muted-2)] sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Company ticker */}
      <div className="relative overflow-hidden py-6 mb-14">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />
        <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap">
          {[...companies, ...companies].map((c, i) => (
            <span key={`${c}-${i}`} className="text-sm font-semibold tracking-wide text-[var(--muted)] opacity-60">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-6 backdrop-blur-sm transition-all duration-200 hover:border-[color-mix(in_srgb,var(--vault-blue)_25%,var(--border))]"
          >
            <p className="text-sm leading-relaxed text-[var(--muted)] italic">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <div className="text-sm font-semibold text-[var(--fg)]">{t.name}</div>
              <div className="text-xs text-[var(--muted-2)]">{t.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
