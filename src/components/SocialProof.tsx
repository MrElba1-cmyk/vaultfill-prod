'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

const companies = [
  'Meridian Health', 'NovaPay', 'Spektra Cloud', 'Ironclad Labs',
  'ClearVault', 'Apex Financial', 'SentryOps', 'TrueNorth Cyber',
];

interface Stat {
  numericValue: number;
  decimals: number;
  suffix: string;
  prefix: string;
  label: string;
}

const stats: Stat[] = [
  { numericValue: 400, decimals: 0, prefix: '', suffix: '+', label: 'Hours Saved' },
  { numericValue: 50, decimals: 0, prefix: '', suffix: '+', label: 'Questionnaires Completed' },
  { numericValue: 98.5, decimals: 1, prefix: '', suffix: '%', label: 'Accuracy Rate' },
  { numericValue: 12, decimals: 0, prefix: '', suffix: '', label: 'Enterprise Clients' },
];

function AnimatedCounter({ stat, inView }: { stat: Stat; inView: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    stat.decimals > 0 ? v.toFixed(stat.decimals) : Math.round(v).toString()
  );
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, stat.numericValue, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, count, stat.numericValue]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (displayRef.current) displayRef.current.textContent = `${stat.prefix}${v}${stat.suffix}`;
    });
    return unsubscribe;
  }, [rounded, stat.prefix, stat.suffix]);

  return (
    <span ref={displayRef}>
      {stat.prefix}0{stat.suffix}
    </span>
  );
}

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

function StatsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 text-center mb-14 sm:grid-cols-4">
      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="group relative rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-6 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/25 hover:shadow-[0_0_30px_var(--glow-emerald)]"
        >
          <div className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            <AnimatedCounter stat={s} inView={inView} />
          </div>
          <div className="mt-2 text-xs text-[var(--muted-2)] sm:text-sm">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

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
      <StatsGrid />

      {/* Company ticker */}
      <div className="mb-14">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-[var(--muted-2)]">
          Trusted by security teams worldwide
        </p>
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-2)] py-5 backdrop-blur-sm">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--card-2)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--card-2)] to-transparent" />
          <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap">
            {[...companies, ...companies].map((c, i) => (
              <span key={`${c}-${i}`} className="text-sm font-semibold tracking-wide text-[var(--muted)] opacity-60">
                {c}
              </span>
            ))}
          </div>
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
