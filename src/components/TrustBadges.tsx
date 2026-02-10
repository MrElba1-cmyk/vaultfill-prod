'use client';

import { motion } from 'framer-motion';

const badges = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Minimal Data Retention',
    desc: 'Chat context lives in memory only during your session. Lead info you voluntarily submit is stored securely.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    title: 'Encrypted in Transit',
    desc: 'All connections use TLS. AI processing uses OpenAI\u0027s enterprise API with no model training on your data.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'SOC 2 Designed',
    desc: 'Architecture follows SOC 2 Type II control principles. Formal audit planned.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    title: 'No Account Required',
    desc: 'Try VaultFill without signing up. A local session ID is used for conversation continuity only.',
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
          className="group relative rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-4 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/25 hover:shadow-[0_0_30px_var(--glow-emerald)]"
        >
          <div className="mb-3 inline-flex rounded-lg bg-emerald-500/10 p-2 text-emerald-500 dark:text-emerald-400">
            {badge.icon}
          </div>
          <h3 className="text-sm font-semibold text-[var(--fg)]">{badge.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-2)]">{badge.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
