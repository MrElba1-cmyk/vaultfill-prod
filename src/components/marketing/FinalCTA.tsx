"use client";

import React from 'react';
import Link from 'next/link';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
          Ready to get audit-ready?
        </h2>
        <p className="text-lg mb-8" style={{ color: 'var(--apple-text-secondary)' }}>
          Join thousands of companies who've simplified their compliance journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--apple-accent)', color: '#fff', boxShadow: 'var(--apple-shadow-lg)' }}
          >
            Start free trial
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--apple-bg)', color: 'var(--apple-text)', border: '1px solid var(--apple-border)' }}
          >
            Talk to sales
          </Link>
        </div>
        <p className="mt-6 text-sm" style={{ color: 'var(--apple-text-secondary)' }}>
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;