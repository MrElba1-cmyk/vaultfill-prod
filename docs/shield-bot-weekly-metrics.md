# Shield Bot — Weekly Baseline Metrics

> Run every Monday morning. Track trends. Zero tolerance for hallucinations.

## How to Generate

```bash
# Against production
node scripts/test-shieldbot-eval.mjs \
  --url https://vaultfill-app.vercel.app \
  --pace 2000 --retries 2 --json > eval-results.json

# Extract the report line
node -e "
const r = require('./eval-results.json').summary;
const d = new Date().toISOString().slice(0,10);
console.log([d, r.total, r.passed, r.failed, r.passRate,
  r.hallucinations, r.citationErrors, r.fallbackErrors,
  r.latency.p50, r.latency.p95].join(','));
" >> docs/eval-history.csv
```

## Metrics to Report

| # | Metric | Target | Hard Fail | How Measured |
|---|--------|--------|-----------|-------------|
| 1 | **Overall pass rate** | ≥ 95% | < 85% | `summary.passRate` |
| 2 | **Hallucinations detected** | 0 | > 0 | `summary.hallucinations` — any `mustNotAppear` match |
| 3 | **Citation accuracy errors** | 0 | > 3 | `summary.citationErrors` — citation doesn't map to real vault content |
| 4 | **Fallback behavior errors** | 0 | > 2 | `summary.fallbackErrors` — bot answers when it should fall back, or vice versa |
| 5 | **Response latency p50** | < 3s | > 8s | `summary.latency.p50` |
| 6 | **Response latency p95** | < 6s | > 15s | `summary.latency.p95` |

### Category-Level Drill-Down

Report per-category pass rate weekly to spot regression:

| Category | Baseline Target | Notes |
|----------|----------------|-------|
| soc2 | 100% | Core vault content — should always pass |
| iso27001 | 100% | Core vault content |
| gdpr | 100% | Core vault content |
| encryption | 100% | Core vault content |
| retention | 100% | Core vault content |
| access_controls | 100% | Core vault content |
| questionnaires | 100% | FAQ content |
| edge_cases | 80% | "hi" and gibberish are inherently fuzzy |
| subprocessors | 100% | Must fall back (not in vault) |
| incident_response | 100% | Must fall back (not in vault) |
| pen_testing | 100% | Must fall back (not in vault) |
| adversarial | 90% | LLM non-determinism on prompt injection |

### Tracking History

Append each run to `docs/eval-history.csv`:

```csv
date,total,passed,failed,pass_rate,hallucinations,citation_errors,fallback_errors,p50_ms,p95_ms
2026-02-10,46,42,4,91.3%,0,2,1,2100,4800
2026-02-17,46,44,2,95.7%,0,1,0,1900,4200
```

## When to Alert

| Condition | Action |
|-----------|--------|
| Any hallucination (> 0) | **Stop. Fix immediately.** Re-run with `--id` to confirm, then patch system prompt or confidence gate. |
| Pass rate drops > 5% week-over-week | Investigate: new vault content? Prompt change? Model update? |
| Latency p95 > 10s | Check OpenAI status, embedding index health, server load |
| New vault file added | Add eval prompts. Run `--category <new>` before merging. |
| Fallback test starts passing (answers instead of falling back) | Vault expanded to cover that topic — update test from `security_clearance_fallback` to `answer_with_citation` |

## Running After Vault Changes

When new documents are added to `data/sample-vault/`:

```bash
# 1. Run full suite to see what changed
node scripts/test-shieldbot-eval.mjs --verbose

# 2. Tests that previously expected fallback may now answer — update them:
#    Change expectedBehavior from "security_clearance_fallback" to "answer_with_citation"
#    Add requiredCitationSource pointing to the new file
#    Keep mustNotAppear entries (only remove ones now explicitly in vault)

# 3. Add new test prompts for the new content
#    Follow the pattern in tests/eval-prompts.json

# 4. Re-run and verify
node scripts/test-shieldbot-eval.mjs --json > eval-results.json
```
