'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AINodeIcon from '@/components/icons/AINodeIcon';

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-20 bg-slate-950 text-emerald-400">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl glass-card p-8 sm:p-12"
      >
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <AINodeIcon variant="vault" size={40} className="text-emerald-400" glow />
          </div>
          <p className="bento-kicker text-emerald-500">OUR MISSION</p>
          <h1 className="mt-2 text-5xl font-bold text-white tracking-tight">Automated Compliance for the AI Era.</h1>
          <p className="mt-6 text-emerald-400/70 text-lg max-w-2xl leading-relaxed">
            AI changed how companies build. It also changed what auditors ask, what evidence looks like, and how fast customers expect answers.
            VaultFill exists to make compliance keep up — by automating the work between your systems and the questionnaires that decide revenue.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="bento-card bg-black/40 border-emerald-500/10">
            <h3 className="text-white font-bold text-xl mb-4">Built for modern evidence</h3>
            <p className="text-sm text-emerald-400/60 leading-relaxed">
              Your proof lives in SaaS tools, logs, tickets, cloud configs, and policy repos — not in a shared drive. VaultFill connects to the sources of truth and keeps answers grounded in real artifacts.
            </p>
          </div>
          <div className="bento-card bg-black/40 border-emerald-500/10">
            <h3 className="text-white font-bold text-xl mb-4">Automation without hand-waving</h3>
            <p className="text-sm text-emerald-400/60 leading-relaxed">
              AI is only useful when it can cite its work. We generate responses with traceable evidence so reviewers can verify, approve, and ship questionnaires faster.
            </p>
          </div>
          <div className="bento-card bg-black/40 border-emerald-500/10">
            <h3 className="text-white font-bold text-xl mb-4">Security-first by default</h3>
            <p className="text-sm text-emerald-400/60 leading-relaxed">
              We treat sensitive compliance data like production secrets: minimal access, tight boundaries, and clear retention rules. Automation should reduce risk, not introduce new surface area.
            </p>
          </div>
          <div className="bento-card bg-black/40 border-emerald-500/10">
            <h3 className="text-white font-bold text-xl mb-4">A better way to earn trust</h3>
            <p className="text-sm text-emerald-400/60 leading-relaxed">
              Customers want speed. Auditors want rigor. Teams want sanity. VaultFill turns compliance into a repeatable system — so trust scales with your product.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] text-emerald-500/40 uppercase tracking-widest font-medium">
            VaultFill // Automated compliance, built for how teams ship now.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
