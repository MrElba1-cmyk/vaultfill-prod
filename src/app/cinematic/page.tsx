"use client";

import React from 'react';
import CinematicHero from '@/components/marketing/CinematicHero';
import TheProblem from '@/components/marketing/TheProblem';
import TheImpact from '@/components/marketing/TheImpact';
import WorkGallery from '@/components/marketing/WorkGallery';
import StickyNav from '@/components/marketing/StickyNav';
import Link from 'next/link';

export default function CinematicPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <StickyNav>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--vault-blue)' }}>
            Vaultfill
          </Link>
          <div className="flex gap-6">
            <Link href="/demo" className="hover:opacity-80 transition-opacity">Demo</Link>
            <Link href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</Link>
            <Link href="/contact" className="hover:opacity-80 transition-opacity">Contact</Link>
          </div>
        </div>
      </StickyNav>

      <CinematicHero
        headline="Secure Your Future"
        subtitle="Enterprise-grade data protection"
        ctaText="Get Started"
        ctaHref="/demo"
      />

      <TheProblem />

      <TheImpact />

      <WorkGallery />

      <footer className="py-12 px-8 text-center opacity-60">
        <p>© 2026 Vaultfill. All rights reserved.</p>
      </footer>
    </main>
  );
}