"use client";

import React from 'react';

const features = [
  {
    title: "Automated Evidence Collection",
    desc: "Connect your tools once. Vaultfill continuously gathers evidence for SOC 2, ISO 27001, and more.",
    icon: "🔄"
  },
  {
    title: "AI-Powered Responses",
    desc: "Draft accurate, citation-backed answers to security questionnaires in seconds, not days.",
    icon: "🤖"
  },
  {
    title: "Continuous Monitoring",
    desc: "Stay audit-ready 24/7 with real-time compliance tracking and automated alerts.",
    icon: "👁️"
  },
  {
    title: "Centralized Knowledge Base",
    desc: "Store policies, artifacts, and responses in a searchable vault that grows with you.",
    icon: "📚"
  },
  {
    title: "Framework Support",
    desc: "SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS, and custom frameworks—all in one place.",
    icon: "📋"
  },
  {
    title: "Enterprise Security",
    desc: "Bank-level encryption, SSO, and granular access controls keep your data safe.",
    icon: "🔒"
  }
];

export const FeatureGrid: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>
            Everything you need to stay compliant
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--apple-text-secondary)' }}>
            Built for modern teams who need security without the headache.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: 'var(--apple-bg)',
                border: '1px solid var(--apple-border)',
                boxShadow: 'var(--apple-shadow-sm)'
              }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--apple-text)' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--apple-text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;