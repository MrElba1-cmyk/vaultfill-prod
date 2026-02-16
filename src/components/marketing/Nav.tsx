"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      style={{ borderBottom: scrolled ? '1px solid var(--apple-border)' : 'none' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl" style={{ color: 'var(--apple-text)' }}>
          Vaultfill
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--apple-text-secondary)' }}>
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--apple-text-secondary)' }}>
            Pricing
          </Link>
          <Link href="/integrations" className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--apple-text-secondary)' }}>
            Integrations
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/demo" 
            className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
            style={{ color: 'var(--apple-text)' }}
          >
            Sign in
          </Link>
          <Link 
            href="/demo" 
            className="text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--apple-accent)', color: '#fff' }}
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;