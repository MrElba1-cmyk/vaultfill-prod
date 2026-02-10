"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── data ─────────────────────────────────────────────── */

const comparisonRows = [
  {
    area: "Approach",
    icon: "🧭",
    vaultfill: "Document-native AI — upload your docs, get answers",
    vanta: "Integration-heavy — connects to your full tech stack",
    winner: "vaultfill",
  },
  {
    area: "Setup Time",
    icon: "⚡",
    vaultfill: "Minutes. Upload documents, start answering.",
    vanta: "Weeks. Requires onboarding, integration setup, and configuration.",
    winner: "vaultfill",
  },
  {
    area: "Privacy",
    icon: "🔒",
    vaultfill: "Privacy-first architecture. Your docs stay yours.",
    vanta: "Requires deep access to cloud infrastructure, repos, and HR systems.",
    winner: "vaultfill",
  },
  {
    area: "Focus",
    icon: "🎯",
    vaultfill: "Purpose-built for security questionnaire automation",
    vanta: "Broad compliance platform (SOC 2, ISO 27001, HIPAA, etc.)",
    winner: "neutral",
  },
  {
    area: "Citations",
    icon: "🔗",
    vaultfill: "RAG-powered — every answer links back to your source documents",
    vanta: "AI-assisted answers without granular source attribution",
    winner: "vaultfill",
  },
  {
    area: "Data Residency",
    icon: "🏛️",
    vaultfill: "Texas-based infrastructure with local data control",
    vanta: "Cloud-dependent with standard enterprise hosting",
    winner: "vaultfill",
  },
  {
    area: "Pricing",
    icon: "💰",
    vaultfill: "Lean startup pricing — built for founders and small teams",
    vanta: "Enterprise-tier pricing ($10K–$20K+/year with add-ons)",
    winner: "vaultfill",
  },
];

const switchingReasons = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Integration Fatigue",
    desc: "Vanta's 300+ integrations demand constant setup, maintenance, and monitoring. VaultFill needs zero API keys — just your existing docs.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: "Privacy Concerns",
    desc: "Vanta needs read access across your entire infrastructure. VaultFill processes only uploaded documents — nothing more.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Questionnaire Focus",
    desc: "Vanta is a Swiss Army knife for compliance. VaultFill is a scalpel for questionnaires — purpose-built, faster, sharper.",
  },
];

const audiencePoints = [
  "Spend hours every week copy-pasting answers into security questionnaires",
  "Already have policies & SOC 2 in place — don't need another compliance platform",
  "Care deeply about data privacy and won't hand infrastructure access to another vendor",
  "Need to move fast — founders closing deals can't wait weeks for onboarding",
  "Run lean teams where the person answering questionnaires is also building the product",
];

/* ── animation ────────────────────────────────────────── */

const reveal = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── check / winner icons ─────────────────────────────── */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function WinnerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
      <CheckIcon className="h-3 w-3" /> Edge
    </span>
  );
}

/* ── page ─────────────────────────────────────────────── */

