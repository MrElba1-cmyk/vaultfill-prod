'use client';

import Link from 'next/link';

type Tier = {
  key: 'core' | 'growth' | 'scale';
  name: string;
  price: string;
  period: string;
  tagline: string;
  bullets: string[];
  cta: string;
  href?: string;
  isFeatured?: boolean;
};

const TIERS: Tier[] = [
  {
    key: 'core',
    name: 'Core',
    price: '$999',
    period: '/mo',
    tagline: 'SOC 2, <20 seats',
    bullets: ['Audit-ready in minutes (vs weeks)', 'Up to 20 seats', 'Citation-backed answers + evidence'],
    cta: 'Start Core →',
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$2,499',
    period: '/mo',
    tagline: 'SOC 2 + ISO 27001, unlimited seats',
    bullets: ['SOC 2 + ISO 27001 coverage', 'Unlimited seats', 'Zero human interaction (no sales-call bottlenecks)'],
    cta: 'Start Growth →',
    isFeatured: true,
  },
  {
    key: 'scale',
    name: 'Scale',
    price: 'Custom',
    period: '',
    tagline: 'Complex programs & procurement',
    bullets: ['Custom scope + controls', 'Procurement & security reviews', 'Dedicated onboarding'],
    cta: 'Contact Sales →',
    href: '/#lead',
  },
];

async function startCheckout(tier: 'core' | 'growth') {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  });
  const data = (await res.json()) as any;
  if (data?.url) window.location.href = data.url;
  else alert('Checkout is not configured yet.');
}

export function PricingClient() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: '#0a0a0a' }}>
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs tracking-widest text-zinc-400">ENTERPRISE-GRADE SECURITY · MONTHLY FLEXIBILITY</p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-50">Unlock Your Autonomous Audit</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            The rigor of a Big 4 audit, the speed of AI.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.key}
              className={
                t.isFeatured
                  ? 'relative rounded-3xl border border-emerald-400/40 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_0_40px_rgba(16,185,129,0.18)] backdrop-blur'
                  : 'rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'
              }
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-zinc-50">{t.name}</h2>
                {t.isFeatured && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-400">{t.tagline}</p>

              <div className="mt-5 flex items-end gap-2">
                <div className="text-4xl font-semibold text-zinc-50">{t.price}</div>
                <div className="pb-1 text-sm text-zinc-400">{t.period}</div>
              </div>

              <ul className="mt-5 space-y-2 text-sm">
                {t.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-zinc-300">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{b}</span>
                  </li>
                ))}
                <li className="flex gap-2 text-zinc-300">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Monthly cancellation (no annual contract lock-in)</span>
                </li>
              </ul>

              <div className="mt-6">
                {t.key === 'scale' ? (
                  <Link
                    href={t.href || '/'}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-50"
                  >
                    {t.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => startCheckout(t.key as 'core' | 'growth')}
                    className={
                      t.isFeatured
                        ? 'inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400 animate-[pulse_2.4s_ease-in-out_infinite]'
                        : 'inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400'
                    }
                  >
                    {t.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
          <span>🔐 AES-256 Encrypted</span>
          <span>·</span>
          <span>🏛️ SOC 2 Designed</span>
          <span>·</span>
          <span>🚫 Never trains on your data</span>
        </div>
      </div>
    </main>
  );
}
