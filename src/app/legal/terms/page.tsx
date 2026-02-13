import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service — VaultFill',
  description: 'Enterprise SaaS agreement, acceptable use, and liability framework for VaultFill.',
};

export default function LegalTermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Standard Enterprise SaaS Agreement — v2.4"
    >
      <section>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--fg)] mb-8 leading-[1.05]">
          Governing the <span className="text-gradient-apex">Edge of Automation.</span>
        </h2>
        <p className="text-lg text-[var(--muted)] leading-relaxed mb-6">
          These Terms of Service (“Terms”) constitute a legally binding agreement between VaultFill (“VaultFill”, “we”, 
          “us”) and the entity accessing the Services (“Customer”, “you”). By utilizing VaultFill, you agree to these 
          standardized terms, which are designed to protect the integrity of the Trust Engine and the privacy of all 
          participants.
        </p>
      </section>

      <div className="space-y-16">
        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">01</span>
            Service Definition & Access
          </h3>
          <p className="text-[var(--muted)] leading-relaxed mb-4">
            VaultFill provides an autonomous trust and compliance engine (the "Service") delivered via a 
            SaaS subscription model.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--muted)]">
            <li><strong>Authorization:</strong> Access is limited to your authorized employees and contractors.</li>
            <li><strong>Credentials:</strong> You are responsible for the security of all account credentials.</li>
            <li><strong>Updates:</strong> We reserve the right to modify the Service to improve performance or security, provided such changes do not materially degrade the core functionality.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">02</span>
            Intellectual Property & Content
          </h3>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-[var(--fg)] mb-2">Customer Ownership</h4>
              <p className="text-sm text-[var(--muted)]">You retain all rights, title, and interest in and to the Customer Content (policies, evidence, and questionnaires) you upload to the Service.</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--fg)] mb-2">VaultFill Ownership</h4>
              <p className="text-sm text-[var(--muted)]">VaultFill retains all rights to the Service, including software, AI architectures, vector indices, and proprietary algorithms.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">03</span>
            Acceptable Use Policy (AUP)
          </h3>
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
            <p className="text-sm font-bold text-[var(--fg)] mb-4 uppercase tracking-widest">Strict Prohibitions:</p>
            <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <span>Reverse engineering or extracting underlying AI models.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <span>Automated scraping or exfiltration of the Knowledge Vault.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <span>Using outputs to create a competing compliance product.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <span>Intentional submission of malicious payloads or exploits.</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">04</span>
            The "Human-in-the-Loop" Requirement
          </h3>
          <p className="text-[var(--muted)] leading-relaxed italic border-l-4 border-[var(--vault-blue)] pl-6 py-2">
            While VaultFill provides highly accurate drafts based on your evidence, the final responsibility for 
            compliance accuracy rests with the Customer. You must review every generated response before submitting 
            it to an auditor or client.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">05</span>
            Limitation of Liability
          </h3>
          <div className="bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] text-sm space-y-4">
            <p className="font-bold text-[var(--fg)] uppercase tracking-tight">Standard SaaS Cap:</p>
            <p className="text-[var(--muted)] leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VAULTFILL’S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR 
              RELATED TO THE SERVICES WILL NOT EXCEED THE TOTAL FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS 
              PRECEDING THE CLAIM.
            </p>
            <p className="text-[var(--muted)] leading-relaxed">
              VAULTFILL SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF 
              PROFITS, REVENUE, OR DATA, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">06</span>
            Term & Termination
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            Subscriptions automatically renew unless cancelled at least 30 days prior to the end of the current 
            term. Upon termination, Customer access is immediately revoked, and data deletion proceeds according 
            to our Privacy Policy.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-[var(--vault-blue)]/10 border border-[var(--vault-blue)]/20 flex items-center justify-center text-[var(--vault-blue)] text-sm">07</span>
            Governing Law
          </h3>
          <p className="text-[var(--muted)] leading-relaxed">
            These Terms are governed by the laws of the State of Delaware, without regard to conflict of law 
            principles. Any disputes shall be resolved in the state or federal courts located in Delaware.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
