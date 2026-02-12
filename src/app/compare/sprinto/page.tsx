"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── comparison data ──────────────────────────────────── */

const comparisonRows = [
  {
    capability: "Primary focus",
    vaultfill: "Questionnaire automation",
    sprinto: "Compliance certification",
  },
  {
    capability: "AI-drafted questionnaire responses",
    vaultfill: "✅ Core feature",
    sprinto: "❌ Not offered",
    winner: "vaultfill",
  },
  {
    capability: "Continuous control monitoring",
    vaultfill: "❌ Not our scope",
    sprinto: "✅ Core feature",
    winner: "sprinto",
  },
  {
    capability: "Evidence ingestion + indexing",
    vaultfill: "✅ Knowledge Vault",
    sprinto: "✅ Evidence collection",
  },
  {
    capability: "SOC 2 / ISO 27001 certification",
    vaultfill: "❌ Not offered",
    sprinto: "✅ Guided workflows",
    winner: "sprinto",
  },
  {
    capability: "Cited responses with source docs",
    vaultfill: "✅ Every answer linked",
    sprinto: "N/A",
    winner: "vaultfill",
  },
  {
    capability: "Board-ready export (PDF, XLSX)",
    vaultfill: "✅",
    sprinto: "✅ (audit reports)",
  },
  {
    capability: "Pricing",
    vaultfill: "$499/mo",
    sprinto: "Custom (typically higher)",
    winner: "vaultfill",
  },
  {
    capability: "Best for",
    vaultfill: "Completing questionnaires fast",
    sprinto: "Getting certified fast",
  },
];

const differentiators = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    title: "AI-First, Not Bolted On",
    body: "VaultFill was designed around AI from day one — not a feature added to an existing compliance tool. Every interaction is grounded in your evidence, cited to source documents.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
    title: "Your Data Stays Yours",
    body: "We never use customer evidence to train models. Uploaded documents are encrypted in transit (TLS 1.3). AI processing uses enterprise API endpoints that do not retain prompts after inference.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: "Minutes, Not Sprints",
    body: "A typical 200-question security questionnaire takes 2–4 weeks manually. VaultFill drafts cited responses in minutes. Your team reviews and ships — not researches and writes.",
  },
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

/* ── page ─────────────────────────────────────────────── */

