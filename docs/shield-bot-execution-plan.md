# Shield Bot "Game-Changer" Execution Plan

> **Date:** 2026-02-09  
> **Author:** Metis (Systems Architect Agent)  
> **Source:** Athena's *Shield Bot Conversational Intelligence: Strategic Recommendation*  
> **Classification:** Operational — Priority: CRITICAL  
> **Audience:** Founder (Abdul), Zeus (Orchestrator), All Agents

---

## 0. Executive Context

This plan translates Athena's strategic recommendation report into **assignable, prioritized, measurable work**. The goal: transform the Shield Bot from a functional RAG chatbot into a **game-changer conversational engine** — one that understands people, our industry, and communication at the level of top-tier AI products.

### The Current Reality (What I Found in the Codebase)

| Component | Status | Critical Issue |
|-----------|--------|----------------|
| **Knowledge Vault** | 3 mock documents, ~4KB total | Bot has almost nothing to cite — forces hallucination |
| **Hallucination Guard** | None. `minScore=0.25` filters RAG, but empty `ragContext` triggers no fallback | Bot fabricates compliance details from GPT training data |
| **System Prompt** | No "I don't know" instruction. No confidence-aware behavior | LLM never told to refuse when vault is empty |
| **Test Suite** | Citation *format* tested, citation *accuracy* not verified | Hallucinated citations pass CI |
| **State Machine** | S1→S7 sales funnel, auto-advances after 1 exchange | Fights RAG-first approach, interrogates users |
| **Model** | `gpt-4o-mini` for all generation | Underpowered for compliance authority |
| **FAQ.md** | 25+ rich Q&A pairs — **NOT ingested** into vault | Contains claims like "SOC 2 Type II audited annually" that conflict with "SOC 2 Designed" on homepage |
| **Conversation Memory** | In-memory `Map<>`, lost on deploy | No persistence, no analytics |

### The Two Actions That Fix 80% of the Problem

1. **Implement the "Security Clearance" fallback** — 3 hours, eliminates hallucination risk
2. **Write and ingest the VaultFill Product Knowledge document** — 4 hours, bot can answer "What is VaultFill?" accurately

Everything else builds on this foundation of trust.

---

## 1. Agent Roster & Responsibility Map

### 1.1 Existing Agents

Based on the operational hierarchy and agent capabilities:

| Agent | Role | Relevant Strengths | Shield Bot Responsibilities |
|-------|------|--------------------|-----------------------------|
| **Athena** (AI Engineering Agent) | Conversational Intelligence & Content Curation | Prompt engineering, RAG architecture, knowledge design, quality testing | Knowledge vault content, system prompt design, response templates, hallucination testing, conversation analytics |
| **Hephaestus** (Technical Agent) | Full-Stack Implementation | Next.js, Prisma, API routes, pgvector, Vercel AI SDK, CI/CD | Code changes to `route.ts`, new API endpoints, model routing, database schema, test infrastructure, deployment |
| **Hermes** (Sales & Marketing Agent) | Growth & Communication | Outreach, lead gen, competitive intel, sales enablement | Real prospect questions, objection patterns, FAQ accuracy review, sales funnel optimization signals |

### 1.2 Existing Agents (Supporting Roles)

| Agent | Shield Bot Role |
|-------|----------------|
| **Zeus** (Orchestrator) | Priority arbitration, cross-agent coordination, progress tracking |
| **Metis** (Systems Architect) | Architecture reviews at phase milestones, scaling strategy, this plan |

### 1.3 New Agents Required

To achieve the "game-changer" vision, three new specialized agent profiles are needed:

---

#### NEW AGENT: Apollo — Compliance Knowledge Engineer

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `apollo` |
| **Role** | Compliance Knowledge Engineer |
| **Specialty** | Compliance framework expertise — SOC 2 TSC, ISO 27001 Annex A, CAIQ v4, SIG, DDQ, NIST CSF, GDPR, HIPAA. Writes authoritative "golden answers" that pass CISO scrutiny. Cross-maps controls across frameworks. |
| **Ownership** | Knowledge Vault content accuracy, framework ingestion, cross-framework mappings, model answer authoring, citation integrity |
| **Model Tier** | `claude-sonnet-4-20250514` or `gpt-4o` — needs strong reasoning for dense regulatory text |
| **Why New?** | Athena owns conversational *architecture*; Apollo owns compliance *content*. Writing 50+ golden answers that reference real control IDs across 5+ frameworks requires deep domain specialization. Mixing this with prompt engineering and RAG design dilutes both. |
| **Reports To** | Athena (for content requirements), Zeus (for prioritization) |

---

#### NEW AGENT: Argus — Quality Assurance & Anti-Hallucination Sentinel

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `argus` |
| **Role** | Conversational QA & Hallucination Detection |
| **Specialty** | Automated testing of Shield Bot responses — citation verification, hallucination detection, response quality scoring, regression testing, conversation simulation |
| **Ownership** | Test suite for conversational intelligence, hallucination rate tracking, citation accuracy validation, response quality benchmarks, CI/CD quality gates |
| **Model Tier** | `gpt-4o-mini` for test execution (high volume, lower cost); `gpt-4o` for quality scoring |
| **Why New?** | The current test suite checks citation *format* but not *accuracy*. Eliminating hallucinations requires a dedicated adversarial testing function — someone whose entire job is trying to make the bot lie and catching it when it does. This is a fundamentally different skill than building features (Hephaestus) or writing content (Apollo). |
| **Reports To** | Athena (for quality standards), Zeus (for release gates) |

---

