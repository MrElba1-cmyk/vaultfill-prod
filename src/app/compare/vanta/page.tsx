import React from 'react';
import Head from 'next/head';

const VantaComparisonPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>VaultFill vs. Vanta: Honest Compliance Automation Comparison</title>
        <meta name="description" content="Compare VaultFill and Vanta side-by-side. Understand key differences in approach, features, AI capabilities, and pricing to choose the best compliance automation solution for your business." />
      </Head>

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-12 text-gray-900">VaultFill vs. Vanta: An Honest Comparison</h1>

        <p className="text-xl text-center text-gray-700 mb-16 max-w-3xl mx-auto">
          Choosing the right compliance automation platform is crucial for your business. This page provides a factual and transparent comparison between VaultFill's document-native, AI-driven approach and Vanta's integration-heavy platform.
        </p>

        {/* Overview */}
        <section className="mb-20">
          <h2 className="text-4xl font-semibold text-gray-800 mb-8 text-center">Understanding the Landscape</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-medium text-gray-800 mb-4">Vanta: Integration-Driven Compliance</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Vanta is a well-established security and compliance automation platform that helps companies achieve and maintain compliance with various security frameworks (SOC 2, ISO 27001, HIPAA, GDPR). Its core strength lies in its extensive integrations with a wide array of third-party tools (HRIS, cloud providers, identity providers, MDMs). Vanta continuously monitors these connections to automate evidence collection and compliance tasks, streamlining audit readiness.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-medium text-gray-800 mb-4">VaultFill: Document-Native & AI-Powered Simplicity</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                VaultFill offers a differentiated approach, prioritizing existing documentation and policies as the primary source of evidence. By leveraging advanced AI, VaultFill analyzes documents, extracts relevant evidence, and assists in policy drafting, significantly reducing the reliance on numerous integrations. This makes VaultFill highly adaptable, less disruptive to existing workflows, and designed for efficient, cost-effective scalability.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="mb-20">
          <h2 className="text-4xl font-semibold text-gray-800 mb-8 text-center">Feature Comparison: VaultFill vs. Vanta</h2>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature / Aspect
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vanta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VaultFill
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Primary Approach</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Integration-heavy; continuous monitoring via API connections to third-party tools.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Document-native; AI-powered analysis of existing documentation and policies.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Evidence Collection</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Automated via integrations; requires setup and maintenance of connections.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">AI-driven extraction from documents; simplifies evidence gathering without extensive integration dependencies.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Policy Management</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Generates policies often based on compliance templates; linked to controls.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">AI-assisted policy drafting and review; emphasis on integrating with existing company documentation.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">AI Capabilities</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Primarily for identifying compliance gaps, reporting, and task automation.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Advanced AI for document analysis, evidence synthesis, policy drafting, and intelligent suggestions.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Ease of Setup & Maintenance</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Can be complex due to numerous integrations; ongoing management of connections.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Generally simpler setup, leveraging existing documentation; less reliance on integration upkeep.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Disruption to Workflows</td>
                  <td className="px-6 py-4 text-lg text-gray-700">May require adjustments to workflows to accommodate integration requirements.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Minimal disruption; adapts to existing document management workflows.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Pricing Model</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Typically tiered based on employee count, integrations, and frameworks; can be premium.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Value-based, often tied to scope of compliance and AI usage; designed for cost-effectiveness.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">Geographic Focus</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Global, strong presence in North America and Europe.</td>
                  <td className="px-6 py-4 text-lg text-gray-700">Global, with a strategic focus on adaptable solutions for diverse regulatory environments.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to Choose Sections */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-semibold text-gray-800 mb-8 text-center">When to Choose VaultFill</h2>
              <ul className="list-disc list-inside text-lg text-gray-700 space-y-4">
                <li>You have extensive existing documentation and policies that you want to leverage directly for compliance.</li>
                <li>You prefer a less integration-heavy approach that minimizes disruption to your current tech stack.</li>
                <li>You want to leverage advanced AI to significantly reduce manual effort in evidence collection and policy management.</li>
                <li>You need a highly adaptable solution that can conform to your unique operational processes, rather than dictating them.</li>
                <li>Cost-effectiveness and scalability are critical, especially as you expand to multiple compliance frameworks.</li>
                <li>You value clarity and actionable insights over a deluge of raw data from numerous integrations.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-4xl font-semibold text-gray-800 mb-8 text-center">When to Choose Vanta</h2>
              <ul className="list-disc list-inside text-lg text-gray-700 space-y-4">
                <li>You have a highly standardized tech stack with readily available APIs for Vanta's integrations.</li>
                <li>You prioritize continuous, real-time monitoring through extensive integrations and don't mind the setup.</li>
                <li>You need support for a very broad range of compliance frameworks out-of-the-box, and are comfortable with a prescriptive approach.</li>
                <li>You have dedicated resources to manage numerous integrations and address the resulting data and alerts.</li>
                <li>You are willing to invest in a premium solution for comprehensive, integration-driven compliance automation.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-4xl font-semibold text-gray-800 mb-6">Ready to Experience a Smarter Way to Compliance?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Explore how VaultFill's innovative, document-native, and AI-powered platform can transform your compliance journey.
          </p>
          <a
            href="/demo"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 ease-in-out"
          >
            Request a Demo
          </a>
        </section>
      </div>
    </>
  );
};

export default VantaComparisonPage;
