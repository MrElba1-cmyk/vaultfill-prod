import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy — VaultFill',
  description: 'Enterprise privacy standards, data sovereignty, and GDPR/CCPA alignment.',
};

export default function LegalPrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Data Sovereignty and Radical Transparency in the Age of AI."
    >
      <section>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--fg)] mb-8 leading-[1.05]">
          Your Data. <span className="text-gradient-apex">Your Sovereignty.</span>
        </h2>
        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
          At VaultFill, we believe privacy is a fundamental human right, not a luxury. Our mission to automate 
          compliance requires us to handle sensitive information, and we take that responsibility with 
          absolute gravity. This policy details how we collect, protect, and respect your data.
        </p>
      </section>

      <div className="space-y-16">
        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">01</span>
            Core Privacy Principles
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bento-card p-6 border border-[var(--border)]">
              <h4 className="font-bold text-[var(--fg)] mb-2">No Training on Customer Data</h4>
              <p className="text-sm text-[var(--muted)]">We never use your uploaded evidence, policies, or questionnaire responses to train our global AI models. Your intellectual property remains yours alone.</p>
            </div>
            <div className="bento-card p-6 border border-[var(--border)]">
              <h4 className="font-bold text-[var(--fg)] mb-2">Data Minimization</h4>
              <p className="text-sm text-[var(--muted)]">We only collect the absolute minimum data required to provide the Service. If we don't need it to generate a compliance draft, we don't want it.</p>
            </div>
            <div className="bento-card p-6 border border-[var(--border)]">
              <h4 className="font-bold text-[var(--fg)] mb-2">Purpose Limitation</h4>
              <p className="text-sm text-[var(--muted)]">Data is used exclusively for the purpose you intended: automating your compliance workflows. We do not sell or monetize your data for advertising.</p>
            </div>
            <div className="bento-card p-6 border border-[var(--border)]">
              <h4 className="font-bold text-[var(--fg)] mb-2">Tenant Isolation</h4>
              <p className="text-sm text-[var(--muted)]">Every customer's data is logically separated. There is no mixing of datasets, even at the vector embedding layer.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">02</span>
            Information We Collect
          </h3>
          <p className="text-[var(--muted)] mb-6">
            VaultFill processes three primary categories of information:
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--vault-blue)]/10 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-mono text-xl">1</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Service Metadata</h4>
                <p className="text-sm text-[var(--muted)]">Name, email address, company affiliation, and billing details. This is used for account management and authentication via our identity providers.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--vault-blue)]/10 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-mono text-xl">2</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Knowledge Vault Content</h4>
                <p className="text-sm text-[var(--muted)]">Policies, procedures, evidence screenshots, and audit reports that you proactively upload. This content is encrypted and indexed only for your use.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--vault-blue)]/10 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-mono text-xl">3</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Operational Telemetry</h4>
                <p className="text-sm text-[var(--muted)]">Anonymized logs of system performance, feature usage, and security events. We use this to detect fraud, maintain system health, and improve the user experience.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">03</span>
            Sub-Processors & Data Transfer
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            To provide the Services, we partner with a limited number of high-trust sub-processors (e.g., cloud hosting 
            and AI infrastructure providers). Every sub-processor is vetted for security compliance (SOC 2, ISO 27001) 
            and is bound by a Data Processing Agreement (DPA) that is as least as restrictive as our terms with you.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">04</span>
            Global Compliance Rights
          </h3>
          <div className="bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)]">
            <h4 className="text-xl font-bold text-[var(--fg)] mb-4">GDPR & CCPA/CPRA Alignment</h4>
            <p className="text-sm text-[var(--muted)] mb-6">
              Regardless of your location, we afford all users the rights typically granted under the most stringent 
              privacy regimes:
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-4 text-sm list-none p-0 m-0">
              <li className="flex gap-2"><span className="text-[var(--vault-blue)]">✓</span> Right to Access & Portability</li>
              <li className="flex gap-2"><span className="text-[var(--vault-blue)]">✓</span> Right to Erasure ("Right to be Forgotten")</li>
              <li className="flex gap-2"><span className="text-[var(--vault-blue)]">✓</span> Right to Rectification</li>
              <li className="flex gap-2"><span className="text-[var(--vault-blue)]">✓</span> Right to Restrict Processing</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">05</span>
            Retention & Deletion
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            Upon termination of your account, you can request the full deletion of your Knowledge Vault. Once 
            initiated, all customer content and its associated vector indices are permanently wiped from our 
            production systems within 30 days.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">06</span>
            Contacting the Privacy Team
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            For questions about our privacy practices, or to exercise your rights, please contact our Data 
            Protection Officer (DPO) at <span className="text-[var(--vault-blue)] font-mono">privacy@vaultfill.com</span>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
