# VaultFill Subprocessor List

**Last Updated:** 2026-02-09  
**Document Classification:** Public  
**Document Owner:** VaultFill Security  
**Notification Policy:** VaultFill will notify customers of new subprocessor additions at least 30 days in advance via email to the designated security contact on file.

---

## Current Subprocessors

The following third-party service providers process customer data on behalf of VaultFill as part of delivering the VaultFill platform.

### OpenAI, L.L.C.

| Field | Detail |
|---|---|
| **Purpose** | Large language model inference (GPT-4o-mini) and text embedding generation (text-embedding-3-small) |
| **Data Processed** | User queries submitted to Shield Bot; document text chunks included in retrieval-augmented generation prompts |
| **Hosting Location** | United States |
| **Data Retention by Subprocessor** | OpenAI's enterprise API retains API inputs and outputs for up to 30 days for abuse and misuse monitoring, then deletes. OpenAI does not use API customer data to train models. |
| **Security & Compliance** | SOC 2 Type II certified. Enterprise API DPA available. |
| **Relevant Link** | https://openai.com/enterprise-privacy |

### Vercel Inc.

| Field | Detail |
|---|---|
| **Purpose** | Application hosting, serverless function execution, edge CDN, SSL/TLS termination, and deployment infrastructure |
| **Data Processed** | All application traffic in transit (HTTPS requests/responses); serverless function execution context during request processing |
| **Hosting Location** | United States (primary); global edge network for static content delivery |
| **Data Retention by Subprocessor** | Function logs retained per Vercel's data retention policy. Static assets cached at edge with standard HTTP cache controls. |
| **Security & Compliance** | SOC 2 Type II certified. GDPR compliant. DPA available. |
| **Relevant Link** | https://vercel.com/security |

### Neon Inc. (via Vercel Postgres)

| Field | Detail |
|---|---|
| **Purpose** | PostgreSQL database hosting with pgvector extension for vector similarity search |
| **Data Processed** | Lead form submissions (email, company, role, volume tier); document section embeddings (vector representations of uploaded evidence); application metadata |
| **Hosting Location** | United States |
| **Data Retention by Subprocessor** | Data retained for the duration of the service. Database backups maintained per Neon's backup policy. Encryption at rest applied at the storage layer. |
| **Security & Compliance** | SOC 2 Type II certified. DPA available. |
| **Relevant Link** | https://neon.tech/security |

### Telegram Messenger LLP (Notification Relay Only)

| Field | Detail |
|---|---|
| **Purpose** | Delivery of internal lead alert notifications to VaultFill sales team |
| **Data Processed** | Minimal subset: lead email address, self-reported monthly questionnaire volume, detected industry tier. No uploaded documents or chat content is sent to Telegram. |
| **Hosting Location** | Global (Telegram infrastructure) |
| **Data Retention by Subprocessor** | Messages retained per Telegram's standard data retention. |
| **Security & Compliance** | Telegram provides transport encryption. Note: Telegram is used solely as an internal notification relay, not as a data processing service for customer-facing features. |
| **Relevant Link** | https://telegram.org/privacy |

> **Note on Telegram:** VaultFill is evaluating alternative notification channels for enterprise customers who require all subprocessors to hold SOC 2 or equivalent certification. Contact security@vaultfill.com to discuss options.

---

## What Is NOT a Subprocessor

The following services are used by VaultFill but do **not** process customer data:

- **GitHub** — Source code repository. No customer data is stored in the codebase.
- **Domain registrar / DNS** — Routes traffic but does not inspect or process payload data.

---

## Data Flow Summary

```
User (Browser)
    │
    ▼  HTTPS/TLS
Vercel Edge Network (CDN + SSL termination)
    │
    ▼  HTTPS/TLS
Vercel Serverless Functions (application logic)
    │
    ├──► Neon PostgreSQL + pgvector (database queries, embedding search)
    │         └─ Lead data, document embeddings, metadata
    │
    ├──► OpenAI API (LLM inference + embedding generation)
    │         └─ User query + retrieved document chunks (in prompt)
    │
    └──► Telegram Bot API (internal notification only)
              └─ Lead email, volume tier, industry (subset)
```

---

## Subprocessor Change Log

| Date | Change | Subprocessor | Details |
|---|---|---|---|
| 2026-02-09 | Initial list published | All | First formal subprocessor inventory |

---

## Questions or Concerns

If you have questions about VaultFill's subprocessors or wish to receive advance notification of changes, contact:

**Email:** security@vaultfill.com

---

*This document is maintained by VaultFill Security and reviewed whenever subprocessor relationships change or at minimum quarterly.*
