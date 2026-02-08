#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:3000/api/leads}"
N="${2:-25}"

echo "Stress testing lead endpoint: $URL ($N requests)"

for i in $(seq 1 "$N"); do
  email="founder_test+$i@vaultfill.com"
  vol="20+"
  proc="Manual/Spreadsheets"
  formats="SOC 2"
  role="GRC"

  code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$URL" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"$email\",\"monthlyVolume\":\"$vol\",\"currentProcess\":\"$proc\",\"primaryFormats\":\"$formats\",\"role\":\"$role\"}")

  echo "[$i/$N] $code $email"
  sleep 0.05
done

echo "Done."
