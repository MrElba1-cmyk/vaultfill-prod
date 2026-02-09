'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Stats ── */
const stats = [
  { value: '10,000+', label: 'Hours Saved', icon: '⏱' },
  { value: '500+', label: 'Questionnaires Completed', icon: '📋' },
  { value: '99.4%', label: 'Accuracy Rate', icon: '🎯' },
  { value: '150+', label: 'Enterprise Clients', icon: '🏢' },
];

/* ── Testimonials ── */
const testimonials = [
  {
    quote:
      'VaultFill cut our questionnaire turnaround from 2 weeks to 2 hours. Our security team finally has bandwidth for real threats.',
    name: 'Sarah Chen',
    title: 'CISO, Meridian Health Systems',
  },
  {
    quote:
      'We used to dread vendor assessments. Now they\'re on autopilot — and the answers are more accurate than what we wrote manually.',
    name: 'James Okafor',
    title: 'VP of Compliance, NovaPay',
  },
  {
    quote:
      'Zero-knowledge architecture sealed the deal. We evaluated 6 tools; VaultFill was the only one our DPO approved same-day.',
    name: 'Anna Lindqvist',
    title: 'Head of GRC, Spektra Cloud',
  },
];

/* ── Logo Wall ── */
const logos = [
  'Meridian Health',
  'NovaPay',
  'Spektra Cloud',
  'Ironclad Labs',
  'ClearVault',
  'Apex Financial',
  'SentryOps',
  'TrueNorth Cyber',
];

/* ── Animated counter hook ── */
function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState('0');
  const numeric = parseInt(target.replace(/[^0-9]/g, ''), 10);
  const suffix = target.replace(/[0-9,]/g, '');

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(numeric * eased);
      setDisplay(current.toLocaleString() + suffix);
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [inView, numeric, suffix]);

  return display;
}

function StatCard({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) {
  const display = useCountUp(stat.value, inView);
  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 text-center transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06]">
      <span className="text-2xl">{stat.icon}</span>
      <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {display}
      </span>
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
        {stat.label}
      </span>
    </div>
  );
}

export default function SocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="space-y-12">
      {/* ── Stats ── */}
      <div>
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-white/30">
          Trusted by security teams worldwide
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} inView={inView} />
          ))}
        </div>
      </div>

      {/* ── Logo Wall ── */}
      <div className="overflow-hidden">
        <div className="flex animate-scroll gap-8 py-4">
          {[...logos, ...logos].map((name, i) => (
            <div
              key={i}
              className="flex h-10 shrink-0 items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 text-xs font-medium tracking-wide text-white/25 transition-colors hover:text-white/40"
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06]"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {/* Decorative quote mark */}
            <span className="absolute -top-2 left-4 text-4xl leading-none text-vault-accent/20">
              &ldquo;
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t.quote}
            </p>
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <p className="text-sm font-medium text-white/80">{t.name}</p>
              <p className="text-xs text-white/35">{t.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
