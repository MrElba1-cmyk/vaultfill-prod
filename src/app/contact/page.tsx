'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AINodeIcon from '@/components/icons/AINodeIcon';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen px-6 py-20 bg-slate-950 text-emerald-400">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl glass-card p-8 sm:p-12 relative overflow-hidden"
      >
        {/* Decorative scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.05)_50%),linear-gradient(90deg,rgba(16,185,129,0),rgba(16,185,129,0.02),rgba(16,185,129,0))] bg-[length:100%_4px,4px_100%]" />

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="contact-form"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <AINodeIcon variant="shield" size={32} className="text-emerald-400" glow />
                </div>
                <p className="bento-kicker text-emerald-500">ENTERPRISE PORTAL</p>
                <h1 className="mt-2 text-3xl font-bold text-white">Request High-Security Briefing</h1>
                <p className="mt-4 text-emerald-400/70 text-sm max-w-md">
                  Direct access to our engineering team for custom deployment and security architecture reviews.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">Full Name</label>
                    <input required type="text" className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">Work Email</label>
                    <input required type="email" className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-white" placeholder="john@company.com" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">Company</label>
                    <input required type="text" className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-white" placeholder="Acme Inc" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">Seat Count</label>
                    <select className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-white appearance-none">
                      <option value="1-10">1-10 seats</option>
                      <option value="11-50">11-50 seats</option>
                      <option value="51-200">51-200 seats</option>
                      <option value="201+">201+ seats (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">Security Requirements / Message</label>
                  <textarea required rows={4} className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-white" placeholder="Describe your compliance roadmap..."></textarea>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-emerald-400 active:scale-[0.98] shadow-[0_10px_40px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                      />
                      Verifying Payload...
                    </>
                  ) : (
                    'Initialize Briefing Request →'
                  )}
                </button>

                <p className="text-[10px] text-center text-emerald-500/40 uppercase tracking-widest font-medium">
                  AES-256 Encrypted Submission
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="h-20 w-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Transmission Received</h2>
              <p className="text-emerald-400/70 max-w-sm mb-8">
                Your request has been logged. An engineering lead will reach out within 4 business hours to coordinate your briefing.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-8 py-2 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-colors"
              >
                Send Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
