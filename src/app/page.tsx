"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import ThemeToggle from "@/components/ThemeToggle";
import LeadModal from "@/components/LeadModal";
import LivePreview from "@/components/LivePreview";
import ErrorBoundary from "@/components/ErrorBoundary";
import WorkflowDemo from "@/components/WorkflowDemo";
import { useModal } from "@/contexts/ModalContext";

const complianceBadges = ["SOC 2 Type II", "ISO 27001", "GDPR", "AES-256"];

const features = [
  {
    title: "Automated Questionnaire Drafting",
    desc: "Upload evidence once. VaultFill drafts consistent, citation-backed answers across SOC 2, SIG, DDQ, and custom formats.",
    icon: "🛡️",
  },
  {
    title: "RAG-Powered Citations",
    desc: "Every answer links back to the exact source — policy section, audit paragraph, or pen-test finding.",
    icon: "🔗",
  },
  {
    title: "Evidence Knowledge Vault",
    desc: "Centralize policies, audit artifacts, and standard responses into a searchable vault that compounds over time.",
    icon: "📚",
  },
  {
    title: "Security-First Architecture",
    desc: "Tenant isolation, encrypted evidence storage, and audit trails designed for enterprise compliance requirements.",
    icon: "🔒",
  },
];

const steps = [
  {
    num: "01",
    title: "Ingest Evidence",
    desc: "Drop in policies, SOC 2/ISO artifacts, vendor docs, and standard responses. VaultFill indexes everything into your private Knowledge Vault.",
  },
  {
    num: "02",
    title: "Generate Drafts",
    desc: "RAG drafts accurate responses with inline citations. Low-confidence answers are flagged for human review.",
  },
  {
    num: "03",
    title: "Approve & Export",
    desc: "Refine, approve, and export. Every edit is logged in an audit-ready trail that your reviewers can trust.",
  },
];

const faqs = [
  {
    q: "What questionnaire formats do you support?",
    a: "SOC 2, SIG, DDQ, CAIQ, and custom spreadsheet-based formats. We add more based on customer demand.",
  },
  {
    q: "How is this different from Vanta or Drata?",
    a: "Those tools manage your compliance program. VaultFill focuses specifically on answering security questionnaires faster — using your existing evidence, with citations a reviewer can verify.",
  },
  {
    q: "Is our data safe?",
    a: "Evidence is encrypted at rest and in transit. Tenant isolation is enforced with row-level security. We never train on your data.",
  },
  {
    q: "How fast can we see results?",
    a: "If your core evidence is ready, VaultFill generates a usable first draft in under 10 minutes.",
  },
];

// Subtle, snappy reveal: y 10 -> 0
const reveal = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const section = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.02 },
  },
};

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ApexLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: 'rgba(0, 212, 255, 0.08)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        boxShadow: '0 0 24px rgba(0, 212, 255, 0.12)',
      }}
    >
      <svg viewBox="0 0 512 512" style={{ width: size * 0.6, height: size * 0.6 }} aria-hidden="true">
        <polygon points="256,72 256,228 138,268" fill="#00D4FF"/>
        <polygon points="256,72 256,228 374,268" fill="#6366F1"/>
        <polygon points="140,272 372,272 256,420" fill="#CBD5E1"/>
      </svg>
    </div>
  );
}

