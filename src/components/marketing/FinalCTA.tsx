"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export const FinalCTA: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto text-center">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
            Ready to get audit-ready?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--apple-text-secondary)' }}>
            Join thousands of companies who've simplified their compliance journey.
          </p>
        </motion.div>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
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
        </motion.div>
        <motion.p 
          initial={reduceMotion ? undefined : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-sm" 
          style={{ color: 'var(--apple-text-secondary)' }}
        >
          No credit card required • 14-day free trial • Cancel anytime
        </motion.p>
      </div>
    </section>
  );
};

export default FinalCTA;
