# Knowledge Vault Pipeline — Document Intake Checklist

## 0) Classification (required)
For every document, set:
- **Sensitivity:** `public` | `share-under-nda` | `internal`
- **Source:** customer-provided | VaultFill-authored | vendor | policy | report
- **Allowed surfaces:** bot-only | internal-only | marketing-site (rare)

## 1) Permission check
- Do we **have the right** to store and process this doc?
- Any NDA/customer confidentiality restrictions?
- If it’s a report (SOC2 / pen test), confirm whether we can ingest:
  - full report, executive summary only, or “sanitized summary only”.

## 2) Redaction / sanitization
- Remove: names, emails, IPs, hostnames, internal URLs, ticket IDs, secrets.
- Replace strong claims with truthful language:
  - “designed with X principles” vs “certified/compliant” unless proven.
- Keep a **redaction log** that never contains the raw removed text (only counts/types).

## 3) Metadata
Attach metadata to each doc:
- title, version/date, framework tags (SOC2, ISO27001, CAIQ, SIG, GDPR)
- sensitivity
- intended use (“questionnaire answers”, “trust center”, “product behavior”)

## 4) Versioning
- Prefer `YYYY-MM` or `v#` in filename.
- If a doc is replaced, keep the prior version (if permitted) with clear deprecation notes.

## 5) Acceptance gate
A doc is accepted only if:
- classification is set
- claims are sanitized
- no PII/secrets detected by automated scan + spot-check
