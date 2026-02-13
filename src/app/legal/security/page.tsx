import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Security — VaultFill',
  description: 'Enterprise-grade security architecture, encryption standards, and the Emerald Stealth protocol.',
};

export default function LegalSecurityPage() {
  return (
    <LegalLayout
      title="Security Policy"
      subtitle="Architected for High-Stakes Integrity and Tenant Isolation."
    >
      <section>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--fg)] mb-8 leading-[1.05]">
          Securing the <span className="text-gradient-apex">Foundation of Trust.</span>
        </h2>
        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
          This Security Statement outlines the technical and organizational measures VaultFill employs to protect 
          Customer Content. VaultFill is engineered with a "Defense in Depth" philosophy, ensuring that security 
          is not an afterthought but the primary constraint of our system architecture.
        </p>
      </section>

      <div className="space-y-16">
        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">01</span>
            Data Encryption Standards
          </h3>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <p>
              VaultFill utilizes industry-leading cryptographic primitives to ensure data remains unreadable to unauthorized parties.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
              <li className="flex flex-col p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                <span className="font-bold text-[var(--fg)] mb-1">At Rest</span>
                <span className="text-sm text-[var(--muted)]">Customer Content is encrypted using AES-256-GCM. Storage volumes are encrypted at the hardware level.</span>
              </li>
              <li className="flex flex-col p-4 bg-[var(--bg)]/50 rounded-xl border border-[var(--border)]">
                <span className="font-bold text-[var(--fg)] mb-1">In Transit</span>
                <span className="text-sm text-[var(--muted)]">All data entering or leaving our network is protected by TLS 1.3 with Perfect Forward Secrecy.</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">02</span>
            Zero-Knowledge Orientation
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            Our systems are designed to operate without human intervention. VaultFill personnel do not have standing 
            access to Customer Content. Access is governed by a <strong>Strict Just-In-Time (JIT)</strong> protocol, 
            requiring multi-party approval and detailed audit logging for any administrative action.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border-l-2 border-[var(--vault-blue)] bg-[var(--vault-blue)]/5">
              <span className="block font-bold text-[var(--fg)] mb-1 text-sm">Automated Processing</span>
              <span className="text-xs text-[var(--muted)]">AI analysis occurs in transient, isolated compute nodes.</span>
            </div>
            <div className="p-4 border-l-2 border-[var(--vault-blue)] bg-[var(--vault-blue)]/5">
              <span className="block font-bold text-[var(--fg)] mb-1 text-sm">No Persistent Access</span>
              <span className="text-xs text-[var(--muted)]">Engineers cannot browse customer repositories.</span>
            </div>
            <div className="p-4 border-l-2 border-[var(--vault-blue)] bg-[var(--vault-blue)]/5">
              <span className="block font-bold text-[var(--fg)] mb-1 text-sm">Ephemeral Sessions</span>
              <span className="text-xs text-[var(--muted)]">Debug access expires automatically after 60 minutes.</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">03</span>
            The Emerald Stealth Protocol
          </h3>
          <p className="text-[var(--muted)] leading-relaxed mb-6">
            VaultFill's proprietary <strong>Emerald Stealth</strong> protocol defines our approach to secure artifact 
            containment. When a policy or evidence document is ingested, it undergoes a multi-stage security 
            validation process:
          </p>
          <div className="space-y-4">
            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[var(--vault-blue)]/20 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-bold">A</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Isolated Sanitization</h4>
                <p className="text-sm text-[var(--muted)]">Documents are stripped of active content (macros, scripts) in a hardened sandbox before reaching the core Knowledge Vault.</p>
              </div>
            </div>
            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[var(--vault-blue)]/20 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-bold">B</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Tenant Key Derivation</h4>
                <p className="text-sm text-[var(--muted)]">Data is encrypted with keys derived from tenant-specific entropy, ensuring that cross-tenant access is mathematically impossible.</p>
              </div>
            </div>
            <div className="glass-card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-[var(--vault-blue)]/20 flex-shrink-0 flex items-center justify-center text-[var(--vault-blue)] font-bold">C</div>
              <div>
                <h4 className="font-bold text-[var(--fg)]">Vector Quantization Guarding</h4>
                <p className="text-sm text-[var(--muted)]">Embedded vectors are stored in isolated namespaces with strict application-level ACLs. Every query is scoped to the tenant ID at the database layer.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">04</span>
            Infrastructure & Resilience
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            VaultFill is hosted on SOC 2 Type II and ISO 27001 compliant cloud infrastructure. We utilize 
            <strong>Multi-Availability Zone (AZ)</strong> redundancy to ensure high availability and data 
            durability. Automated daily backups are encrypted and stored in geographically dispersed regions.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">05</span>
            Reporting a Vulnerability
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            We value the work of the security research community. If you believe you have found a security 
            vulnerability in VaultFill, please reach out via our <strong>Responsible Disclosure Program</strong>. 
            Send reports to <span className="text-[var(--vault-blue)] font-mono">security@vaultfill.com</span>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
