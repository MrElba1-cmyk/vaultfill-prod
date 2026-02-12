import LegalLayout from '@/components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout 
      title="Terms of Service" 
      subtitle="Last Updated: February 11, 2026"
    >
      <section>
        <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">1. Services Provided</h2>
        <p>VaultFill provides an autonomous compliance and security questionnaire automation platform. Usage is governed by the seat count and deployment model selected during onboarding.</p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">2. Acceptable Use</h2>
        <p>Users must not use the Emerald Stealth engine for reverse-engineering, data-scraping, or any activity that violates the security of our infrastructure or other tenants.</p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-tight">3. Intellectual Property</h2>
        <p>Your evidence, policies, and generated responses remain your sole property. VaultFill retains ownership of the underlying AI models and proprietary "Emerald Stealth" remediation logic.</p>
      </section>
    </LegalLayout>
  );
}
