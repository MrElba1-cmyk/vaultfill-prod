"use client";

import React from 'react';
import Nav from '@/components/marketing/Nav';
import Hero from '@/components/marketing/Hero';
import LogoBar from '@/components/marketing/LogoBar';
import FeatureGrid from '@/components/marketing/FeatureGrid';
import Frameworks from '@/components/marketing/Frameworks';
import FinalCTA from '@/components/marketing/FinalCTA';

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--apple-bg)' }}>
      <Nav />
      <Hero />
      <LogoBar />
      <FeatureGrid />
      <Frameworks />
      <FinalCTA />
      
      <footer className="py-8 px-6 text-center text-sm" style={{ borderTop: '1px solid var(--apple-border)' }}>
        <p style={{ color: 'var(--apple-text-secondary)' }}>
          © 2026 Vaultfill. All rights reserved.
        </p>
      </footer>
    </main>
  );
}