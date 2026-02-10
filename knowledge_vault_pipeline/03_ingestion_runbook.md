# Knowledge Vault Pipeline — Ingestion Runbook

## Pre-flight
1. Ensure document is intake-approved (see `02_document_intake.md`).
2. Confirm DB connection env vars are present.
3. Confirm we are ingesting only allowed folders (public/nda/internal segregation).

## Standard ingestion (current)
From repo root:

```bash
npm i
node -v

# Ingest the vault documents into pgvector
npm run ingest:vault 2>/dev/null || node scripts/ingest-vault.ts
```

## Recommended additions (near-term)
- `scripts/validate-vault.ts` to:
  - scan for PII patterns
  - enforce max chunk sizes
  - ensure metadata present

## Rollback
If ingestion introduces bad content:
- Prefer **soft rollback** by marking document sections inactive (recommended future)
- For now (harder): re-run ingestion from a clean corpus after removing the doc(s).

## Scheduling
- Manual during build-out
- Later: cron/CI scheduled ingestion for public docs + controlled manual runs for NDA/internal

## Safety: log discipline
- Never log raw document text.
- Log only: doc id, chunk count, timing, hashes.
