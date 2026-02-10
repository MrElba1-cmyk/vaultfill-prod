# Knowledge Vault Enrichment Plan

> **Status:** Draft  
> **Created:** 2026-02-09  
> **Owner:** VaultFill Engineering  
> **Goal:** Populate `pgvector`-backed knowledge vault with compliance frameworks, questionnaire templates, and competitive intelligence so the AI can generate accurate, citation-ready answers out of the box.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Format Requirements for pgvector Embeddings](#2-format-requirements-for-pgvector-embeddings)
3. [Content Set 1 — Compliance Frameworks (Structured)](#3-content-set-1--compliance-frameworks-structured)
4. [Content Set 2 — Questionnaire Templates](#4-content-set-2--questionnaire-templates)
5. [Content Set 3 — Competitive Knowledge (Internal Only)](#5-content-set-3--competitive-knowledge-internal-only)
6. [Ingestion Priority Matrix](#6-ingestion-priority-matrix)
7. [Effort Estimates](#7-effort-estimates)
8. [Ingestion Pipeline Spec](#8-ingestion-pipeline-spec)
9. [Quality Assurance](#9-quality-assurance)
10. [Appendix — Content Source Links](#appendix--content-source-links)

---

## 1. Architecture Overview

```
┌────────────────────────┐
│   Raw Content Sources  │  PDFs, Excel, JSON, Markdown
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│   Ingestion Pipeline   │  Parse → Normalize → Chunk → Embed → Store
│   (Node.js workers)    │
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│   PostgreSQL + pgvector│
│                        │
│  ┌──────────────────┐  │
│  │ knowledge_chunks  │  │  Embeddings + metadata + full text
│  ├──────────────────┤  │
│  │ frameworks       │  │  Framework catalog (SOC2, ISO, etc.)
│  ├──────────────────┤  │
│  │ questions        │  │  Normalized Q&A pairs
│  ├──────────────────┤  │
│  │ competitive_intel│  │  Internal-only, never served via API
│  └──────────────────┘  │
└──────────┬─────────────┘
           ▼
┌────────────────────────┐
│   RAG Retrieval Layer  │  Cosine similarity search → Context injection
│   (API: /api/knowledge)│
└────────────────────────┘
```

Content is stored in **two tiers**:
- **Public Knowledge** — frameworks, controls, Q&A templates → served to users via chat API
- **Internal Knowledge** — competitive intel, objection handling → used by internal team only, gated by `is_internal: true` flag and API-level access control

---

## 2. Format Requirements for pgvector Embeddings

### 2.1 Embedding Model

| Parameter | Value |
|-----------|-------|
| **Model** | `text-embedding-3-small` (OpenAI) |
| **Dimensions** | 1536 (native); optionally reduce to **512** via `dimensions` param for cost/perf |
| **Max Input** | 8,191 tokens (~32K chars English) |
| **Cost** | $0.02 / 1M tokens |
| **Fallback** | `text-embedding-3-large` (3072 dims, $0.13/1M tokens) for high-precision needs |

> **Why `text-embedding-3-small`?** Best cost-performance ratio for structured compliance text. Upgrade path to `-large` is seamless (same API, same pipeline).

### 2.2 Chunk Strategy

| Content Type | Chunk Size | Overlap | Rationale |
|-------------|-----------|---------|-----------|
| **Control descriptions** | 1 chunk per control | 0 | Controls are atomic; splitting degrades retrieval |
| **Q&A pairs** | 1 chunk per Q+A pair | 0 | Question + answer = single semantic unit |
| **Implementation guidance** | 400–600 tokens | 50 tokens | Longer narrative; overlap preserves context |
| **Framework overviews** | 300–500 tokens | 75 tokens | Dense introductory content |
| **Competitive intel** | 200–400 tokens | 50 tokens | Short, punchy objection/response pairs |

### 2.3 Database Schema (pgvector)

```sql
-- Core embeddings table
CREATE TABLE knowledge_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id    TEXT NOT NULL,           -- 'soc2', 'iso27001', 'sig_lite', etc.
    content_type    TEXT NOT NULL,           -- 'control', 'question', 'guidance', 'competitive'
    category        TEXT,                     -- 'encryption', 'access_control', etc.
    control_id      TEXT,                     -- 'CC6.1', 'A.8.2', 'SIG-A.1', etc.
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,            -- Full text of chunk
    citation        TEXT,                     -- Formatted citation string
    embedding       vector(1536) NOT NULL,   -- Or vector(512) if using reduced dims
    is_internal     BOOLEAN DEFAULT FALSE,   -- TRUE = never served via public API
    source_url      TEXT,                     -- Link to original source
    version         TEXT,                     -- '2022', 'v4.1', etc.
    metadata        JSONB DEFAULT '{}',       -- Flexible extra fields
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_embedding ON knowledge_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_framework ON knowledge_chunks (framework_id);
CREATE INDEX idx_knowledge_category ON knowledge_chunks (category);
CREATE INDEX idx_knowledge_internal ON knowledge_chunks (is_internal);
CREATE INDEX idx_knowledge_control ON knowledge_chunks (control_id);

-- Enforce: competitive intel never leaks
CREATE POLICY internal_only ON knowledge_chunks
    FOR SELECT
    USING (is_internal = FALSE OR current_setting('app.role') = 'internal');
```

### 2.4 Citation Format

Every chunk MUST include a machine-parseable citation that the LLM can reference in answers:

```
[{framework} {control_id}] — {title}
```

Examples:
- `[SOC 2 CC6.1] — Logical and Physical Access Controls`
- `[ISO 27001 A.8.24] — Use of Cryptography`
- `[CAIQ v4 AIS-04.1] — Application Security — Automated Application Security Testing`
- `[SIG Lite A.1] — Information Security Policy`

---

## 3. Content Set 1 — Compliance Frameworks (Structured)

### 3.1 SOC 2 Type II — Trust Service Criteria

**What to ingest:**
- All 5 Trust Service Categories (Security, Availability, Processing Integrity, Confidentiality, Privacy)
- All CC-series criteria (CC1.1 through CC9.9) — approximately 60+ criteria
- Points of Focus for each criterion (2022 revision)
- Common SOC 2 audit questions mapped to each criterion (~150 questions)
- COSO principle mappings

**Primary Source:**
- 📄 **AICPA 2017 Trust Services Criteria (With Revised Points of Focus — 2022)**
  - Download: https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022
  - Format: PDF (free download, requires AICPA account)
- 📄 **TSC-COSO Mapping Document**
  - Available from AICPA resources page alongside the TSC

**Supplementary Sources:**
- Cherry Bekaert TSC Guide: https://www.cbh.com/insights/articles/soc-2-trust-services-criteria-guide/
- Linford & Co TSC Overview: https://linfordco.com/blog/trust-services-critieria-principles-soc-2/
- Public SOC 2 report examples (for question pattern extraction)

**Ingestion Format:**

```json
{
  "framework_id": "soc2",
  "content_type": "control",
  "control_id": "CC6.1",
  "category": "logical_physical_access",
  "title": "Logical and Physical Access Controls",
  "content": "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity's objectives. Points of Focus: ...",
  "citation": "[SOC 2 CC6.1] — Logical and Physical Access Controls",
  "version": "2022",
  "metadata": {
    "trust_service_category": "Security",
    "coso_principle": "CC6",
    "points_of_focus": ["Identifies and manages...", "Restricts access..."]
  }
}
```

**Estimated Volume:** ~250 chunks (60 controls + 150 questions + 40 guidance chunks)

---

### 3.2 ISO 27001:2022 — Annex A Controls

**What to ingest:**
- All 93 Annex A controls (reorganized in 2022 from 114 in 2013)
- 4 control themes: Organizational (37), People (8), Physical (14), Technological (34)
- Implementation guidance for each control (from ISO 27002:2022)
- Cross-mapping to SOC 2 TSC and NIST CSF

**Primary Source:**
- 📄 **ISO/IEC 27001:2022** — Purchase required from ISO store
  - https://www.iso.org/standard/27001
  - ~$200 USD for the standard
- 📄 **ISO/IEC 27002:2022** — Implementation guidance companion
  - https://www.iso.org/standard/75652.html

**Supplementary Sources (free, for control listings and guidance):**
- DataGuard Annex A overview: https://www.dataguard.com/iso-27001/annex-a/
- HighTable Annex A controls list: https://hightable.io/iso-27001-annex-a-controls-list/
- Scrut ISO 27001 controls: https://www.scrut.io/hub/iso-27001/iso-27001-controls
- Blackmores 2013→2022 mapping PDF: https://isologyhub.com/wp-content/uploads/2023/02/ISO-27001-2022-Annex-A-Control-Mapping.pdf

**Ingestion Format:**

```json
{
  "framework_id": "iso27001",
  "content_type": "control",
  "control_id": "A.8.24",
  "category": "cryptography",
  "title": "Use of Cryptography",
  "content": "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented. Implementation guidance: Organizations should establish a policy on the use of cryptographic controls...",
  "citation": "[ISO 27001 A.8.24] — Use of Cryptography",
  "version": "2022",
  "metadata": {
    "control_theme": "Technological",
    "control_number": 24,
    "soc2_mapping": ["CC6.1", "CC6.7"],
    "nist_mapping": ["SC-12", "SC-13"]
  }
}
```

**Estimated Volume:** ~350 chunks (93 controls + 93 implementation guides + 93 Q&A pairs + 70 cross-mapping chunks)

---

### 3.3 SIG Lite / SIG Full (Shared Assessments)

**What to ingest:**
- **SIG Lite 2025:** 128 questions (program-level risk assessment)
- **SIG Core (Full) 2025:** 1,855 questions across all risk domains
- Model answers for each question
- Domain structure: 25 risk domains (updated 2024/2025)

**Primary Source:**
- 📄 **Shared Assessments SIG Questionnaire** — Membership required
  - https://sharedassessments.org/sig/
  - Membership tiers: Individual ($1,500/yr), Corporate (varies)
  - Content available as Excel (XLSX) and JSON for licensed integrators

**Supplementary Sources:**
- SIG overview: https://sharedassessments.org/about-sig/
- UpGuard SIG guide: https://www.upguard.com/blog/sig-questionnaire
- Workstreet SIG Lite guide: https://www.workstreet.com/blog/sig-lite

**Access Strategy:**
> ⚠️ SIG content is **proprietary** and requires a Shared Assessments membership or license. Options:
> 1. **Purchase membership** (~$1,500/yr individual) — gives full Excel export
> 2. **JSON content license** — for platform integration (contact Shared Assessments sales)
> 3. **Build equivalent** — Write VaultFill-original questions modeled on SIG structure/domains (no copyright issues, lower fidelity)
> 
> **Recommendation:** Start with Option 3 (VaultFill-authored SIG-equivalent), upgrade to Option 1/2 after revenue justifies it.

**Ingestion Format:**

```json
{
  "framework_id": "sig_lite",
  "content_type": "question",
  "control_id": "SIG-A.1",
  "category": "information_security_policy",
  "title": "Information Security Policy Existence",
  "content": "Q: Does the organization have a documented information security policy? A: Yes. [Company] maintains a comprehensive Information Security Policy that is reviewed and approved by senior management annually. The policy covers: scope and objectives, roles and responsibilities, acceptable use, data classification, and incident response procedures. Last reviewed: [date]. Citation: [SOC 2 CC1.1], [ISO 27001 A.5.1]",
  "citation": "[SIG Lite A.1] — Information Security Policy",
  "version": "2025"
}
```

**Estimated Volume:**
- SIG Lite: ~200 chunks (128 questions × ~1.5 chunks avg for Q+A+guidance)
- SIG Full: ~2,500 chunks (1,855 questions)
- VaultFill-equivalent (if self-authored): ~400 chunks covering top domains

---

### 3.4 CAIQ v4 — Consensus Assessments Initiative Questionnaire

**What to ingest:**
- All CAIQ v4.1 questions (mapped to CCM v4.1 — Cloud Controls Matrix)
- 197 control objectives across 17 domains
- Yes/No question format + best-practice narrative responses
- CCM control descriptions and implementation guidelines

**Primary Source:**
- 📄 **CSA Cloud Controls Matrix v4.1 + CAIQ v4.1**
  - Download: https://cloudsecurityalliance.org/artifacts/cloud-controls-matrix-v4-1
  - Format: Excel (XLSX), JSON, YAML, OSCAL — **free download** (account required)
  - Machine-readable bundle available (JSON/YAML/OSCAL)
- 📄 **STAR Level 1 Security Questionnaire (CAIQ v4)**
  - https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4

**Supplementary Sources:**
- CSA CAIQ resources hub: https://cloudsecurityalliance.org/research/topics/caiq
- AWS CAIQ v4 example: https://aws.amazon.com/blogs/security/aws-csa-consensus-assessment-initiative-questionnaire-version-4-now-available/

**Ingestion Format:**

```json
{
  "framework_id": "caiq_v4",
  "content_type": "question",
  "control_id": "AIS-04.1",
  "category": "application_security",
  "title": "Automated Application Security Testing",
  "content": "Q: Are automated application security testing tools used in the development process? A: Yes. [Company] integrates SAST and DAST tools into the CI/CD pipeline. All code commits trigger automated security scans using [tool]. Critical and high-severity findings block deployments. Results are reviewed by the security team within 24 hours. Citation: [CAIQ v4 AIS-04.1], [ISO 27001 A.8.25]",
  "citation": "[CAIQ v4 AIS-04.1] — Automated Application Security Testing",
  "version": "4.1",
  "metadata": {
    "ccm_domain": "Application & Interface Security",
    "ccm_control": "AIS-04",
    "response_type": "yes_no_narrative"
  }
}
```

**Estimated Volume:** ~500 chunks (197 controls × ~2.5 chunks avg for question + narrative answer + guidance)

---

### 3.5 DDQ Templates — Due Diligence Questionnaires

**What to ingest:**
- Common vendor due diligence questions (~100–150 questions)
- Categories: company overview, security posture, data handling, subprocessors, BCP/DR, insurance, legal/compliance
- Model answers with citation cross-references
- Multiple DDQ templates (financial services, healthcare, tech/SaaS, general)

**Primary Sources:**
- 📄 **Google VSAQ (Vendor Security Assessment Questionnaire)** — Open source
  - https://github.com/nickthecook/vsaq (community mirror)
  - Original: Google VSAQ framework
- 📄 **HECVAT (Higher Education CAIQ)** — For edu sector DDQs
  - https://library.educause.edu/resources/2020/4/higher-education-community-vendor-assessment-toolkit
- 📄 **Industry DDQ templates** (synthesized from):
  - ContentSnare 47-question template: https://contentsnare.com/vendor-questionnaire/
  - Venminder top 10 questions: https://www.venminder.com/blog/top-10-questions-vendor-cybersecurity-questionnaires
  - Cynomi vendor risk guide: https://cynomi.com/learn/vendor-risk-assessment-questionnaire/

**Ingestion Format:**

```json
{
  "framework_id": "ddq_general",
  "content_type": "question",
  "control_id": "DDQ-SEC-12",
  "category": "data_encryption",
  "title": "Encryption at Rest",
  "content": "Q: Does the vendor encrypt all customer data at rest? If so, describe the encryption standard and key management process. A: Yes. [Company] encrypts all customer data at rest using AES-256 encryption. Encryption keys are managed through [AWS KMS / HashiCorp Vault] with automatic key rotation every [90/365] days. Key access is restricted to authorized personnel via IAM policies and logged for audit. Citation: [SOC 2 CC6.1], [ISO 27001 A.8.24]",
  "citation": "[DDQ SEC-12] — Encryption at Rest",
  "version": "2025",
  "metadata": {
    "ddq_section": "Security Controls",
    "industry_variants": ["financial_services", "healthcare", "saas_general"],
    "difficulty": "standard"
  }
}
```

**Estimated Volume:** ~300 chunks (150 questions × 2 chunks avg)

---

## 4. Content Set 2 — Questionnaire Templates

### 4.1 Top 50 Security Questionnaire Questions

These are the **highest-frequency questions** that appear across SOC 2, ISO 27001, SIG, CAIQ, and custom DDQs. They form the "instant value" layer — the first thing users will ask about.

**Categories and Question Distribution:**

| # | Category | Questions | Priority |
|---|----------|-----------|----------|
| 1 | **Encryption & Data Protection** | 8 | 🔴 Critical |
| 2 | **Access Control & Authentication** | 7 | 🔴 Critical |
| 3 | **Incident Response** | 5 | 🔴 Critical |
| 4 | **Vendor / Third-Party Management** | 5 | 🟡 High |
| 5 | **Business Continuity & DR** | 5 | 🟡 High |
| 6 | **Network Security** | 4 | 🟡 High |
| 7 | **Employee Security & Training** | 4 | 🟢 Medium |
| 8 | **Compliance & Certifications** | 4 | 🟢 Medium |
| 9 | **Data Privacy & Retention** | 4 | 🟢 Medium |
| 10 | **Physical Security** | 2 | 🟢 Medium |
| 11 | **Change Management** | 2 | 🟢 Medium |
|   | **TOTAL** | **50** | |

### 4.2 Model Answer Format

Each of the 50 questions gets a **model answer template** with:

```markdown
## Q: [Question text as commonly asked]

**Category:** Encryption & Data Protection  
**Frameworks:** SOC 2 CC6.1, CC6.7 | ISO 27001 A.8.24 | CAIQ v4 EKM-02.1 | SIG D.1  
**Frequency:** ████████░░ 85% (appears in 85% of questionnaires)

### Model Answer

[Company] implements [specific control]. [Evidence description]. 
[Quantitative detail where applicable].

**Key points to include:**
- [ ] Specific technology/standard used
- [ ] Frequency of review/rotation
- [ ] Who is responsible
- [ ] Where evidence is documented

### Citation
> [SOC 2 CC6.1] — Logical and Physical Access Controls
> [ISO 27001 A.8.24] — Use of Cryptography

### Variations
- **Short form (DDQ):** "Yes. AES-256 encryption at rest, TLS 1.3 in transit."
- **Long form (SOC 2 narrative):** [Full paragraph with evidence references]
- **Yes/No (CAIQ):** "Yes" + supplementary narrative
```

### 4.3 Sources for Question Frequency Analysis

- Aggregate from ingested frameworks (SOC 2, ISO, SIG, CAIQ, DDQ)
- ContentSnare vendor questionnaire (47 questions): https://contentsnare.com/vendor-questionnaire/
- Venminder top cybersecurity questions: https://www.venminder.com/blog/top-10-questions-vendor-cybersecurity-questionnaires
- 6clicks top questionnaires: https://www.6clicks.com/resources/blog/5-top-questionnaires-to-assess-vendor-cybersecurity
- UpGuard top assessment questionnaires: https://www.upguard.com/blog/top-vendor-assessment-questionnaires

**Estimated Volume:** ~150 chunks (50 questions × 3 answer variants each)

---

## 5. Content Set 3 — Competitive Knowledge (Internal Only)

> ⚠️ **All content in this section is flagged `is_internal: true` and MUST NOT be served through the public API or chat interface.** It is used exclusively for internal team enablement.

### 5.1 Common Objections from Prospects

| Objection Category | Example Objection | # Responses |
|-------------------|-------------------|-------------|
| **Trust / AI accuracy** | "How do I know the AI answers are correct?" | 3–5 |
| **Security of our data** | "Will my compliance docs be used to train models?" | 3–5 |
| **Cost justification** | "We already have a GRC tool" | 3–5 |
| **Integration concerns** | "Does it work with our existing stack?" | 3–5 |
| **Compliance validity** | "Will auditors accept AI-generated responses?" | 3–5 |
| **Team adoption** | "My team won't use another tool" | 3–5 |
| **Data lock-in** | "Can we export everything?" | 2–3 |
| **Customization** | "Our questionnaires are unique" | 2–3 |

**Source:** Internal — authored by VaultFill team based on sales conversations, competitor analysis, and industry patterns.

**Estimated Volume:** ~60 chunks

### 5.2 Why Teams Switch from Manual Processes

Content to capture:
- Pain points of manual questionnaire completion (time, errors, inconsistency)
- Quantified metrics: avg hours per questionnaire (40–80hrs manual → 2–4hrs with VaultFill)
- Case study frameworks (anonymized)
- Before/after workflow comparisons
- Common triggers for seeking automation (audit failure, scaling, key person dependency)

**Source:** Internal — authored by VaultFill team.

**Estimated Volume:** ~30 chunks

### 5.3 Pricing Positioning Responses

Content to capture:
- Value-based pricing justification
- ROI calculator inputs and narratives
- Comparison framings (vs. manual process cost, vs. GRC platform cost, vs. consultant cost)
- Discount/negotiation guardrails (internal only)
- Tier differentiation talking points

**Source:** Internal — authored by VaultFill team.

**Estimated Volume:** ~20 chunks

---

## 6. Ingestion Priority Matrix

Prioritized by **time-to-value** — what makes the bot useful fastest.

| Priority | Content Set | Rationale | Target Date |
|----------|------------|-----------|-------------|
| **🔴 P0** | Top 50 Questionnaire Q&As | Immediate demo value; covers ~85% of user queries | Week 1 |
| **🔴 P0** | SOC 2 Trust Service Criteria | Most requested framework in US market | Week 1–2 |
| **🟡 P1** | CAIQ v4 | Free download, structured JSON/YAML, fast to ingest | Week 2 |
| **🟡 P1** | ISO 27001 Annex A Controls | Second most requested framework globally | Week 2–3 |
| **🟡 P1** | DDQ Templates (General) | Cross-framework; high query overlap | Week 3 |
| **🟢 P2** | SIG Lite (VaultFill-authored equivalent) | Bridges gap until membership acquired | Week 3–4 |
| **🟢 P2** | Competitive Intel — Objections | Enables sales team immediately | Week 4 |
| **🔵 P3** | SIG Full (licensed) | Requires membership; massive question bank | Week 5–6 |
| **🔵 P3** | Competitive Intel — Switching & Pricing | Lower urgency; refine after early sales | Week 6 |
| **🔵 P3** | DDQ Templates (Industry-specific) | Healthcare, FinServ variants | Week 6–8 |

### Critical Path

```
Week 1:  Top 50 Q&As ──────────────► Bot is demo-ready
Week 2:  SOC 2 + CAIQ v4 ──────────► Handles 60% of real questionnaires
Week 3:  ISO 27001 + DDQ ──────────► Handles 85% of real questionnaires
Week 4:  SIG Lite equiv ──────────► Handles 95% of real questionnaires
Week 5+: SIG Full + variants ─────► Full coverage
```

---

## 7. Effort Estimates

| Content Set | Parse/Extract | Write Model Answers | Embed & Store | QA/Review | **Total** |
|------------|:------------:|:-------------------:|:-------------:|:---------:|:---------:|
| **Top 50 Q&As** | 2h | 8h | 1h | 3h | **14h** |
| **SOC 2 TSC** | 4h | 12h | 2h | 4h | **22h** |
| **CAIQ v4** | 2h (JSON source) | 10h | 1h | 3h | **16h** |
| **ISO 27001 Annex A** | 4h | 14h | 2h | 4h | **24h** |
| **DDQ Templates** | 6h | 12h | 2h | 4h | **24h** |
| **SIG Lite (self-authored)** | 2h | 10h | 1h | 3h | **16h** |
| **SIG Full (licensed)** | 8h | 30h | 3h | 8h | **49h** |
| **Competitive Intel** | 1h | 8h | 0.5h | 2h | **11.5h** |
| | | | | | |
| **P0 Total** | | | | | **36h** |
| **P0+P1 Total** | | | | | **100h** |
| **All Content** | | | | | **~177h** |

### Cost Estimates

| Item | Cost |
|------|------|
| **Embedding generation** (all content, ~4,400 chunks × ~300 tokens avg) | ~$0.03 (negligible) |
| **ISO 27001:2022 standard purchase** | ~$200 |
| **ISO 27002:2022 standard purchase** | ~$200 |
| **Shared Assessments SIG membership** (if pursuing licensed route) | ~$1,500/yr |
| **CSA CAIQ v4.1** | Free (account required) |
| **AICPA TSC document** | Free (account required) |
| **Engineering time** (P0+P1, ~100h × blended rate) | Internal |

---

## 8. Ingestion Pipeline Spec

### 8.1 Pipeline Steps

```
1. EXTRACT     → Parse source (PDF/Excel/JSON/Markdown) into raw text
2. NORMALIZE   → Map to canonical schema (framework_id, control_id, category, etc.)
3. ENRICH      → Add cross-framework mappings, citations, metadata
4. CHUNK       → Split per strategy (see §2.2); preserve Q&A pair integrity
5. EMBED       → Call OpenAI embeddings API (batch endpoint for bulk)
6. VALIDATE    → Check embedding dimensions, citation format, metadata completeness
7. STORE       → INSERT into knowledge_chunks with ON CONFLICT UPDATE
8. INDEX       → Rebuild IVFFlat index after bulk inserts (or use HNSW for incremental)
```

### 8.2 Ingestion Script Interface

```bash
# Ingest a single framework
npm run ingest -- --framework soc2 --source ./data/raw/soc2-tsc-2022.json

# Ingest all P0 content
npm run ingest -- --priority p0

# Dry run (parse + validate, no DB writes)
npm run ingest -- --framework caiq_v4 --dry-run

# Re-embed existing content (e.g., after model change)
npm run ingest -- --re-embed --framework iso27001
```

### 8.3 File Organization

```
data/
├── raw/                          # Original source files (gitignored)
│   ├── soc2-tsc-2022.pdf
│   ├── iso27001-annex-a.xlsx
│   ├── caiq-v4.1-ccm.json       # Machine-readable from CSA
│   └── ddq-templates/
├── processed/                    # Normalized JSON (committed)
│   ├── soc2/
│   │   ├── controls.json
│   │   ├── questions.json
│   │   └── guidance.json
│   ├── iso27001/
│   ├── caiq_v4/
│   ├── sig_lite/
│   ├── ddq/
│   └── questionnaire_top50/
├── competitive/                  # Internal only (gitignored)
│   ├── objections.json
│   ├── switching-reasons.json
│   └── pricing-positioning.json
└── sample-vault/                 # Existing demo content
```

---

## 9. Quality Assurance

### 9.1 Acceptance Criteria per Content Set

- [ ] **Coverage:** ≥95% of controls/questions from source document ingested
- [ ] **Citation accuracy:** Every chunk has a valid, correctly formatted citation
- [ ] **Cross-references:** SOC 2 ↔ ISO 27001 ↔ CAIQ mappings present where applicable
- [ ] **Retrieval test:** Top-3 cosine similarity results for 20 sample queries return relevant chunks
- [ ] **No hallucinated content:** Model answers are factual and cite real control IDs
- [ ] **Internal flag:** All competitive intel chunks have `is_internal: true`

### 9.2 Retrieval Quality Benchmarks

| Metric | Target |
|--------|--------|
| **Recall@5** (relevant chunk in top 5 results) | ≥ 90% |
| **Precision@3** (top 3 results are all relevant) | ≥ 80% |
| **Citation accuracy** (correct framework + control ID) | 100% |
| **Answer completeness** (model answer covers all key points) | ≥ 85% |

### 9.3 Testing Protocol

1. **Unit tests:** Validate schema compliance for every processed JSON file
2. **Embedding sanity:** Spot-check that similar questions have cosine similarity > 0.8
3. **Cross-framework retrieval:** Query "encryption at rest" → expect SOC2, ISO, CAIQ, DDQ results
4. **Negative test:** Public API query → confirm zero competitive intel chunks returned
5. **End-to-end:** Submit 10 real questionnaire questions → evaluate answer quality vs. manual baseline

---

## Appendix — Content Source Links

### Free / Open Sources

| Source | URL | Format | Content |
|--------|-----|--------|---------|
| AICPA TSC 2022 | https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022 | PDF | SOC 2 criteria + points of focus |
| AICPA SOC 2 Hub | https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2 | Web | SOC 2 overview and resources |
| CSA CCM + CAIQ v4.1 | https://cloudsecurityalliance.org/artifacts/cloud-controls-matrix-v4-1 | JSON/YAML/XLSX | All CAIQ questions + CCM controls |
| CSA STAR CAIQ v4 | https://cloudsecurityalliance.org/artifacts/star-level-1-security-questionnaire-caiq-v4 | XLSX | STAR submission template |
| CSA CAIQ Resources | https://cloudsecurityalliance.org/research/topics/caiq | Web | CAIQ overview and docs |
| DataGuard ISO 27001 Annex A | https://www.dataguard.com/iso-27001/annex-a/ | Web | Full 93-control listing |
| HighTable ISO 27001 Controls | https://hightable.io/iso-27001-annex-a-controls-list/ | Web | Controls list with descriptions |
| Blackmores ISO Mapping | https://isologyhub.com/wp-content/uploads/2023/02/ISO-27001-2022-Annex-A-Control-Mapping.pdf | PDF | 2013→2022 control mapping |
| HECVAT | https://library.educause.edu/resources/2020/4/higher-education-community-vendor-assessment-toolkit | XLSX | Education-sector DDQ |

### Paid / Licensed Sources

| Source | URL | Cost | Content |
|--------|-----|------|---------|
| ISO 27001:2022 | https://www.iso.org/standard/27001 | ~$200 | Full standard text |
| ISO 27002:2022 | https://www.iso.org/standard/75652.html | ~$200 | Implementation guidance |
| Shared Assessments SIG | https://sharedassessments.org/sig/ | ~$1,500/yr | Full SIG question bank |

### Reference Guides (for model answer quality)

| Source | URL | Use |
|--------|-----|-----|
| Cherry Bekaert SOC 2 Guide | https://www.cbh.com/insights/articles/soc-2-trust-services-criteria-guide/ | TSC explanations |
| ContentSnare Vendor Questionnaire | https://contentsnare.com/vendor-questionnaire/ | 47 common questions |
| Venminder Top 10 Questions | https://www.venminder.com/blog/top-10-questions-vendor-cybersecurity-questionnaires | High-frequency questions |
| UpGuard Assessment Questionnaires | https://www.upguard.com/blog/top-vendor-assessment-questionnaires | Framework comparison |
| Cynomi Vendor Risk Guide | https://cynomi.com/learn/vendor-risk-assessment-questionnaire/ | DDQ best practices |
| AWS CAIQ v4 Example | https://aws.amazon.com/blogs/security/aws-csa-consensus-assessment-initiative-questionnaire-version-4-now-available/ | Real CAIQ completion example |

---

*This plan covers ~4,400 knowledge chunks across 8 content sets. P0 content (Top 50 Q&As + SOC 2) is achievable in ~36 engineering hours and makes the bot demo-ready. Full coverage across all frameworks requires ~177 hours and ~$1,900 in content licensing.*
