#!/bin/bash
rm -rf node_modules .next
[ -f "next.config.ts" ] && mv next.config.ts next.config.mjs
gcloud run deploy vaultfill-prod --source . --region us-central1 --allow-unauthenticated --quiet
