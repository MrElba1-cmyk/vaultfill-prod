#!/bin/bash
# Setup a Neon PostgreSQL database for VaultFill
# Requires: npx neonctl (authenticated)
# Usage: bash scripts/setup-neon-db.sh

set -e

echo "🔧 Creating Neon project for VaultFill..."
PROJECT=$(npx neonctl projects create --name vaultfill-db --output json 2>/dev/null)
CONNECTION_URI=$(echo "$PROJECT" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.connection_uris[0]?.connection_uri || '');
")

if [ -z "$CONNECTION_URI" ]; then
  echo "❌ Failed to create Neon project. Make sure you're authenticated: npx neonctl auth"
  exit 1
fi

echo "✅ Neon project created!"
echo "📎 DATABASE_URL: ${CONNECTION_URI}"
echo ""
echo "Next steps:"
echo "  1. Set on Vercel: vercel env update DATABASE_URL production <<< '${CONNECTION_URI}'"
echo "  2. Run migration: DATABASE_URL='${CONNECTION_URI}' npx prisma migrate deploy"
echo "  3. Run ingestion: DATABASE_URL='${CONNECTION_URI}' npx tsx scripts/ingest-vault.ts"
echo "  4. Redeploy: vercel --prod"
