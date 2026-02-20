# VaultFill Autonomous Architecture: Master Runbook

## System Overview
VaultFill is a multi-agent AI compliance engine operating on a Next.js/Node.js stack, utilizing Supabase (PostgreSQL + pgvector) for state management and mathematical routing.

## 1. Knowledge Ingestion Engine
* **Location:** `scripts/ingest-vault.ts`
* **Function:** Parses internal compliance documentation, chunks text, generates mathematical vectors via OpenAI `text-embedding-3-small`, and writes to `public.documents`.
* **Execution:** Manual, triggered upon new document upload.

## 2. National Scout Agent (Discovery)
* **Location:** `scripts/scout-leads.ts`
* **Function:** Queries national registries for compliance target titles (Director of Operations, Chief Compliance Officer, IT Director).
* **State Mutation:** Injects targets into `public.leads` with status `new`.
* **Current State:** Operating in Simulation Mode pending Apollo.io API tier upgrade.

## 3. Closer Agent (Generation)
* **Location:** `scripts/outreach-agent.ts`
* **Function:** Scans database for `new` leads. Utilizes Google Gemini 2.5 Flash reasoning engine to draft highly specific, vector-anchored cold outreach payloads.
* **State Mutation:** Updates target status to `drafted`. Writes payload to `draft_payload` column.

## 4. Transmission Agent (Delivery)
* **Location:** `scripts/transmission-agent.ts`
* **Function:** Scans database for `drafted` payloads. Routes payloads to target inboxes via Twilio SendGrid SDK.
* **State Mutation:** Updates target status to `sent`.
* **Current State:** Operating in Simulation Mode pending Namecheap DNS resolution and Twilio sender authentication.
