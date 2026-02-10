#!/usr/bin/env bash
# test-shieldbot.sh — Automated smoke test for Shield Bot's /api/chat endpoint.
# Exits non-zero if any check fails.

set -euo pipefail

# Allow override via env var or first CLI arg
BASE_URL="${SHIELDBOT_URL:-${1:-https://vaultfill.com}}"
ENDPOINT="${BASE_URL%/}/api/chat"

MESSAGES=(
  "Do you train AI models on customer data?"
  "What encryption do you use for data in transit?"
  "What encryption do you use for data at rest?"
  "What is your policy on quantum-resistant cryptography?"
  "Who are your subprocessors?"
  "I want to sign up"
)

PASS=0
FAIL=0
CITATION_FOUND=0
FALLBACK_FOUND=0
CONVERSION_INTENT_OK=0
FAILED_DETAILS=()
TOTAL_MESSAGES=${#MESSAGES[@]}

SECURITY_CLEARANCE_FALLBACK='My current security clearance (context) does not contain the answer to that specific protocol.'

echo "=== Shield Bot Smoke Test ==="
echo "Endpoint: ${ENDPOINT}"
echo ""

for i in "${!MESSAGES[@]}"; do
  msg="${MESSAGES[$i]}"
  idx=$((i + 1))
  echo "--- Test ${idx}/${TOTAL_MESSAGES}: \"${msg}\" ---"

  # Use a unique session per message to get independent responses (maximizes citation coverage)
  SESSION_ID="smoke-test-$$-${idx}"

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
  if echo "$BODY" | grep -qi "Based on \["; then
    echo "  ✅ Citation found"
    CITATION_FOUND=1
  else
    echo "  ℹ️  No citation in this response (ok if others have one)"
  fi

  # Check 5: Fallback detection (tracked globally)
  if [[ "${BODY//$'\n'/ }" == "$SECURITY_CLEARANCE_FALLBACK" ]]; then
    echo "  ✅ Security-clearance fallback triggered (expected for some queries)"
    FALLBACK_FOUND=1
  fi

  # Check 6: Conversion intent — "I want to sign up" must NOT return fallback
  if [[ "$msg" == "I want to sign up" ]]; then
    if echo "$BODY" | grep -qi "security clearance"; then
      echo "  ❌ FAIL: Conversion intent 'I want to sign up' returned security-clearance fallback"
      FAILED_DETAILS+=("Test ${idx} (\"${msg}\"): Conversion intent hit security-clearance fallback")
      FAIL=$((FAIL + 1))
      continue
    else
      echo "  ✅ Conversion intent did NOT trigger security-clearance fallback"
      CONVERSION_INTENT_OK=1
    fi
    # Verify it contains a CTA keyword
    if echo "$BODY" | grep -qi "email\|reach out\|early access"; then
      echo "  ✅ Conversion intent contains CTA language"
    else
      echo "  ⚠️  Conversion intent response missing expected CTA language"
    fi
  fi

  PASS=$((PASS + 1))
done

echo ""
echo "=== Citation Check ==="
if [[ "$CITATION_FOUND" -eq 0 ]]; then
  echo "❌ FAIL: No citation found in any of the 5 responses"
  FAILED_DETAILS+=("Global: No citation (\"Based on [Title, Section]: ...\") found in any response")
  FAIL=$((FAIL + 1))
else
  echo "✅ At least one response contains a citation"
fi

echo ""
echo "=== Fallback Check ==="
# We accept either the legacy hard fallback OR the new soft fallback strategy.
# Soft fallback is expected when the vault lacks coverage and should be non-hallucinatory.
SOFT_FALLBACK_FOUND=0
# Re-scan captured bodies (saved in /tmp files) for soft fallback phrasing.
if ls /tmp/shieldbot_response_*.txt >/dev/null 2>&1; then
  if rg -qi "I checked the Knowledge Vault|don.t see a specific policy document covering" /tmp/shieldbot_response_*.txt; then
    SOFT_FALLBACK_FOUND=1
  fi
fi

if [[ "$FALLBACK_FOUND" -eq 0 && "$SOFT_FALLBACK_FOUND" -eq 0 ]]; then
  echo "ℹ️  No fallback detected in this run (ok if all answers were covered)"
else
  echo "✅ Fallback behavior detected (security-clearance or soft fallback)"
fi

echo ""
echo "=== Conversion Intent Check ==="
if [[ "$CONVERSION_INTENT_OK" -eq 0 ]]; then
  echo "❌ FAIL: 'I want to sign up' did not pass conversion intent bypass"
  FAILED_DETAILS+=("Global: Conversion intent bypass not confirmed")
  FAIL=$((FAIL + 1))
else
  echo "✅ Conversion intent correctly bypassed security-clearance fallback"
fi

# ═══════════════════════════════════════════════════════════════════════════
# EMAIL INTERCEPT TESTS — verify no fabricated addresses
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "=== Email Intercept Tests ==="

# Helper: send chat messages and return body
email_chat() {
  local payload="$1"
  local session="email-test-$$-${RANDOM}"
  curl -s -X POST "${ENDPOINT}" \
    -H "Content-Type: application/json" \
    -H "x-vaultfill-session-id: ${session}" \
    -d "$payload" \
    --max-time 30 2>/dev/null || echo ""
}

assert_contains() {
  local label="$1" body="$2" needle="$3"
  if echo "$body" | grep -qi "$needle"; then
    echo "  ✅ ${label} — contains '${needle}'"
    PASS=$((PASS + 1))
  else
    echo "  ❌ ${label} — expected to contain '${needle}'"
    FAILED_DETAILS+=("Email: ${label} — missing '${needle}'")
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local label="$1" body="$2" needle="$3"
  if echo "$body" | grep -qi "$needle"; then
    echo "  ❌ ${label} — should NOT contain '${needle}'"
    FAILED_DETAILS+=("Email: ${label} — unexpected '${needle}'")
    FAIL=$((FAIL + 1))
  else
    echo "  ✅ ${label} — does not contain '${needle}'"
    PASS=$((PASS + 1))
  fi
}

# -- E1: Email after CTA → signup confirmation --
echo ""
echo "--- E1: Email after CTA → signup confirmation ---"
E1_BODY=$(email_chat '{
  "messages": [
    {"role":"assistant","content":"Great question! Want me to set up a quick pilot for you? Just drop your email and I will get you started."},
    {"role":"user","content":"Sure! jane@example.com"}
  ]
}')

assert_contains    "signup confirmation"        "$E1_BODY" "signed up"
assert_contains    "asks for company"           "$E1_BODY" "company"
assert_not_contains "no security@ fabricated"   "$E1_BODY" "security@"
assert_not_contains "no privacy@ fabricated"    "$E1_BODY" "privacy@"

# -- E2: Bare email with signup intent --
echo ""
echo "--- E2: Bare email with 'sign me up' ---"
E2_BODY=$(email_chat '{
  "messages": [
    {"role":"user","content":"Sign me up — my email is bob@acme.co"}
  ]
}')

assert_contains    "signup confirmation"        "$E2_BODY" "signed up"
assert_contains    "asks for company"           "$E2_BODY" "company"
assert_not_contains "no security@ fabricated"   "$E2_BODY" "security@"
assert_not_contains "no privacy@ fabricated"    "$E2_BODY" "privacy@"

# -- E3: Email with unclear intent → clarifying question --
echo ""
echo "--- E3: Email with no clear intent → clarifying question ---"
E3_BODY=$(email_chat '{
  "messages": [
    {"role":"user","content":"Here is an email I found: admin@somevendor.com — can you look into this?"}
  ]
}')

assert_contains    "asks clarification"         "$E3_BODY" "sign up"
assert_not_contains "no security@ fabricated"   "$E3_BODY" "security@"
assert_not_contains "no privacy@ fabricated"    "$E3_BODY" "privacy@"

# Cleanup
rm -f /tmp/shieldbot_response_*.txt

echo ""
echo "=== Results ==="
TOTAL_CHECKS=$((PASS + FAIL))
echo "Passed: ${PASS}/${TOTAL_CHECKS} checks"
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
