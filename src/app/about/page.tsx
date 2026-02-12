'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AINodeIcon from '@/components/icons/AINodeIcon';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { label: 'Hours Reclaimed', value: '42k+' },
    { label: 'Evidence Indexed', value: '1.2M+' },
    { label: 'Draft Accuracy', value: '99.4%' },
  ];

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 sm:py-20 bg-[var(--bg)] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-5xl"
      >
        {/* Hero Section */}
        <div className="glass-card p-8 sm:p-16 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <AINodeIcon variant="vault" size={240} className="text-[var(--vault-blue)]" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 mb-8 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
              <AINodeIcon variant="vault" size={32} className="text-[var(--vault-blue)]" glow />
            </div>
            <p className="bento-kicker text-[var(--vault-blue)] mb-4">THE MISSION</p>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[var(--fg)] mb-6 leading-[1.05]">
              Scaling trust at the <span className="text-gradient-apex">speed of product.</span>
            </h1>
            <p className="text-[var(--muted)] text-lg sm:text-xl leading-relaxed">
              Legacy compliance was built for static infrastructure. Modern companies ship continuously. 
              VaultFill compresses the audit loop into minutes, transforming security questionnaires from a bottleneck into a competitive advantage.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-[var(--border)] pt-12 relative z-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-[var(--fg)] mb-1">{s.value}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-[var(--muted-2)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="grid gap-8 md:grid-cols-12 mb-8">
          <div className="md:col-span-7 bento-card flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4">Why we built VaultFill</h2>
            <div className="space-y-4 text-[var(--muted)] text-base leading-relaxed">
              <p>
                As security engineers, we spent 30% of our time copy-pasting answers from PDF policies into massive spreadsheets. It was manual, error-prone, and a waste of talent.
              </p>
              <p>
                We realized the problem wasn't a lack of information—it was a <strong>retrieval gap</strong>. Your evidence exists, but it's trapped in static documents.
              </p>
              <p>
                VaultFill was born to bridge that gap. We use RAG (Retrieval-Augmented Generation) to give your compliance team a "second brain" that remembers every policy section and pen-test finding.
              </p>
            </div>
          </div>
          <div className="md:col-span-5 bento-card bg-gradient-to-br from-[var(--vault-blue)]/10 to-transparent flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 rounded-full bg-[var(--vault-blue)] flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
              <AINodeIcon variant="shield" size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-[var(--fg)] mb-2">Security-First AI</h3>
            <p className="text-sm text-[var(--muted)]">
              Built on isolated infrastructure. We never train on your data. Your evidence is your own.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[
            {
              title: 'Total Verifiability',
              desc: 'Every answer is backed by an inline citation to your source evidence. No hallucinations, only facts.',
              icon: 'link'
            },
            {
              title: 'Tenant Isolation',
              desc: 'Data is strictly compartmentalized at the database and application layers. Enterprise-grade security by default.',
              icon: 'shield'
            },
            {
              title: 'Continuous Compliance',
              desc: 'Your Knowledge Vault updates as your policies evolve, ensuring every questionnaire is answered with the latest truth.',
              icon: 'report'
            }
          ].map((v) => (
            <div key={v.title} className="bento-card group hover:scale-[1.02] transition-transform">
              <div className="h-12 w-12 rounded-xl bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 grid place-items-center mb-6 group-hover:bg-[var(--vault-blue)]/20 transition-colors">
                <AINodeIcon variant={v.icon as any} size={24} className="text-[var(--vault-blue)]" />
              </div>
              <h3 className="text-[var(--fg)] font-bold text-xl mb-3 tracking-tight">{v.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bento-card border-[var(--vault-blue)]/30 bg-[var(--vault-blue)]/5 p-12 text-center">
          <h2 className="text-3xl font-bold text-[var(--fg)] mb-4">Ready to reclaim your time?</h2>
          <p className="text-[var(--muted)] mb-8 max-w-lg mx-auto">
            Join 40+ security teams who have automated their compliance response cycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="px-8 py-4 bg-[var(--vault-blue)] text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-cyan-500/25"
            >
              Get Started
            </Link>
            <Link 
              href="/"
              className="px-8 py-4 border border-[var(--border)] text-[var(--fg)] font-bold rounded-2xl hover:bg-[var(--card)] transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-[var(--muted-2)] uppercase tracking-[0.2em] font-bold">
            VaultFill // Built in Houston for the global frontier.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
