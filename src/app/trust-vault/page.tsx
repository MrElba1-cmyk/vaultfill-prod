"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── data ─────────────────────────────────────────────── */

const dataHandlingPractices = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: "Encryption in Transit",
    desc: "All connections to VaultFill use TLS (HTTPS). Data never traverses the network in plaintext.",
    status: "active",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "No Model Training",
    desc: "We use OpenAI's enterprise API. Your data is never used to train, fine-tune, or improve any AI models. This is contractually guaranteed by our API agreement.",
    status: "active",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: "Minimal Data Retention",
    desc: "Chat session context is held in server memory for the duration of your conversation only. It is not persisted to disk or any database. Lead info you voluntarily submit is stored securely.",
    status: "active",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: "Tenant Isolation",
    desc: "Each organization's data is logically isolated at the application layer. Cross-tenant access is architecturally prevented through scoped queries and access controls.",
    status: "active",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
    title: "No Account Required",
    desc: "You can try VaultFill without creating an account or providing personal information. A local session ID is used for conversation continuity only.",
    status: "active",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    title: "We Never Sell Your Data",
    desc: "VaultFill does not sell, license, or share customer data with third parties for marketing, advertising, or any purpose beyond providing the service.",
    status: "active",
  },
];

const complianceStatus = [
  {
    framework: "SOC 2 Type II",
    status: "In Progress",
    statusColor: "amber",
    detail: "Architecture designed with SOC 2 controls in mind. Formal audit engagement planned. We'll update this page when certification is achieved.",
  },
  {
    framework: "ISO 27001",
    status: "Planned",
    statusColor: "muted",
    detail: "On our roadmap. We follow ISO 27001 principles in our development practices today, but formal certification has not been initiated.",
  },
  {
    framework: "GDPR",
    status: "Compliant Practices",
    statusColor: "cyan",
    detail: "We process minimal personal data, do not track users across sites, and support data deletion requests. A formal DPA is available for enterprise customers on request.",
  },
];

const dataFlowSteps = [
  {
    step: "1",
    label: "You Upload Evidence",
    desc: "Documents are transmitted via TLS to our servers. We accept PDFs, XLSX, and text-based formats.",
  },
  {
    step: "2",
    label: "AI Processes Your Query",
    desc: "Your question and relevant evidence excerpts are sent to OpenAI's enterprise API. Prompts are not retained by OpenAI after inference.",
  },
  {
    step: "3",
    label: "Response Delivered",
    desc: "VaultFill returns a cited response with links to source documents. Session context is held in server memory only.",
  },
  {
    step: "4",
    label: "Session Ends",
    desc: "When your session ends, conversation context is purged from memory. Uploaded evidence persists in your Knowledge Vault until you delete it.",
  },
];

const whatWeCollect = [
  { what: "Chat session context", where: "Server memory (ephemeral)", retention: "Duration of conversation" },
  { what: "Uploaded evidence documents", where: "Knowledge Vault (server-side)", retention: "Until you delete them" },
  { what: "Lead info (email, org, role)", where: "Secured database", retention: "Until deleted on request" },
  { what: "Browser session ID", where: "localStorage (your browser)", retention: "Until you clear browser data" },
];

