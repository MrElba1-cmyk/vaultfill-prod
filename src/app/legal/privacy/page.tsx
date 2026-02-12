import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy — VaultFill',
  description: 'Enterprise privacy terms for VaultFill (GDPR-aligned).',
};

export default function LegalPrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Data minimization, GDPR rights, and Zero‑Knowledge operational controls."
    >
      <section>
        <p className="text-emerald-400/80">
          This Privacy Policy (“Policy”) governs the processing of Personal Data by VaultFill (“VaultFill”, “we”,
          “us”) in connection with our websites, products, and services (collectively, the “Services”). If you are
          using the Services on behalf of an entity, you represent that you have authority to bind that entity.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">1. Roles (Controller / Processor)</h2>
        <p className="text-emerald-400/80">
          For enterprise customers, VaultFill generally acts as a <b>processor</b> with respect to Customer
          Content (including uploaded artifacts) and the customer acts as the <b>controller</b>. VaultFill acts as
          a controller for Personal Data we process for our own purposes (e.g., account administration, billing,
          security telemetry, and service communications).
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">2. Binding Principles</h2>
        <ul className="list-disc pl-5">
          <li><b>Data minimization:</b> collect/process only what is necessary to provide, secure, and support the Services.</li>
          <li><b>Purpose limitation:</b> use data only for stated purposes and compatible purposes permitted by law.</li>
          <li><b>Access limitation:</b> restrict access to Personal Data by least privilege and auditability.</li>
          <li><b>Retention limitation:</b> retain Personal Data only as required for the purposes below and legal/contractual obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">3. Zero‑Knowledge Architecture (Operational Definition)</h2>
        <p className="text-emerald-400/80">
          VaultFill is engineered with a <b>Zero‑Knowledge Architecture</b> orientation: Customer Content is
          processed by automated systems, and VaultFill personnel are not expected to access or review Customer
          Content as part of normal operations. Any human access (if required) is gated by role-based controls,
          logged, and limited to the minimum necessary for: (i) customer-requested support, (ii) security incident
          response, (iii) reliability operations, or (iv) legal compliance.
        </p>
        <p className="mt-3 text-emerald-400/80">
          This section describes security design and operational policy. It does not supersede or modify a
          customer’s executed DPA/MSA.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">4. Categories of Personal Data</h2>
        <ul className="list-disc pl-5">
          <li><b>Account:</b> name, work email, role, authentication identifiers.</li>
          <li><b>Organization:</b> company name, subscription tier, seat count, billing and administrative metadata.</li>
          <li><b>Telemetry & security logs:</b> device/browser metadata, timestamps, and security-relevant events necessary to protect the Services.</li>
          <li><b>Customer Content:</b> artifacts you upload for analysis and drafting (processed under customer instructions).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">5. Purposes of Processing</h2>
        <ul className="list-disc pl-5">
          <li>Provide and operate the Services, including processing uploads and generating drafts and reports.</li>
          <li>Security, abuse prevention, fraud detection, and integrity monitoring.</li>
          <li>Customer support, incident communications, and service notices.</li>
          <li>Billing, subscription administration, and compliance with legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">6. Lawful Bases (GDPR)</h2>
        <ul className="list-disc pl-5">
          <li><b>Contract (Art. 6(1)(b)):</b> to provide the Services you request.</li>
          <li><b>Legitimate interests (Art. 6(1)(f)):</b> to secure the Services, prevent abuse, and improve performance (balanced against your rights).</li>
          <li><b>Consent (Art. 6(1)(a)):</b> where required (e.g., certain marketing communications).</li>
          <li><b>Legal obligation (Art. 6(1)(c)):</b> to satisfy applicable legal requirements and lawful requests.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">7. Security Measures (Summary)</h2>
        <ul className="list-disc pl-5">
          <li><b>Encryption at rest:</b> AES‑256‑GCM (or equivalent) is used to protect stored data where applicable.</li>
          <li><b>Encryption in transit:</b> TLS 1.3 (or equivalent) where supported.</li>
          <li><b>Access controls:</b> least-privilege, role-based access control, and audited administrative actions.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">8. Data Subject Rights (GDPR)</h2>
        <p className="text-emerald-400/80">Subject to applicable law and identity verification, you may request:</p>
        <ul className="list-disc pl-5">
          <li>Access, rectification, deletion, restriction, and portability.</li>
          <li>Objection to processing based on legitimate interests.</li>
          <li>Withdrawal of consent (where processing is based on consent).</li>
          <li>Lodging a complaint with a supervisory authority.</li>
        </ul>
        <p className="mt-3 text-emerald-400/80">
          For Customer Content processed on behalf of enterprise customers, requests should be directed to the
          relevant controller (the customer).
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">9. International Transfers</h2>
        <p className="text-emerald-400/80">
          Where cross-border transfers occur, VaultFill implements appropriate safeguards consistent with
          applicable law (e.g., contractual protections and technical controls).
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">10. Contact</h2>
        <p className="text-emerald-400/80">
          Submit privacy requests via your enterprise support channel or the website Contact page.
        </p>
      </section>
    </LegalLayout>
  );
}
