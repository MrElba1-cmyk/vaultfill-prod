# Compliance Corpus Proposal — VaultFill Knowledge Vault

> **Created:** 2026-02-09  
> **Status:** Proposal — awaiting VaultFill team review  
> **Goal:** Define the minimum viable compliance corpus so the Knowledge Vault can answer the majority of enterprise buyer security questions truthfully, with citations.

---

## Table of Contents

1. [Current Inventory & Gap Analysis](#1-current-inventory--gap-analysis)
2. [Proposed Minimum Viable Corpus (16 Documents)](#2-proposed-minimum-viable-corpus-16-documents)
3. [Document-by-Document Specification](#3-document-by-document-specification)
4. [2-Week Ingestion Schedule](#4-2-week-ingestion-schedule)
5. [Templates for Missing Documents](#5-templates-for-missing-documents)
6. [Appendix: Chunking & Embedding Notes](#appendix-chunking--embedding-notes)

---

## 1. Current Inventory & Gap Analysis

### 1.1 What We Have

| # | File | Location | Content Quality | Coverage |
|---|------|----------|----------------|----------|
| 1 | `SOC2_Type2_Report_v2.md` | `data/sample-vault/` | **Mock** — 3 sections only (logical access, encryption at rest, MFA). Labeled "mock" at top. | ~10% of SOC 2 TSC |
| 2 | `ISO27001_Policy.md` | `data/sample-vault/` | **Mock** — roles + asset mgmt + 3 control statements. Very thin. | ~5% of ISO 27001 Annex A |
| 3 | `Global_Privacy_Policy.md` | `data/sample-vault/` | **Mock** — retention, GDPR basics, DSR. Adequate skeleton. | ~30% of typical privacy policy |
| 4 | `FAQ.md` | `data/sample-vault/` + root | **Good** — 25 Q&As across 5 categories (getting started, security, features, pricing, technical). Duplicated in two locations. | High relevance — but all VaultFill product-focused, no compliance evidence |
| 5 | `vaultfill-product-knowledge.md` | `docs/` | **Excellent** — comprehensive product doc with truthful security claims audit. 11 sections. | Product positioning ✅; compliance evidence ❌ |
| 6 | `privacy-claim-recommendation.md` | `docs/` | **Internal** — audit of privacy claims vs. reality. Replacement copy provided. | Not corpus material — internal ops doc |
| 7 | `knowledge-vault-enrichment-plan.md` | `docs/` | **Excellent** — detailed plan for framework ingestion (SOC2, ISO, CAIQ, SIG, DDQ). Schema, pipeline, effort estimates. | Blueprint ✅; no actual content yet |
| 8 | `competitive_intel_vanta_decon.md` | `docs/` | **Internal only** — competitive analysis. Was previously exposed via `/api/knowledge`. | ⚠️ Must NEVER be in sample-vault |

### 1.2 What's Currently Ingested (pgvector)

The `ingest-vault.ts` script reads from `docs/` and `data/sample-vault/`. The `vector-index.json` shows embeddings exist for the sample-vault docs. However:
- Chunks are basic: split on headings, max ~2000 chars
- No framework IDs, control IDs, or structured citations
- No sensitivity flags (`is_internal`)
- Competitive intel was previously ingested and publicly served (audit flagged this as CRITICAL)

### 1.3 Gap Analysis — What Buyers Actually Ask

When an enterprise prospect evaluates VaultFill as a vendor, their security/procurement team sends a questionnaire covering these domains. Here's what we can answer today vs. what we can't:

| Domain | Can Answer Today? | Gap |
|--------|:-----------------:|-----|
| **SOC 2 compliance status** | ⚠️ Partial | Mock report only covers 3 areas. No actual audit report, bridge letter, or management assertion. |
| **ISO 27001 certification** | ⚠️ Partial | Mock policy is skeletal. No SoA, no certificate, no Annex A control mapping. |
| **CAIQ/CCM responses** | ❌ No | No CAIQ content exists. Enrichment plan references it but nothing authored. |
| **SIG Lite responses** | ❌ No | No SIG content. Plan acknowledges membership requirement. |
| **DPA (Data Processing Agreement)** | ❌ No | No DPA exists. Enterprise buyers will request one before signing. |
| **Subprocessor list** | ❌ No | We use OpenAI, Vercel, Neon (Postgres), Telegram — but no formal list exists. |
| **Data retention & deletion** | ⚠️ Partial | Privacy policy mentions principles; no specific retention schedule with actual periods. |
| **Incident response** | ❌ No | No IR plan, no summary, no notification timelines. |
| **Access control policy** | ⚠️ Partial | SOC 2 mock mentions basics; no actual policy describing VaultFill's own controls. |
| **Change management** | ❌ No | No change management process documented. |
| **BCP/DR** | ❌ No | No business continuity or disaster recovery plan. |
| **Vulnerability management** | ❌ No | Pre-launch security audit exists but no vuln mgmt program documented. |
| **Encryption & key management** | ⚠️ Partial | Product knowledge doc has truthful claims; no formal encryption policy doc. |
| **Logging & audit trails** | ⚠️ Partial | FAQ mentions audit trails; no specifics on log types, retention, monitoring. |

**Bottom line:** The current corpus can handle ~20% of a typical vendor security questionnaire. The remaining ~80% would produce either no answer or a hallucinated one.

---

## 2. Proposed Minimum Viable Corpus (16 Documents)

These 16 documents represent the minimum set to answer the vast majority of enterprise security questionnaire questions about **VaultFill itself** (not generic framework content — that's covered by the enrichment plan).

### Document Overview

| # | Document | Status | Sensitivity | Can Sanitize for Public? | Impact |
|---|----------|--------|------------|:------------------------:|--------|
| 1 | SOC 2 Readiness Narrative | 🟡 Needs authoring | Share-under-NDA | ✅ Yes | 🔴 Critical |
| 2 | ISO 27001 Statement of Applicability (SoA) | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) |🔴 Critical |
| 3 | CAIQ v4 Self-Assessment | 🟡 Needs authoring | Share-under-NDA | ✅ Yes | 🟡 High |
| 4 | SIG Lite Responses | 🟡 Needs authoring | Share-under-NDA | ❌ Too detailed | 🟡 High |
| 5 | Data Processing Agreement (DPA) | 🟡 Needs authoring (legal review) | Public | N/A (already public) | 🔴 Critical |
| 6 | Subprocessor List | 🟡 Needs authoring | Public | N/A (already public) | 🔴 Critical |
| 7 | Data Retention & Deletion Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🔴 Critical |
| 8 | Incident Response Summary | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (overview) | 🔴 Critical |
| 9 | Access Control Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🟡 High |
| 10 | Change Management Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🟡 High |
| 11 | BCP/DR Summary | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (overview) | 🟡 High |
| 12 | Vulnerability Management Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🟡 High |
| 13 | Encryption & Key Management Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🔴 Critical |
| 14 | Logging & Audit Trail Policy | 🟡 Needs authoring | Share-under-NDA | ✅ Yes (summary) | 🟡 High |
| 15 | Privacy Policy (Full, Publishable) | 🟡 Needs expansion | Public | N/A (already public) | 🔴 Critical |
| 16 | Security Overview (Public) | 🟡 Needs authoring | Public | N/A (already public) | 🔴 Critical |

**Legend:**
- 🔴 Critical = Requested in >80% of vendor questionnaires
- 🟡 High = Requested in 40-80% of vendor questionnaires
- **Share-under-NDA** = Shared with prospects after mutual NDA or during formal due diligence
- **Public** = Can be posted on website or shared freely
- **Internal** = Never shared outside the org

---

## 3. Document-by-Document Specification

### Doc 1: SOC 2 Readiness Narrative
**Filename:** `soc2-readiness-narrative.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — a 1-page "SOC 2 Readiness Summary" for the website

**Purpose:** Since VaultFill does not yet have a SOC 2 Type II audit report, this document describes the controls VaultFill has implemented aligned to the Trust Service Criteria. It's the honest alternative to a full report.

**Sectioning/Chunking Strategy:**
- **Section 1:** Executive Summary & Audit Status (1 chunk) — state clearly: "VaultFill has not completed a SOC 2 Type II audit. Architecture follows TSC principles. Formal audit planned for [date]."
- **Section 2:** Common Criteria (CC) — Organization & Management (CC1) (1 chunk)
- **Section 3:** Communications (CC2) (1 chunk)
- **Section 4:** Risk Assessment (CC3) (1 chunk)
- **Section 5:** Monitoring Activities (CC4) (1 chunk)
- **Section 6:** Control Activities (CC5) (1 chunk)
- **Section 7:** Logical & Physical Access Controls (CC6) (2 chunks — this is the most queried area)
- **Section 8:** System Operations (CC7) (1 chunk)
- **Section 9:** Change Management (CC8) (1 chunk)
- **Section 10:** Risk Mitigation (CC9) (1 chunk)
- **Estimated chunks:** 11-13

**What to include:**
- For each CC category: what VaultFill actually does today, what's planned, what's not yet implemented
- Specific technologies (Vercel, Neon Postgres, OpenAI API, TLS, etc.)
- Honest gaps flagged clearly

**⚠️ Do NOT fabricate:** If a control is not implemented, state "Not yet implemented. Planned for [quarter]." Never claim controls that don't exist.

---

### Doc 2: ISO 27001 Statement of Applicability (SoA)
**Filename:** `iso27001-soa.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — "ISO 27001 Alignment Summary" (list of applicable controls only, no implementation details)

**Purpose:** Maps VaultFill's practices to all 93 Annex A controls from ISO 27001:2022. For each control, states whether it's applicable, implemented, partially implemented, or not applicable — with justification.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope & Certification Status (1 chunk) — clearly state: not certified, designed with ISO 27001 principles
- **Section 2:** Organizational Controls (A.5.1–A.5.37) — group into 4-5 chunks of ~8 controls each
- **Section 3:** People Controls (A.6.1–A.6.8) — 1 chunk
- **Section 4:** Physical Controls (A.7.1–A.7.14) — 2 chunks
- **Section 5:** Technological Controls (A.8.1–A.8.34) — group into 4-5 chunks of ~7 controls each
- **Estimated chunks:** 13-15

**Format per control:**
```
| Control ID | Control Name | Applicable? | Status | Notes |
| A.8.24 | Use of Cryptography | Yes | Partially Implemented | TLS in transit. At-rest encryption via Vercel Postgres defaults. Dedicated KMS planned. |
```

---

### Doc 3: CAIQ v4 Self-Assessment
**Filename:** `caiq-v4-self-assessment.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — publish as CSA STAR Level 1 submission (this is designed to be public)

**Purpose:** Answer the Cloud Security Alliance CAIQ v4.1 questions for VaultFill. The CAIQ is specifically designed for cloud service providers to self-assess and publish.

**Sectioning/Chunking Strategy:**
- 1 chunk per CCM domain (17 domains), each containing all questions for that domain
- **Domains:** AIS, BCR, CCC, CEK, DSP, GRC, HRS, IAM, IPY, IVS, LOG, SEF, STA, TVM, UEM, A&A, SCA
- **Estimated chunks:** 17-25

**Note:** The CAIQ v4.1 template is free to download from CSA. VaultFill should download it, complete honestly, and consider submitting to the CSA STAR registry for public transparency.

---

### Doc 4: SIG Lite Responses
**Filename:** `sig-lite-responses.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ❌ No — too detailed, responses reference internal controls

**Purpose:** Pre-built responses to the ~128 SIG Lite questions. Since SIG content is proprietary (requires Shared Assessments membership), this document contains VaultFill's answers mapped to the common SIG Lite question categories.

**Sectioning/Chunking Strategy:**
- 1 chunk per SIG domain (25 domains, but SIG Lite only covers ~18 actively)
- Each chunk: domain header + Q&A pairs for that domain
- **Estimated chunks:** 18-22

**Access note:** Without a Shared Assessments membership ($1,500/yr), author responses based on the publicly known SIG Lite question categories. When a prospect sends their actual SIG Lite, VaultFill's RAG should match these responses by semantic similarity.

---

### Doc 5: Data Processing Agreement (DPA)
**Filename:** `dpa-template.md`  
**Status:** 🟡 NEEDS AUTHORING — requires legal review  
**Sensitivity:** Public  
**Sanitized Public Version:** N/A — the DPA itself should be public/available on request

**Purpose:** Standard DPA that enterprise customers will require before signing. Covers GDPR Article 28 requirements, CCPA service provider obligations, and standard contractual clauses.

**Sectioning/Chunking Strategy:**
- **Section 1:** Definitions (1 chunk)
- **Section 2:** Scope & Purpose of Processing (1 chunk)
- **Section 3:** Obligations of the Processor (VaultFill) (2 chunks)
- **Section 4:** Subprocessor Management (1 chunk) — cross-references the subprocessor list
- **Section 5:** Data Subject Rights (1 chunk)
- **Section 6:** Security Measures (1 chunk)
- **Section 7:** Breach Notification (1 chunk)
- **Section 8:** Data Return & Deletion (1 chunk)
- **Section 9:** Audits & Compliance (1 chunk)
- **Annex 1:** Processing Details (categories of data, data subjects, retention periods) (1 chunk)
- **Annex 2:** Technical & Organizational Measures (1 chunk)
- **Annex 3:** List of Subprocessors (1 chunk — or cross-reference)
- **Estimated chunks:** 12-14

**⚠️ Important:** DPA MUST be reviewed by a lawyer before publishing. Template provided below as a starting point.

---

### Doc 6: Subprocessor List
**Filename:** `subprocessors.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Public  
**Sanitized Public Version:** N/A — already public

**Purpose:** Lists all third-party services that process customer data on VaultFill's behalf. Required by GDPR, expected by every enterprise buyer.

**Sectioning/Chunking Strategy:**
- Single chunk (short document, ~300 tokens). Table format.
- **Estimated chunks:** 1-2

**Known subprocessors to document (based on codebase analysis):**

| Subprocessor | Purpose | Data Processed | Location | DPA Available? |
|---|---|---|---|---|
| **OpenAI** | LLM inference (GPT-4o-mini) + embeddings | User queries, document chunks (in prompts) | USA | Yes (OpenAI DPA) |
| **Vercel** | Application hosting, edge network, serverless compute | All application traffic, session data | USA (global CDN) | Yes (Vercel DPA) |
| **Neon** (via Vercel Postgres) | Database hosting (PostgreSQL + pgvector) | Lead data, document embeddings, metadata | USA | Yes (Neon DPA) |
| **Telegram** | Lead notification delivery | Lead email, volume, industry (subset) | Global | ⚠️ Review needed |

**⚠️ VaultFill team must verify:** Are there any other services processing customer data? Analytics? Error tracking? CDN? Email service?

---

### Doc 7: Data Retention & Deletion Policy
**Filename:** `data-retention-deletion-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — summary table of retention periods for the privacy page

**Purpose:** Specifies what data VaultFill collects, how long it's retained, and how it's deleted. Critical for GDPR compliance and vendor questionnaires.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope & Definitions (1 chunk)
- **Section 2:** Data Category Inventory (1 chunk) — table of all data types with retention periods
- **Section 3:** Retention Schedule (1 chunk)
  - Chat session data: In-memory only, purged on process recycle (add explicit TTL per privacy-claim-recommendation.md)
  - Lead form submissions: [VaultFill to define — e.g., 24 months then auto-delete]
  - Uploaded evidence documents: Retained until customer deletes or contract terminates
  - Embeddings/vectors: Retained alongside source documents
  - Audit logs: [VaultFill to define — e.g., 12 months]
- **Section 4:** Deletion Procedures (1 chunk) — how data is deleted, verification, media sanitization
- **Section 5:** Data Subject Requests (1 chunk) — process for handling deletion requests
- **Estimated chunks:** 5-6

**⚠️ VaultFill team must provide:** Actual retention periods. The template below uses placeholders.

---

### Doc 8: Incident Response Summary
**Filename:** `incident-response-summary.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — high-level overview (phases, notification commitment, contact info)

**Purpose:** Describes VaultFill's incident response process. Buyers need to know: if there's a breach, what happens, how fast are they notified, and who's responsible.

**Sectioning/Chunking Strategy:**
- **Section 1:** Purpose & Scope (1 chunk)
- **Section 2:** Incident Classification (1 chunk) — severity levels (P1/P2/P3/P4)
- **Section 3:** Response Phases (1 chunk) — Detection → Containment → Eradication → Recovery → Lessons Learned
- **Section 4:** Notification Timelines (1 chunk) — GDPR requires 72 hours; what does VaultFill commit to?
- **Section 5:** Roles & Responsibilities (1 chunk)
- **Section 6:** Communication Plan (1 chunk) — who gets notified, through what channel
- **Estimated chunks:** 6

**⚠️ VaultFill team must define:** Notification timelines, incident commander role, communication channels. Template below provides the structure.

---

### Doc 9: Access Control Policy
**Filename:** `access-control-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — summary of principles (least privilege, MFA, access reviews)

**Purpose:** Documents how VaultFill manages access to its systems — both for the team and for customers.

**Sectioning/Chunking Strategy:**
- **Section 1:** Principles (least privilege, need-to-know, separation of duties) (1 chunk)
- **Section 2:** Authentication Requirements (1 chunk) — MFA, password policy, SSO
- **Section 3:** Authorization Model (1 chunk) — RBAC, tenant isolation, admin access
- **Section 4:** Provisioning & Deprovisioning (1 chunk) — JML process
- **Section 5:** Access Reviews (1 chunk) — frequency, scope, remediation
- **Section 6:** Privileged Access Management (1 chunk) — production access, break-glass procedures
- **Estimated chunks:** 6

---

### Doc 10: Change Management Policy
**Filename:** `change-management-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — overview of process (PR review, CI/CD, rollback)

**Purpose:** Documents how VaultFill manages changes to its production systems — code deployments, infrastructure changes, configuration changes.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope (1 chunk) — what constitutes a change
- **Section 2:** Change Classification (1 chunk) — standard, normal, emergency
- **Section 3:** Change Process (1 chunk) — request → review → approve → deploy → verify
- **Section 4:** Code Review & CI/CD (1 chunk) — PR requirements, automated testing, deployment pipeline
- **Section 5:** Rollback Procedures (1 chunk)
- **Section 6:** Emergency Changes (1 chunk)
- **Estimated chunks:** 6

**Note:** Since VaultFill deploys via Vercel (git push → auto-deploy), much of this can be documented from existing workflow. The VaultFill team should describe their actual PR review process and any deployment gates.

---

### Doc 11: BCP/DR Summary
**Filename:** `bcp-dr-summary.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — high-level overview (RPO/RTO commitments, cloud provider resilience)

**Purpose:** Describes how VaultFill maintains service continuity and recovers from disasters.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope & Objectives (1 chunk)
- **Section 2:** Business Impact Analysis (1 chunk) — critical services, dependencies
- **Section 3:** Recovery Objectives (1 chunk) — RPO, RTO targets
- **Section 4:** Infrastructure Resilience (1 chunk) — Vercel's multi-region, Neon's replication, backup strategy
- **Section 5:** DR Procedures (1 chunk) — failover, data restoration
- **Section 6:** Testing (1 chunk) — frequency of DR tests, results
- **Estimated chunks:** 6

**Note:** Much of VaultFill's DR posture is inherited from Vercel and Neon. Document what each provider offers, plus any VaultFill-specific procedures.

---

### Doc 12: Vulnerability Management Policy
**Filename:** `vulnerability-management-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — overview of scanning cadence, remediation SLAs, responsible disclosure

**Purpose:** Documents how VaultFill identifies, prioritizes, and remediates vulnerabilities.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope (1 chunk)
- **Section 2:** Vulnerability Identification (1 chunk) — scanning tools, frequency, sources (CVEs, dependency audits, pen tests)
- **Section 3:** Severity Classification & SLAs (1 chunk) — CVSS-based tiers, remediation timelines
- **Section 4:** Remediation Process (1 chunk) — triage → patch → verify → close
- **Section 5:** Penetration Testing (1 chunk) — frequency, scope, third-party vs. internal
- **Section 6:** Responsible Disclosure (1 chunk) — `security.txt` already exists at `/.well-known/security.txt`
- **Estimated chunks:** 6

**What already exists:** The `prelaunch_security_audit.md` demonstrates VaultFill does perform security assessments. The `security.txt` file exists. These should be referenced.

---

### Doc 13: Encryption & Key Management Policy
**Filename:** `encryption-key-management-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — summary of what's encrypted, standards used

**Purpose:** Documents VaultFill's encryption practices. This is one of the most frequently asked areas. MUST be truthful — the privacy-claim-recommendation.md already identified false claims about encryption.

**Sectioning/Chunking Strategy:**
- **Section 1:** Encryption in Transit (1 chunk) — TLS version, certificate management, HSTS. **This is implemented and verifiable.**
- **Section 2:** Encryption at Rest (1 chunk) — Current state: relies on Vercel Postgres default encryption. **Must state honestly:** no application-layer encryption at rest yet. Planned.
- **Section 3:** Key Management (1 chunk) — Current: Vercel/Neon managed keys. No customer-managed keys (BYOK) yet. Planned.
- **Section 4:** Data in Processing (1 chunk) — Queries sent to OpenAI API over TLS. OpenAI processes plaintext. No E2E encryption. State this clearly.
- **Section 5:** Cryptographic Standards (1 chunk) — what algorithms/protocols are in use
- **Estimated chunks:** 5

**⚠️ Critical honesty requirement:** Per the privacy-claim-recommendation.md:
- ✅ CAN claim: TLS in transit, Vercel Postgres default encryption
- ❌ CANNOT claim: "AES-256 encryption at rest" (not application-implemented), "end-to-end encrypted", "zero-knowledge"
- State planned improvements with timelines

---

### Doc 14: Logging & Audit Trail Policy
**Filename:** `logging-audit-trail-policy.md`  
**Status:** 🟡 NEEDS AUTHORING by VaultFill team  
**Sensitivity:** Share-under-NDA  
**Sanitized Public Version:** ✅ Yes — summary of what's logged, retention period, access controls on logs

**Purpose:** Documents what VaultFill logs, how logs are protected, and how they support audit requirements.

**Sectioning/Chunking Strategy:**
- **Section 1:** Scope — what systems generate logs (1 chunk)
- **Section 2:** Log Types (1 chunk) — application logs, access logs, security events, audit trail of user actions
- **Section 3:** Log Protection (1 chunk) — who can access logs, immutability, encryption
- **Section 4:** Retention (1 chunk) — how long logs are kept
- **Section 5:** Monitoring & Alerting (1 chunk) — what triggers alerts, who responds
- **Estimated chunks:** 5

**What already exists:** Vercel provides deployment logs, function logs, and access logs. VaultFill's application has audit trail functionality (per FAQ). The `alert_procedures.md` doc may contain relevant detail.

---

### Doc 15: Privacy Policy (Full, Publishable)
**Filename:** `privacy-policy-full.md`  
**Status:** 🟡 NEEDS EXPANSION — current `/privacy` page is a placeholder  
**Sensitivity:** Public  
**Sanitized Public Version:** N/A — this IS the public version

**Purpose:** Full, legally reviewed privacy policy for vaultfill.com. Replaces the current placeholder page.

**Sectioning/Chunking Strategy:**
- **Section 1:** Introduction & Scope (1 chunk)
- **Section 2:** Data We Collect (1 chunk) — be specific: session IDs, form submissions, chat messages (in-memory), uploaded documents
- **Section 3:** How We Use Data (1 chunk)
- **Section 4:** Data Sharing & Subprocessors (1 chunk) — cross-reference subprocessor list
- **Section 5:** Data Retention (1 chunk) — cross-reference retention policy
- **Section 6:** Your Rights (GDPR/CCPA) (1 chunk)
- **Section 7:** Security Measures (1 chunk)
- **Section 8:** Cookies & Tracking (1 chunk) — be honest: localStorage session ID, no third-party cookies
- **Section 9:** Changes to Policy (1 chunk)
- **Section 10:** Contact Information (1 chunk)
- **Estimated chunks:** 10

**⚠️ Must align with:** privacy-claim-recommendation.md findings. No "zero-knowledge" language. No "no data stored" claims.

---

### Doc 16: Security Overview (Public)
**Filename:** `security-overview-public.md`  
**Status:** 🟡 NEEDS AUTHORING — current `/security` page is a placeholder  
**Sensitivity:** Public  
**Sanitized Public Version:** N/A — this IS the public version

**Purpose:** Public-facing security page content. Replaces the current placeholder. This is what prospects see before they even request a formal assessment.

**Sectioning/Chunking Strategy:**
- **Section 1:** Security Philosophy (1 chunk)
- **Section 2:** Infrastructure & Hosting (1 chunk) — Vercel, serverless, auto-scaling, CDN
- **Section 3:** Data Protection (1 chunk) — encryption in transit, tenant isolation, no model training
- **Section 4:** Application Security (1 chunk) — secure development, dependencies, testing
- **Section 5:** Compliance Alignment (1 chunk) — SOC 2 Designed, ISO 27001 principles, GDPR
- **Section 6:** Responsible Disclosure (1 chunk) — link to security.txt, contact info
- **Section 7:** Trust Center Resources (1 chunk) — links to DPA, subprocessor list, privacy policy
- **Estimated chunks:** 7

---

## 4. 2-Week Ingestion Schedule

### Prioritization Rationale

Ordered by: (1) frequency of buyer questions, (2) deal-blocking potential, (3) authoring complexity.

### Week 1: Foundation Documents (Deal-Unlockers)

These are the documents that, if absent, will stall or kill enterprise deals.

| Day | Document | Author | Effort | Expected Impact |
|-----|----------|--------|--------|-----------------|
| **Mon (Day 1)** | **Doc 6: Subprocessor List** | VaultFill team (15 min) | 🟢 Low | Unblocks DPA/procurement conversations. Every buyer asks for this. |
| **Mon (Day 1)** | **Doc 16: Security Overview (Public)** | VaultFill team + AI assist | 🟡 Medium (2-3h) | Replaces placeholder `/security` page. First thing prospects see. |
| **Tue (Day 2)** | **Doc 15: Privacy Policy (Full)** | VaultFill team (legal review) | 🟡 Medium (3-4h) | Replaces placeholder `/privacy` page. Required for enterprise. |
| **Tue (Day 2)** | **Doc 7: Data Retention & Deletion** | VaultFill team | 🟡 Medium (2-3h) | Asked in 90%+ of questionnaires. Pairs with privacy policy. |
| **Wed (Day 3)** | **Doc 13: Encryption & Key Mgmt** | VaultFill team | 🟡 Medium (2-3h) | Top-3 most asked topic. Must be truthful per audit findings. |
| **Wed (Day 3)** | **Doc 8: Incident Response Summary** | VaultFill team | 🟡 Medium (2-3h) | Universal questionnaire requirement. |
| **Thu (Day 4)** | **Doc 5: DPA Template** | VaultFill team + legal | 🔴 High (4-6h) | Deal-blocking. No enterprise signs without a DPA. Template provided below. |
| **Fri (Day 5)** | **Doc 9: Access Control Policy** | VaultFill team | 🟡 Medium (2-3h) | High-frequency questionnaire topic. |
| **Fri (Day 5)** | **Doc 14: Logging & Audit Trails** | VaultFill team | 🟡 Medium (2-3h) | Frequently asked alongside access control. |

**Week 1 cumulative coverage:** ~60% of typical vendor questionnaire questions answerable.

### Week 2: Framework Alignment & Remaining Policies

| Day | Document | Author | Effort | Expected Impact |
|-----|----------|--------|--------|-----------------|
| **Mon (Day 6)** | **Doc 1: SOC 2 Readiness Narrative** | VaultFill team | 🔴 High (6-8h) | Covers the #1 requested framework. Honest "designed, not audited" position. |
| **Tue (Day 7)** | **Doc 10: Change Management** | VaultFill team | 🟡 Medium (2-3h) | Common questionnaire topic, directly observable from git workflow. |
| **Tue (Day 7)** | **Doc 12: Vulnerability Management** | VaultFill team | 🟡 Medium (2-3h) | Pairs with change management. Security audit provides evidence. |
| **Wed (Day 8)** | **Doc 11: BCP/DR Summary** | VaultFill team | 🟡 Medium (3-4h) | Requires documenting Vercel/Neon resilience + VaultFill procedures. |
| **Thu (Day 9)** | **Doc 2: ISO 27001 SoA** | VaultFill team | 🔴 High (8-10h) | 93 controls to map. Time-intensive but high value for global buyers. |
| **Fri (Day 10)** | **Doc 3: CAIQ v4 Self-Assessment** | VaultFill team | 🔴 High (6-8h) | Cloud-specific buyers expect this. Can be submitted to CSA STAR. |

**Week 2 Overflow / Week 3:**

| Document | Notes |
|----------|-------|
| **Doc 4: SIG Lite Responses** | Defer to week 3 unless a specific prospect requests. Most SIG content overlaps with the other 15 docs. |

**Week 2 cumulative coverage:** ~85-90% of typical vendor questionnaire questions answerable.

### Impact Projection

```
Baseline (today):     ████░░░░░░░░░░░░░░░░  ~20% coverage
After Week 1:         ████████████░░░░░░░░  ~60% coverage
After Week 2:         █████████████████░░░  ~85% coverage
After SIG Lite:       ██████████████████░░  ~90% coverage
After framework docs: ████████████████████  ~95% coverage
  (from enrichment plan)
```

---

## 5. Templates for Missing Documents

> **⚠️ IMPORTANT:** These templates provide structure and example language. VaultFill team MUST fill in the `[PLACEHOLDER]` values with actual, truthful information. Do NOT use the template language as-is in production — it contains placeholders and example text that must be replaced.

### Template: Subprocessor List (Doc 6)

```markdown
# VaultFill Subprocessor List

**Last updated:** [DATE]  
**Notification policy:** VaultFill will notify customers of new subprocessor additions [30 days] in advance via [email/trust center page].

## Current Subprocessors

| Subprocessor | Purpose | Data Processed | Hosting Location | DPA/Security Info |
|---|---|---|---|---|
| OpenAI, L.L.C. | AI model inference and text embeddings | User queries (in prompts), document text chunks | United States | [OpenAI DPA link] |
| Vercel Inc. | Application hosting, CDN, serverless compute | All application data in transit, function execution context | United States (global edge CDN) | [Vercel DPA link] |
| Neon Inc. (via Vercel Postgres) | PostgreSQL database hosting | Lead data, document embeddings, application metadata | United States | [Neon DPA link] |
| Telegram (notification only) | Lead alert delivery to VaultFill sales team | Lead email, industry, volume tier (subset only) | Global | [Note: Telegram receives minimal data; reviewing alternatives for enterprise customers] |

## Subprocessor Change Log

| Date | Change | Subprocessor |
|---|---|---|
| [DATE] | Initial list published | — |
```

---

### Template: Incident Response Summary (Doc 8)

```markdown
# VaultFill Incident Response Summary

**Document Owner:** [Name/Role]  
**Last Reviewed:** [DATE]  
**Classification:** Share under NDA

## 1. Purpose

This document summarizes VaultFill's process for identifying, responding to, and recovering from security incidents. A detailed Incident Response Plan is maintained internally.

## 2. Scope

Covers all systems that process, store, or transmit customer data, including:
- VaultFill application (hosted on Vercel)
- Database systems (Neon/Vercel Postgres)
- Third-party integrations (OpenAI API)
- Internal tooling and access systems

## 3. Incident Classification

| Severity | Description | Response Time | Example |
|----------|-------------|--------------|---------|
| P1 — Critical | Confirmed data breach, full service outage | [PLACEHOLDER: e.g., 1 hour] | Unauthorized access to customer data |
| P2 — High | Potential data exposure, partial outage | [PLACEHOLDER: e.g., 4 hours] | Suspicious access patterns, degraded service |
| P3 — Medium | Security misconfiguration, no data impact | [PLACEHOLDER: e.g., 1 business day] | Misconfigured access control, failed pen test finding |
| P4 — Low | Minor security observation | [PLACEHOLDER: e.g., 5 business days] | Informational vulnerability, policy clarification needed |

## 4. Response Phases

1. **Detection & Triage** — Identify the incident, classify severity, assign incident commander.
2. **Containment** — Limit the scope and impact. Isolate affected systems.
3. **Eradication** — Remove the root cause. Patch vulnerabilities.
4. **Recovery** — Restore services. Verify integrity. Resume normal operations.
5. **Post-Incident Review** — Conduct blameless retrospective. Document lessons learned. Update controls.

## 5. Customer Notification

- **Notification timeline:** VaultFill will notify affected customers within [PLACEHOLDER: e.g., 72 hours] of confirming a data breach, in compliance with GDPR Article 33 requirements.
- **Notification method:** [PLACEHOLDER: e.g., email to designated security contact + status page update]
- **Notification content:** Nature of the incident, data affected, actions taken, recommended customer actions, point of contact.

## 6. Contact

- **Security incidents:** [PLACEHOLDER: e.g., security@vaultfill.com]
- **Responsible disclosure:** See /.well-known/security.txt
```

---

### Template: Data Retention & Deletion Policy (Doc 7)

```markdown
# VaultFill Data Retention & Deletion Policy

**Document Owner:** [Name/Role]  
**Last Reviewed:** [DATE]  
**Classification:** Share under NDA

## 1. Purpose

Defines retention periods for all categories of data processed by VaultFill and the procedures for secure deletion.

## 2. Data Category Inventory

| Data Category | Description | Retention Period | Deletion Method | Legal Basis |
|---|---|---|---|---|
| **Chat session context** | In-memory conversation history during active sessions | Duration of session + [PLACEHOLDER: e.g., 30 min] idle timeout; not persisted to disk | Automatic memory purge | Legitimate interest (service delivery) |
| **Lead form submissions** | Name, email, company, role, volume, current process | [PLACEHOLDER: e.g., 24 months from submission] | Database deletion + backup rotation | Consent (form submission) |
| **Uploaded evidence documents** | Customer security policies, audit reports, etc. | Until customer requests deletion or [PLACEHOLDER: e.g., 30 days after contract termination] | Database deletion + embedding removal | Contract performance |
| **Document embeddings** | Vector representations of uploaded documents | Same as source documents | Database deletion | Contract performance |
| **Application logs** | Server logs, error logs, access logs | [PLACEHOLDER: e.g., 90 days rolling] | Automatic rotation/deletion by hosting provider | Legitimate interest (operations) |
| **Audit trail logs** | User actions within VaultFill (uploads, edits, approvals) | [PLACEHOLDER: e.g., 12 months] | Scheduled purge | Legitimate interest (compliance) |

## 3. Deletion Procedures

- **Customer-initiated:** Customers may request deletion of their data by contacting [PLACEHOLDER: e.g., privacy@vaultfill.com]. Requests will be fulfilled within [PLACEHOLDER: e.g., 30 days].
- **Automated:** Data exceeding retention periods is [PLACEHOLDER: automatically purged via scheduled job / manually reviewed quarterly].
- **Verification:** Deletion is confirmed via [PLACEHOLDER: log entry / confirmation email to requester].
- **Backups:** Backup copies are rotated on a [PLACEHOLDER: e.g., 30-day] cycle. Deleted data will be purged from backups within [PLACEHOLDER: e.g., 60 days].

## 4. Exceptions

- Data subject to legal hold or regulatory requirement may be retained beyond standard periods.
- Aggregated, anonymized data (e.g., usage statistics) may be retained indefinitely.
```

---

### Template: Encryption & Key Management Policy (Doc 13)

```markdown
# VaultFill Encryption & Key Management Policy

**Document Owner:** [Name/Role]  
**Last Reviewed:** [DATE]  
**Classification:** Share under NDA

## 1. Encryption in Transit

| Component | Protocol | Status |
|---|---|---|
| User ↔ VaultFill application | TLS 1.2+ (HTTPS enforced) | ✅ Implemented |
| VaultFill ↔ OpenAI API | TLS 1.2+ | ✅ Implemented |
| VaultFill ↔ Database (Neon) | TLS 1.2+ (enforced by Neon) | ✅ Implemented |
| HSTS | max-age=63072000; includeSubDomains; preload | ✅ Implemented |
| Certificate management | Managed by Vercel (auto-renewal via Let's Encrypt) | ✅ Implemented |

## 2. Encryption at Rest

| Component | Method | Status |
|---|---|---|
| Database (Neon/Vercel Postgres) | Provider-managed encryption (AES-256 at storage layer) | ✅ Provider-managed |
| Application-layer encryption of evidence docs | [PLACEHOLDER: Not yet implemented / Planned for Q[X] 2026] | 🟡 Planned |
| Backup encryption | Inherits provider encryption | ✅ Provider-managed |

**Honest note:** VaultFill currently relies on cloud provider default encryption at rest. Dedicated application-layer encryption with customer-managed keys is on the product roadmap.

## 3. Key Management

| Aspect | Current State |
|---|---|
| Encryption key ownership | Managed by cloud providers (Vercel, Neon) |
| Key rotation | Per provider policy (automatic) |
| Customer-managed keys (BYOK) | Not available. [PLACEHOLDER: Planned for Q[X] 2026] |
| API key management | OpenAI API key stored as environment variable in Vercel, not in source code |
| Secret management | Vercel Environment Variables (encrypted at rest, scoped by environment) |

## 4. Data in Processing

User queries and document chunks are sent to OpenAI's API for LLM inference. During processing:
- Data is transmitted over TLS
- OpenAI processes data in plaintext for inference
- OpenAI's enterprise API does not use customer data for model training (per OpenAI Data Usage Policy)
- OpenAI's data retention: API inputs/outputs are retained for [PLACEHOLDER: 30 days for abuse monitoring, then deleted — verify current OpenAI policy]

**This is NOT end-to-end encryption.** The server and OpenAI can access the plaintext content of queries and documents during processing.

## 5. Cryptographic Standards

| Usage | Standard |
|---|---|
| TLS | 1.2 minimum, 1.3 preferred |
| At-rest (provider) | AES-256 |
| Hashing | SHA-256 (where applicable) |
| [PLACEHOLDER: Add any other applicable standards] | |
```

---

### Template: DPA (Doc 5) — Abbreviated Structure

```markdown
# Data Processing Agreement

**Between:**  
- **Controller:** [Customer Name] ("Controller")  
- **Processor:** VaultFill, Inc. ("Processor")

**Effective Date:** [DATE]

> ⚠️ THIS IS A TEMPLATE. Must be reviewed and approved by legal counsel before use.

## 1. Definitions
[Standard GDPR Article 4 definitions: Personal Data, Processing, Controller, Processor, Sub-processor, Data Subject, Supervisory Authority]

## 2. Scope of Processing
- **Subject matter:** Processing of personal data as necessary to provide the VaultFill service
- **Duration:** Term of the service agreement
- **Nature and purpose:** Automated analysis of uploaded security documentation; generation of questionnaire responses; lead management
- **Types of personal data:** [To be completed per customer — e.g., names, emails, job titles contained in uploaded documents]
- **Categories of data subjects:** [To be completed — e.g., employees of Controller mentioned in security policies]

## 3. Processor Obligations
[Standard obligations: process only on instructions, confidentiality, security measures, assist with DSR, notification of breaches, deletion/return on termination, audit rights]

## 4. Sub-processors
- Processor shall maintain a list of sub-processors (see Subprocessor List)
- Processor shall notify Controller [30 days] in advance of engaging new sub-processors
- Controller may object to new sub-processors within [PLACEHOLDER: 14 days]

## 5. Security Measures
[Reference Technical & Organizational Measures in Annex 2]

## 6. Breach Notification
Processor shall notify Controller without undue delay, and in any event within [PLACEHOLDER: 48-72 hours], of becoming aware of a personal data breach.

## 7. Data Return & Deletion
Upon termination, Processor shall [delete / return] all personal data within [PLACEHOLDER: 30 days] and certify deletion in writing.

## 8. Audit Rights
Controller or its appointed auditor may audit Processor's compliance with this DPA [PLACEHOLDER: once per year / upon reasonable request with 30 days notice].

## Annex 1: Processing Details
[Categories of data, data subjects, retention periods, transfers]

## Annex 2: Technical & Organizational Measures
[Reference encryption, access control, incident response, and other security policies]

## Annex 3: Sub-processors
[Reference Subprocessor List document]
```

---

## Appendix: Chunking & Embedding Notes

### Recommended Updates to Ingestion Pipeline

The current `ingest-vault.ts` script needs enhancement to support this corpus:

1. **Add metadata fields:** Each chunk needs `sensitivity` (public / nda / internal), `doc_type` (policy / assessment / legal / overview), `framework_refs` (array of framework IDs this doc answers questions for).

2. **Add sensitivity filtering:** The RAG retrieval layer must filter by sensitivity level based on context:
   - Shield Bot on public landing page → public docs only
   - Authenticated customer session → public + NDA docs
   - Internal team → all docs

3. **Improve chunking:** Move from simple heading-based splits to the strategy defined per-document above. Preserve Q&A pairs as atomic units.

4. **Add citation format:** Each chunk should carry a formatted citation string (e.g., `[VaultFill Encryption Policy, §2 — Encryption at Rest]`) that the LLM can reference in generated answers.

5. **Dedup ingestion:** The FAQ.md exists in two locations (`data/sample-vault/FAQ.md` and `FAQ.md` at root). The script already deduplicates by filename but this should be intentional, not accidental.

### File Organization

```
data/
├── sample-vault/              # Demo/sample content (for landing page Shield Bot)
│   ├── FAQ.md                 # Keep — good for demo
│   ├── SOC2_Type2_Report_v2.md        # Replace with soc2-readiness-narrative.md
│   ├── ISO27001_Policy.md             # Replace with iso27001-soa.md
│   └── Global_Privacy_Policy.md       # Replace with privacy-policy-full.md
│
├── compliance-vault/          # NEW — the real compliance corpus
│   ├── public/                # Can be served to anyone
│   │   ├── security-overview-public.md
│   │   ├── privacy-policy-full.md
│   │   ├── subprocessors.md
│   │   └── dpa-template.md
│   ├── nda/                   # Shared under NDA / due diligence only
│   │   ├── soc2-readiness-narrative.md
│   │   ├── iso27001-soa.md
│   │   ├── caiq-v4-self-assessment.md
│   │   ├── sig-lite-responses.md
│   │   ├── data-retention-deletion-policy.md
│   │   ├── incident-response-summary.md
│   │   ├── access-control-policy.md
│   │   ├── change-management-policy.md
│   │   ├── bcp-dr-summary.md
│   │   ├── vulnerability-management-policy.md
│   │   ├── encryption-key-management-policy.md
│   │   └── logging-audit-trail-policy.md
│   └── internal/              # NEVER served via API
│       └── (competitive intel, pricing strategy, etc.)
```

### Relationship to Enrichment Plan

This compliance corpus proposal and the existing `knowledge-vault-enrichment-plan.md` are **complementary, not overlapping:**

| This Proposal | Enrichment Plan |
|---|---|
| **VaultFill's own compliance docs** — answers "how does VaultFill handle X?" | **Generic framework knowledge** — answers "what does SOC 2 require for X?" |
| 16 documents about VaultFill's practices | 4,400+ chunks of framework controls, Q&As, model answers |
| Must be authored by VaultFill team (truthful, specific) | Can be sourced from public framework documentation |
| Needed for VaultFill to pass its own vendor assessments | Needed for VaultFill to help customers answer their questionnaires |

**Both are needed.** This corpus comes first because VaultFill can't sell to enterprises if it can't answer questions about its own security posture.

---

*End of proposal. All 16 documents require VaultFill team input to fill placeholders with truthful, accurate information. Templates are provided as starting points — not finished documents.*
