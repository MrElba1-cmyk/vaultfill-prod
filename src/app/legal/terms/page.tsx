import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service — VaultFill',
  description: 'Binding SaaS terms for VaultFill (enterprise-grade).',
};

export default function LegalTermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Subscription SaaS terms with strict disclaimers and liability limitations."
    >
      <section>
        <p className="text-emerald-400/80">
          These Terms of Service (“Terms”) form a binding agreement between VaultFill (“VaultFill”, “we”, “us”)
          and the customer (“Customer”, “you”) governing access to and use of the Services. By accessing or using
          the Services, Customer accepts these Terms. If Customer is using the Services on behalf of an entity,
          Customer represents it has authority to bind that entity.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">1. Order of Precedence</h2>
        <p className="text-emerald-400/80">
          If the parties execute an Order Form, MSA, DPA, SLA, or other written agreement, that agreement will
          govern and control to the extent of any conflict.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">2. Subscription; Fees; Term</h2>
        <ul className="list-disc pl-5">
          <li><b>Subscription:</b> Services are provided on a subscription basis for the term stated in the Order Form.</li>
          <li><b>Fees:</b> fees are due as stated in the Order Form. Non-payment may result in suspension after notice.</li>
          <li><b>Seats/usage:</b> usage limits and seat counts apply. Excess usage may require upgrade or additional fees.</li>
          <li><b>Taxes:</b> fees exclude taxes unless stated otherwise.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">3. Customer Responsibilities</h2>
        <ul className="list-disc pl-5">
          <li>Maintain credential confidentiality and restrict access to authorized users.</li>
          <li>Ensure uploaded content is authorized, lawful, and does not infringe third-party rights.</li>
          <li>Independently review and validate generated outputs prior to operational or contractual use.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">4. Acceptable Use</h2>
        <ul className="list-disc pl-5">
          <li>No reverse engineering, model extraction, prompt extraction, or circumvention of technical controls.</li>
          <li>No security testing, scanning, or probing absent written authorization.</li>
          <li>No malware, exploit payloads, or content intended to compromise confidentiality, integrity, or availability.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">5. Confidentiality</h2>
        <p className="text-emerald-400/80">
          Each party may receive Confidential Information. The receiving party will protect Confidential
          Information using reasonable measures and will use it only to perform under these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">6. Disclaimers</h2>
        <p className="text-emerald-400/80">
          THE SERVICES, INCLUDING ANY OUTPUTS, ARE PROVIDED “AS IS” AND “AS AVAILABLE.” EXCEPT AS EXPRESSLY
          STATED IN A WRITTEN AGREEMENT, VAULTFILL DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT
          OF COURSE OF DEALING OR USAGE OF TRADE. VAULTFILL DOES NOT WARRANT THAT OUTPUTS ARE ERROR-FREE OR THAT
          THEY WILL SATISFY ANY PARTICULAR AUDIT, REGULATORY, OR PROCUREMENT REQUIREMENT.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">7. STRICT LIMITATION OF LIABILITY (SaaS)</h2>
        <p className="text-emerald-400/80">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW: (A) IN NO EVENT WILL VAULTFILL BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE,
          BUSINESS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO THE SERVICES, EVEN IF ADVISED OF THE
          POSSIBILITY; AND (B) VAULTFILL’S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THE SERVICES
          WILL NOT EXCEED THE FEES PAID (OR PAYABLE) BY CUSTOMER TO VAULTFILL FOR THE SERVICES IN THE TWELVE (12)
          MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
        </p>
        <p className="mt-3 text-emerald-400/80">
          CUSTOMER’S SOLE AND EXCLUSIVE REMEDY FOR ANY CLAIM IS LIMITED TO THE AMOUNT SET FORTH ABOVE.
        </p>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">8. Termination</h2>
        <ul className="list-disc pl-5">
          <li>Either party may terminate for material breach not cured after written notice.</li>
          <li>Upon termination, access will be discontinued as described in the Order Form/MSA.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white font-bold text-lg uppercase tracking-tight">9. Governing Law</h2>
        <p className="text-emerald-400/80">
          Governing law and venue are set forth in the parties’ executed agreement; otherwise, as required by
          applicable law.
        </p>
      </section>
    </LegalLayout>
  );
}
