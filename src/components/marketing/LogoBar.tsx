"use client";

import React from 'react';

const logos = [
  { name: 'AWS', icon: '☁️' },
  { name: 'Google', icon: '🔍' },
  { name: 'Azure', icon: '💙' },
  { name: 'Stripe', icon: '💳' },
  { name: 'Slack', icon: '💬' },
  { name: 'Notion', icon: '📝' },
];

export const LogoBar: React.FC = () => {
  return (
    <section className="py-12 px-6" style={{ backgroundColor: 'var(--apple-bg-secondary)' }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-center text-sm font-medium mb-8" style={{ color: 'var(--apple-text-secondary)' }}>
          TRUSTED BY FAST-GROWING TEAMS
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 text-lg font-medium" style={{ color: 'var(--apple-text)' }}>
              <span className="text-2xl">{logo.icon}</span>
              <span className="hidden md:inline">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoBar;