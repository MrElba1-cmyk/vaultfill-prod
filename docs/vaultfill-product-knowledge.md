# VaultFill — Product Knowledge Document

> **Last updated:** 2026-02-09  
> **Status:** Living document — update as product evolves  
> **Audience:** Internal team, AI agents (Shield Bot), sales enablement

---

## 1. What VaultFill Is

VaultFill is an AI-powered security questionnaire automation tool. It helps companies draft accurate, citation-backed responses to security questionnaires (SOC 2, SIG, DDQ, CAIQ, and custom formats) by leveraging their existing security documentation.

**Core value proposition:** Turn existing security evidence (policies, audit reports, penetration test results) into a reusable Knowledge Vault that generates consistent, verifiable questionnaire responses in minutes instead of days.

**What VaultFill is NOT:**
- Not a compliance management platform (that's what Vanta, Drata, etc. do)
- Not a GRC tool — it doesn't manage controls, run continuous monitoring, or track remediation
- Not a replacement for having actual security policies and practices in place

---

## 2. How It Works

### Three-Step Workflow

1. **Ingest Evidence** — Upload security documents (policies, SOC 2/ISO artifacts, penetration test reports, vendor docs, standard responses) into the Knowledge Vault. VaultFill indexes everything using vector embeddings for semantic search.

2. **Generate Drafts** — When a questionnaire is submitted, VaultFill's RAG (Retrieval-Augmented Generation) engine retrieves the most relevant evidence chunks, then drafts responses with inline citations pointing back to source documents and sections. Low-confidence answers are flagged for human review.

3. **Approve & Export** — Review, refine, and approve drafted responses. Every edit is logged in an audit trail. Export the completed questionnaire.

### Technical Implementation

- **Knowledge Vault:** Documents are chunked, embedded (via OpenAI embeddings API), and stored in PostgreSQL with pgvector for cosine-similarity search.
- **RAG Engine:** For each question, the system retrieves the top-3 most relevant document chunks (minimum similarity threshold of 0.25), then constructs a prompt with cited context for the LLM.
- **Citation Format:** Every AI-generated answer references its source as `[Document Title, Section Name]`, enabling reviewers to verify claims against original evidence.
- **AI Model:** Currently uses OpenAI GPT-4o-mini via the Vercel AI SDK. Responses are generated with a temperature of 0.5 for consistency.

---

## 3. Key Features

### 3.1 Evidence Knowledge Vault
- Centralized repository for security documentation
- Supports policies, SOC 2 reports, ISO 27001 artifacts, penetration test results, vendor management docs, and standard answer templates
- Vector-indexed for semantic search — finds relevant evidence even when questions are phrased differently than source material
- Compounds over time: the more evidence ingested, the better and faster responses become

### 3.2 RAG-Powered Citations
- Every generated answer includes a citation linking back to the specific source document and section
- Reviewers can verify any answer against the original evidence
- Prevents hallucination by grounding responses in actual uploaded documentation
- Low-relevance results (below similarity threshold) are excluded rather than fabricated

### 3.3 Automated Questionnaire Drafting
- Supports SOC 2, SIG, DDQ, CAIQ, and custom spreadsheet-based questionnaire formats
- Upload evidence once, reuse across multiple questionnaires
- Consistent answers across different questionnaire submissions — no contradictions between what you told Vendor A vs. Vendor B

### 3.4 Shield Bot (AI Chat Assistant)
- Interactive chat interface for real-time security Q&A
- Uses the same RAG pipeline as questionnaire drafting
- Framework-aware: detects when users ask about specific frameworks (SOC 2, ISO 27001, NIST, HIPAA, GDPR) and tailors responses
- Conversation memory within a session for contextual follow-ups
- Available on the landing page for prospects to test with sample data

### 3.5 Lead Capture & Scoring
- Automatic lead tier calculation based on monthly questionnaire volume:
  - **Tier 1:** 20+ questionnaires/month (highest priority)
  - **Tier 2:** 6–20 questionnaires/month
  - **Tier 3:** 1–5 questionnaires/month
- Industry detection from email domain
- Real-time alerts via Telegram with actionable sales intelligence

---

## 4. Architecture & Technology

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, static generation |
| Frontend | React 19, Framer Motion, Tailwind CSS | Responsive, animated UI |
| AI/LLM | Vercel AI SDK + OpenAI GPT-4o-mini | Chat completions and embeddings |
| Database | Vercel Postgres + pgvector | Structured data + vector similarity search |
| ORM | Prisma 5 | Type-safe database access |
| Hosting | Vercel | Edge CDN, serverless functions, auto-scaling |
| Alerts | Telegram Bot API | Real-time health and lead notifications |

### Deployment
- Hosted on Vercel with automatic deployments on git push
- Vercel Edge Network provides CDN, SSL termination, and auto-scaling
- Serverless functions handle API routes — scales to zero when idle

---

## 5. Security & Privacy Practices

> **Important:** All claims in this section reflect the actual current state of the system. See `docs/privacy-claim-recommendation.md` for the full audit of claims vs. reality.

### What Is True (Verified)

| Practice | Details |
|---|---|
| **TLS encryption in transit** | All connections between users and VaultFill use HTTPS/TLS |
| **No model training on user data** | OpenAI's enterprise API does not train on input data by default — this is confirmed by OpenAI's data usage policy |
| **Tenant isolation** | Processing is isolated per tenant at the application layer; no cross-tenant data access |
| **Minimal data retention** | Chat session context is held in memory only for the duration of a conversation; it is not persisted to disk |
| **No account required** | Users can interact with Shield Bot without creating an account; a local session ID is used for conversation continuity |
| **Privacy-first architecture** | System is designed to minimize data collection and storage; lead data is only collected when voluntarily submitted |

### What Is Aspirational (Not Yet Achieved)

| Claim | Current Status |
|---|---|
| **SOC 2 Type II certified** | Architecture is designed with SOC 2 principles; formal audit has NOT been completed. Use "SOC 2 Designed" language. |
| **Encryption at rest** | Not yet implemented for evidence files. Currently relies on Vercel Postgres default encryption. Planned for Phase 3. |
| **Self-hosted LLM option** | Not available. All AI processing currently goes through OpenAI's API. Planned for customers who cannot send data externally. |

### What Must NOT Be Claimed

- ❌ "Zero-knowledge architecture" — Server holds session state in memory; queries are sent to OpenAI in plaintext
- ❌ "End-to-end encrypted" — TLS protects data in transit, but the server and OpenAI process plaintext
- ❌ "No data stored" — Lead information submitted via forms IS stored in the database
- ❌ "No tracking, no cookies" — A localStorage session ID is used for conversation continuity

---

## 6. Target Customer Profile

### Ideal Customer
- **Company size:** 10–500 employees (lean teams where the person answering questionnaires is also building the product)
- **Industry:** SaaS, fintech, healthtech, or any B2B company that regularly receives security questionnaires from prospects/customers
- **Pain point:** Spending hours or days per week copy-pasting answers into security questionnaires and vendor assessments
- **Maturity:** Already has basic security documentation (policies, SOC 2 report, etc.) but lacks an efficient way to reuse it across questionnaires
- **Budget sensitivity:** Lean startups that find enterprise compliance platforms ($10K–$20K+/year) too expensive for questionnaire automation alone

### Customer Pain Points VaultFill Addresses

1. **Repetitive manual work** — Security teams answer the same questions across dozens of questionnaires per quarter, each time hunting for the right policy reference
2. **Inconsistent answers** — Without a central source of truth, different team members give different answers to the same question across questionnaires
3. **Slow turnaround** — Questionnaire responses take days or weeks, slowing down sales cycles
4. **No citation trail** — Reviewers on the receiving end can't easily verify that answers are backed by real evidence
5. **Integration fatigue** — Full compliance platforms require weeks of onboarding and deep infrastructure access; VaultFill requires only document uploads

---

## 7. Competitive Positioning

### VaultFill vs. Compliance Platforms (Vanta, Drata, Secureframe)

| Dimension | VaultFill | Compliance Platforms |
|---|---|---|
| **Focus** | Security questionnaire automation only | Full compliance lifecycle management |
| **Setup time** | Minutes (upload documents) | Weeks (onboarding, integrations, configuration) |
| **Infrastructure access** | None required — document-only | Deep access to cloud, repos, HR, identity systems |
| **Citation model** | RAG-powered, every answer cites source documents | AI-assisted but typically without granular source attribution |
| **Pricing** | Startup-friendly (plans TBA) | $10K–$20K+/year with add-ons |
| **When to use** | You need to answer questionnaires faster using docs you already have | You need to manage an entire compliance program across multiple frameworks |

**Honest framing:** If a customer needs continuous compliance monitoring, control tracking, and automated evidence collection across their infrastructure, a platform like Vanta is the right tool. VaultFill solves a narrower but high-impact problem: turning existing documentation into fast, accurate questionnaire responses.

---

## 8. Supported Questionnaire Formats

- **SOC 2** — Service Organization Control Type II questionnaires
- **SIG (Standardized Information Gathering)** — Shared Assessments SIG Lite and Full
- **DDQ (Due Diligence Questionnaire)** — Vendor due diligence questionnaires
- **CAIQ (Consensus Assessments Initiative Questionnaire)** — Cloud Security Alliance format
- **Custom formats** — Spreadsheet-based questionnaires in custom formats; additional formats added based on customer demand

---

## 9. Current Product Stage

- **Stage:** Pre-revenue, early access / beta
- **Landing page:** Live at vaultfill.com with interactive Shield Bot demo using sample evidence data
- **Lead capture:** Active — collecting early access signups with tier-based scoring
- **Knowledge Vault:** Functional with sample documents (SOC 2 report, ISO 27001 policy, privacy policy); ready for customer evidence ingestion
- **Shield Bot:** Live and operational — answers security questions using RAG against the Knowledge Vault
- **Questionnaire export:** In development
- **Pricing:** Not yet announced — described as "startup-friendly, plans announced soon"
- **Location:** Houston, TX

---

## 10. Key Metrics & Claims That Can Be Made

### Verifiable Performance Claims
- "Draft responses in minutes, not days" — Shield Bot demo demonstrates real-time response generation
- "Citation-backed answers" — Every RAG response includes source document references that can be verified
- "Upload evidence once, reuse across questionnaires" — Knowledge Vault is designed for evidence reuse

### Claims That Require Qualification
- "Save 400+ hours" — This is a marketing estimate based on industry averages for manual questionnaire completion; not yet validated with customer data. Should be presented as a projection, not a guarantee.
- "Cut compliance costs by 85%" — Same as above; an aspirational figure based on time savings estimates. Should be qualified with "up to" or "potential" language.

### Claims to Avoid Entirely
- Any claim about SOC 2 certification (say "SOC 2 Designed" instead)
- Any claim about zero-knowledge or end-to-end encryption
- Any specific customer count or revenue figures (pre-revenue)
- Any claim that VaultFill replaces the need for actual security practices

---

## 11. Frequently Asked Questions (Factual Answers)

**Q: What questionnaire formats do you support?**  
A: SOC 2, SIG, DDQ, CAIQ, and custom spreadsheet-based formats. We add more based on customer demand.

**Q: How is this different from Vanta or Drata?**  
A: Those tools manage entire compliance programs. VaultFill focuses specifically on answering security questionnaires faster — using your existing evidence, with citations a reviewer can verify.

**Q: Is our data safe?**  
A: Data is encrypted in transit via TLS. Tenant isolation is enforced at the application layer. We use OpenAI's enterprise API which does not train on your data.

**Q: How fast can we see results?**  
A: If your core evidence is ready, VaultFill generates a usable first draft in under 10 minutes.

**Q: Do you need access to our infrastructure?**  
A: No. VaultFill works entirely from uploaded documents — policies, audit reports, and standard responses. We don't require access to your cloud accounts, repositories, or internal systems.

**Q: What happens to our documents after upload?**  
A: Documents are chunked and embedded for semantic search, stored in an encrypted database. They are used only to generate your questionnaire responses and are not shared across tenants or used for model training.

**Q: Is there a free trial?**  
A: The Shield Bot demo on our landing page is free to use with sample data. Early access program details and pricing will be announced soon.

---

*This document should be updated whenever product capabilities, security practices, or positioning change. All claims should be verified against the actual codebase and infrastructure before being used in external communications.*
