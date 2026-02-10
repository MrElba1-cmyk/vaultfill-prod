import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VaultFill vs. Vanta — An Honest Comparison | VaultFill",
  description:
    "Compare VaultFill's document-native, zero-knowledge questionnaire automation with Vanta's integration-heavy compliance platform. See which fits your team.",
  openGraph: {
    title: "VaultFill vs. Vanta — An Honest Comparison",
    description:
      "Vanta is a great compliance platform. VaultFill is a different tool for a different job. See the honest comparison.",
  },
};

const comparisonRows = [
  {
    area: "Approach",
    vaultfill: "Document-native AI — upload your docs, get answers",
    vanta: "Integration-heavy — connects to your full tech stack",
  },
  {
    area: "Setup Time",
    vaultfill: "Minutes. Upload documents, start answering.",
    vanta: "Weeks. Requires onboarding, integration setup, and configuration.",
  },
  {
    area: "Privacy",
    vaultfill: "Zero-knowledge architecture. Your docs stay yours.",
    vanta: "Requires deep access to cloud infrastructure, repos, and HR systems.",
  },
  {
    area: "Focus",
    vaultfill: "Purpose-built for security questionnaire automation",
    vanta: "Broad compliance platform (SOC 2, ISO 27001, HIPAA, etc.)",
  },
  {
    area: "Citations",
    vaultfill: "RAG-powered — every answer links back to your source documents",
    vanta: "AI-assisted answers without granular source attribution",
  },
  {
    area: "Data Residency",
    vaultfill: "Texas-based infrastructure with local data control",
    vanta: "Cloud-dependent with standard enterprise hosting",
  },
  {
    area: "Pricing",
    vaultfill: "Lean startup pricing — built for founders and small teams",
    vanta: "Enterprise-tier pricing ($10K–$20K+/year with add-ons)",
  },
];

const switchingReasons = [
  {
    num: "01",
    title: "Integration Fatigue",
    problem:
      "Vanta's power comes from 300+ integrations — connecting your AWS, GitHub, HR tools, identity providers, and more. For many teams, especially lean startups, that's a feature that becomes a burden. Every integration needs setup, maintenance, and monitoring. When one breaks, your compliance posture looks broken too.",
    solution:
      "VaultFill takes a different path. Upload your existing security docs — policies, SOC 2 reports, penetration test results — and the AI learns from what you already have. No API keys. No broken webhooks. No integration debt.",
  },
  {
    num: "02",
    title: "Privacy Concerns",
    problem:
      "To do its job, Vanta needs read access across your infrastructure: cloud accounts, code repositories, endpoint management, HR platforms. For companies handling sensitive data or operating under strict privacy requirements, that level of access can be a dealbreaker.",
    solution:
      "VaultFill operates on a zero-knowledge model. We process your uploaded documents — nothing more. We don't connect to your infrastructure, read your codebase, or access employee data. Your security posture stays between you and your documents.",
  },
  {
    num: "03",
    title: "Questionnaire-Specific Focus",
    problem:
      "Vanta is a compliance platform — it monitors controls, collects evidence, manages audits, and yes, helps with questionnaires. But questionnaire automation is one feature among dozens. When that's the problem you actually need solved today, a purpose-built tool outperforms a Swiss Army knife.",
    solution:
      "VaultFill is built from the ground up for one workflow: turning your existing documentation into accurate, cited, human-quality questionnaire responses. Our RAG-powered Shield Bot doesn't just generate generic answers — it pulls from your specific evidence and links every response back to the source.",
  },
];

const audiencePoints = [
  "Spend hours every week copy-pasting answers into security questionnaires and vendor assessments",
  "Don't need (or want) a full compliance platform — they already have their policies, SOC 2 report, and controls in place",
  "Care deeply about data privacy and don't want to hand infrastructure access to another vendor",
  "Need to move fast — a founder closing a deal shouldn't wait weeks for onboarding",
  "Operate with lean teams where the person answering questionnaires is also the person building the product",
];

