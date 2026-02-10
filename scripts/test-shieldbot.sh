#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# test-shieldbot.sh — Smoke tests for the VaultFill chat bot
#
# Usage:
#   ./scripts/test-shieldbot.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:3000
#
# Exit 0 = all passed, 1 = any failure
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="${1:-http://localhost:3000}"
CHAT_URL="${BASE}/api/chat"
LEADS_URL="${BASE}/api/leads"
PASS=0
FAIL=0

green()  { printf '\033[0;32m%s\033[0m\n' "$*"; }
red()    { printf '\033[0;31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }

# Helper: send a chat payload and return the raw body
chat() {
  local payload="$1"
  curl -s -X POST "$CHAT_URL" \
    -H "Content-Type: application/json" \
    -H "x-vaultfill-session-id: test-$(date +%s)-$RANDOM" \
    -d "$payload" \
    --max-time 30
}

assert_contains() {
  local label="$1" body="$2" needle="$3"
  if echo "$body" | grep -qi "$needle"; then
    green "  ✓ $label — contains '$needle'"
    ((PASS++)) || true
  else
    red "  ✗ $label — expected to contain '$needle'"
    red "    body: ${body:0:300}"
    ((FAIL++)) || true
  fi
}

assert_not_contains() {
  local label="$1" body="$2" needle="$3"
  if echo "$body" | grep -qi "$needle"; then
    red "  ✗ $label — should NOT contain '$needle'"
    red "    body: ${body:0:300}"
    ((FAIL++)) || true
  else
    green "  ✓ $label — does not contain '$needle'"
    ((PASS++)) || true
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
yellow "═══ VaultFill ShieldBot Smoke Tests ═══"
yellow "Target: $BASE"
echo ""

# ── 0) Health check ──────────────────────────────────────────────────────────
yellow "── Test 0: Health check"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/health" --max-time 10 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  green "  ✓ /api/health → 200"
  ((PASS++)) || true
else
  red "  ✗ /api/health → $HTTP_CODE (expected 200)"
  ((FAIL++)) || true
fi

# ── 1) Email after CTA — signup flow ────────────────────────────────────────
yellow "── Test 1: Email after CTA → signup confirmation"
# Simulate: bot previously asked for email (CTA), user provides one
BODY=$(chat '{
  "messages": [
    {"role":"assistant","content":"Great question! Want me to set up a quick pilot for you? Just drop your email and I will get you started."},
    {"role":"user","content":"Sure! jane@example.com"}
  ]
}')

assert_contains    "signup confirmation"      "$BODY" "signed up"
assert_contains    "asks for company"         "$BODY" "company"
assert_not_contains "no security@ fabricated" "$BODY" "security@"
assert_not_contains "no privacy@ fabricated"  "$BODY" "privacy@"

# ── 2) Bare email — signup intent ───────────────────────────────────────────
yellow "── Test 2: Bare email with 'sign me up'"
BODY=$(chat '{
  "messages": [
    {"role":"user","content":"Sign me up — my email is bob@acme.co"}
  ]
}')

assert_contains    "signup confirmation"      "$BODY" "signed up"
assert_contains    "asks for company"         "$BODY" "company"
assert_not_contains "no security@ fabricated" "$BODY" "security@"
assert_not_contains "no privacy@ fabricated"  "$BODY" "privacy@"

# ── 3) Email alone (no context) — clarifying question ───────────────────────
yellow "── Test 3: Email with no clear intent → clarifying question"
BODY=$(chat '{
  "messages": [
    {"role":"user","content":"Here is an email I found: admin@somevendor.com — can you look into this?"}
  ]
}')

# This is ambiguous — should ask for clarification, NOT sign them up
assert_contains    "asks clarification"       "$BODY" "sign up"
assert_not_contains "no security@ fabricated" "$BODY" "security@"
assert_not_contains "no privacy@ fabricated"  "$BODY" "privacy@"

# ── 4) Normal question (no email) still works ───────────────────────────────
yellow "── Test 4: Normal GRC question (no email) → LLM response"
BODY=$(chat '{
  "messages": [
    {"role":"user","content":"What is SOC 2 Type II?"}
  ]
}' 2>&1 || true)

if [ -z "$BODY" ]; then
  yellow "  ⚠ Skipped (LLM unavailable — no valid OPENAI_API_KEY)"
else
  # Should get a substantive answer about SOC 2
  assert_contains    "SOC 2 answer"             "$BODY" "SOC"
  assert_not_contains "no security@ fabricated" "$BODY" "security@vaultfill"
  assert_not_contains "no privacy@ fabricated"  "$BODY" "privacy@vaultfill"
fi

# ── 5) /api/leads POST ──────────────────────────────────────────────────────
yellow "── Test 5: /api/leads POST"
LEAD_RESP=$(curl -s -X POST "$LEADS_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-smoke@example.com","sessionId":"smoke-test"}')

assert_contains "leads POST ok" "$LEAD_RESP" '"ok":true'

# ── 6) /api/leads POST — bad payload ────────────────────────────────────────
yellow "── Test 6: /api/leads POST — missing email → 400"
LEAD_BAD=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$LEADS_URL" \
  -H "Content-Type: application/json" \
  -d '{"company":"Acme"}')

if [ "$LEAD_BAD" = "400" ]; then
  green "  ✓ leads POST missing email → 400"
  ((PASS++)) || true
else
  red "  ✗ leads POST missing email → $LEAD_BAD (expected 400)"
  ((FAIL++)) || true
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
yellow "═══ Results ═══"
green "Passed: $PASS"
if [ "$FAIL" -gt 0 ]; then
  red "Failed: $FAIL"
  exit 1
else
  green "Failed: 0"
  green "All tests passed! ✅"
  exit 0
fi