const whatWeDoNot = [
  "Train AI models on your data",
  "Sell or share data with third parties",
  "Track you across websites",
  "Require accounts or personal info to try the product",
  "Store chat history to disk after session ends",
  "Use cookies for advertising or analytics",
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

/* ── status badge ─────────────────────────────────────── */

function StatusBadge({ status, color }: { status: string; color: string }) {
  const styles: Record<string, string> = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    cyan: "border-[color-mix(in_srgb,var(--vault-blue)_30%,transparent)] bg-[color-mix(in_srgb,var(--vault-blue)_10%,transparent)] text-[var(--vault-blue)]",
    muted: "border-[var(--border)] bg-transparent text-[var(--muted-2)] border-dashed",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles[color] || styles.muted}`}>
      {status}
    </span>
  );
}

/* ── page ─────────────────────────────────────────────── */

export default function TrustVaultPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Background ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,var(--glow-cyan)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_20%_80%,var(--glow-indigo)_0%,transparent_50%)] opacity-40" />
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
                <span className="text-[var(--fg)]">Trust Center</span>
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
                TRUST CENTER
              </div>
            </Reveal>

            <Reveal>
              <h1 className="mt-7 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--fg)] sm:text-[44px] md:text-[56px]">
                How We Protect{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-[var(--trust)] bg-clip-text text-transparent">Your Data</span>
              </h1>
            </Reveal>

            <Reveal>
              <p className="mt-5 text-[15px] leading-relaxed text-[var(--muted)] sm:text-lg">
                Transparency over marketing. This page documents exactly what VaultFill does with your data,
                what we don&apos;t do, and where we are on our compliance journey. No vague promises — just facts.
              </p>
            </Reveal>
          </div>
        </motion.section>

        {/* ────── DATA HANDLING PRACTICES ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              Our Data Handling Practices
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dataHandlingPractices.map((p) => (
              <Reveal key={p.title}>
                <div className="bento-card flex h-full flex-col items-start">
                  <div className="bento-icon mb-4 text-[var(--vault-blue)]">
                    {p.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-[var(--fg)]">{p.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── DATA FLOW ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
              How Your Data Flows
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mb-10 max-w-2xl text-center text-[14px] text-[var(--muted)] sm:mb-12">
              A transparent look at what happens when you use VaultFill — from upload to response.
            </p>
          </Reveal>

          <div className="mx-auto max-w-3xl space-y-4">
            {dataFlowSteps.map((s, i) => (
              <Reveal key={s.step}>
                <div className="group flex gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5 backdrop-blur-[14px] transition-all hover:border-[color-mix(in_srgb,var(--vault-blue)_18%,transparent)] sm:p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--vault-blue)_12%,transparent)] text-sm font-bold text-[var(--vault-blue)]">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="mb-1 text-[15px] font-semibold text-[var(--fg)]">{s.label}</h3>
                    <p className="text-[13px] leading-relaxed text-[var(--muted)] sm:text-[14px]">{s.desc}</p>
                  </div>
                  {i < dataFlowSteps.length - 1 && (
                    <div className="pointer-events-none absolute -bottom-4 left-[2.15rem] hidden h-4 w-px bg-[var(--border)] sm:block" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── WHAT WE COLLECT ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              What We Collect
            </h2>
          </Reveal>

          {/* Desktop table */}
          <Reveal>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] backdrop-blur-[14px] md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Where It Lives</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {whatWeCollect.map((row, i) => (
                    <tr key={row.what} className={`border-b border-[var(--border)] last:border-b-0 ${i % 2 === 0 ? "" : "bg-[color-mix(in_srgb,var(--vault-blue)_2%,transparent)]"}`}>
                      <td className="px-6 py-4 font-medium text-[var(--fg)]">{row.what}</td>
                      <td className="px-6 py-4 text-[var(--muted)]">{row.where}</td>
                      <td className="px-6 py-4 text-[var(--muted)]">{row.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Mobile stacked */}
          <div className="space-y-3 md:hidden">
            {whatWeCollect.map((row) => (
              <Reveal key={row.what}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5 backdrop-blur-[14px]">
                  <div className="mb-2 text-sm font-semibold text-[var(--fg)]">{row.what}</div>
                  <div className="text-[13px] text-[var(--muted)]">
                    <span className="text-[var(--muted-2)]">Where:</span> {row.where}
                  </div>
                  <div className="text-[13px] text-[var(--muted)]">
                    <span className="text-[var(--muted-2)]">Retention:</span> {row.retention}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── WHAT WE DON'T DO ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:mb-12 sm:text-3xl">
              What We Don&apos;t Do
            </h2>
          </Reveal>

          <div className="mx-auto max-w-2xl space-y-3">
            {whatWeDoNot.map((item) => (
              <Reveal key={item}>
                <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-5 py-4 backdrop-blur-[14px] transition-all duration-200 hover:border-red-500/20">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-[14px] leading-relaxed text-[var(--muted)] sm:text-[15px]">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── COMPLIANCE STATUS ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <Reveal>
            <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
              Compliance Status
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mb-10 max-w-2xl text-center text-[14px] text-[var(--muted)] sm:mb-12">
              We believe in honesty over hype. Here&apos;s exactly where we stand on formal certifications.
            </p>
          </Reveal>

          <div className="mx-auto max-w-3xl space-y-4">
            {complianceStatus.map((c) => (
              <Reveal key={c.framework}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-6 backdrop-blur-[14px] transition-all hover:border-[color-mix(in_srgb,var(--vault-blue)_18%,transparent)] sm:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[var(--fg)]">{c.framework}</h3>
                    <StatusBadge status={c.status} color={c.statusColor} />
                  </div>
                  <p className="text-[14px] leading-relaxed text-[var(--muted)]">{c.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.section>

        {/* ────── SUBPROCESSORS ────── */}
        <motion.section className="pb-20 sm:pb-24" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Reveal>
            <h2 className="mb-4 text-center text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
              Subprocessors
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mb-10 max-w-2xl text-center text-[14px] text-[var(--muted)] sm:mb-12">
              Third-party services that process data on our behalf.
            </p>
          </Reveal>

          <Reveal>
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] backdrop-blur-[14px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Provider</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)]">Purpose</th>
                    <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted-2)] sm:table-cell">Data Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="px-6 py-4 font-medium text-[var(--fg)]">OpenAI</td>
                    <td className="px-6 py-4 text-[var(--muted)]">AI inference (questionnaire responses)</td>
                    <td className="hidden px-6 py-4 text-[var(--muted)] sm:table-cell">Zero retention (enterprise API)</td>
                  </tr>
                  <tr className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--vault-blue)_2%,transparent)]">
                    <td className="px-6 py-4 font-medium text-[var(--fg)]">Vercel</td>
                    <td className="px-6 py-4 text-[var(--muted)]">Application hosting &amp; CDN</td>
                    <td className="hidden px-6 py-4 text-[var(--muted)] sm:table-cell">Standard infrastructure logs</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="px-6 py-4 font-medium text-[var(--fg)]">Stripe</td>
                    <td className="px-6 py-4 text-[var(--muted)]">Payment processing</td>
                    <td className="hidden px-6 py-4 text-[var(--muted)] sm:table-cell">Per Stripe&apos;s data retention policy</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-[var(--fg)]">PostgreSQL (Vercel)</td>
                    <td className="px-6 py-4 text-[var(--muted)]">Lead storage &amp; application data</td>
                    <td className="hidden px-6 py-4 text-[var(--muted)] sm:table-cell">Until deleted on request</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </motion.section>

        {/* ────── CONTACT ────── */}
        <Reveal>
          <section className="mb-16 sm:mb-24">
            <div className="relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--vault-blue)_20%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--vault-blue)_8%,transparent)] via-[var(--card-2)] to-[color-mix(in_srgb,var(--glow-indigo)_8%,transparent)] p-8 text-center backdrop-blur-[14px] sm:rounded-3xl sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--glow-cyan)_0%,transparent_70%)] opacity-40" />

              <div className="relative">
                <h2 className="text-2xl font-semibold text-[var(--fg)] sm:text-3xl">Questions About Security?</h2>
                <p className="mt-3 text-[14px] text-[var(--muted)] sm:text-base">
                  We&apos;re happy to walk through our architecture, provide a DPA, or answer specific security questions.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <a
                    href="mailto:security@vaultfill.com"
                    className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-[var(--trust)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_var(--glow-cyan)] ring-1 ring-cyan-400/25 transition-all hover:brightness-110"
                  >
                    security@vaultfill.com
                    <span className="vault-power" aria-hidden="true" />
                  </a>
                  <p className="text-[13px] text-[var(--muted-2)]">
                    Or reach our general team at{" "}
                    <a href="mailto:hello@vaultfill.com" className="text-[var(--vault-blue)] transition-colors hover:text-[var(--fg)]">
                      hello@vaultfill.com
                    </a>
                  </p>
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