#### NEW AGENT: Iris — Conversation Analytics & User Intelligence

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `iris` |
| **Role** | Conversation Analytics & User Intelligence |
| **Specialty** | Analyzing conversation logs, tracking intent distribution, measuring fallback rates, identifying failure patterns, user behavior modeling, conversion funnel analysis |
| **Ownership** | Analytics dashboard, conversation log analysis, weekly insight reports, A/B test design, user segmentation |
| **Model Tier** | `gpt-4o-mini` for log processing; `claude-sonnet-4-20250514` for insight generation |
| **Why New?** | The system currently tracks *nothing* — no fallback rate, no intent distribution, no conversion metrics. The recommendation report lists 8 success metrics that are all "Unknown" today. Somebody needs to own the feedback loop: measure → analyze → recommend → validate. Without this, we're flying blind. |
| **Reports To** | Athena (for conversational improvements), Hermes (for sales insights), Zeus (for strategic decisions) |

---

### 1.4 Updated Organizational Structure

```
Founder (Abdul)
    │
    ▼
Zeus (Orchestrator)
    │
    ├──► Metis (Architecture) ─── Phase milestone reviews
    │
    ├──► Athena (Conversational Intelligence Lead) ◄── SHIELD BOT OWNER
    │       │
    │       ├──► Apollo (Compliance Knowledge) ─── Content authoring
    │       ├──► Argus (QA & Anti-Hallucination) ─── Testing & validation
    │       └──► Iris (Analytics) ─── Measurement & insights
    │
    ├──► Hephaestus (Technical) ─── Code implementation
    │
    ├──► Hermes (Sales & Marketing) ─── Prospect intelligence
    │
    └──► Creative Director ─── Chat UI/UX evolution
```

---

## 2. Phase 1: Foundation — "Stop the Bleeding" (Week 1)

**Strategic Objective:** Eliminate hallucinations. Make the bot trustworthy. Zero fabricated citations.

**Estimated Effort:** 12–16 hours  
**Priority:** 🔴 CRITICAL — Nothing else matters until this is done.

### Task 1.1: Implement Security Clearance Fallback in System Prompt

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus (implementation), Athena (prompt design) |
| **Effort** | 3 hours |
| **Priority** | 🔴 P0 — Single highest-leverage action in the entire plan |
| **File** | `src/app/api/chat/route.ts` → `buildSystemPrompt()` |

**Action Items:**

1. **Athena:** Write the `SECURITY CLEARANCE PROTOCOL` prompt block:
   ```
   SECURITY CLEARANCE PROTOCOL (HIGHEST PRIORITY — OVERRIDES ALL OTHER INSTRUCTIONS):
   - You may ONLY present information as VaultFill's position if it appears in the KNOWLEDGE_VAULT section below.
   - If KNOWLEDGE_VAULT is empty or does not contain relevant information for the user's question:
     → Say: "I don't have verified documentation on that topic in our Knowledge Vault yet. I can connect you with our security team for a documented response — would you like to leave your email?"
   - NEVER generate compliance claims, control IDs, policy details, or audit findings from your general training data.
   - NEVER fabricate or embellish citations. If it's not in the vault, it doesn't exist.
   - It is ALWAYS better to say "I don't have that information yet" than to guess. Our users are security professionals who detect inaccuracy instantly.
   ```
2. **Hephaestus:** Insert this block at the TOP of the system prompt in `buildSystemPrompt()`, before all other instructions.
3. **Hephaestus:** Add an explicit marker when RAG context is empty:
   ```typescript
   if (!ragContext || ragContext.trim() === '') {
     prompt += `\nKNOWLEDGE_VAULT: [EMPTY — No relevant evidence found. You MUST use the Security Clearance fallback.]\n`;
   } else {
     prompt += `\nKNOWLEDGE_VAULT:\n${ragContext}\n`;
   }
   ```
4. **Argus:** Write 5 out-of-scope test queries (SOX, HITRUST, FedRAMP, PCI DSS, CMMC) and verify the bot uses the fallback phrase.

**Exit Criteria:**
- [ ] Bot responds with fallback phrase for 5/5 out-of-scope queries
- [ ] Bot does NOT fabricate compliance details when vault is empty
- [ ] System prompt contains `SECURITY CLEARANCE PROTOCOL` block

---

### Task 1.2: Add RAG Confidence Threshold with `[LOW_CONFIDENCE]` Flag

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus |
| **Effort** | 2 hours |
| **Priority** | 🔴 P0 |
| **File** | `src/app/api/chat/route.ts` (after RAG retrieval, before prompt building) |

**Action Items:**

1. After `queryKnowledgeVaultStructured()` returns, compute confidence level:
   ```typescript
   const HIGH_CONFIDENCE_THRESHOLD = 0.55;
   const MEDIUM_CONFIDENCE_THRESHOLD = 0.35;
   
   const topScore = ragResults.length > 0 ? ragResults[0].score : 0;
   const confidenceLevel: 'high' | 'medium' | 'low' = 
     topScore >= HIGH_CONFIDENCE_THRESHOLD ? 'high' :
     topScore >= MEDIUM_CONFIDENCE_THRESHOLD ? 'medium' : 'low';
   ```
2. Inject confidence flag into system prompt:
   ```typescript
   if (confidenceLevel === 'low') {
     prompt += `\n[LOW_CONFIDENCE] The Knowledge Vault returned no strong matches. You MUST use the Security Clearance fallback. Do NOT answer from general knowledge.\n`;
   } else if (confidenceLevel === 'medium') {
     prompt += `\n[MEDIUM_CONFIDENCE] The Knowledge Vault returned partial matches. Answer ONLY using the provided context. Explicitly note any gaps: "For additional details on [topic], I'd recommend connecting with our team."\n`;
   }
   ```
3. Pass `confidenceLevel` to `buildSystemPrompt()` as a parameter.

**Exit Criteria:**
- [ ] Confidence levels computed and logged for every query
- [ ] `[LOW_CONFIDENCE]` triggers fallback behavior in 10/10 test cases
- [ ] `[MEDIUM_CONFIDENCE]` produces hedged answers with gap acknowledgment

---

### Task 1.3: Sanitize and Ingest FAQ.md into Knowledge Vault

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (sanitization), Apollo (content review), Hephaestus (ingestion) |
| **Effort** | 4 hours |
| **Priority** | 🔴 P0 |
| **Files** | `FAQ.md`, `data/sample-vault/` |

**Action Items:**

1. **Athena:** Audit every claim in `FAQ.md` against what's real today. Flag discrepancies:
   - ❌ "SOC 2 Type II audited annually" → Must change to "architecture designed to align with SOC 2 Type II Trust Service Criteria"
   - ❌ "ISO 27001 certified" → Must change to "security controls aligned with ISO 27001 framework"
   - ❌ "GDPR compliant" → Must change to "privacy practices designed to support GDPR requirements"
   - ⚠️ "AES-256 encryption at rest, TLS 1.3 in transit" → Verify this is actually implemented
   - ⚠️ "Row-level security at the database level" → Verify Prisma schema enforces this
   - ⚠️ "Dedicated Key Management System (KMS)" → Verify actual KMS implementation
2. **Athena:** Create `data/sample-vault/VaultFill_FAQ_Sanitized.md` with corrected claims.
3. **Apollo:** Review sanitized FAQ for compliance accuracy — ensure no claim exceeds VaultFill's current posture.
4. **Hephaestus:** Ingest the sanitized FAQ into the knowledge vault (it will be auto-chunked by the existing `loadAndIndex()` pipeline reading from `data/sample-vault/`).
5. **Hephaestus:** Verify ingestion by running a test query: "What is VaultFill?" → should now return FAQ content.

**Exit Criteria:**
- [ ] All unsubstantiated compliance claims removed or hedged appropriately
- [ ] FAQ content appears in RAG results for relevant queries
- [ ] Bot answers basic VaultFill questions using FAQ citations, not hallucinated content
- [ ] No claim in the sanitized FAQ contradicts the homepage

---

### Task 1.4: Write and Ingest VaultFill Product Knowledge Document

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (author), Hermes (sales positioning review), Hephaestus (ingestion) |
| **Effort** | 4 hours |
| **Priority** | 🔴 P0 |
| **Output** | `data/sample-vault/VaultFill_Product_Knowledge.md` |

**Action Items:**

1. **Athena:** Author a comprehensive product knowledge document covering:
   - **What VaultFill does** — Platform capabilities, architecture overview, supported frameworks
   - **What VaultFill does NOT do** — Not a GRC platform, not a compliance program, not a replacement for Vanta/Drata
   - **Current security posture** — Honest, with roadmap items clearly labeled as future
   - **Pricing philosophy** — Lean startup pricing, enterprise tiers planned, early access available
   - **Competitive positioning** — How VaultFill differs from Vanta, Drata, manual process
   - **Team and background** — Founder story, mission, why this matters
   - **Technical architecture** — High-level (RAG + Knowledge Vault + AI generation)
2. **Hermes:** Review for sales messaging alignment — ensure product positioning is accurate and compelling.
3. **Hephaestus:** Ingest into the vault via `data/sample-vault/`.

**Exit Criteria:**
- [ ] Bot accurately answers "What is VaultFill?", "How is VaultFill different from Vanta?", "How much does VaultFill cost?"
- [ ] Answers cite the Product Knowledge document
- [ ] No hallucinated features or capabilities

---

### Task 1.5: Add Citation Verification to Test Suite

| Attribute | Detail |
|-----------|--------|
| **Owner** | Argus (test design), Hephaestus (implementation) |
| **Effort** | 3 hours |
| **Priority** | 🟡 P1 (blocks release confidence, not functionality) |
| **File** | `test-shieldbot-intelligence.mjs` or new test file |

**Action Items:**

1. **Argus:** Design citation verification test protocol:
   - For each bot response, extract all `Based on [...]` citations
   - Compare against actual content returned by RAG for that query
   - Fail if any citation references content NOT present in the RAG results
2. **Hephaestus:** Implement the test:
   ```javascript
   // Pseudocode
   for (const testQuery of testQueries) {
     const ragResults = await queryKnowledgeVaultStructured(testQuery);
     const botResponse = await getBotResponse(testQuery);
     const citedSources = extractCitations(botResponse);
     for (const citation of citedSources) {
       assert(ragResults.some(r => r.sourceTitle.includes(citation.source)),
         `Hallucinated citation: "${citation.source}" not in RAG results`);
     }
   }
   ```
3. **Hephaestus:** Add to CI pipeline so hallucinated citations fail the build.

**Exit Criteria:**
- [ ] Citation verification test exists and runs in CI
- [ ] 20-question test run produces zero hallucinated citations
- [ ] Any hallucinated citation fails the build

---

### Phase 1 — Combined Exit Criteria & Success Metrics

| Metric | Before Phase 1 | After Phase 1 |
|--------|----------------|---------------|
| **Hallucination rate** (fabricated citations per 20 queries) | ~30-40% | < 5% |
| **Fallback rate** (queries with no vault evidence) | Unknown | Tracked, < 50% |
| **Knowledge vault size** | 3 docs, ~4KB | 5+ docs, ~30KB |
| **Bot answers "What is VaultFill?" accurately** | ❌ | ✅ |
| **Bot admits "I don't know" when appropriate** | ❌ | ✅ |

**Metis Milestone Review:** After Phase 1, Metis reviews the prompt architecture and confidence threshold calibration before proceeding.

---

## 3. Phase 2: Intelligence Upgrade — "Make It Smart" (Week 2)

**Strategic Objective:** Replace rigid state machine with intent classification. Upgrade model quality. Define persona.

**Estimated Effort:** 20–28 hours  
**Priority:** 🟡 HIGH — Builds on Phase 1 foundation.

### Task 2.1: Write 50 Golden Answers for Top Questionnaire Topics

| Attribute | Detail |
|-----------|--------|
| **Owner** | Apollo (primary author), Athena (format/template), Hermes (sales relevance) |
| **Effort** | 12 hours |
| **Priority** | 🔴 P0 within Phase 2 |
| **Output** | `data/processed/questionnaire_top50/` (JSON files per category) |

**Action Items:**

