"use client";

import React from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title = "Security compliance, simplified.",
  subtitle = "Vaultfill automates your SOC 2, ISO 27001, and HIPAA audits—so you can focus on building. Get audit-ready in days, not months.",
  ctaPrimary = "Start free trial",
  ctaSecondary = "Watch demo"
}) => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 
            className="apple-animate-fade-up text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6"
            style={{ color: 'var(--apple-text)', animationDelay: '0ms' }}
          >
            {title}
          </h1>
          <p 
            className="apple-animate-fade-up text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: 'var(--apple-text-secondary)', animationDelay: '150ms' }}
          >
            {subtitle}
          </p>
          <div 
            className="apple-animate-fade-up flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animationDelay: '300ms' }}
          >
            <a
              href="/demo"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--apple-accent)', color: '#fff', boxShadow: 'var(--apple-shadow-md)' }}
            >
              {ctaPrimary}
            </a>
            <a
              href="/demo"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--apple-bg-secondary)', color: 'var(--apple-text)', border: '1px solid var(--apple-border)' }}
            >
              {ctaSecondary}
            </a>
          </div>
        </div>
        
        {/* Product Preview */}
        <div 
          className="apple-animate-fade-up mt-16 rounded-2xl overflow-hidden"
          style={{ 
            animationDelay: '500ms', 
            boxShadow: 'var(--apple-shadow-xl)',
            border: '1px solid var(--apple-border)'
          }}
        >
          <div className="bg-gray-100 aspect-video flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🛡️</div>
              <p className="text-xl font-medium" style={{ color: 'var(--apple-text)' }}>Vaultfill Dashboard</p>
              <p className="mt-2" style={{ color: 'var(--apple-text-secondary)' }}>Your compliance at a glance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;