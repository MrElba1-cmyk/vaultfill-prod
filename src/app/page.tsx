"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { motion } from "framer-motion";

import ThemeToggle from "@/components/ThemeToggle";
import LeadModal from "@/components/LeadModal";
import LivePreview from "@/components/LivePreview";
import ErrorBoundary from "@/components/ErrorBoundary";
import WorkflowDemo from "@/components/WorkflowDemo";
import SandboxBanner from "@/components/SandboxBanner";
import TrustBadges from "@/components/TrustBadges";
import PrivacyPromise from "@/components/PrivacyPromise";
import SocialProof from "@/components/SocialProof";
import TryItCTA from "@/components/TryItCTA";
import FloatingChat from "@/components/FloatingChat";
import LiveAuditFeed from "@/components/LiveAuditFeed";
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
    desc: "Tenant isolation, secure evidence handling, and audit trails designed for enterprise compliance requirements.",
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
    a: "Data is encrypted in transit via TLS. Tenant isolation is enforced at the application layer. We use OpenAI's enterprise API which does not train on your data.",
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
    <div className="min-h-screen mesh-emerald text-[var(--fg)] selection:bg-emerald-500/30">
      {/* Clean, stable background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(52,211,153,0.08)_0%,transparent_62%)] opacity-80" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <LeadModal open={isLeadModalOpen} onClose={closeLeadModal} />

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#03060B]/20 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <ApexLogo size={36} />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight text-[var(--fg)]">VaultFill</div>
              <div className="hidden text-[10px] font-medium uppercase tracking-widest text-emerald-500/60 sm:block">Apex Compliance</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-10 text-[13px] font-medium tracking-wide text-[var(--muted-2)] md:flex">
            <Link className="transition-colors hover:text-emerald-400" href="/about">Platform</Link>
            <Link className="transition-colors hover:text-emerald-400" href="/security">Security</Link>
            <Link className="transition-colors hover:text-emerald-400" href="/pricing">Pricing</Link>
            <Link className="transition-colors hover:text-emerald-400" href="/internal/roadmap">Roadmap</Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <SignedOut>
              <button
                onClick={openLeadModal}
                className="group relative h-10 overflow-hidden rounded-full bg-emerald-500 px-6 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">Get Early Access</span>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6">
        {/* 1 · SANDBOX BANNER */}
        <div className="pt-6">
          <SandboxBanner />
        </div>

        {/* 2 · HERO */}
        <motion.section
          className="pb-20 pt-16 md:pb-32 md:pt-28"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          <div className="text-center">
            <motion.div
              variants={reveal}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Next-Gen Evidence RAG
            </motion.div>

            <motion.h1 
              variants={reveal}
              className="mx-auto mt-8 max-w-4xl text-5xl font-bold tracking-tight text-[var(--fg)] sm:text-7xl md:text-8xl"
            >
              Master Your <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">Compliance Vault</span>
            </motion.h1>

            <motion.p 
              variants={reveal}
              className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl"
            >
              VaultFill transforms static security artifacts into a live, interactive knowledge engine. 
              Draft verifiable SOC 2 and SIG responses in seconds, not weeks.
            </motion.p>

            <motion.div 
              variants={reveal}
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <button
                onClick={openLeadModal}
                className="group relative flex h-16 items-center gap-3 rounded-2xl bg-emerald-600 px-12 text-lg font-bold text-white transition-all hover:scale-[1.03] hover:bg-emerald-500 active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] ring-1 ring-white/20"
              >
                Start Your Vault
                <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <a
                href="#how-it-works"
                className="flex h-14 items-center rounded-2xl border border-white/10 bg-white/5 px-10 text-base font-semibold text-[var(--fg)] backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Watch Workflow
              </a>
            </motion.div>
          </div>

          <motion.div 
            variants={reveal}
            className="relative mx-auto mt-24 max-w-5xl"
          >
            <div className="glass-card subpixel-border relative z-10 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <span className="ml-4 text-[11px] font-bold uppercase tracking-widest text-white/40">Security Intelligence Portal</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 rounded-full bg-white/5">
                    <div className="h-full w-[85%] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400">85% Complete</span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Incoming Question</div>
                      <div className="text-sm font-medium text-white/90">"Describe your policy for data encryption at rest and in transit."</div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Suggested Draft</div>
                        <div className="text-[9px] font-bold bg-emerald-400 text-black px-2 py-0.5 rounded">98% Confidence</div>
                      </div>
                      <div className="text-sm leading-relaxed text-emerald-100/80">
                        "VaultFill enforces AES-256 encryption at rest and TLS 1.3 for data in transit. Keys are rotated annually via HSM."
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400/80">Source: Sec-Policy-2025.pdf (Page 12)</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/40 p-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6">Real-time Metrics</div>
                    <div className="space-y-6">
                      {[
                        { label: "Questions Drafted", value: "1,284", color: "emerald" },
                        { label: "Citations Verified", value: "99.8%", color: "cyan" },
                        { label: "Hours Reclaimed", value: "412h", color: "indigo" },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-white/60">{stat.label}</span>
                            <span className="text-sm font-bold text-white">{stat.value}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "70%" }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full rounded-full bg-${stat.color}-500`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Glows for Hero Visual */}
            <div className="absolute -left-20 -top-20 -z-10 h-64 w-64 bg-emerald-500/20 blur-[120px]" />
            <div className="absolute -right-20 -bottom-20 -z-10 h-64 w-64 bg-indigo-500/20 blur-[120px]" />
          </motion.div>
        </motion.section>

        {/* 3 · SECURITY TRUST CARDS */}
        <div className="pb-14">
          <TrustBadges />
        </div>

        {/* 3.5 · LIVE AUDIT FEED */}
        <div className="py-14 sm:py-20">
          <Reveal>
            <div className="bento-kicker text-[var(--apex-emerald)] mb-4">AUTONOMOUS AUDIT FEED</div>
            <LiveAuditFeed />
          </Reveal>
        </div>

        {/* 4 · LIVE QUESTIONNAIRE DEMO */}
        <ErrorBoundary>
          <LivePreview onCta={openLeadModal} />
        </ErrorBoundary>

        {/* 5 · PRIVACY PROMISE */}
        <PrivacyPromise />

        {/* 6+7 · KNOWLEDGE VAULT + CAPABILITIES */}
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
                    <div key={t} className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-3 py-2 text-[11px] font-semibold text-[var(--muted)]">
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

        {/* 9 · SOCIAL PROOF */}
        <SocialProof />

        {/* 10 · FAQ */}
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

        {/* 11 · TRY IT CTA */}
        <TryItCTA />

        {/* 12 · FOOTER */}
        <footer className="border-t border-[var(--border)] pb-14 pt-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <ApexLogo size={38} />
              <div>
                <div className="text-sm font-semibold text-[var(--fg)]">VaultFill</div>
                <div className="text-[11px] text-[var(--muted-2)]">Evidence-backed answers for security questionnaires.</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-2)] px-3 py-1 text-[10px] font-semibold" style={{ color: "var(--vault-blue)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Houston-born
                </div>
              </div>
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--muted-2)]">
              <Link href="/about" className="transition-colors hover:text-[var(--fg)]">About</Link>
              <Link href="/contact" className="transition-colors hover:text-[var(--fg)]">Contact</Link>
              <Link href="/privacy" className="transition-colors hover:text-[var(--fg)]">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-[var(--fg)]">Terms</Link>
              <Link href="/security" className="transition-colors hover:text-[var(--fg)]">Security</Link>
              <span>© {new Date().getFullYear()} VaultFill. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>

      {/* 13 · FLOATING CHAT */}
      <FloatingChat />
    </div>
  );
}