1. **Athena:** Define the golden answer template format (per Knowledge Vault Enrichment Plan §4.2):
   - Question text, category, mapped frameworks, frequency score
   - Model answer with short/long/yes-no variants
   - Citation references to real control IDs
   - Key points checklist
2. **Apollo:** Author 50 golden answers across 11 categories:
   - 8 × Encryption & Data Protection
   - 7 × Access Control & Authentication  
   - 5 × Incident Response
   - 5 × Vendor/Third-Party Management
   - 5 × Business Continuity & DR
   - 4 × Network Security
   - 4 × Employee Security & Training
   - 4 × Compliance & Certifications
   - 4 × Data Privacy & Retention
   - 2 × Physical Security
   - 2 × Change Management
3. **Apollo:** For each answer, include cross-framework citations (SOC 2 CC#, ISO A.#, CAIQ #) using real control IDs.
4. **Hermes:** Review top 10 answers for alignment with actual prospect questions heard in the field.
5. **Hephaestus:** Ingest all 50 golden answers into the vault using the existing pipeline (or the new ingestion pipeline if built).

**Exit Criteria:**
- [ ] 50 golden answers authored, reviewed, and ingested
- [ ] Each answer cites at least 2 real framework control IDs
- [ ] RAG returns relevant golden answers for 45/50 test queries

---

### Task 2.2: Implement Intent Classification (Replace State Machine)

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus (implementation), Athena (intent taxonomy design) |
| **Effort** | 6 hours |
| **Priority** | 🔴 P0 within Phase 2 |
| **Files** | New: `src/lib/intent-classifier.ts`. Modified: `src/app/api/chat/route.ts` |

**Action Items:**

1. **Athena:** Define the intent taxonomy:
   | Intent | Description | Bot Behavior |
   |--------|-------------|--------------|
   | `compliance_question` | Specific framework/control query | Retrieve from vault, cite sources, answer directly |
   | `product_question` | VaultFill features, pricing, comparison | Answer from product knowledge base |
   | `demo_request` | User wants to see VaultFill in action | Provide live example with their topic |
   | `objection` | Concern about accuracy, privacy, cost | Address directly and honestly |
   | `lead_signal` | Buying interest (pricing, trial, demo) | Offer next step naturally |
   | `small_talk` | Greeting, thanks, general chat | Be warm, brief, redirect to value |
   | `off_topic` | Unrelated to security/compliance/VaultFill | Politely redirect |
   | `unknown` | Can't determine intent | Ask one clarifying question |

2. **Hephaestus:** Implement two-pass architecture:
   ```typescript
   // Pass 1: Intent classification (gpt-4o-mini, fast, cheap)
   const intentResult = await generateText({
     model: openai('gpt-4o-mini'),
     system: 'Classify the user intent into exactly one of: compliance_question, product_question, demo_request, objection, lead_signal, small_talk, off_topic, unknown. Consider conversation history. Respond with ONLY the intent label.',
     messages: [...conversationHistory, { role: 'user', content: query }],
     temperature: 0,
     maxTokens: 20,
   });
   const intent = intentResult.text.trim();
   
   // Pass 2: Generate response with intent-specific prompt
   const systemPrompt = buildPromptForIntent(intent, ragContext, confidenceLevel, ...);
   ```
3. **Hephaestus:** Deprecate (but don't delete yet) the state machine. Keep `onboardingStateMachine.ts` but remove it from the active code path. Replace with intent-based routing.
4. **Athena:** Write intent-specific prompt fragments for each intent type.

**Exit Criteria:**
- [ ] Intent classifier correctly labels 90%+ of a 40-query test set
- [ ] State machine code removed from active code path
- [ ] Bot no longer auto-advances through S1→S7 funnel
- [ ] Response behavior adapts based on classified intent

---

### Task 2.3: Upgrade Generation Model for User-Facing Responses

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus |
| **Effort** | 3 hours |
| **Priority** | 🟡 P1 |
| **File** | `src/app/api/chat/route.ts` |

**Action Items:**

1. Implement dual-model architecture:
   - **`gpt-4o-mini`** for: intent classification, framework detection — fast, cheap
   - **`gpt-4o`** (or `claude-sonnet-4-20250514`) for: user-facing response generation — quality
2. Add environment variable for model selection:
   ```typescript
   const GENERATION_MODEL = process.env.SHIELDBOT_GENERATION_MODEL || 'gpt-4o';
   const CLASSIFICATION_MODEL = process.env.SHIELDBOT_CLASSIFICATION_MODEL || 'gpt-4o-mini';
   ```
3. Add token budget guards: `maxTokens: 800` for responses, `maxTokens: 20` for classification.
4. Log model usage and token counts for cost monitoring.

**Exit Criteria:**
- [ ] Response quality noticeably improved in A/B comparison (Phase 1 gpt-4o-mini vs Phase 2 gpt-4o)
- [ ] Classification still uses gpt-4o-mini (cost-efficient)
- [ ] Token usage logged per request

---

### Task 2.4: Build Response Templates for Each Intent

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena |
| **Effort** | 4 hours |
| **Priority** | 🟡 P1 |
| **Output** | Response template definitions embedded in intent-specific prompt fragments |

**Action Items:**

1. **Compliance question template:**
   ```
   [Direct answer citing vault sources with "Based on [Source, Section]:" format]
   [Key detail or relevant clarification, 1-2 sentences]
   [One natural follow-up OR value-add insight — never a redundant question]
   ```
2. **Product question template:**
   ```
   [Direct answer about VaultFill]
   [Differentiator or unique value proposition]
   [Soft call-to-action if naturally appropriate]
   ```
3. **Low-confidence / fallback template:**
   ```
   [Acknowledge the question directly]
   [State what you DO have documented that's related, if anything]
   [Offer to connect with the team: "I can connect you with our security team for a documented answer — would you like to leave your email?"]
   ```
4. **Objection handling template:**
   ```
   [Acknowledge the concern directly — don't dismiss it]
   [Address with specific evidence or honest positioning]
   [Reframe value if appropriate]
   ```
5. Encode templates into the system prompt builder.

**Exit Criteria:**
- [ ] Each intent type produces responses matching its template structure
- [ ] Compliance answers always lead with vault citations
- [ ] Product answers always include a differentiator
- [ ] Fallback answers never contain fabricated information

---

### Task 2.5: Clean Up State Machine HTML Comment Leakage

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus |
| **Effort** | 1 hour |
| **Priority** | 🟢 P2 (cosmetic but professional) |
| **File** | `src/app/api/chat/route.ts` |

**Action Items:**

1. Add a post-generation cleanup step that strips `<!-- STATE:S# -->` comments from responses before sending to the user.
2. Remove state-machine prompt fragments that instruct the LLM to emit HTML comments.

**Exit Criteria:**
- [ ] No HTML comments appear in any bot response
- [ ] Clean, professional output in all test cases

---

### Task 2.6: Define Shield Bot Persona — "Athena's Voice"

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (persona design), Creative Director (visual alignment) |
| **Effort** | 2 hours |
| **Priority** | 🟡 P1 |
| **Output** | Persona document + system prompt persona block |

**Action Items:**

1. **Athena:** Define Shield Bot persona:
   - **Expertise level:** Senior security consultant with 10+ years experience
   - **Voice:** Authoritative but approachable. Precise, not verbose. Uses industry terminology naturally (not to show off). Speaks like a trusted colleague, not a salesperson.
   - **Tone calibration by audience:**
     - CISO → Executive-level, strategic, risk-focused
     - Security engineer → Technical, specific, implementation-detail oriented
     - GRC analyst → Framework-specific, controls-mapping focused
     - General visitor → Accessible, clear, minimal jargon
   - **What the bot NEVER does:** Uses filler ("Great question!"), hedges unnecessarily, makes claims it can't back up, speaks in marketing copy
2. **Athena:** Encode persona into the system prompt as a persistent personality block.
3. **Creative Director:** Ensure chat UI typography, avatar, and interaction patterns align with persona.

**Exit Criteria:**
- [ ] Persona document authored and approved
- [ ] System prompt includes persona block
- [ ] Bot tone is consistent across 20 test interactions

---

### Phase 2 — Combined Exit Criteria & Success Metrics

| Metric | After Phase 1 | After Phase 2 |
|--------|---------------|---------------|
| **Intent classification accuracy** | N/A | ≥ 90% |
| **Response quality** (1-5 expert panel) | ~3.5 | 4.0+ |
| **Knowledge vault size** | ~30KB | ~100KB+ (with 50 golden answers) |
| **Framework-switching fluency** | Poor (fights state machine) | Smooth (intent-based) |
| **State machine HTML leakage** | Occasional | Zero |

**Metis Milestone Review:** After Phase 2, Metis reviews intent classification architecture, dual-model cost profile, and persona coherence.

---

## 4. Phase 3: Knowledge Depth — "Become the Expert" (Weeks 3–4)

**Strategic Objective:** Achieve 85%+ coverage of real compliance questionnaire topics. Build analytics to measure everything.

**Estimated Effort:** 40–50 hours  
**Priority:** 🟡 HIGH

### Task 3.1: Ingest SOC 2 Trust Service Criteria

| Attribute | Detail |
|-----------|--------|
| **Owner** | Apollo (content extraction + model answers), Hephaestus (ingestion pipeline) |
| **Effort** | 22 hours |
| **Priority** | 🔴 P0 within Phase 3 — Most requested framework |
| **Source** | AICPA TSC 2022 (free PDF download) |

**Action Items:**

1. **Apollo:** Download and extract all 60+ CC-series criteria from AICPA TSC 2022.
2. **Apollo:** Write model answers for each criterion, including Points of Focus.
3. **Apollo:** Map SOC 2 criteria to ISO 27001 Annex A controls (cross-reference).
4. **Apollo:** Author ~150 common SOC 2 audit questions mapped to criteria.
5. **Hephaestus:** Build or enhance ingestion pipeline (`npm run ingest -- --framework soc2`) per the Knowledge Vault Enrichment Plan §8.
6. **Hephaestus:** Ingest all content, verify embeddings, test retrieval.
7. **Argus:** Run retrieval quality benchmarks — Recall@5 ≥ 90%, Precision@3 ≥ 80%.

**Exit Criteria:**
- [ ] ~250 SOC 2 chunks ingested and searchable
- [ ] Bot accurately answers SOC 2 questions about CC6.1, CC7.2, CC8.1, etc.
- [ ] Cross-references to ISO 27001 present in metadata

---

### Task 3.2: Ingest CAIQ v4 (Cloud Controls Matrix)

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus (primary — structured JSON source), Apollo (model answer review) |
| **Effort** | 8 hours |
| **Priority** | 🟡 P1 — Free, structured, fast win |
| **Source** | CSA CCM v4.1 JSON/YAML (free download) |

**Action Items:**

1. **Hephaestus:** Download CAIQ v4.1 machine-readable bundle from CSA.
2. **Hephaestus:** Write parser to transform JSON/YAML → canonical ingestion format.
3. **Apollo:** Review and enhance 20% of answers requiring narrative quality improvement.
4. **Hephaestus:** Ingest all 197 control objectives (~500 chunks).
5. **Argus:** Verify retrieval quality.

**Exit Criteria:**
- [ ] ~500 CAIQ chunks ingested
- [ ] Bot answers cloud security questions with CAIQ citations

---

### Task 3.3: Ingest ISO 27001 Annex A Controls

| Attribute | Detail |
|-----------|--------|
| **Owner** | Apollo (content), Hephaestus (ingestion) |
| **Effort** | 12 hours |
| **Priority** | 🟡 P1 — Second most requested framework |
| **Source** | Free supplementary sources (DataGuard, HighTable, Scrut listings) + ISO 27002:2022 if purchased |

**Action Items:**

1. **Apollo:** Extract all 93 Annex A controls (2022 reorganization: 37 Organizational, 8 People, 14 Physical, 34 Technological).
2. **Apollo:** Write implementation guidance and model answers for each control.
3. **Apollo:** Add cross-mappings to SOC 2 TSC and NIST CSF.
4. **Hephaestus:** Ingest ~350 chunks.
5. **Argus:** Verify retrieval quality, especially cross-framework queries.

**Exit Criteria:**
- [ ] ~350 ISO 27001 chunks ingested
- [ ] Bot handles cross-framework questions ("How does encryption work across SOC 2 and ISO 27001?")

---

### Task 3.4: Implement Cross-Framework Mapping in RAG

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (design), Hephaestus (implementation) |
| **Effort** | 6 hours |
| **Priority** | 🟡 P1 |

**Action Items:**

1. **Athena:** Define cross-framework retrieval logic: when a user asks about a topic (e.g., "encryption"), the RAG system should return chunks from multiple frameworks showing coverage across SOC 2, ISO, and CAIQ.
2. **Hephaestus:** Enhance `queryKnowledgeVaultStructured()` to optionally retrieve cross-framework results:
   - Group results by `framework_id`
   - Return top result from each relevant framework
   - Provide unified context showing multi-framework coverage
3. **Athena:** Write prompt instructions for cross-framework presentation.

**Exit Criteria:**
- [ ] Query "encryption at rest" returns results from SOC 2, ISO 27001, and CAIQ
- [ ] Bot presents cross-framework coverage when multiple frameworks are relevant

---

### Task 3.5: Build Conversation Analytics Dashboard

| Attribute | Detail |
|-----------|--------|
| **Owner** | Iris (design + requirements), Hephaestus (implementation) |
| **Effort** | 8 hours |
| **Priority** | 🟢 P2 (but enables data-driven Phase 4) |

**Action Items:**

1. **Iris:** Define analytics schema:
   - Per-conversation: session_id, timestamp, messages[], intents[], confidence_levels[], fallback_triggered, lead_captured
   - Aggregated: intent distribution, fallback rate, avg conversation length, conversion rate, top queries
2. **Hephaestus:** Implement conversation logging to database (replace in-memory `Map<>` session store).
3. **Hephaestus:** Build `/api/admin/analytics` endpoint returning dashboard data.
4. **Iris:** Design weekly analytics report template.

**Exit Criteria:**
- [ ] All conversations logged to database with intent and confidence metadata
- [ ] Admin analytics endpoint returns meaningful aggregated data
- [ ] Fallback rate, intent distribution, and conversion rate are measurable

---

### Phase 3 — Combined Exit Criteria & Success Metrics

| Metric | After Phase 2 | After Phase 3 |
|--------|---------------|---------------|
| **Framework coverage** | Product + FAQ + 50 golden answers | SOC 2, ISO 27001, CAIQ, Product, FAQ |
| **Knowledge vault size** | ~100KB | 1,000+ chunks, ~500KB |
| **Fallback rate** | ~50% | < 15% |
| **Cross-framework capability** | None | Functional |
| **Analytics** | None | Full pipeline active |

**Metis Milestone Review:** After Phase 3, Metis reviews the enriched knowledge architecture, pgvector index performance, cross-framework retrieval quality, and analytics pipeline design for scaling.

---

## 5. Phase 4: Game-Changer Features — "Differentiate" (Weeks 5–8)

**Strategic Objective:** Build features no competitor has. Make the Shield Bot the reason people choose VaultFill.

**Estimated Effort:** 60–80 hours  
**Priority:** 🟢 IMPORTANT — Execute only after Phases 1-3 validate the approach with user engagement data.

### Task 4.1: Multi-Framework Cross-Referencing Engine

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (design), Apollo (cross-mapping content), Hephaestus (implementation) |
| **Effort** | 16 hours |
| **Priority** | 🔴 P0 within Phase 4 — Killer feature |

**Action Items:**

1. **Apollo:** Build complete cross-reference mapping: SOC 2 ↔ ISO 27001 ↔ CAIQ ↔ NIST CSF ↔ GDPR Articles.
2. **Athena:** Design cross-reference presentation format: "Here's how encryption is addressed across your relevant frameworks: [SOC 2 CC6.1], [ISO A.8.24], [CAIQ EKM-02.1], [NIST SC-13]."
3. **Hephaestus:** Implement cross-framework query expansion and result grouping.
4. **Creative Director:** Design rich message format for cross-framework comparison views.

**Exit Criteria:**
- [ ] Bot produces accurate cross-framework citations for 15+ compliance topics
- [ ] Presentation is clear and useful for compliance professionals

---

### Task 4.2: Questionnaire Draft Mode — Core Product Differentiator

| Attribute | Detail |
|-----------|--------|
| **Owner** | Hephaestus (implementation), Athena (conversation flow design), Apollo (answer quality) |
| **Effort** | 24 hours |
| **Priority** | 🔴 P0 within Phase 4 — The feature that makes VaultFill a product, not a demo |

**Action Items:**

1. **Athena:** Design the questionnaire draft conversation flow:
   - User uploads/pastes questionnaire questions
   - Bot identifies framework(s) and parses questions
   - Bot drafts answers for each question, citing vault sources
   - Bot flags low-confidence answers for human review
   - User can refine, approve, and export
2. **Hephaestus:** Implement:
   - Question parsing (extract individual questions from pasted/uploaded content)
   - Batch RAG retrieval (one query per question, parallelized)
   - Draft generation with per-answer confidence indicators
   - Export to markdown/JSON/CSV
3. **Apollo:** Ensure golden answers cover the most common questionnaire questions.
4. **Argus:** Quality-test 3 full questionnaire workflows end-to-end.

**Exit Criteria:**
- [ ] User can paste 10+ questions and get drafted answers with citations
- [ ] Low-confidence answers are visually flagged
- [ ] Export produces a usable deliverable

---

### Task 4.3: Confidence Indicators on Answers

| Attribute | Detail |
|-----------|--------|
| **Owner** | Creative Director (UI design), Hephaestus (implementation) |
| **Effort** | 8 hours |
| **Priority** | 🟡 P1 |

**Action Items:**

1. **Creative Director:** Design confidence indicator UI:
   - 🟢 High confidence (score > 0.55) — solid vault evidence
   - 🟡 Medium confidence (0.35-0.55) — partial evidence, may need verification
   - 🔴 Low confidence (< 0.35) — fallback, no vault evidence
2. **Hephaestus:** Include confidence metadata in API response (alongside the text).
3. **Hephaestus:** Update chat UI components to render confidence indicators.

**Exit Criteria:**
- [ ] Every answer displays appropriate confidence indicator
- [ ] Users understand what the indicators mean (tooltip/legend)

---

### Task 4.4: Proactive Insights Engine

| Attribute | Detail |
|-----------|--------|
| **Owner** | Athena (design), Apollo (insight content) |
| **Effort** | 12 hours |
| **Priority** | 🟡 P1 |

**Action Items:**

1. **Athena:** Design proactive insight system: based on conversation history and detected frameworks, suggest related topics the user should prepare for.
   - Example: User asks about SOC 2 encryption → Bot suggests: "Based on your SOC 2 focus, you should also prepare for CC7 (System Operations) and CC8 (Change Management) — these are commonly audited alongside encryption controls."
2. **Apollo:** Author 30+ insight snippets linking framework areas together.
3. **Hephaestus:** Implement as post-response enhancement: after answering the main question, optionally append a "💡 Related" section.

**Exit Criteria:**
- [ ] Bot proactively suggests relevant topics in 30%+ of compliance conversations
- [ ] Suggestions are accurate and genuinely useful

---

### Task 4.5: Rich Message Types in Chat UI

| Attribute | Detail |
|-----------|--------|
| **Owner** | Creative Director (design), Hephaestus (implementation) |
| **Effort** | 12 hours |
| **Priority** | 🟢 P2 |

**Action Items:**

1. **Creative Director:** Design rich message components aligned with the Trust Blue design system:
   - Citation cards with source preview
   - Comparison tables (framework vs framework)
   - Evidence preview panels
   - Structured answer blocks with headings
2. **Hephaestus:** Implement structured message format in API response (JSON with type annotations).
3. **Hephaestus:** Build React components to render rich messages in `FloatingChat.tsx` / `ChatWidget.tsx`.

**Exit Criteria:**
- [ ] At least 3 rich message types functional (citation card, comparison table, structured answer)
- [ ] Visual design matches Trust Blue aesthetic

---

### Task 4.6: SIG Lite Equivalent + DDQ Templates Ingestion

| Attribute | Detail |
|-----------|--------|
| **Owner** | Apollo (content authoring), Hephaestus (ingestion) |
| **Effort** | 16 hours |
| **Priority** | 🟡 P1 |

**Action Items:**

1. **Apollo:** Author VaultFill-equivalent SIG Lite questions (~128 questions covering 25 risk domains) — original content, no copyright issues.
2. **Apollo:** Author DDQ template questions for general, financial services, healthcare, and SaaS categories (~150 questions).
3. **Hephaestus:** Ingest all content (~500 chunks).
4. **Argus:** Verify retrieval quality and cross-framework accuracy.

**Exit Criteria:**
- [ ] SIG-equivalent and DDQ content ingested (~500 chunks)
- [ ] Bot handles 95%+ of real questionnaire topics

---

### Phase 4 — Combined Exit Criteria & Success Metrics

| Metric | After Phase 3 | After Phase 4 |
|--------|---------------|---------------|
| **Hallucination rate** | < 5% | 0% |
| **Fallback rate** | < 15% | < 10% |
| **Response quality** (1-5 expert panel) | 4.0+ | 4.5+ |
| **Knowledge vault size** | ~1,000 chunks | 4,000+ chunks |
| **Framework coverage** | SOC 2, ISO, CAIQ | + SIG, DDQ, GDPR, HIPAA |
| **Questionnaire draft capability** | None | Full workflow |
| **Cross-framework references** | Basic | Comprehensive |
| **Avg conversation length** | Tracked | 5+ exchanges |
| **Lead capture rate** | Tracked | > 8% |

**Metis Milestone Review:** After Phase 4, Metis conducts a comprehensive architecture audit: pgvector scaling readiness, model cost sustainability, multi-tenant isolation for the questionnaire draft feature, and production hardening recommendations.

---

## 6. Priority Sequence — The Critical Path

```
IMMEDIATE (Today/Tomorrow):
  ├─ 1.1  Security Clearance Fallback ──────────────── 3h  [Hephaestus + Athena]
  └─ 1.2  RAG Confidence Threshold ─────────────────── 2h  [Hephaestus]

WEEK 1 (Remaining):
  ├─ 1.3  Sanitize & Ingest FAQ ────────────────────── 4h  [Athena + Apollo + Hephaestus]
  ├─ 1.4  Product Knowledge Document ───────────────── 4h  [Athena + Hermes + Hephaestus]
  └─ 1.5  Citation Verification Tests ─────────────── 3h  [Argus + Hephaestus]

WEEK 2:
  ├─ 2.1  50 Golden Answers ────────────────────────── 12h [Apollo + Athena]
  ├─ 2.2  Intent Classification ────────────────────── 6h  [Hephaestus + Athena]
  ├─ 2.3  Model Upgrade (gpt-4o) ──────────────────── 3h  [Hephaestus]
  ├─ 2.4  Response Templates ──────────────────────── 4h  [Athena]
  ├─ 2.5  HTML Comment Cleanup ─────────────────────── 1h  [Hephaestus]
  └─ 2.6  Persona Definition ──────────────────────── 2h  [Athena + Creative Director]

WEEKS 3-4:
  ├─ 3.1  SOC 2 TSC Ingestion ─────────────────────── 22h [Apollo + Hephaestus]
  ├─ 3.2  CAIQ v4 Ingestion ──────────────────────── 8h  [Hephaestus + Apollo]
  ├─ 3.3  ISO 27001 Annex A ──────────────────────── 12h [Apollo + Hephaestus]
  ├─ 3.4  Cross-Framework Mapping ──────────────────── 6h  [Athena + Hephaestus]
  └─ 3.5  Analytics Dashboard ─────────────────────── 8h  [Iris + Hephaestus]

WEEKS 5-8 (execute only if Phase 1-3 engagement validates):
  ├─ 4.1  Multi-Framework Cross-Ref Engine ─────────── 16h [Athena + Apollo + Hephaestus]
  ├─ 4.2  Questionnaire Draft Mode ─────────────────── 24h [Hephaestus + Athena + Apollo]
  ├─ 4.3  Confidence Indicators UI ─────────────────── 8h  [Creative Director + Hephaestus]
  ├─ 4.4  Proactive Insights Engine ────────────────── 12h [Athena + Apollo]
  ├─ 4.5  Rich Message Types ──────────────────────── 12h [Creative Director + Hephaestus]
  └─ 4.6  SIG Lite + DDQ Templates ─────────────────── 16h [Apollo + Hephaestus]

TOTAL: ~135-175 hours across 8 weeks
```

---

## 7. Risk Register

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|-------------|--------|------------|-------|
| R1 | **GPT-4o cost overrun** at scale | Medium | Medium | Token budgets, cache top-50 answers, downgrade simple intents to gpt-4o-mini | Hephaestus |
| R2 | **Knowledge vault content staleness** | High | High | Quarterly review cycle, version tracking on all chunks, Iris monitors for drift | Apollo + Iris |
| R3 | **Prompt injection via chat input** | Medium | High | Input sanitization, separate system/user boundaries, content filtering | Hephaestus + Argus |
| R4 | **Over-engineering before product-market fit** | Medium | Medium | Phase 3-4 gated on Phase 1-2 engagement data. Kill switch on Phase 4 if analytics show low usage | Zeus + Iris |
| R5 | **LLM provider outage** (OpenAI down) | Low | Critical | Graceful degradation: cached top-50 answers, "assistant temporarily unavailable" fallback | Hephaestus |
| R6 | **FAQ claims contradict homepage** | Already happening | High | Task 1.3 directly addresses. Athena audits all claims before ingestion | Athena |
| R7 | **Agent coordination overhead** with 3 new agents | Medium | Medium | Clear ownership boundaries, Athena as Shield Bot lead reduces cross-agent confusion | Zeus |

---

## 8. Budget Considerations

| Item | Cost | Phase |
|------|------|-------|
| **GPT-4o generation** (~1000 conversations/month) | ~$15-30/month | Phase 2+ |
| **Embedding generation** (4,400 chunks × ~300 tokens) | ~$0.03 (one-time) | Phase 3 |
| **ISO 27001:2022 standard** | ~$200 (one-time) | Phase 3 |
| **ISO 27002:2022 guidance** | ~$200 (one-time) | Phase 3 |
| **Shared Assessments SIG membership** | ~$1,500/year (if pursued) | Phase 4 |
| **CAIQ v4.1 content** | Free | Phase 3 |
| **AICPA TSC 2022** | Free | Phase 3 |
| **Agent model costs** (Apollo on gpt-4o, Argus on gpt-4o-mini) | ~$20-50/month | All phases |

**Total estimated external cost for Phases 1-3:** ~$450  
**Total estimated external cost for Phase 4 (if SIG licensed):** ~$1,950

---

## 9. Definition of "Game-Changer" — How We Know We Won

The Shield Bot is a game-changer when a CISO visiting vaultfill.com has this experience:

1. **First 10 seconds:** Asks a real compliance question. Gets a cited, accurate, authoritative answer.
2. **Next 30 seconds:** Asks a follow-up. Bot demonstrates it understands the framework context and builds on the previous answer.
3. **Next 2 minutes:** Asks an out-of-scope question. Bot honestly says "I don't have documentation on that yet" — and offers to connect them with the team. CISO thinks: *"This is trustworthy."*
4. **Next 5 minutes:** Asks the bot to draft answers for their specific questionnaire. Bot produces useful first drafts with real citations.
5. **Result:** CISO leaves their email. Not because they were asked 7 times, but because the bot earned it by being genuinely useful.

**Quantified:**
- Zero hallucinated citations
- 4.5+/5 response quality on expert review
- 85%+ of real compliance questions answered from the vault
- 5+ average conversation exchanges (people WANT to keep talking)
- 8%+ lead capture rate (organic, not forced)

---

## Appendix A: Agent Quick Reference

| Agent | ID | Archetype | Primary Shield Bot Tasks |
|-------|----|-----------|--------------------------|
| **Athena** | `athena` | Conversational Intelligence Lead | Prompt design, persona, templates, conversation architecture |
| **Hephaestus** | `hephaestus` | Technical Builder | All code changes, API routes, model routing, database, deployment |
| **Hermes** | `hermes` | Sales & Communications | Prospect intelligence, FAQ accuracy, sales messaging alignment |
| **Apollo** | `apollo` | Compliance Knowledge Engineer | Golden answers, framework content, cross-mappings, citation integrity |
| **Argus** | `argus` | QA & Anti-Hallucination | Test suites, citation verification, hallucination detection, quality gates |
| **Iris** | `iris` | Analytics & User Intelligence | Conversation logging, metrics, dashboards, weekly insight reports |
| **Zeus** | `zeus` | Orchestrator | Priority arbitration, cross-agent coordination |
| **Metis** | `metis` | Systems Architect | Phase milestone reviews, scaling strategy |
| **Creative Director** | `creative-director` | UI/UX Design | Chat UI, rich messages, confidence indicators, persona visuals |

---

*This plan should be reviewed by Zeus for priority alignment with the broader VaultFill roadmap. Metis will conduct architecture reviews at each phase boundary. Execution begins immediately with Tasks 1.1 and 1.2.*

**First action: Hephaestus + Athena → Implement Security Clearance Fallback (Task 1.1) — TODAY.**
