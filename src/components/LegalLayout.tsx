import React from 'react';
import Link from 'next/link';

export default function LegalLayout({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 sm:py-20 bg-[var(--bg)] transition-colors duration-300">
      <div className="mx-auto max-w-4xl glass-card p-8 sm:p-16 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--vault-blue)]/5 to-transparent rounded-bl-full -mr-32 -mt-32 pointer-events-none" />

        <div className="mb-16 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--vault-blue)] hover:opacity-80 transition-opacity mb-8">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <p className="bento-kicker text-[var(--muted-2)]">LEGAL FRAMEWORK</p>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-[var(--fg)] tracking-tight text-center">{title}</h1>
          <p className="mt-4 text-[var(--muted-2)] text-xs uppercase tracking-widest text-center font-medium">{subtitle}</p>
        </div>
        
        <div className="relative z-10 prose prose-invert max-w-none text-[var(--muted)] text-base leading-relaxed space-y-12">
          {children}
        </div>
        
        <div className="mt-24 pt-12 border-t border-[var(--border)] relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-[10px] text-[var(--muted-2)] uppercase tracking-widest font-bold">
              VaultFill Autonomous Trust Engine
            </div>
            <div className="flex gap-6 text-[10px] text-[var(--muted-2)] uppercase tracking-widest font-bold">
              <Link href="/privacy" className="hover:text-[var(--vault-blue)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--vault-blue)] transition-colors">Terms</Link>
              <Link href="/security" className="hover:text-[var(--vault-blue)] transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
