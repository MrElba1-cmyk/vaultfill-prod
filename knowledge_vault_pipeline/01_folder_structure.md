# Knowledge Vault Pipeline — Folder Structure

## Goals
- Keep **code + schemas** in git.
- Keep **sensitive/raw documents, embeddings artifacts, and logs** out of git.
- Make it obvious what is safe to share publicly vs NDA-only vs internal.

## Proposed structure (repo)

```
/vaultfill-app
  /data
    /sample-vault/              # ✅ demo/synthetic/sanitized docs safe for repo
    /vault-public/              # ✅ sanitized public trust docs (no secrets)
    /vault-nda/                 # 🚫 NOT IN GIT (mounted/secure storage)
    /vault-internal/            # 🚫 NOT IN GIT (internal-only)
  /scripts
    ingest-vault.ts             # ingestion entrypoint
    validate-vault.ts           # (recommended) validates docs + metadata
  /knowledge_vault_pipeline/    # ✅ runbooks + policies (this folder)
  /.gitignore                   # must exclude nda/internal + logs
```

## Git vs Not Git

### In Git (safe)
- Ingestion code (`/scripts`)
- Sanitization/redaction rules (templates)
- Schema migrations (if any)
- Runbooks + docs (`/knowledge_vault_pipeline`)
- **Sanitized** trust docs intended for marketing or the bot

### NOT in Git (must be excluded)
- Raw customer questionnaires
- Full SOC2 reports / pen test reports (unless explicitly approved)
- Unredacted ISO SoA / risk register
- Ingestion logs containing any raw text
- Any credential/config files containing secrets

## .gitignore recommendations
- `data/vault-nda/`
- `data/vault-internal/`
- `*.log`
- `logs/`
- `*.pdf` (unless explicitly approved and sanitized)