export default function Home() {
  const [leadOpen, setLeadOpen] = useState(false);
  const { isLeadModalOpen, openLeadModal, closeLeadModal } = useModal();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Clean, stable background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(0,212,255,0.10)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:92px_92px] dark:[background-image:linear-gradient(to_right,rgba(226,232,240,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.06)_1px,transparent_1px)]" />
      </div>

      <LeadModal open={isLeadModalOpen} onClose={closeLeadModal} />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[14px]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ApexLogo />
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-wide text-[var(--fg)] sm:text-sm">VaultFill</div>
              <div className="hidden text-[11px] text-[var(--muted-2)] sm:block">Security Questionnaire Automation</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[var(--muted-2)] md:flex">
            <a className="transition-colors hover:text-[var(--fg)]" href="#features">Features</a>
            <a className="transition-colors hover:text-[var(--fg)]" href="#how-it-works">Workflow</a>
            <a className="transition-colors hover:text-[var(--fg)]" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openLeadModal();
              }}
              className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_18px_60px_rgba(0,212,255,0.20)] ring-1 ring-cyan-400/20 transition-all hover:brightness-110 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <span className="relative">Get Early Access</span>
              <span className="vault-power" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* HERO */}
        <motion.section
          className="pb-12 pt-10 sm:pb-16 sm:pt-14 md:pb-20 md:pt-20"
          variants={section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="grid gap-10 sm:gap-14 md:grid-cols-2 md:items-center">
            <div>
              <Reveal>
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold"
                  style={{ color: "var(--vault-blue)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Enterprise-grade, evidence-backed automation
                </div>
              </Reveal>

              <Reveal>
                <h1 className="mt-6 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--fg)] sm:mt-8 sm:text-4xl md:text-[58px]">
                  Security questionnaires,
                  <span className="text-gradient-blue"> completed at enterprise speed.</span>
                </h1>
              </Reveal>

              <Reveal>
                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-[15.5px] md:text-lg">
                  Turn policies, audit artifacts, and standard responses into a private Knowledge Vault.
                  VaultFill drafts answers with <span className="font-semibold text-[var(--fg)]">verifiable citations</span> —
                  so reviewers approve in minutes, not weeks.
                </p>
              </Reveal>

              <Reveal>
                <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                  <Link
                    id="get-started"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openLeadModal();
                    }}
                    className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-cyan-500 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(0,212,255,0.25)] ring-1 ring-cyan-400/20 transition-all hover:brightness-110"
                  >
                    Start Free Trial
                    <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="vault-power" aria-hidden="true" />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white/5 px-7 py-3.5 text-sm font-semibold text-[var(--fg)] transition-all hover:bg-white/10"
                  >
                    See the workflow
                  </a>
                </div>
              </Reveal>

              <Reveal>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[var(--muted-2)]">
                  {complianceBadges.map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {badge}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div>
              <Reveal>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-4 shadow-[var(--shadow-natural)] backdrop-blur-[14px] sm:rounded-3xl sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[var(--fg)]">Security Questionnaire — Draft</div>
                    <div className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold" style={{ color: "var(--vault-blue)" }}>
                      AI Drafting
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        q: "Do you encrypt data at rest?",
                        a: "Yes — AES-256 is applied to all stored data. Keys are managed via a dedicated KMS.",
                        cite: "security-policy.pdf § 3.2",
                      },
                      {
                        q: "How do you manage vendor risk?",
                        a: "Vendors are assessed pre-engagement with scorecards and reviewed quarterly.",
                        cite: "vendor-mgmt-procedure.pdf",
                      },
                      {
                        q: "Describe your incident response process.",
                        a: "Our IR plan defines roles, escalation timelines, and mandatory post-incident reviews.",
                        cite: "IR-Plan.pdf § Appendix A",
                      },
                    ].map((item) => (
                      <div key={item.q} className="rounded-xl border border-[var(--border)] bg-black/15 p-3 sm:rounded-2xl sm:p-4">
                        <div className="text-[11px] font-semibold text-[var(--muted-2)]">{item.q}</div>
                        <div className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{item.a}</div>
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold" style={{ color: "var(--vault-blue)" }}>
                            {item.cite}
                          </span>
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            ✓ Reviewed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-[var(--border)] bg-cyan-500/5 p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-[var(--muted-2)]">Draft completed in</div>
                        <div className="mt-1 text-2xl font-semibold text-[var(--fg)]">8 minutes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-[var(--muted-2)]">Questions answered</div>
                        <div className="mt-1 text-2xl font-semibold" style={{ color: "var(--vault-blue)" }}>
                          47 / 52
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </motion.section>

        <ErrorBoundary>
          <LivePreview onCta={openLeadModal} />
        </ErrorBoundary>

        {/* TRUSTED BY */}
        <motion.section className="border-y border-[var(--border)] py-10" variants={section} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-2)]">
              Trusted by forward-thinking teams
            </p>
          </Reveal>
          <Reveal>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 opacity-85">
              {["Acme Corp", "TechVault", "SecureStack", "CloudGuard", "DataShield"].map((name) => (
                <div key={name} className="text-sm font-semibold tracking-wide text-[var(--muted)]">
                  {name}
                </div>
              ))}
            </div>
          </Reveal>
        </motion.section>

        {/* FEATURES (uniform heights + stagger) */}
        <motion.section id="features" className="py-14 sm:py-20 md:py-24" variants={section} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }}>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold" style={{ color: "var(--vault-blue)" }}>
              Capabilities
            </div>
          </Reveal>
          <Reveal>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:mt-5 sm:text-3xl md:text-4xl">
              Built for speed.
              <br />
              Designed for trust.
            </h2>
          </Reveal>
          <Reveal>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
              Stop rewriting answers from scratch. Centralize evidence, generate consistent responses,
              and keep citations close for reviewers who need to verify fast.
            </p>
          </Reveal>

          <motion.div
            className="mt-12 grid items-stretch gap-5 md:grid-cols-12"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.10 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            <motion.div className="md:col-span-8" variants={reveal} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="bento-card group flex h-full flex-col">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="bento-kicker">Knowledge Vault</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[var(--fg)]">
                      Your evidence becomes a compounding asset.
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                      Policies, audit artifacts, and standard responses stay organized, searchable, and ready.
                      VaultFill references the right source every time — without manual hunting.
                    </p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <div className="bento-icon" aria-hidden="true">📦</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {["Policies", "SOC 2", "ISO Artifacts", "Pen Tests", "Customer Docs", "Standard Answers"].map((t) => (
                    <div key={t} className="rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-[11px] font-semibold text-[var(--muted)]">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div className="md:col-span-4 grid items-stretch gap-5" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.10 } } }}>
              {features.slice(0, 2).map((f) => (
                <motion.div key={f.title} className="h-full" variants={reveal} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="bento-card group flex h-full flex-col">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="bento-kicker">
                          {f.icon} {f.title}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
                      </div>
                      <div className="bento-icon" aria-hidden="true">{f.icon}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {features.slice(2).map((f) => (
              <motion.div key={f.title} className="md:col-span-6" variants={reveal} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                <div className="bento-card group flex h-full flex-col">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="bento-kicker">
                        {f.icon} {f.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
                    </div>
                    <div className="bento-icon" aria-hidden="true">{f.icon}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* WORKFLOW - Interactive Demo */}
        <motion.section id="how-it-works" className="py-14 sm:py-20 md:py-24" variants={section} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }}>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold" style={{ color: "var(--vault-blue)" }}>
              Workflow
            </div>
          </Reveal>
          <Reveal>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:mt-5 sm:text-3xl md:text-4xl">Three steps to done.</h2>
          </Reveal>
          <Reveal>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
              A simple workflow that turns your existing security artifacts into a compounding asset.
            </p>
          </Reveal>

          <div className="mt-12">
            <WorkflowDemo />
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section id="faq" className="py-14 sm:py-20 md:py-24" variants={section} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.16 }}>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold" style={{ color: "var(--vault-blue)" }}>
              FAQ
            </div>
          </Reveal>
          <Reveal>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:mt-5 sm:text-3xl md:text-4xl">Common questions.</h2>
          </Reveal>

          <motion.div
            className="mt-10 grid items-stretch gap-5 md:grid-cols-2"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
          >
            {faqs.map((f) => (
              <motion.div key={f.q} className="h-full" variants={reveal} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                <div className="bento-card h-full">
                  <h3 className="text-base font-semibold text-[var(--fg)]">{f.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{f.a}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <footer className="border-t border-[var(--border)] pb-14 pt-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <ApexLogo size={38} />
              <div>
                <div className="text-sm font-semibold text-[var(--fg)]">VaultFill</div>
                <div className="text-[11px] text-[var(--muted-2)]">Evidence-backed answers for security questionnaires.</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 py-1 text-[10px] font-semibold" style={{ color: "var(--vault-blue)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Houston-born
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--muted-2)]">
              <a href="#" className="transition-colors hover:text-[var(--fg)]">Privacy</a>
              <a href="#" className="transition-colors hover:text-[var(--fg)]">Terms</a>
              <a href="#" className="transition-colors hover:text-[var(--fg)]">Security</a>
              <span>© {new Date().getFullYear()} VaultFill. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
