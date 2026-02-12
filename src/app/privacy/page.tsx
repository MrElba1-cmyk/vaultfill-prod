import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout 
      title="Privacy Policy" 
      subtitle="Last Updated: February 12, 2026"
    >
      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">1. Zero-Knowledge Commitment</h2>
        <p>VaultFill is designed on the principle of least privilege. We employ Zero-Knowledge architecture where possible, ensuring that your most sensitive compliance artifacts remain private and isolated.</p>
        <p>This means your raw data is indexed into vectors that are functionally useless to any entity outside of your specific tenant environment.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">2. Data Ingestion & Encryption</h2>
        <p>All data uploaded via the Emerald Stealth engine is encrypted using AES-256 at rest and TLS 1.3 in transit. Artifacts are processed in isolated memory environments and are never used to train third-party LLMs.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Encryption at Rest:</strong> AES-256 with rotation-managed keys.</li>
          <li><strong>In-Transit Security:</strong> Mandated TLS 1.2+ (standard 1.3).</li>
          <li><strong>AI Safety:</strong> We use Enterprise-tier API agreements that strictly forbid training on user inputs.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">3. Regional Isolation</h2>
        <p>Your data remains within your selected region. We do not engage in cross-border data transfers without explicit enterprise-level authorization.</p>
      </section>

      <div className="bg-[var(--vault-blue)]/5 border border-[var(--vault-blue)]/20 p-6 rounded-2xl">
        <h3 className="text-[var(--vault-blue)] font-bold text-sm uppercase tracking-widest mb-2">Our Data Promise</h3>
        <p className="text-sm text-[var(--muted)]">
          We never sell your data. We never share your evidence with other tenants. Your security posture is your competitive edge, and we are here to protect it.
        </p>
      </div>
    </LegalLayout>
  );
}
