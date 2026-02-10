#!/usr/bin/env bash
# test-shieldbot-smoke.sh — Quick smoke test with citation-accuracy checks.
# Wraps the eval harness for CI-friendly execution.
#
# Usage:
#   ./scripts/test-shieldbot-smoke.sh                          # Default: localhost:3000
#   SHIELDBOT_URL=https://vaultfill-app.vercel.app ./scripts/test-shieldbot-smoke.sh
#   ./scripts/test-shieldbot-smoke.sh --category soc2          # Subset
#
# Requires: node >= 18 (for native fetch)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

BASE_URL="${SHIELDBOT_URL:-http://localhost:3000}"
EXTRA_ARGS="${*}"

echo "=== Shield Bot Smoke + Eval Test ==="
echo "Endpoint: ${BASE_URL}"
echo ""

# ── Step 1: Quick health check ─────────────────────────────────────────────

echo "--- Health check ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"ping","messages":[]}' \
  --max-time 30 2>/dev/null) || HTTP_CODE="000"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "❌ Health check failed: HTTP ${HTTP_CODE}"
  echo "   Is the server running at ${BASE_URL}?"
  exit 1
fi
echo "✅ API reachable (HTTP ${HTTP_CODE})"
echo ""

# ── Step 2: Run the full eval harness ─────────────────────────────────────

echo "--- Running evaluation harness ---"
echo ""

node "${SCRIPT_DIR}/test-shieldbot-eval.mjs" \
  --url "${BASE_URL}" \
  ${EXTRA_ARGS}

EXIT_CODE=$?

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo ""
  echo "=== ✅ All tests passed ==="
else
  echo ""
  echo "=== ❌ Some tests failed (exit code: ${EXIT_CODE}) ==="
fi

exit $EXIT_CODE
