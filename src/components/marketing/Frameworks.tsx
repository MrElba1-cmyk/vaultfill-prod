"use client";

import React from 'react';

const frameworks = [
  { name: 'SOC 2', desc: 'Type I & II' },
  { name: 'ISO 27001', desc: 'Certification' },
  { name: 'HIPAA', desc: 'Compliance' },
  { name: 'GDPR', desc: 'Privacy' },
  { name: 'PCI DSS', desc: 'Payments' },
  { name: 'SIG', desc: 'Assessment' },
];

export const Frameworks: React.FC = () => {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'var(--apple-bg-secondary)' }}>
      <div className="max-w-[1200px] mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
          Supported frameworks
        </h2>
        <p className="mb-10" style={{ color: 'var(--apple-text-secondary)' }}>
          One platform for all your compliance needs
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {frameworks.map((fw, idx) => (
            <div 
              key={idx}
              className="px-6 py-4 rounded-xl"
              style={{ 
                backgroundColor: 'var(--apple-bg)',
                border: '1px solid var(--apple-border)',
                boxShadow: 'var(--apple-shadow-sm)'
              }}
            >
              <div className="font-semibold" style={{ color: 'var(--apple-text)' }}>{fw.name}</div>
              <div className="text-sm" style={{ color: 'var(--apple-text-secondary)' }}>{fw.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Frameworks;