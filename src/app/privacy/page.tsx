import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout 
      title="Privacy Policy" 
      subtitle="Last Updated: February 13, 2026"
    >
      <div className="space-y-12 text-[var(--muted)] leading-relaxed">
        
        {/* SECTION 1: INTRODUCTION */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">1. Introduction</h2>
          <p>
            At VaultFill ("we," "our," or "us"), we understand that security is not just a feature—it is the very foundation of your trust in us. 
            This Privacy Policy describes how VaultFill collects, uses, and discloses information, and what choices you have with respect to the information.
          </p>
          <p>
            When you use our Service to automate your security questionnaires, you entrust us with sensitive compliance artifacts. 
            We treat this responsibility with the highest level of care, employing enterprise-grade encryption and strict tenant isolation.
          </p>
        </section>

        {/* SECTION 2: INFORMATION WE COLLECT */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">2. Information We Collect</h2>
          <p>We collect information in the following ways:</p>
          
          <h3 className="text-[var(--fg)] font-semibold text-lg mt-6">A. Information You Provide Directly</h3>
          <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and organization details.</li>
            <li><strong>Customer Content:</strong> This includes the security policies, audit reports (SOC 2, ISO), and past questionnaires you upload to the Knowledge Vault. This data is the core of our service and is treated as confidential.</li>
            <li><strong>Support Communications:</strong> Content of messages you send to our support team.</li>
          </ul>

          <h3 className="text-[var(--fg)] font-semibold text-lg mt-6">B. Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
            <li><strong>Usage Data:</strong> We track how you interact with the Service, such as which features you use and the volume of questionnaires processed.</li>
            <li><strong>Device & Log Data:</strong> IP addresses, browser type, and operating system information for security auditing and debugging.</li>
          </ul>
        </section>

        {/* SECTION 3: USE OF DATA */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">3. How We Use Your Information</h2>
          <p>We use the information we collect for specific purposes:</p>
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="bg-[var(--card-2)] border border-[var(--border)] p-5 rounded-xl">
              <div className="text-emerald-400 font-semibold mb-2">Service Delivery</div>
              <div className="text-sm">To provide, maintain, and improve the VaultFill platform, including processing your artifacts into vector embeddings for RAG (Retrieval-Augmented Generation).</div>
            </div>
            <div className="bg-[var(--card-2)] border border-[var(--border)] p-5 rounded-xl">
              <div className="text-emerald-400 font-semibold mb-2">Security & Compliance</div>
              <div className="text-sm">To monitor for suspicious activity, enforce our Terms of Service, and comply with legal obligations.</div>
            </div>
          </div>
          <p className="mt-4 italic">
            <strong>Crucially:</strong> We do not use your Customer Content (policies, answers) to train our foundational AI models. Your data remains isolated to your tenant.
          </p>
        </section>

        {/* SECTION 4: DATA PROCESSING */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">4. AI & Data Processing</h2>
          <p>VaultFill leverages Large Language Models (LLMs) to draft responses. Here is how your data flows:</p>
          <ol className="list-decimal pl-6 space-y-3 marker:font-bold marker:text-[var(--fg)]">
            <li>
              <strong>Ingestion:</strong> Your documents are chunked and embedded using a secure embedding model.
            </li>
            <li>
              <strong>Storage:</strong> These embeddings are stored in a dedicated vector database namespace, isolated logically from other tenants.
            </li>
            <li>
              <strong>Retrieval:</strong> When you ask a question, we retrieve only the relevant chunks.
            </li>
            <li>
              <strong>Generation:</strong> Relevant chunks and your question are sent to the LLM API (via enterprise agreements with zero-retention) to generate the answer.
            </li>
          </ol>
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg flex items-start gap-3">
             <div className="text-xl">🔒</div>
             <div className="text-sm text-emerald-200/80">
               <strong>Zero-Retention Agreement:</strong> Our AI providers are contractually prohibited from using data sent via our API for model training.
             </div>
          </div>
        </section>

        {/* SECTION 5: SECURITY */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">5. Security Measures</h2>
          <p>We employ industry-standard security controls to protect your data:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
            <li><strong>Encryption at Rest:</strong> AES-256 encryption for all stored data.</li>
            <li><strong>Encryption in Transit:</strong> TLS 1.3 for all data moving between your client, our servers, and third-party processors.</li>
            <li><strong>Access Control:</strong> Strict role-based access control (RBAC) and Multi-Factor Authentication (MFA) for internal staff.</li>
            <li><strong>Regular Audits:</strong> We undergo regular third-party penetration testing and security reviews.</li>
          </ul>
        </section>

        {/* SECTION 6: RETENTION */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">6. Data Retention</h2>
          <p>
            We retain your Customer Content only for as long as your account is active. 
            Upon account termination, you may request the immediate deletion of your data. 
            Standard backups are retained for 30 days before being securely overwritten.
          </p>
        </section>

        {/* SECTION 7: SUBPROCESSORS */}
        <section className="space-y-4">
          <h2 className="text-[var(--fg)] font-bold text-2xl tracking-tight">7. Subprocessors</h2>
          <p>To provide our service, we engage the following third-party subprocessors:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--fg)]">
                  <th className="py-3 pr-4">Subprocessor</th>
                  <th className="py-3 pr-4">Purpose</th>
                  <th className="py-3">Location</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                <tr className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-4">Vercel Inc.</td>
                  <td className="py-3 pr-4">Hosting & Compute</td>
                  <td className="py-3">USA</td>
                </tr>
                <tr className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-4">OpenAI, LLC</td>
                  <td className="py-3 pr-4">LLM Processing</td>
                  <td className="py-3">USA</td>
                </tr>
                <tr className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-4">Pinecone Systems</td>
                  <td className="py-3 pr-4">Vector Database</td>
                  <td className="py-3">USA (AWS)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Supabase</td>
                  <td className="py-3 pr-4">Relational Database</td>
                  <td className="py-3">USA (AWS)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 8: CONTACT */}
        <section className="bg-[var(--card-2)] border border-[var(--border)] rounded-2xl p-8 text-center mt-12">
          <h3 className="text-[var(--fg)] font-bold text-xl mb-2">Questions about your privacy?</h3>
          <p className="text-sm mb-6">Our Data Protection Officer is available to address your concerns.</p>
          <a 
            href="mailto:privacy@vaultfill.com"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--vault-blue)] px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Contact Privacy Team
          </a>
        </section>
        
      </div>
    </LegalLayout>
  );
}
