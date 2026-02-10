# Knowledge Vault Pipeline — Observability

## What we track
- ingestion runs: start/end, docs processed, chunks created, failures
- retrieval quality: topScore distribution, hit rate, fallback rate

## Logging rules (critical)
- **No raw doc text** in logs.
- Store only:
  - document ids/paths (sanitized)
  - chunk counts
  - hashes of queries (if needed)
  - confidence scores

## Metrics (minimum)
- `ingest_docs_total`
- `ingest_chunks_total`
- `ingest_failures_total`
- `retrieval_topscore_avg`
- `chat_fallback_rate`

## Alerts
- ingestion failures > 0
- fallback rate spikes
- topScore distribution collapses (signals retrieval broken)