export default function SprintoComparePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,var(--glow-cyan)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_20%,var(--glow-indigo)_0%,transparent_50%)] opacity-60" />
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
                <span className="text-[var(--fg)]">Sprinto</span>
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
              <div className="bento-kicker mx-auto inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--vault-blue)_20%,transparent)] bg-[color-mix(in_srgb,var(--vault-blue)_10%,transparent)] px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--vault-blue)] shadow-[0_0_8px_var(--glow-cyan)]" />
                COMPARISON
              </div>
            </Reveal>

            <Reveal>
              <h1 className="mt-7 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--fg)] sm:text-[44px] md:text-[56px]">
                <span className="bg-gradient-to-r from-cyan-400 to-[var(--vault-blue)] bg-clip-text text-transparent">VaultFill</span>
                <span className="mx-3 text-[var(--muted-2)] sm:mx-4">vs</span>
                <span className="text-[var(--muted)]">Sprinto</span>
              </h1>
            </Reveal>

            <Reveal>
              <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted)] sm:text-lg">
                Both help with compliance. They automate the certification. We automate the questionnaire — and we&apos;re built different under the hood.
              </p>
            </Reveal>
          </div>
        </motion.section>

        {/* ────── POSITIONING STATEMENT ────── */}
        <motion.section className="pb-16 sm:pb-20" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-6 text-[14px] leading-relaxed text-[var(--muted)] backdrop-blur-[14px] sm:p-8 sm:text-[15px]">
              <p className="mb-4">
                <strong className="text-[var(--fg)]">Sprinto is a compliance automation platform</strong> — it monitors controls,
                collects evidence continuously, and helps you get SOC&nbsp;2 or ISO&nbsp;27001
                certified faster. It&apos;s excellent at what it does.
              </p>
              <p>
                <strong className="text-[var(--fg)]">VaultFill solves a different problem:</strong> the security questionnaires,
                vendor risk assessments, and due diligence forms that pile up <em>after</em> you&apos;re certified.
                We ingest your evidence, understand it with AI, and draft cited responses in minutes — not days.
              </p>
            </div>
          </Reveal>
        </motion.section>

        {/* ────── COMPARISON TABLE ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              Side by Side
            </h2>
          </Reveal>

          {/* Desktop table */}
          <Reveal>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] backdrop-blur-[14px] md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Capability</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--vault-blue)]">VaultFill</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Sprinto</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.capability} className={`border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--vault-blue)_4%,transparent)] ${i % 2 === 0 ? "" : "bg-[color-mix(in_srgb,var(--vault-blue)_2%,transparent)]"}`}>
                      <td className="px-6 py-4 font-medium text-[var(--fg)]">{row.capability}</td>
                      <td className={`px-6 py-4 ${row.winner === "vaultfill" ? "text-[var(--vault-blue)] font-semibold" : "text-[var(--muted)]"}`}>
                        {row.vaultfill}
                      </td>
                      <td className={`px-6 py-4 ${row.winner === "sprinto" ? "text-[var(--vault-blue)] font-semibold" : "text-[var(--muted-2)]"}`}>
                        {row.sprinto}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Mobile stacked cards */}
          <div className="space-y-3 md:hidden">
            {comparisonRows.map((row) => (
              <Reveal key={row.capability}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5 backdrop-blur-[14px]">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">{row.capability}</div>
                  <div className={`mb-2 flex items-start gap-2 rounded-xl p-3 ${row.winner === "vaultfill" ? "border border-[color-mix(in_srgb,var(--vault-blue)_15%,transparent)] bg-[color-mix(in_srgb,var(--vault-blue)_5%,transparent)]" : "border border-[var(--border)] bg-[var(--card)]"}`}>
                    <div>
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--vault-blue)]">VaultFill</span>
                      <p className="text-[13px] leading-relaxed text-[var(--fg)]">{row.vaultfill}</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2 rounded-xl p-3 ${row.winner === "sprinto" ? "border border-[color-mix(in_srgb,var(--vault-blue)_15%,transparent)] bg-[color-mix(in_srgb,var(--vault-blue)_5%,transparent)]" : ""}`}>
                    <div>
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-2)]">Sprinto</span>
                      <p className="text-[13px] leading-relaxed text-[var(--muted-2)]">{row.sprinto}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── "THEY COMPLEMENT EACH OTHER" ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl border border-[color-mix(in_srgb,var(--vault-blue)_20%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--vault-blue)_8%,transparent)] via-[var(--card-2)] to-[color-mix(in_srgb,var(--glow-indigo)_12%,transparent)] p-8 text-center backdrop-blur-[14px] sm:p-10">
              <h2 className="mb-4 text-xl font-semibold text-[var(--fg)] sm:text-2xl">They Complement Each Other</h2>
              <p className="text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">
                Use Sprinto to earn the certification. Use VaultFill to handle the avalanche of questionnaires that follows.
                Your SOC&nbsp;2 report from Sprinto becomes evidence in VaultFill&apos;s Knowledge Vault.
              </p>
            </div>
          </Reveal>
        </motion.section>

        {/* ────── DIFFERENTIATORS ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              What Sets VaultFill Apart
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-3">
            {differentiators.map((d) => (
              <Reveal key={d.title}>
                <div className="bento-card flex h-full flex-col items-start">
                  <div className="bento-icon mb-4 text-[var(--vault-blue)]">
                    {d.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-[var(--fg)] sm:text-lg">{d.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── TRUST CALLOUT ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-8 backdrop-blur-[14px] sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--glow-cyan)_0%,transparent_70%)] opacity-40" />
              <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <div className="bento-icon shrink-0 text-[var(--vault-blue)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-[var(--fg)]">Honest About Where We Are</h3>
                  <p className="mb-4 text-[14px] leading-relaxed text-[var(--muted)]">
                    VaultFill is designed with SOC&nbsp;2 controls in mind and we&apos;re on a formal audit path — but we haven&apos;t completed
                    certification yet. We&apos;ll update this page the moment we do.
                  </p>
                  <p className="mb-5 text-[14px] leading-relaxed text-[var(--muted)]">
                    In the meantime, our architecture, encryption standards, and data handling practices are documented transparently
                    in our Trust Center.
                  </p>
                  <Link
                    href="/trust-vault"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--vault-blue)] transition-colors hover:text-[var(--fg)]"
                  >
                    Review Our Trust Center →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </motion.section>

        {/* ────── CTA ────── */}
        <Reveal>
          <section className="mb-16 sm:mb-24">
            <div className="relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--vault-blue)_20%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--vault-blue)_10%,transparent)] via-[var(--card-2)] to-[color-mix(in_srgb,var(--glow-indigo)_10%,transparent)] p-8 text-center shadow-[0_22px_70px_var(--glow-cyan)] backdrop-blur-[14px] sm:rounded-3xl sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--glow-cyan)_0%,transparent_70%)]" />

              <div className="relative">
                <h2 className="text-2xl font-semibold text-[var(--fg)] sm:text-3xl">See It In Action</h2>
                <p className="mt-3 text-[14px] text-[var(--muted)] sm:text-base">
                  Paste a real questionnaire. Watch VaultFill draft cited answers from your evidence in real time.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/"
                    className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-[var(--trust)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_var(--glow-cyan)] ring-1 ring-cyan-400/25 transition-all hover:brightness-110"
                  >
                    Start Your Audit →
                    <span className="vault-power" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-8 py-3.5 text-sm font-semibold text-[var(--fg)] backdrop-blur-sm transition-all hover:border-[color-mix(in_srgb,var(--vault-blue)_30%,transparent)]"
                  >
                    Request a Briefing
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
