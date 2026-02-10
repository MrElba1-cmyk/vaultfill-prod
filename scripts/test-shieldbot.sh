#!/usr/bin/env bash
# test-shieldbot.sh — Automated smoke test for Shield Bot's /api/chat endpoint.
# Exits non-zero if any check fails.

set -euo pipefail

BASE_URL="${SHIELDBOT_URL:-https://vaultfill-app.vercel.app}"
ENDPOINT="${BASE_URL}/api/chat"

MESSAGES=(
  "how much does it cost?"
  "soc 2"
  "I want to be compliant"
  "I need help preparing for an audit"
  "what about encryption at rest?"
)

PASS=0
FAIL=0
CITATION_FOUND=0
FAILED_DETAILS=()

echo "=== Shield Bot Smoke Test ==="
echo "Endpoint: ${ENDPOINT}"
echo ""

for i in "${!MESSAGES[@]}"; do
  msg="${MESSAGES[$i]}"
  idx=$((i + 1))
  echo "--- Test ${idx}/5: \"${msg}\" ---"

  # Use a unique session per test run but shared across messages (simulates conversation)
  SESSION_ID="smoke-test-$$"

  # Capture HTTP status code and body separately
  HTTP_CODE=$(curl -s -o /tmp/shieldbot_response_${idx}.txt -w "%{http_code}" \
    -X POST "${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -d "{\"message\": $(printf '%s' "$msg" | jq -Rs .), \"sessionId\": \"${SESSION_ID}\"}" \
    --max-time 60 2>/dev/null) || HTTP_CODE="000"

  BODY=$(cat /tmp/shieldbot_response_${idx}.txt 2>/dev/null || echo "")

  # Check 1: HTTP 200
  if [[ "$HTTP_CODE" != "200" ]]; then
    echo "  ❌ FAIL: HTTP status ${HTTP_CODE} (expected 200)"
    FAILED_DETAILS+=("Test ${idx} (\"${msg}\"): HTTP ${HTTP_CODE}")
    FAIL=$((FAIL + 1))
    continue
  else
    echo "  ✅ HTTP 200"
  fi

  # Check 2: Non-empty body
  if [[ -z "$BODY" ]]; then
    echo "  ❌ FAIL: Empty response body"
    FAILED_DETAILS+=("Test ${idx} (\"${msg}\"): Empty response body")
    FAIL=$((FAIL + 1))
    continue
  else
    echo "  ✅ Non-empty response (${#BODY} chars)"
  fi

  # Check 3: No "something went wrong" error
  if echo "$BODY" | grep -qi "something went wrong"; then
    echo "  ❌ FAIL: Response contains 'something went wrong'"
    FAILED_DETAILS+=("Test ${idx} (\"${msg}\"): Contains error message")
    FAIL=$((FAIL + 1))
    continue
  else
    echo "  ✅ No error message detected"
  fi

  # Check 4: Citation detection (tracked globally)
  if echo "$BODY" | grep -qP 'Based on \[.*?\]:'; then
    echo "  ✅ Citation found"
    CITATION_FOUND=1
  else
    echo "  ℹ️  No citation in this response (ok if others have one)"
  fi

  PASS=$((PASS + 1))
done

echo ""
echo "=== Citation Check ==="
if [[ "$CITATION_FOUND" -eq 0 ]]; then
  echo "❌ FAIL: No citation found in any of the 5 responses"
  FAILED_DETAILS+=("Global: No citation (\"Based on [Source]: ...\") found in any response")
  FAIL=$((FAIL + 1))
else
  echo "✅ At least one response contains a citation"
fi

# Cleanup
rm -f /tmp/shieldbot_response_*.txt

echo ""
echo "=== Results ==="
echo "Passed: ${PASS}/5 individual checks"
if [[ "$FAIL" -gt 0 ]]; then
  echo "FAILED: ${FAIL} check(s)"
  echo ""
  echo "Failure details:"
  for detail in "${FAILED_DETAILS[@]}"; do
    echo "  • ${detail}"
  done
  exit 1
else
  echo "✅ All checks passed — deploy is healthy!"
  exit 0
fi