export default function VantaComparePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(0,212,255,0.10)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:92px_92px] dark:[background-image:linear-gradient(to_right,rgba(226,232,240,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.06)_1px,transparent_1px)]" />
      </div>

      {/* Nav breadcrumb */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[14px]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid rgba(0, 212, 255, 0.15)",
                boxShadow: "0 0 24px rgba(0, 212, 255, 0.12)",
              }}
            >
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
              <div className="text-[11px] text-[var(--muted-2)]">
                <span className="hidden sm:inline">Security Questionnaire Automation</span>
                <span className="sm:hidden">Compare</span>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--fg)] transition-all hover:bg-white/10 sm:text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pb-12 pt-12 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold"
              style={{ color: "var(--vault-blue)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Honest Comparison
            </div>

            <h1 className="mt-6 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--fg)] sm:text-4xl md:text-[52px]">
              VaultFill vs. Vanta
              <span className="text-gradient-blue"> — An Honest Comparison</span>
            </h1>

            <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted)] sm:text-lg">
              <strong className="text-[var(--fg)]">Vanta is a great compliance platform. VaultFill is a different tool for a different job.</strong>
            </p>

            <p className="mt-4 text-[14px] leading-relaxed text-[var(--muted)] sm:text-base">
              Vanta helps companies manage entire compliance programs — SOC 2, ISO 27001, HIPAA, and more — across hundreds of integrations. VaultFill does one thing exceptionally well:{" "}
              <strong className="text-[var(--fg)]">answer security questionnaires fast, accurately, and privately.</strong>
            </p>

            <p className="mt-4 text-[13px] text-[var(--muted-2)] sm:text-sm">
              If you need a full compliance platform, Vanta may be the right choice. If you need to stop losing days to repetitive questionnaire work, keep reading.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="pb-16 sm:pb-20">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
            Head-to-Head Comparison
          </h2>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] shadow-[var(--shadow-natural)] backdrop-blur-[14px] md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Area</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--vault-blue)" }}>
                    VaultFill
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Vanta</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.area} className={i < comparisonRows.length - 1 ? "border-b border-[var(--border)]" : ""}>
                    <td className="px-6 py-4 font-semibold text-[var(--fg)]">{row.area}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      <span className="inline-flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {row.vaultfill}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-2)]">{row.vanta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {comparisonRows.map((row) => (
              <div key={row.area} className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 shadow-[var(--shadow-natural)] backdrop-blur-[14px]">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">{row.area}</div>
                <div className="mb-2 flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--vault-blue)" }}>VaultFill</span>
                    <p className="text-sm text-[var(--muted)]">{row.vaultfill}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pl-6">
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--muted-2)]">Vanta</span>
                    <p className="text-sm text-[var(--muted-2)]">{row.vanta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Teams Are Switching */}
        <section className="pb-16 sm:pb-20">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
            Why Teams Are Switching
          </h2>

          <div className="space-y-8">
            {switchingReasons.map((reason) => (
              <div
                key={reason.num}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-6 shadow-[var(--shadow-natural)] backdrop-blur-[14px] sm:rounded-3xl sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      background: "rgba(0, 212, 255, 0.08)",
                      border: "1px solid rgba(0, 212, 255, 0.15)",
                      color: "var(--vault-blue)",
                    }}
                  >
                    {reason.num}
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--fg)]">{reason.title}</h3>
                </div>
                <p className="mb-4 text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">{reason.problem}</p>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[14px] font-medium leading-relaxed text-[var(--fg)] sm:text-[15px]">
                    <span className="mr-1.5 text-emerald-400">→</span>
                    {reason.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who VaultFill Is For */}
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
              Who VaultFill Is For
            </h2>
            <p className="mb-6 text-center text-[14px] text-[var(--muted)] sm:text-base">
              VaultFill is built for teams who:
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-6 shadow-[var(--shadow-natural)] backdrop-blur-[14px] sm:rounded-3xl sm:p-8">
              <ul className="space-y-4">
                {audiencePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-center text-[13px] text-[var(--muted-2)] sm:text-sm">
              If that sounds like you, VaultFill fits. If you need continuous compliance monitoring across multiple frameworks with deep infrastructure integrations, Vanta is worth evaluating.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-8 text-center shadow-[var(--shadow-natural)] backdrop-blur-[14px] sm:rounded-3xl sm:p-12">
            <h2 className="text-2xl font-semibold text-[var(--fg)] sm:text-3xl">See It in Action</h2>
            <p className="mt-3 text-[14px] text-[var(--muted)] sm:text-base">
              <strong className="text-[var(--fg)]">Ready to stop losing hours to questionnaires?</strong>
            </p>
            <p className="mt-2 text-[13px] text-[var(--muted-2)] sm:text-sm">
              Drop in a security question and watch it pull accurate, cited answers from your own documentation — in seconds, not days. No signup required.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(0,212,255,0.25)] ring-1 ring-cyan-400/20 transition-all hover:brightness-110"
              >
                Try the Shield Bot →
                <span className="vault-power" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted-2)]">
        <p>Last updated: February 9, 2026</p>
        <p className="mt-1">
          <Link href="/" className="transition-colors hover:text-[var(--fg)]">
            VaultFill
          </Link>{" "}
          — Security Questionnaire Automation
        </p>
      </footer>
    </div>
  );
}
