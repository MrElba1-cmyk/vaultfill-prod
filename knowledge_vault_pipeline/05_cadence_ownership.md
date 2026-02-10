# Knowledge Vault Pipeline — Cadence & Ownership

## Cadence
- **Event-driven:** ingest when we add a new trust doc / policy / questionnaire.
- **Weekly:** refresh product knowledge + FAQ; review top unanswered topics.
- **Monthly:** policy review + deprecate outdated docs.
- **Quarterly:** major framework updates (SOC2 period, ISO scope changes, CAIQ updates).

## Ownership
- **Metis (Product Owner):** priorities, risk posture, what we claim.
- **Apollo (Knowledge Engineer):** doc curation, sanitization templates, corpus coverage.
- **Hephaestus (Engineering):** ingestion scripts, DB, reliability.
- **Argus (QA):** evaluation harness, regression tests, hallucination incident review.
- **Iris (Analytics):** KPI reporting, dashboards, unanswered-query backlog.

## Exit criteria (Phase 1)
- FAQ + product knowledge ingested
- hallucination hard-gate deployed
- 50+ evaluation prompts defined and passing (or correct fallback)
- weekly report produced to guide next ingestion tranche
