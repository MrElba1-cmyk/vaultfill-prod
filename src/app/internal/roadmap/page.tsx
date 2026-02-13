'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Award, 
  Zap,
  Target,
  BarChart3,
  ChevronRight
} from 'lucide-react';

const milestones = [
  {
    quarter: 'Q1 2025',
    title: 'Foundations',
    status: 'completed',
    items: ['Legal Entity & Bank Setup', 'Market Research', 'Core Team Hiring', 'Vision & OKR Framework'],
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
  },
  {
    quarter: 'Q2 2025',
    title: 'MVP Development',
    status: 'active',
    items: ['VaultFill Core Engine (RAG)', '“Emerald Stealth” UI Theme', 'Security & Privacy Legal Docs', 'Internal Alpha Test'],
    icon: <Zap className="w-6 h-6 text-emerald-400" />
  },
  {
    quarter: 'Q3 2025',
    title: 'Beta & Revenue',
    status: 'pending',
    items: ['Closed-Beta Release', 'Demo-Banner & Lead-Gen', 'Feedback Loop', 'First Paying Contracts'],
    icon: <TrendingUp className="w-6 h-6 text-emerald-400" />
  },
  {
    quarter: 'Q4 2025',
    title: 'Scaling & Seed',
    status: 'pending',
    items: ['Seed Round – $500k', 'Full $100k UI Overhaul', 'Public Beta Launch', '$100k ARR Milestone'],
    icon: <Target className="w-6 h-6 text-emerald-400" />
  },
  {
    quarter: 'Q2 2026',
    title: 'Series A Expansion',
    status: 'pending',
    items: ['Series A – $2M', 'Deskyra Platform Phase 1', 'Automated Audit-Feed', '$1M ARR Milestone'],
    icon: <Rocket className="w-6 h-6 text-emerald-400" />
  },
  {
    quarter: '2027',
    title: 'Global Exit',
    status: 'pending',
    items: ['EU & APAC Launch', '$5M ARR Milestone', 'Strategic IPO Planning', 'Exit / Acquisition'],
    icon: <Globe className="w-6 h-6 text-emerald-400" />
  }
];

export default function RoadmapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 font-sans overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[1px] w-12 bg-emerald-500/50" />
            <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Strategic Intelligence</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            VaultFill Road‑Map
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            A high-fidelity projection of market dominance, expansion, and the path to a $5M ARR exit.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.quarter}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-full bg-zinc-950/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 hover:bg-zinc-900/40 transition-colors duration-300">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    {milestone.icon}
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
                    milestone.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 animate-pulse' :
                    milestone.status === 'completed' ? 'bg-zinc-500/10 border-zinc-500/50 text-zinc-400' :
                    'bg-white/5 border-white/10 text-zinc-500'
                  }`}>
                    {milestone.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-sm font-mono text-emerald-500 tracking-wider uppercase">{milestone.quarter}</h3>
                  <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">{milestone.title}</h2>
                </div>

                <ul className="space-y-4">
                  {milestone.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 group/item">
                      <ChevronRight className="w-4 h-4 mt-1 text-emerald-500 group-hover/item:translate-x-1 transition-transform" />
                      <span className="text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 className="w-64 h-64 text-emerald-500" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tighter text-white">Target Milestone: $5M ARR</h2>
              <p className="text-zinc-400 max-w-xl text-lg">
                Phase 3 international expansion and integration with the Deskyra ecosystem 
                will drive exponential valuation prior to Q4 2027 acquisition window.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-1">Exit Confidence</span>
              <span className="text-6xl font-bold text-emerald-400 tracking-tighter">98.2%</span>
            </div>
          </div>
        </motion.section>

        <footer className="mt-20 flex justify-between items-center text-zinc-600 font-mono text-xs">
          <span>VAULTFILL STRATEGY CONFIDENTIAL // LEVEL 4 CLEARANCE</span>
          <span>&copy; 2025-2027 EXECUTION ENGINE</span>
        </footer>
      </div>
    </div>
  );
}
