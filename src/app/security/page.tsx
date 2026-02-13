import LegalLayout from '@/components/LegalLayout';
import AINodeIcon from '@/components/icons/AINodeIcon';

export default function SecurityPage() {
  return (
    <LegalLayout 
      title="Security Posture" 
      subtitle="Enterprise-Grade Assurance & Emerald Stealth"
    >
      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <div className="bento-card bg-[var(--vault-blue)]/5 border-[var(--vault-blue)]/20 p-8">
          <div className="h-10 w-10 bg-[var(--vault-blue)]/20 rounded-lg flex items-center justify-center mb-4">
            <AINodeIcon variant="shield" size={24} className="text-[var(--vault-blue)]" />
          </div>
          <h3 className="text-[var(--fg)] font-bold mb-2">SOC 2 Type II</h3>
          <p className="text-xs text-[var(--muted)]">Annual audits covering Security, Availability, and Confidentiality. Report available upon request.</p>
        </div>
        <div className="bento-card bg-indigo-500/5 border-indigo-500/20 p-8">
          <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
            <AINodeIcon variant="vault" size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-[var(--fg)] font-bold mb-2">ISO 27001</h3>
          <p className="text-xs text-[var(--muted)]">Information security management system (ISMS) certified for all core operations and engineering.</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">1. <span className="text-[var(--apex-emerald)]">Emerald Stealth</span> Architecture</h2>
        <p>Our infrastructure utilizes <strong>Emerald Stealth</strong>—a proprietary isolation layer that sanitizes all incoming artifacts before they enter the processing pipeline. This prevents prompt injection and data leakage.</p>
        <p>This layer acts as a "digital air-gap" for your evidence, ensuring that the AI processing engine never interacts with raw, un-sanitized files.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">2. Zero-Trust Networking</h2>
        <p>Internal service communication is strictly governed by Zero-Trust principles. No service is trusted by default, regardless of its location in the network stack. Every request is authenticated, authorized, and encrypted.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[var(--fg)] font-bold text-xl tracking-tight">3. Data Residency & Controls</h2>
        <p>VaultFill supports multi-region deployment. Enterprise customers can choose to pin their data to specific AWS/GCP regions (e.g., us-east-1, eu-central-1) to comply with local data sovereignty laws.</p>
      </section>

      <div className="bg-emerald-500/5 dark:bg-emerald-500/5 light:bg-[var(--apex-emerald)]/5 border border-[var(--apex-emerald)]/20 p-8 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
        <div className="flex-1">
          <h3 className="text-[var(--apex-emerald)] font-bold text-sm uppercase tracking-widest mb-2">Active Monitoring</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            VaultFill maintains a 24/7 autonomous monitoring feed. Any anomaly in the "Emerald Stealth" layer triggers immediate circuit-breaking to protect tenant data integrity.
          </p>
        </div>
        <div className="h-24 w-24 bg-[var(--apex-emerald)]/10 rounded-full flex items-center justify-center shrink-0 border border-[var(--apex-emerald)]/20">
          <div className="h-3 w-3 bg-[var(--apex-emerald)] rounded-full animate-pulse" />
        </div>
      </div>
    </LegalLayout>
  );
}
