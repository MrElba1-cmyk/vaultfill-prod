"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/security', label: 'Security' },
    { href: '/trust-vault', label: 'Trust Vault' },
    { href: '/integrations', label: 'Integrations' },
  ];

  const isActive = (href: string) => pathname === href;

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
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ 
                color: isActive(link.href) ? 'var(--apple-accent)' : 'var(--apple-text-secondary)'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/contact" 
            className="text-sm font-medium px-4 py-2 rounded-full transition-colors hidden sm:block"
            style={{ color: 'var(--apple-text)' }}
          >
            Contact
          </Link>
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
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t" style={{ borderColor: 'var(--apple-border)' }}>
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="block text-base font-medium py-2"
                style={{ 
                  color: isActive(link.href) ? 'var(--apple-accent)' : 'var(--apple-text)'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/contact" 
              className="block text-base font-medium py-2"
              style={{ color: 'var(--apple-text)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
