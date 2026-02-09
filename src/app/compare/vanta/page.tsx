import React from 'react';

export const metadata = {
  title: 'VaultFill vs. Vanta: Honest Compliance Automation Comparison',
  description: 'Compare VaultFill's AI-powered, document-native compliance automation with Vanta's integration-heavy approach.',
};

export default function VantaComparePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-400 to-cyan-500 text-transparent bg-clip-text">VaultFill vs. Vanta</h1>
        <p className="text-xl text-gray-300 mb-12 text-center">An honest comparison of two leading compliance automation platforms.</p>

        {/* Placeholder Content - Full content from docs/competitive_intel_vanta_decon.md would go here */}
        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-300">Overview</h2>
          <p className="text-gray-200">This page provides a detailed comparison, drawing insights from competitive intelligence. [Full comparison table and sections would be dynamically rendered here from competitive_intel_vanta_decon.md]</p>
        </div>

        <div className="text-center">
          <a href="#" className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300">
            Request a Demo
          </a>
        </div>
      </div>
    </div>
  );
}