export default function VantaComparePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,var(--glow-emerald)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_20%,var(--glow-cyan)_0%,transparent_50%)] opacity-60" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:92px_92px]" />
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[14px]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="bento-icon !h-9 !w-9 !rounded-xl">
              <svg viewBox="0 0 512 512" className="h-5 w-5" aria-hidden="true">
                <polygon points="256,72 256,228 138,268" fill="#00D4FF" />
                <polygon points="256,72 256,228 374,268" fill="#6366F1" />
                <polygon points="140,272 372,272 256,420" fill="#CBD5E1" />
              </svg>
            </div>
            <div className="leading-tight">
              <Link href="/" className="text-[13px] font-semibold tracking-wide text-[var(--fg)] transition-colors hover:text-cyan-400 sm:text-sm">
                VaultFill
              </Link>
              <nav className="flex items-center gap-1 text-[11px] text-[var(--muted-2)]">
                <Link href="/" className="transition-colors hover:text-[var(--fg)]">Home</Link>
                <span>/</span>
                <span className="text-[var(--muted)]">Compare</span>
                <span>/</span>
                <span className="text-[var(--fg)]">Vanta</span>
              </nav>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-4 py-2 text-xs font-semibold text-[var(--fg)] backdrop-blur-sm transition-all hover:border-[color-mix(in_srgb,var(--vault-blue)_30%,transparent)] sm:text-sm"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">

        {/* ────── HERO ────── */}
        <motion.section className="pb-14 pt-14 sm:pb-20 sm:pt-20 md:pb-24 md:pt-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="bento-kicker mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                Honest Comparison
              </div>
            </Reveal>

            <Reveal>
              <h1 className="mt-7 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--fg)] sm:text-[44px] md:text-[56px]">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">VaultFill</span>
                <span className="mx-3 text-[var(--muted-2)] sm:mx-4">vs</span>
                <span className="text-[var(--muted)]">Vanta</span>
              </h1>
            </Reveal>

            <Reveal>
              <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted)] sm:text-lg">
                <strong className="text-[var(--fg)]">Vanta is a great compliance platform.</strong>{" "}
                VaultFill is a different tool for a different job — purpose-built to{" "}
                <strong className="text-[var(--fg)]">answer security questionnaires fast, accurately, and privately.</strong>
              </p>
            </Reveal>

            <Reveal>
              <p className="mt-4 text-[13px] text-[var(--muted-2)] sm:text-sm">
                Need a full compliance platform? Vanta may be right. Need to stop losing days to repetitive questionnaire work? Keep reading.
              </p>
            </Reveal>
          </div>
        </motion.section>

        {/* ────── COMPARISON GRID ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              Head-to-Head
            </h2>
          </Reveal>

          {/* Column headers (desktop) */}
          <Reveal>
            <div className="mb-4 hidden grid-cols-[1fr_1fr_1fr] gap-4 px-2 md:grid lg:gap-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Category</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">VaultFill</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Vanta</div>
            </div>
          </Reveal>

          {/* Comparison cards */}
          <div className="space-y-3 sm:space-y-4">
            {comparisonRows.map((row) => (
              <Reveal key={row.area}>
                {/* Desktop: 3-column card */}
                <div className="group hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] shadow-[var(--shadow-natural)] backdrop-blur-[14px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--vault-blue)_18%,transparent)] hover:shadow-[var(--shadow-natural),0_0_40px_var(--glow-cyan)] md:block">
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 px-6 py-5 lg:gap-5">
                    {/* Area */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-lg">{row.icon}</span>
                      <span className="text-sm font-semibold text-[var(--fg)]">{row.area}</span>
                    </div>
                    {/* VaultFill */}
                    <div className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <div className="text-sm text-[var(--muted)]">
                        {row.vaultfill}
                        {row.winner === "vaultfill" && (
                          <span className="ml-2 inline-block align-middle"><WinnerBadge /></span>
                        )}
                      </div>
                    </div>
                    {/* Vanta */}
                    <div className="text-sm text-[var(--muted-2)]">{row.vanta}</div>
                  </div>
                </div>

                {/* Mobile: stacked card */}
                <div className="group rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5 shadow-[var(--shadow-natural)] backdrop-blur-[14px] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--vault-blue)_18%,transparent)] md:hidden">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">{row.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">{row.area}</span>
                    {row.winner === "vaultfill" && <WinnerBadge />}
                  </div>
                  <div className="mb-2.5 flex items-start gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-emerald-400">VaultFill</span>
                      <p className="text-[13px] leading-relaxed text-[var(--fg)]">{row.vaultfill}</p>
                    </div>
                  </div>
                  <div className="pl-6">
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-2)]">Vanta</span>
                    <p className="text-[13px] leading-relaxed text-[var(--muted-2)]">{row.vanta}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── WHY TEAMS ARE SWITCHING ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              Why Teams Are Switching
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-3">
            {switchingReasons.map((r) => (
              <Reveal key={r.title}>
                <div className="bento-card flex h-full flex-col items-start">
                  <div className="bento-icon mb-4 text-emerald-400">
                    {r.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-[var(--fg)] sm:text-lg">{r.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── WHO VAULTFILL IS FOR ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="mb-3 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
                Who VaultFill Is For
              </h2>
            </Reveal>
            <Reveal>
              <p className="mb-8 text-center text-[14px] text-[var(--muted)] sm:text-base">
                VaultFill is built for teams who:
              </p>
            </Reveal>

            <div className="space-y-3">
              {audiencePoints.map((point, i) => (
                <Reveal key={i}>
                  <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-5 py-4 backdrop-blur-[14px] transition-all duration-200 hover:border-emerald-500/20">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span className="text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">{point}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-6 text-center text-[13px] text-[var(--muted-2)] sm:text-sm">
                If that sounds like you, VaultFill fits. If you need continuous compliance monitoring across multiple frameworks with deep infrastructure integrations, Vanta is worth evaluating.
              </p>
            </Reveal>
          </div>
        </motion.section>

        {/* ────── CTA ────── */}
        <Reveal>
          <section className="mb-16 sm:mb-24">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-[var(--card-2)] to-cyan-500/10 p-8 text-center shadow-[0_22px_70px_var(--glow-emerald)] backdrop-blur-[14px] sm:rounded-3xl sm:p-14">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--glow-emerald)_0%,transparent_70%)]" />

              <div className="relative">
                <h2 className="text-2xl font-semibold text-[var(--fg)] sm:text-3xl">See It in Action</h2>
                <p className="mt-3 text-[14px] text-[var(--muted)] sm:text-base">
                  <strong className="text-[var(--fg)]">Ready to stop losing hours to questionnaires?</strong>
                </p>
                <p className="mt-2 text-[13px] text-[var(--muted-2)] sm:text-sm">
                  Drop a security question and watch Shield Bot pull accurate, cited answers from your docs — in seconds.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4">
                  <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400/25 transition-all hover:brightness-110"
                  >
                    Try the Shield Bot →
                    <span className="vault-power" aria-hidden="true" />
                  </Link>
                  <Link href="/" className="text-sm text-[var(--muted-2)] transition-colors hover:text-[var(--fg)]">
                    ← Back to home
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted-2)]">
        <p>Last updated: February 2026</p>
        <p className="mt-1">
          <Link href="/" className="transition-colors hover:text-[var(--fg)]">VaultFill</Link> — Security Questionnaire Automation
        </p>
      </footer>
    </div>
  );
}
