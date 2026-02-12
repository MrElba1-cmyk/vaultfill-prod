# VaultFill Security Overview

**Last Updated:** 2026-02-09  
**Document Classification:** Public  
**Document Owner:** VaultFill Security

---

## Our Approach to Security

VaultFill handles sensitive compliance documentation — security policies, audit artifacts, and vendor assessments — on behalf of enterprise customers. We take that responsibility seriously. This page describes the technical and organizational measures we have in place, what we're working toward, and where we stand on formal certifications.

We believe in transparency: we will tell you what's implemented, what's planned, and what's not yet in place.

---

## Infrastructure & Hosting

VaultFill runs on a modern, cloud-native serverless architecture. There are no self-managed servers, VMs, or containers to patch.

| Component | Provider | Details |
|---|---|---|
| **Application Hosting** | Vercel | Serverless functions on Vercel's Edge Network. Auto-scaling, zero-idle-cost. Deployments are immutable and atomic. |
| **Database** | Neon PostgreSQL (via Vercel Postgres) | Managed PostgreSQL with the pgvector extension for semantic search. Provider-managed encryption at the storage layer. |
| **AI Processing** | OpenAI Enterprise API | GPT-4o-mini for response generation; text-embedding-3-small for semantic embeddings. Enterprise API tier — no customer data used for model training. |
| **CDN & SSL** | Vercel Edge Network | Global content delivery network with automatic TLS certificate provisioning and renewal. |
| **DNS & DDoS** | Vercel (Cloudflare-backed) | Anycast DNS with built-in DDoS mitigation at the network edge. |

**Key architectural decisions:**
- Serverless-first: no persistent servers means a minimal attack surface and no OS-level patching burden.
- All infrastructure providers (Vercel, Neon, OpenAI) maintain SOC 2 Type II certification.
- No customer infrastructure access required — VaultFill works entirely from uploaded documents.

---

## Data Protection

### Encryption in Transit

All data in transit is encrypted using TLS 1.2 or higher across every connection:

- **User ↔ VaultFill:** HTTPS enforced. HSTS enabled with preload (`max-age=63072000; includeSubDomains; preload`).
- **VaultFill ↔ OpenAI API:** TLS-encrypted API calls.
- **VaultFill ↔ Database (Neon):** TLS-encrypted database connections enforced by the provider.

### Encryption at Rest

- **Database storage:** Neon PostgreSQL provides encryption at rest at the storage layer using provider-managed keys (AES-256).
- **Application-layer encryption:** VaultFill currently relies on provider-managed encryption at rest. Dedicated application-layer encryption with customer-managed keys (BYOK) is on our product roadmap.

> **Honest note:** We do not currently implement application-layer encryption on top of the provider's storage-level encryption. We will update this page when that capability ships.

### No Model Training on Your Data

VaultFill uses OpenAI's Enterprise API tier. Per OpenAI's data usage policy, API inputs and outputs are **not** used to train OpenAI's models. Your documents, queries, and generated responses remain yours.

### Tenant Isolation

Each customer's data is logically isolated:
- Database queries are scoped to the authenticated tenant.
- There is no mechanism for one tenant's data to appear in another tenant's queries or responses.
- The RAG (Retrieval-Augmented Generation) pipeline retrieves only from the requesting tenant's Knowledge Vault.

### Minimal Data Retention

- **Chat session context** is held in application memory only for the duration of the conversation. Session data is automatically purged after idle timeout. Chat history is not written to disk.
- **Uploaded evidence documents** are retained until the customer requests deletion or the contract terminates.
- **Lead form submissions** (when voluntarily provided) are stored in the database and retained per our data retention policy.

See our [Data Retention & Deletion Policy] for specific retention periods by data category.

---

## Application Security

### Secure Development Practices

- **Version control:** All code is maintained in Git with branch protection.
- **Code review:** Changes require pull request review before merge.
- **Dependency management:** Third-party dependencies are monitored for known vulnerabilities.
- **No secrets in code:** API keys and credentials are managed as environment variables through Vercel's encrypted secrets store, scoped by deployment environment (production, preview, development). Secrets are never committed to source control.

### Security Headers

