# VaultFill Data Retention & Deletion Policy

**Last Updated:** 2026-02-09  
**Document Classification:** Share under NDA  
**Document Owner:** VaultFill Security  
**Review Cadence:** Annually or upon material change to data processing activities

---

## 1. Purpose

This policy defines the retention periods for all categories of data processed by VaultFill, the procedures for secure deletion, and the mechanisms available to data subjects and customers to request removal of their data. It supports compliance with GDPR Article 5(1)(e) (storage limitation), CCPA, and common vendor security questionnaire requirements.

---

## 2. Scope

This policy applies to all data processed by the VaultFill platform, including:
- Data processed through the VaultFill web application (vaultfill.com)
- Data stored in VaultFill's database systems (Neon PostgreSQL via Vercel Postgres)
- Data transmitted to subprocessors (OpenAI, Vercel, Telegram) during service delivery
- Data held in application memory during active sessions

---

## 3. Data Category Inventory & Retention Schedule

### 3.1 Customer-Facing Data

| Data Category | Description | Storage Location | Retention Period | Deletion Trigger |
|---|---|---|---|---|
| **Chat session context** | Conversation history between user and Shield Bot (message role, content, timestamps) | Application memory only (Node.js `Map` object, server-side) | Duration of active session + automatic purge after 7-day idle timeout. Not written to persistent storage. | Session idle timeout or server process recycle |
| **Uploaded evidence documents** | Security policies, audit reports, vendor attestations uploaded to the Knowledge Vault | Neon PostgreSQL (as text content and vector embeddings) | Retained until customer requests deletion or contract terminates | Customer deletion request or contract termination + 30-day grace period |
| **Document embeddings** | 1536-dimension vector representations of uploaded document chunks (text-embedding-3-small) | Neon PostgreSQL (pgvector) | Same lifecycle as the source document — deleted when the source document is deleted | Cascading deletion with source document |
| **Generated questionnaire responses** | AI-drafted answers produced by the RAG pipeline | Returned to user in real-time; not persisted server-side unless exported | Not retained server-side after delivery. If customer exports, retention is on customer's systems. | Immediate (not stored) |

### 3.2 Lead & Marketing Data

| Data Category | Description | Storage Location | Retention Period | Deletion Trigger |
|---|---|---|---|---|
| **Lead form submissions** | Email address, company name, role, monthly questionnaire volume, current process, preferred formats | Neon PostgreSQL (`leads` table) | 24 months from date of submission | Automatic purge at retention expiry, or upon data subject deletion request |
| **Lead notification data** | Subset of lead data sent to VaultFill sales team (email, volume tier, detected industry) | Telegram messages (notification relay) | Per Telegram's retention policy (VaultFill does not control Telegram message retention) | VaultFill team manually deletes notification messages as part of quarterly hygiene |
| **User-agent strings** | Browser user-agent captured with lead submissions | Neon PostgreSQL (`leads` table, `user_agent` column) | Same as lead form submissions (24 months) | Deleted with the lead record |

### 3.3 Operational Data

| Data Category | Description | Storage Location | Retention Period | Deletion Trigger |
|---|---|---|---|---|
| **Application logs** | Server-side function execution logs, error logs, request metadata | Vercel (managed log infrastructure) | Per Vercel's log retention policy (varies by plan; typically 1–3 days for serverless function logs on non-enterprise plans) | Automatic rotation by Vercel |
| **Deployment logs** | Build and deployment event records | Vercel dashboard | Per Vercel's retention policy | Automatic rotation by Vercel |
| **Health check data** | Daily automated health check results (`/api/cron/health`) | Application logs (Vercel) | Same as application logs | Automatic rotation |

### 3.4 Data Processed by Subprocessors

| Subprocessor | Data Received | Subprocessor Retention | VaultFill's Control |
|---|---|---|---|
| **OpenAI** | User queries + document chunks (in LLM prompts); document text (for embedding generation) | API inputs/outputs retained up to 30 days for abuse monitoring, then deleted. Not used for model training. | VaultFill does not control OpenAI's abuse-monitoring retention. Documented in OpenAI's DPA and data usage policy. |
| **Vercel** | All HTTPS request/response traffic during serverless function execution | Function execution context is ephemeral. Logs retained per plan tier. | VaultFill uses Vercel's log management. |
| **Neon** | All database content (see categories above) | Data retained for the duration of the service. Backups per Neon's backup schedule. | VaultFill controls data lifecycle via database operations. |
| **Telegram** | Lead notification subset (email, volume, industry) | Per Telegram's data retention | Limited — Telegram messages can be manually deleted by VaultFill team |

---

## 4. Deletion Procedures

### 4.1 Customer-Initiated Deletion

Customers may request deletion of their data by contacting **privacy@vaultfill.com**. VaultFill will:

1. **Acknowledge** the request within 2 business days.
2. **Verify** the identity of the requester (customer admin or authorized contact).
3. **Execute** the deletion within 30 calendar days of verification:
   - Delete all uploaded evidence documents and their associated embeddings from the database.
   - Delete any lead records associated with the customer's domain.
   - Confirm deletion in writing to the requester.
4. **Backup propagation:** Deleted data will be purged from database backups within 60 calendar days as backup snapshots rotate out per Neon's backup retention schedule.

### 4.2 Data Subject Requests (GDPR Article 17 / CCPA)

Individual data subjects may request deletion of their personal data (e.g., lead form submissions). The process follows Section 4.1 with the following additions:
- Requests may be submitted directly by the data subject to privacy@vaultfill.com.
- VaultFill will complete the deletion within 30 calendar days per GDPR Article 12(3) requirements.
- If the data has been transmitted to subprocessors, VaultFill will notify the relevant subprocessors of the deletion request.

### 4.3 Automated Retention Enforcement

| Data Category | Automation Status |
|---|---|
| Chat session context | ✅ Automated — in-memory `Map` with periodic cleanup (hourly sweep, 7-day TTL) |
| Lead submissions (24-month retention) | 🟡 Planned — automated purge job to be implemented. Currently handled via manual quarterly review. |
| Application logs | ✅ Automated — managed by Vercel's log rotation |

> **Note:** Automated enforcement for lead data purging is planned for implementation. Until the automated purge job is deployed, the VaultFill team performs a manual quarterly review to identify and delete records that have exceeded the 24-month retention period.

### 4.4 Deletion Verification

- Deletion is confirmed via database query verifying no records remain for the affected data.
- A deletion log entry is created (who requested, what was deleted, when completed) and retained for 12 months for audit purposes.
- The requester receives written confirmation upon completion.

---

## 5. Exceptions

- **Legal hold:** Data subject to active litigation, regulatory investigation, or legal hold may be retained beyond standard retention periods as required by law. The data subject will be notified of the hold where legally permitted.
- **Aggregated/anonymized data:** Data that has been irreversibly anonymized or aggregated such that it no longer constitutes personal data may be retained indefinitely for analytics and service improvement purposes.
- **Contractual obligations:** Where a customer contract specifies retention periods that differ from this policy, the contractual terms take precedence for that customer's data.

---

## 6. Policy Review & Updates

This policy is reviewed at minimum annually and updated whenever:
- New data categories are introduced
- Subprocessor relationships change
- Regulatory requirements change
- Customer feedback or audit findings require adjustment

Changes to this policy are communicated to affected customers via email notification.

---

## Contact

For questions about data retention or to submit a deletion request:

**Email:** privacy@vaultfill.com  
**Security contact:** security@vaultfill.com

---

*This policy reflects VaultFill's current data processing activities as of the date above. Retention periods marked as "planned" for automation are currently enforced through manual processes.*
