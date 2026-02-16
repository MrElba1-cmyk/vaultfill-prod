"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { label: 'Features', url: '#features' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'Integrations', url: '/integrations' },
  { label: 'Login', url: '/sign-in' },
];

const hero = {
  headline: 'Security compliance that actually works',
  subhead: 'Automate your SOC 2, HIPAA, and ISO 27001 compliance in weeks—not months. Continuous monitoring, zero hassle.',
  ctaPrimary: 'Start free trial',
  ctaSecondary: 'Book demo'
};

const problem = {
  title: 'Compliance is slow, expensive, and manual',
  bullets: [
    'Endless spreadsheets and checklist chasing',
    'Audits take 6+ months to complete',
    'Security questionnaires kill your sales cycle',
    'Compliance gaps go undetected for months'
  ]
};

const features = [
  { title: 'Continuous Monitoring', desc: 'Real-time visibility into your security posture with automated alerts when controls drift.' },
  { title: 'One-click Audits', desc: 'SOC 2, HIPAA, ISO 27001 ready in weeks. We handle the heavy lifting.' },
  { title: 'Trust Center', desc: 'Share your security posture instantly. Close deals faster with live compliance evidence.' },
  { title: 'Vendor Risk', desc: 'Assess and monitor vendors in one place. Reduce third-party risk automatically.' }
];

const trustBadges = [
  { name: 'SOC 2 Type II', desc: 'Certified' },
  { name: 'ISO 27001', desc: 'Certified' },
  { name: 'GDPR Ready', desc: 'Compliant' }
];

const integrations = ['AWS', 'Google Cloud', 'Azure', 'GitHub', 'Slack', 'Jira', 'Okta', 'Datadog'];

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl" style={{ color: 'var(--apple-text)' }}>Vaultfill</Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.url} className="text-sm font-medium hover:opacity-70" style={{ color: 'var(--apple-text-muted)' }}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="apple-btn apple-btn-secondary">Sign in</Link>
          <Link href="/demo" className="apple-btn apple-btn-primary">Get started</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-[1000px] mx-auto text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 animate-fade-up" style={{ color: 'var(--apple-text)' }}>
          {hero.headline}
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-up" style={{ color: 'var(--apple-text-muted)', animationDelay: '100ms' }}>
          {hero.subhead}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Link href="/demo" className="apple-btn apple-btn-primary">{hero.ctaPrimary}</Link>
          <Link href="/demo" className="apple-btn apple-btn-secondary">{hero.ctaSecondary}</Link>
        </div>
        
        {/* Product Preview */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-lg animate-fade-up" style={{ border: '1px solid var(--apple-border)', animationDelay: '300ms' }}>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🛡️</div>
              <p className="text-xl font-medium" style={{ color: 'var(--apple-text)' }}>Vaultfill Dashboard</p>
              <p className="mt-2" style={{ color: 'var(--apple-text-muted)' }}>Your compliance at a glance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'var(--apple-bg)' }}>
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12" style={{ color: 'var(--apple-text)' }}>
          {problem.title}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {problem.bullets.map((bullet, idx) => (
            <div key={idx} className="apple-card flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <span className="text-xl">⚠️</span>
              <p className="text-base" style={{ color: 'var(--apple-text)' }}>{bullet}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4" style={{ color: 'var(--apple-text)' }}>
          Automated compliance, from day one
        </h2>
        <p className="text-lg text-center mb-12" style={{ color: 'var(--apple-text-muted)' }}>
          Everything you need to stay audit-ready
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="apple-card animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--apple-text)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--apple-text-muted)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="py-16 px-6" style={{ backgroundColor: 'var(--apple-bg)' }}>
      <div className="max-w-[1000px] mx-auto text-center">
        <p className="text-sm font-medium mb-8" style={{ color: 'var(--apple-text-muted)' }}>TRUSTED BY FAST-GROWING TEAMS</p>
        <div className="flex flex-wrap justify-center gap-8">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-2xl font-semibold" style={{ color: 'var(--apple-text)' }}>{badge.name}</div>
              <div className="text-sm" style={{ color: 'var(--apple-text-muted)' }}>{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1000px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
          Integrates with what you already use
        </h2>
        <p className="mb-10" style={{ color: 'var(--apple-text-muted)' }}>
          Connect your existing tools in minutes
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {integrations.map((tool, idx) => (
            <div key={idx} className="px-6 py-3 rounded-full" style={{ backgroundColor: 'var(--apple-surface)', border: '1px solid var(--apple-border)' }}>
              <span className="font-medium" style={{ color: 'var(--apple-text)' }}>{tool}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
          Ready to get compliant?
        </h2>
        <p className="text-lg mb-8" style={{ color: 'var(--apple-text-muted)' }}>
          Join 2,000+ companies who've automated their security compliance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/demo" className="apple-btn apple-btn-primary">Start free trial</Link>
          <Link href="/contact" className="apple-btn apple-btn-secondary">Talk to sales</Link>
        </div>
        <p className="mt-6 text-sm" style={{ color: 'var(--apple-text-muted)' }}>
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main style={{ backgroundColor: 'var(--apple-bg)', minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <Problem />
      <Features />
      <Trust />
      <Integrations />
      <FinalCTA />
      <footer className="py-8 px-6 text-center text-sm" style={{ borderTop: '1px solid var(--apple-border)' }}>
        <p style={{ color: 'var(--apple-text-muted)' }}>© 2026 Vaultfill. All rights reserved.</p>
      </footer>
    </main>
  );
}