VaultFill serves the following security headers on all responses:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Content-Security-Policy` | Restricts script sources, frame ancestors, and resource loading |

### Input Validation

- Email addresses are validated server-side before storage.
- All API endpoints validate request format and reject malformed input.
- The chat API implements prompt-injection defenses — the LLM is instructed to refuse requests to disclose system instructions or internal configurations.

### Responsible Disclosure

We welcome security researchers who report vulnerabilities responsibly.

- **Contact:** security@vaultfill.com
- **Security.txt:** https://vaultfill.com/.well-known/security.txt
- **Response commitment:** We will acknowledge receipt within 48 hours and provide an initial assessment within 5 business days.

---

## Compliance Alignment

### SOC 2 — Designed, Not Yet Audited

VaultFill's architecture is designed following SOC 2 Type II Trust Service Criteria principles across Security, Availability, and Confidentiality categories. **A formal SOC 2 Type II audit has not yet been completed.** We are actively working toward audit readiness and will update this page when an audit is scheduled.

In the interim, we provide:
- A SOC 2 Readiness Narrative describing our controls mapped to Trust Service Criteria (available under NDA)
- Documentation of our security controls, policies, and procedures

### ISO 27001 — Principles Applied, Not Yet Certified

VaultFill's information security practices are informed by ISO 27001:2022 best practices. **We are not yet ISO 27001 certified.** A Statement of Applicability mapping our controls to ISO 27001 Annex A is available upon request under NDA.

### GDPR

VaultFill is designed with GDPR principles in mind:
- **Lawful basis:** Processing is based on contractual necessity and legitimate interest.
- **Data minimization:** We collect only the data necessary to provide the service.
- **Data subject rights:** We support access, correction, deletion, and portability requests.
- **Data Processing Agreement:** Available for customers who require one.
- **Subprocessor transparency:** A current list of subprocessors is publicly available.

### CCPA

VaultFill does not sell personal information. California residents may exercise their rights under CCPA by contacting privacy@vaultfill.com.

---

## Operational Security

### Monitoring & Alerting

- Application health monitoring via automated daily health checks.
- Real-time alerting for service anomalies and lead activity via secure notification channels.
- Vercel provides deployment status monitoring and function execution metrics.

### Incident Response

VaultFill maintains an incident response process covering:
- Incident classification by severity (P1 through P4)
- Defined response timelines per severity level
- Customer notification commitment for confirmed data breaches in compliance with GDPR Article 33 requirements
- Post-incident review and lessons learned

An Incident Response Summary is available upon request under NDA. For the current full details, see our [Incident Response Summary].

### Business Continuity

VaultFill's serverless architecture on Vercel provides inherent resilience:
- **No single point of failure:** Serverless functions execute across Vercel's distributed infrastructure.
- **Database resilience:** Neon PostgreSQL provides automated backups and point-in-time recovery.
- **Rapid redeployment:** Immutable deployments can be rolled back to any previous version in seconds.

A Business Continuity & Disaster Recovery summary is available upon request.

---

## Trust Center Resources

| Resource | Classification | How to Access |
|---|---|---|
| **This Security Overview** | Public | You're reading it |
| **Privacy Policy** | Public | [vaultfill.com/privacy](/privacy) |
| **Subprocessor List** | Public | [Available here](subprocessors.md) |
| **Data Processing Agreement (DPA)** | Available on request | Contact security@vaultfill.com |
| **SOC 2 Readiness Narrative** | Under NDA | Contact security@vaultfill.com |
| **ISO 27001 Statement of Applicability** | Under NDA | Contact security@vaultfill.com |
| **CAIQ v4 Self-Assessment** | Under NDA | Contact security@vaultfill.com |
| **Incident Response Summary** | Under NDA | Contact security@vaultfill.com |
| **Data Retention & Deletion Policy** | Under NDA | Contact security@vaultfill.com |
| **Penetration Test Summary** | Under NDA | Contact security@vaultfill.com |

---

## Contact

For security questions, vulnerability reports, or to request compliance documentation:

**Email:** security@vaultfill.com  
**Security.txt:** https://vaultfill.com/.well-known/security.txt

---

*This document is reviewed and updated whenever material changes occur to VaultFill's security posture, and at minimum quarterly.*
