# Compliance Corpus — Ingestion Order & Status Tracker

> **Created:** 2026-02-09  
> **Purpose:** Track authoring progress and ingestion sequence for the 16 compliance corpus documents.

---

## Ingestion Order (Optimized for Bot Impact)

Documents are ordered so that each batch maximally increases the percentage of buyer questions the bot can answer. Ingesting in this order means the bot gets useful fast.

### Batch 1 — Immediate (Day 1) ✅ IN PROGRESS

| # | Document | File | Status | Bot Impact |
|---|----------|------|--------|------------|
| 1 | **Subprocessor List** | `data/compliance-vault/public/subprocessors.md` | ✅ **AUTHORED** | Every buyer asks "who processes my data?" — now answerable |
| 2 | **Security Overview** | `data/compliance-vault/public/security-overview.md` | ✅ **AUTHORED** | Top-of-funnel trust doc. Covers infra, encryption, compliance status, headers, responsible disclosure |
| 3 | **Data Retention & Deletion** | `data/compliance-vault/nda/data-retention-deletion-policy.md` | ✅ **AUTHORED** | "How long do you keep my data?" — top-5 question, now answerable with specifics |

**After Batch 1 ingestion:** Bot can answer subprocessor, data flow, encryption-in-transit, hosting, retention, deletion, GDPR rights, and security posture questions. **Estimated coverage: ~35%** (up from ~20%).

### Batch 2 — Day 2-3 (Critical Policies)

| # | Document | File | Status | Bot Impact |
|---|----------|------|--------|------------|
| 4 | **Encryption & Key Management** | `data/compliance-vault/nda/encryption-key-management-policy.md` | 🟡 NEXT | Top-3 most asked. Pairs with security overview for depth. |
| 5 | **Incident Response Summary** | `data/compliance-vault/nda/incident-response-summary.md` | 🟡 NEXT | Universal requirement. Notification timelines, severity classification. |
| 6 | **Access Control Policy** | `data/compliance-vault/nda/access-control-policy.md` | 🟡 QUEUED | Authentication, authorization, provisioning, MFA. |

**After Batch 2 ingestion: ~50% coverage**

### Batch 3 — Day 4-5 (Operational Policies)

| # | Document | File | Status | Bot Impact |
|---|----------|------|--------|------------|
| 7 | **Privacy Policy (Full)** | `data/compliance-vault/public/privacy-policy-full.md` | 🟡 QUEUED | Replaces placeholder. Cross-references retention + subprocessors. |
| 8 | **Change Management** | `data/compliance-vault/nda/change-management-policy.md` | 🟡 QUEUED | CI/CD, PR review, rollback — documentable from existing workflow. |
| 9 | **Logging & Audit Trails** | `data/compliance-vault/nda/logging-audit-trail-policy.md` | 🟡 QUEUED | What's logged, where, how long, who can access. |

**After Batch 3 ingestion: ~60% coverage**

### Batch 4 — Day 6-7 (Resilience & Vulnerability)

| # | Document | File | Status | Bot Impact |
|---|----------|------|--------|------------|
| 10 | **BCP/DR Summary** | `data/compliance-vault/nda/bcp-dr-summary.md` | 🟡 QUEUED | RPO/RTO, Vercel/Neon resilience, failover procedures. |
| 11 | **Vulnerability Management** | `data/compliance-vault/nda/vulnerability-management-policy.md` | 🟡 QUEUED | Scanning, remediation SLAs, pen testing, responsible disclosure. |
| 12 | **DPA Template** | `data/compliance-vault/public/dpa-template.md` | 🟡 QUEUED | Deal-blocker for procurement. Needs legal review. |

**After Batch 4 ingestion: ~70% coverage**

### Batch 5 — Day 8-10 (Framework Assessments)

| # | Document | File | Status | Bot Impact |
|---|----------|------|--------|------------|
| 13 | **SOC 2 Readiness Narrative** | `data/compliance-vault/nda/soc2-readiness-narrative.md` | 🟡 QUEUED | Maps VaultFill controls to all CC categories. Biggest single doc. |
| 14 | **ISO 27001 SoA** | `data/compliance-vault/nda/iso27001-soa.md` | 🟡 QUEUED | 93 Annex A controls mapped. Time-intensive. |
| 15 | **CAIQ v4 Self-Assessment** | `data/compliance-vault/nda/caiq-v4-self-assessment.md` | 🟡 QUEUED | 17 CCM domains. Can submit to CSA STAR. |
| 16 | **SIG Lite Responses** | `data/compliance-vault/nda/sig-lite-responses.md` | 🟡 QUEUED | Overlaps heavily with other docs. Lowest marginal impact. |

**After Batch 5 ingestion: ~85-90% coverage**

---

## Ingestion Technical Notes

### Current Pipeline
The existing `scripts/ingest-vault.ts` reads from `docs/` and `data/sample-vault/`. To ingest the new compliance corpus, either:

**Option A (quick):** Add `data/compliance-vault/public/` and `data/compliance-vault/nda/` to the `DOCS_DIRS` array in `ingest-vault.ts`, then re-run.

**Option B (proper):** Enhance the script to read a `sensitivity` flag from frontmatter or directory path, and store it as metadata so the RAG layer can filter by access level.

### Recommended: Option A now, Option B this week
Get the docs into the bot immediately with Option A. Then enhance the pipeline for sensitivity-aware retrieval.

### Re-ingestion After Each Batch
After authoring each batch, run:
```bash
npx tsx scripts/ingest-vault.ts
```
This will re-chunk, re-embed, and re-store all documents. The script clears existing data before re-inserting, so it's safe to re-run.

---

## Coverage Projection

```
Today (baseline):        ████░░░░░░░░░░░░░░░░  20%
After Batch 1 (Day 1):   ███████░░░░░░░░░░░░░  35%
After Batch 2 (Day 3):   ██████████░░░░░░░░░░  50%
After Batch 3 (Day 5):   ████████████░░░░░░░░  60%
After Batch 4 (Day 7):   ██████████████░░░░░░  70%
After Batch 5 (Day 10):  █████████████████░░░  85%
+ Framework content:      ███████████████████░  95%
  (enrichment plan)
```
