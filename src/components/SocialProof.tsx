'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

const companies = [
  'Meridian Health', 'NovaPay', 'Spektra Cloud', 'Ironclad Labs',
  'ClearVault', 'Apex Financial', 'SentryOps', 'TrueNorth Cyber',
];

function FadingDivider() {
  return <div className="my-10 fading-line" aria-hidden="true" />;
}

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
    <div
      ref={ref}
      className="grid grid-cols-2 gap-4 text-center mb-14 md:grid-cols-4"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-2xl p-[1px]"
        >
          {/* 1px gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent opacity-70" />

          {/* card */}
          <div className="relative rounded-2xl border border-white/5 bg-[var(--card-2)] p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_40px_rgba(52,211,153,0.10)]">
            {/* inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(70%_60%_at_50%_0%,rgba(16,185,129,0.10)_0%,transparent_60%)]" />

            <div className="relative text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              <AnimatedCounter stat={s} inView={inView} />
            </div>
            <div className="relative mt-2 text-xs text-[var(--muted-2)] sm:text-sm">{s.label}</div>
          </div>
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
      <FadingDivider />

      {/* Company ticker */}
      <div className="mb-14">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-[var(--muted-2)]">
          Trusted by security teams worldwide
        </p>
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-2)] py-5 backdrop-blur-sm">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--card-2)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--card-2)] to-transparent" />

          {/* Infinite marquee: grayscale/low-opacity baseline; hover-to-color */}
          <div className="group flex animate-[scroll_32s_linear_infinite] gap-12 whitespace-nowrap will-change-transform marquee-container">
            {[...companies, ...companies].map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="select-none text-sm font-semibold tracking-wide text-zinc-300/40 transition-all duration-200 hover:text-emerald-200 hover:opacity-100 dark:text-zinc-300/40 light:text-slate-500/60"
                style={{ filter: 'grayscale(100%)' }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <FadingDivider />

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
