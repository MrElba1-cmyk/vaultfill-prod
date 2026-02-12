import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Security — VaultFill',
  description: 'Enterprise security posture for VaultFill (encryption, isolation, zero-log principles).',
};

export default function LegalSecurityPage() {
  return (
    <LegalLayout
      title="Security"
      subtitle="AES‑256‑GCM encryption, Zero‑Knowledge controls, and Emerald Stealth protocol baselines."
    >
      <section>
        <p className="text-emerald-400/80">
          This Security Statement provides a high-level summary of VaultFill’s security posture. It is not a
          warranty and does not modify a signed MSA/DPA/SLA. Detailed control evidence may be provided to
          qualified enterprise customers under NDA.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">1. Encryption</h2>
        <ul className="list-disc pl-5">
          <li><b>Encryption at rest:</b> AES‑256‑GCM (or equivalent) is used to protect stored data where applicable.</li>
          <li><b>Encryption in transit:</b> TLS 1.3 (or equivalent) is used where supported.</li>
          <li><b>Key management:</b> access to cryptographic material is restricted by least privilege and administrative actions are auditable.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">2. Zero‑Knowledge Architecture</h2>
        <p className="text-emerald-400/80">
          VaultFill is designed for minimal human access to Customer Content. Under our Zero‑Knowledge
          Architecture orientation, Customer Content is processed by automated systems and access by VaultFill
          personnel is restricted, logged, and permitted only when necessary for: (i) customer-requested support,
          (ii) security incident response, (iii) reliability operations, or (iv) legal compliance.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">3. Zero‑Log Policy (Minimization Standard)</h2>
        <p className="text-emerald-400/80">
          VaultFill applies a “Zero‑Log” minimization standard: we avoid storing raw customer content in
          operational logs and restrict logs to metadata necessary for integrity, abuse prevention, and incident
          investigation. Logs (where required) are access-controlled and retained under policy.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">4. Emerald Stealth Protocol</h2>
        <p className="text-emerald-400/80">
          “Emerald Stealth” is VaultFill’s internal protocol baseline for secure artifact ingestion and
          containment. It establishes the minimum architectural requirements for handling untrusted uploads,
          reducing injection/exfiltration risk, and maintaining auditability.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Isolation-first:</b> tenant content is processed within isolated execution contexts and scoped boundaries.</li>
          <li><b>Input hardening:</b> uploads are treated as untrusted input and sanitized prior to ingestion.</li>
          <li><b>Least privilege:</b> role-based access control and scoped credentials limit access to systems and data.</li>
          <li><b>Auditability:</b> security-relevant actions are logged for accountability and investigation.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">5. Monitoring & Incident Response</h2>
        <ul className="list-disc pl-5">
          <li><b>Detection:</b> monitoring for anomalous behavior and abuse patterns.</li>
          <li><b>Containment:</b> circuit-breaking and isolation patterns to reduce blast radius.</li>
          <li><b>Remediation:</b> patching, response actions, and customer communications per enterprise agreements.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">6. Vulnerability Disclosure</h2>
        <p className="text-emerald-400/80">
          Submit vulnerability reports through your enterprise support channel or the website Contact page. Do not
          include sensitive customer data in reports.
        </p>
      </section>
    </LegalLayout>
  );
}
