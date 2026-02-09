# VaultFill Onboarding Flow — Implementation Specification

> **Document Type:** Technical Implementation Spec  
> **Created:** 2026-02-09  
> **Author:** Metis (Systems Architect)  
> **Audience:** Technical Agent / Frontend Engineer  
> **Depends On:** `onboarding_state_machine.md` (canonical state machine)  
> **Status:** Ready for Implementation

---

## 0. Current State Assessment

The existing `ChatWidget.tsx` / `FloatingChat.tsx` is a **stateless Q&A bot**:
- No state machine — every message hits `/api/chat` with raw conversation history
- No session state beyond `localStorage` message persistence
- No pain classification, no branching, no demo flow
- Welcome message is generic technical support copy
- No analytics events fired

**This spec transforms it into the state-machine-driven onboarding flow.**

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────┐
│  React Client (FloatingChat.tsx)            │
│  ┌───────────────────────────────────────┐  │
│  │  useOnboardingMachine (XState v5)     │  │
│  │  - holds current state                │  │
│  │  - exposes send(event)                │  │
│  │  - mirrors to sessionStorage          │  │
│  └──────────┬────────────────────────────┘  │
│             │ events                         │
│  ┌──────────▼────────────────────────────┐  │
│  │  ChatRenderer                         │  │
│  │  - renders bot messages per state     │  │
│  │  - renders quick-reply buttons        │  │
│  │  - renders inline demo components     │  │
│  └──────────┬────────────────────────────┘  │
│             │ API calls (pain classify,      │
│             │ lead store, analytics)         │
└─────────────┼───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│  API Routes                                  │
│  POST /api/onboarding/classify  (pain NLP)   │
│  POST /api/onboarding/lead      (lead store) │
│  POST /api/onboarding/analytics (events)     │
│  POST /api/chat                 (existing)   │
└──────────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│  Server State (Redis / Vercel KV)            │
│  Key: session:{session_id}                   │
│  TTL: 24h                                    │
│  Stores: OnboardingSession object            │
└──────────────────────────────────────────────┘
```

---

## 2. Data Structures

### 2.1 `OnboardingSession` (server + client mirror)

```typescript
interface OnboardingSession {
  sessionId: string;               // `onb_${timestamp}_${random}`
  state: OnboardingState;          // current XState state value
  painTag: PainTag | null;         // classified pain point
  painConfidence: number;          // 0-1 classifier confidence
  greetingAnswer: 'manual' | 'tool' | 'exploring' | null;
  retryCount: number;              // irrelevant input retries in current state
  clarifyCount: number;            // vague input clarifications in PROBLEM_ID
  demoProgress: {
    questionnaire: boolean;        // DEMO_QUESTIONNAIRE completed
    citation: boolean;             // DEMO_CITATION completed
  };
  leadCaptured: {
    type: 'email' | 'soft' | null;
    email: string | null;
  };
  meta: {
    pageUrl: string;
    referrer: string;
    utmParams: Record<string, string>;
    startedAt: string;             // ISO timestamp
    completedAt: string | null;
    returningUser: boolean;
    previousPainTag: PainTag | null;
  };
  messageHistory: ChatMessage[];   // last 20 messages for display
}

type OnboardingState =
  | 'IDLE'
  | 'GREETING'
  | 'PROBLEM_ID'
  | 'PROBLEM_ID_DEEP'
  | 'DEMO'
  | 'DEMO_QUESTIONNAIRE'
  | 'DEMO_CITATION'
  | 'LEAD_CAPTURE'
  | 'LEAD_CAPTURE_EMAIL'
  | 'LEAD_CAPTURE_SOFT'
  | 'COMPLETE'
  | 'EXIT_GRACEFUL';

type PainTag =
  | 'pain:time_waste'
  | 'pain:accuracy'
  | 'pain:scale'
  | 'pain:cost'
  | 'pain:none';
```

### 2.2 `ChatMessage` (enhanced)

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;               // ISO
  metadata?: {
    stateAtTime: OnboardingState;  // state when message was sent
    quickReplies?: QuickReply[];   // buttons to show below message
    demoComponent?: 'questionnaire' | 'citation'; // inline demo
    isTypingAnimation?: boolean;   // render with typing effect
  };
}

interface QuickReply {
  label: string;
  value: string;
  event: string;                   // XState event name to fire
}
```

### 2.3 `PainClassification` (API response)

```typescript
interface PainClassification {
  tag: PainTag;
  confidence: number;              // 0-1
  rawInput: string;
  reasoning: string;               // LLM reasoning (for debugging)
}
```

---

## 3. Conversation Branches — Complete Script

### 3.1 IDLE → GREETING

**Trigger:** `user_opens_chat` (user clicks FAB or sends first message)

**Proactive bubble** (optional): If user is on `/pricing` and idle >15s, show teaser bubble:
> "Have questions about pricing? I can help. 💬"

**Bot message on open:**
> "Hey — quick question. How are you currently handling security questionnaires?"

**Quick replies:**
| Label | Value | Event |
|-------|-------|-------|
| 📋 Manually in spreadsheets | `manual` | `USER_RESPONDS` |
| 🔧 Using another tool | `tool` | `USER_RESPONDS` |
| 👀 Just exploring | `exploring` | `USER_RESPONDS` |

**Free-text handling:** If user types instead of tapping a quick reply, classify intent:
- Contains "manual", "spreadsheet", "excel", "google sheet" → `manual`
- Contains "tool", "using", "currently use", product names → `tool`
- Contains "exploring", "looking", "curious", "browsing" → `exploring`
- Unclassifiable → increment `retryCount`, rephrase:
  > "No worries! Just trying to point you to the right thing. Are you handling questionnaires manually, using a tool, or just exploring?"
- `retryCount >= 2` → skip to PROBLEM_ID with `greetingAnswer: null`

**Timeout (60s no response):**
> "No worries at all. If questionnaires ever become a headache, we're here. 🛡️"  
→ `EXIT_GRACEFUL`

---

### 3.2 GREETING → PROBLEM_ID

**Trigger:** `USER_RESPONDS` with classified `greetingAnswer`

**Branch A — `manual`:**
> "Got it — spreadsheets and manual work. How many questionnaires does your team handle per month? Ballpark is fine."

Quick replies: `1-5` | `5-15` | `15+` | `Not sure`

**Branch B — `tool`:**
> "What's the biggest frustration with your current tool?"

Quick replies: `Slow / manual steps` | `Inaccurate answers` | `Hard to integrate` | `Too expensive`

**Branch C — `exploring`:**
> "No worries. Most teams find us when questionnaires start eating 20+ hrs/week. Sound familiar?"

Quick replies: `Yeah, that's us` | `Not yet, just curious` | `Show me what you do`

**Free-text classification for pain tags:**

| Detected Keywords/Patterns | Pain Tag | Confidence Threshold |
|---|---|---|
| hours, manual, slow, tedious, time, forever, weekend | `pain:time_waste` | ≥ 0.6 |
| errors, wrong, outdated, inaccurate, stale, incorrect | `pain:accuracy` | ≥ 0.6 |
| growing, more clients, enterprise, scale, volume | `pain:scale` | ≥ 0.6 |
| expensive, consultant, budget, cost, pricing | `pain:cost` | ≥ 0.6 |
| (none match or confidence < 0.6) | `pain:none` | — |

**Vague input handling:** If classifier confidence < 0.6 and no quick-reply match:
- `clarifyCount < 2`: Ask follow-up:
  > "Could you tell me a bit more? What's the most annoying part of your current process?"
- `clarifyCount >= 2`: Default to `pain:none`, proceed to PROBLEM_ID_DEEP

---

### 3.3 PROBLEM_ID → PROBLEM_ID_DEEP

**Trigger:** `PAIN_IDENTIFIED` (pain tag assigned with confidence ≥ 0.6, or defaulted to `pain:none`)

**Amplification messages by tag:**

| Tag | Bot Message |
|-----|-------------|
| `pain:time_waste` | "Yeah — the average security team spends 40+ hrs/month on questionnaires. We cut that to under 4. Want to see how?" |
| `pain:accuracy` | "Outdated answers are a deal-killer. VaultFill pulls from your live security vault — every answer is cited and current. Want a quick look?" |
| `pain:scale` | "Scaling questionnaire responses without scaling headcount is exactly what we built for. Quick 60-second demo?" |
| `pain:cost` | "Most teams spend $15K+/yr on consultants for this. VaultFill replaces that. Want to see the workflow?" |
| `pain:none` | "Here's a 60-second look at how it works — no commitment." |

**Quick replies (all tags):** `Yes, show me` | `Not right now`

**"Not right now" → EXIT_GRACEFUL** with resource drop:
> "Totally fine. Here's our security questionnaire automation guide if you want to explore on your own: [link]. I'm always here if you have questions. 🛡️"

**Pivot handling:** If user brings up a new topic instead of confirming, re-run pain classifier and loop back to PROBLEM_ID with new context.

---

### 3.4 PROBLEM_ID_DEEP → DEMO

**Trigger:** `USER_CONFIRMS_PAIN` (affirmative response detected)

**Affirmative detection:** "yes", "sure", "show me", "let's see", "go ahead", "demo", "yeah", quick-reply tap

**Bot transition message:**
> "Great — here's a quick look. Imagine you just received this security questionnaire question..."

→ Auto-advance to `DEMO_QUESTIONNAIRE` after 1.5s delay

---

### 3.5 DEMO_QUESTIONNAIRE (Substate)

**Render:** Inline demo component (not a chat message — a React component embedded in the message stream)

**Sequence:**
1. Bot shows sample question card:
   > **Sample Question:** "Does your organization encrypt data at rest and in transit?"
2. Typing animation (1.5s) simulating VaultFill processing
3. Generated answer appears with typing effect:
   > **VaultFill Answer:** "Yes. All data at rest is encrypted using AES-256. Data in transit is protected via TLS 1.2+. Encryption keys are managed through AWS KMS with automatic rotation."
4. Confidence badge renders: **97% confidence**
5. Source citation tag: `📎 SOC 2 Type II Report, Section 4.2`

**Component:** `<DemoQuestionnaire onComplete={() => send('STEP_COMPLETE')} />`

**Auto-advance:** After answer fully renders + 2s pause → fire `STEP_COMPLETE` → transition to `DEMO_CITATION`

**User can skip:** If user types during demo, bot responds:
> "Hang on — almost done with the demo. Just a few more seconds!"
(Queue their message for after demo completes)

---

### 3.6 DEMO_CITATION (Substate)

**Bot message:**
> "See that citation? Every VaultFill answer traces back to your actual documentation. Your auditor sees exactly where each answer came from."

**Render:** Citation trail component showing:
```
📎 Source Trail:
├── SOC 2 Type II Report → Section 4.2 (Encryption Controls)
├── AWS KMS Configuration Doc → Page 12
└── Internal Security Policy v3.1 → §6.3
```

**Differentiator callout:**
> "Unlike other tools that guess, VaultFill cites. Every. Single. Answer."

**Auto-advance:** 2s after citation renders → fire `STEP_COMPLETE` → transition to `LEAD_CAPTURE`

---

### 3.7 DEMO → LEAD_CAPTURE

**Trigger:** `DEMO_COMPLETE` (both demo substates finished)

**2s pause, then bot message:**
> "That's VaultFill in action. Want me to set up a pilot with your actual documents? Drop your work email and I'll have the team reach out today."

**Quick replies:** `Sure, here's my email` | `Not ready yet` | `I have more questions`

**"I have more questions"** → Transition to existing Q&A mode (current `/api/chat`) but keep session state. After Q&A, re-present lead capture.

---

### 3.8 LEAD_CAPTURE_EMAIL

**Trigger:** User provides email (free text or after tapping "Sure, here's my email")

**Email extraction:** Regex `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` from user message.

**Validation:**
- Format valid → accept
- Personal domain (gmail, yahoo, hotmail) → soft nudge:
  > "Got it! If you have a work email, that helps us set up the pilot faster. Otherwise, this works too."
- Invalid → ask again:
  > "Hmm, that doesn't look like an email. Mind trying again?"

**On valid email captured:**
> "Perfect — you'll hear from us within 2 hours. In the meantime, here's our security automation whitepaper: [link]"

**Data stored (POST `/api/onboarding/lead`):**
```json
{
  "email": "user@company.com",
  "painTag": "pain:time_waste",
  "greetingAnswer": "manual",
  "demoCompleted": true,
  "sourcePage": "/pricing",
  "utmParams": { "source": "google", "medium": "cpc" },
  "sessionDuration": 145000,
  "messageCount": 12
}
```

→ Transition to `COMPLETE`

---

### 3.9 LEAD_CAPTURE_SOFT

**Trigger:** `DECLINES_EMAIL` — user says "not ready", "no thanks", "maybe later"

**Bot message:**
> "Totally fine. Here's a link to try it yourself — no signup needed: [sandbox link]. If you want to chat later, I'm always here."

**Data stored:**
```json
{
  "anonymousSessionId": "onb_...",
  "painTag": "pain:time_waste",
  "demoCompleted": true,
  "softCtaClicked": true
}
```

→ Transition to `COMPLETE`

---

### 3.10 EXIT_GRACEFUL (from any state)

**Triggers:**
- Explicit: user says "bye", "no thanks", "not interested", closes widget
- Timeout: 60s in GREETING, 120s in other states
- Max retries exceeded

**Bot message:**
> "No worries at all. If questionnaires ever become a headache, we're here. 🛡️"

**If `painTag` was set, append resource:**
> "Here's a quick guide that might help: [relevant link based on painTag]"

---

## 4. Guardrails — Preventing Premature Lead Capture

### 4.1 State Gate

**Hard rule:** The `LEAD_CAPTURE` state is ONLY reachable through `DEMO_CITATION → step_complete`. There is no shortcut.

```typescript
// XState guard — reject any transition to LEAD_CAPTURE unless demo is complete
LEAD_CAPTURE: {
  entry: ['fireDemoCompleteEvent'],
  // Can only enter from DEMO_CITATION
  always: {
    target: 'DEMO',
    cond: (ctx) => !ctx.demoProgress.questionnaire || !ctx.demoProgress.citation,
  },
}
```

### 4.2 No Email Ask Before Demo

- The bot NEVER mentions email, signup, or contact info before `LEAD_CAPTURE` state
- System prompt for any LLM calls includes:
  > "NEVER ask for the user's email, name, or contact information. NEVER mention signing up, scheduling a call, or any lead capture action."
- This instruction is removed only when state === `LEAD_CAPTURE*`

### 4.3 No Form Fields in Chat

- No inline form components appear before `LEAD_CAPTURE`
- Quick replies are conversational, never resembling a form

### 4.4 Classifier Confidence Gate

- Pain classification requires confidence ≥ 0.6 to advance to `PROBLEM_ID_DEEP`
- Below 0.6 → clarifying question (up to 2x), then default to `pain:none`
- Prevents premature personalization on weak signals

### 4.5 Demo Completion Verification

```typescript
// Both flags must be true before LEAD_CAPTURE transition fires
function canTransitionToLeadCapture(ctx: OnboardingSession): boolean {
  return ctx.demoProgress.questionnaire === true
      && ctx.demoProgress.citation === true;
}
```

### 4.6 Returning User Bypass (Controlled)

- Returning users who previously completed demo MAY skip to `LEAD_CAPTURE`
- But only if their previous session reached `DEMO_CITATION` or beyond
- Bot confirms: "Welcome back! Want to pick up where we left off?"
- User must explicitly confirm before jumping ahead

---

## 5. Handoff Points

### 5.1 Demo → Lead Capture

| Signal | Action |
|--------|--------|
| `DEMO_CITATION.step_complete` | 2s delay → auto-transition to `LEAD_CAPTURE` |
| Bot says | "That's VaultFill in action. Want me to set up a pilot..." |
| Quick replies | `Sure, here's my email` / `Not ready yet` / `I have more questions` |

### 5.2 Lead Capture → CRM Pipeline

| Lead Type | CRM Action | SLA |
|-----------|-----------|-----|
| Email captured | Create contact in CRM, tag with `pain_tag`, assign to sales | Follow-up within 2 hours |
| Soft CTA | Create anonymous lead, tag with pain_tag, add to nurture sequence | No direct outreach |

### 5.3 Onboarding → Q&A Mode

If user asks a question at any point that's clearly a product/technical question (not onboarding flow):
- Route to existing `/api/chat` knowledge base
- Keep onboarding state intact
- After Q&A exchange, gently re-enter flow:
  > "Great question! Now, back to what I was showing you..."

Detection: If user message doesn't match any expected onboarding response AND matches a knowledge-base query pattern, treat as Q&A detour.

---

## 6. Analytics Events — Complete Mapping

### 6.1 Event Definitions

```typescript
interface AnalyticsEvent {
  event: string;
  sessionId: string;
  timestamp: string;
  properties: Record<string, any>;
}
```

### 6.2 Event Catalog

| Event Name | Fired At | Properties |
|---|---|---|
| `onboarding_start` | IDLE → GREETING | `sessionId`, `pageUrl`, `referrer`, `utmParams`, `returningUser` |
| `greeting_response` | GREETING → PROBLEM_ID | `greetingAnswer`, `inputMethod` (`quick_reply` \| `free_text`) |
| `greeting_timeout` | GREETING → EXIT_GRACEFUL | `timeoutDuration` |
| `greeting_retry` | Irrelevant input in GREETING | `retryCount`, `rawInput` |
| `pain_identified` | PROBLEM_ID → PROBLEM_ID_DEEP | `painTag`, `painConfidence`, `rawInput`, `greetingAnswer` |
| `pain_clarify` | Vague input in PROBLEM_ID | `clarifyCount`, `rawInput` |
| `pain_amplified` | PROBLEM_ID_DEEP message sent | `painTag`, `amplificationVariant` |
| `demo_accepted` | PROBLEM_ID_DEEP → DEMO | `painTag`, `timeInProblemId` (ms) |
| `demo_declined` | PROBLEM_ID_DEEP → EXIT_GRACEFUL | `painTag` |
| `demo_started` | → DEMO_QUESTIONNAIRE | `painTag` |
| `demo_step_complete` | Each demo substate completes | `stepName` (`questionnaire` \| `citation`), `stepDuration` (ms) |
| `demo_complete` | Both substates done | `totalDemoDuration` (ms), `painTag` |
| `lead_capture_shown` | → LEAD_CAPTURE | `painTag`, `demoDuration` |
| `lead_email_captured` | LEAD_CAPTURE_EMAIL → COMPLETE | `emailDomain`, `painTag`, `sessionDuration`, `isPersonalEmail` |
| `lead_soft_accepted` | LEAD_CAPTURE_SOFT → COMPLETE | `painTag`, `sessionDuration` |
| `lead_declined` | LEAD_CAPTURE → EXIT_GRACEFUL | `painTag` |
| `qa_detour` | User asks off-topic question mid-flow | `currentState`, `questionPreview` (first 50 chars) |
| `onboarding_complete` | → COMPLETE | `completionType` (`email` \| `soft`), `painTag`, `totalDuration`, `messageCount`, `statesVisited[]` |
| `onboarding_exit` | → EXIT_GRACEFUL | `lastState`, `painTag`, `exitReason` (`timeout` \| `user_exit` \| `max_retries`), `sessionDuration` |
| `returning_user_detected` | Session restore from cookie | `previousPainTag`, `previousLastState` |
| `widget_opened` | FAB clicked | `pageUrl`, `timeOnPageBeforeOpen` (ms) |
| `widget_closed` | Close button or click-away | `currentState`, `sessionDuration` |

### 6.3 Implementation

```typescript
// Client-side analytics helper
function trackOnboarding(event: string, properties: Record<string, any>) {
  // 1. Fire to /api/onboarding/analytics (server-side storage)
  fetch('/api/onboarding/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, sessionId, timestamp: new Date().toISOString(), properties }),
  }).catch(() => {}); // fire-and-forget

  // 2. Push to window analytics (GA4, Segment, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties);
  }
}
```

---

## 7. XState Machine Definition (Skeleton)

```typescript
// src/lib/onboarding-machine.ts
import { createMachine, assign } from 'xstate';

export const onboardingMachine = createMachine({
  id: 'onboarding',
  initial: 'IDLE',
  context: {
    sessionId: '',
    painTag: null,
    painConfidence: 0,
    greetingAnswer: null,
    retryCount: 0,
    clarifyCount: 0,
    demoProgress: { questionnaire: false, citation: false },
    leadCaptured: { type: null, email: null },
    meta: { pageUrl: '', referrer: '', utmParams: {}, startedAt: '', completedAt: null, returningUser: false, previousPainTag: null },
  },
  states: {
    IDLE: {
      on: {
        USER_OPENS_CHAT: 'GREETING',
      },
    },
    GREETING: {
      entry: ['sendGreetingMessage', 'trackOnboardingStart'],
      after: {
        60000: 'EXIT_GRACEFUL', // 60s timeout
      },
      on: {
        USER_RESPONDS: {
          target: 'PROBLEM_ID',
          actions: ['setGreetingAnswer', 'trackGreetingResponse'],
        },
        IRRELEVANT_INPUT: [
          { target: 'GREETING', cond: 'canRetry', actions: ['incrementRetry', 'sendRetryMessage', 'trackGreetingRetry'] },
          { target: 'PROBLEM_ID', actions: ['trackGreetingRetry'] }, // max retries exceeded
        ],
      },
    },
    PROBLEM_ID: {
      entry: ['sendProblemIdQuestion'],
      on: {
        PAIN_IDENTIFIED: {
          target: 'PROBLEM_ID_DEEP',
          cond: 'painConfidenceSufficient',
          actions: ['setPainTag', 'trackPainIdentified'],
        },
        VAGUE_INPUT: [
          { target: 'PROBLEM_ID', cond: 'canClarify', actions: ['incrementClarify', 'sendClarifyMessage'] },
          { target: 'PROBLEM_ID_DEEP', actions: ['setDefaultPainNone'] },
        ],
        USER_EXITS: 'EXIT_GRACEFUL',
        HARD_RESET: 'GREETING',
      },
    },
    PROBLEM_ID_DEEP: {
      entry: ['sendAmplificationMessage', 'trackPainAmplified'],
      on: {
        USER_CONFIRMS_PAIN: {
          target: 'DEMO',
          actions: ['trackDemoAccepted'],
        },
        PIVOT_TOPIC: {
          target: 'PROBLEM_ID',
          actions: ['resetClarifyCount'],
        },
        USER_EXITS: {
          target: 'EXIT_GRACEFUL',
          actions: ['sendResourceDrop'],
        },
      },
    },
    DEMO: {
      initial: 'DEMO_QUESTIONNAIRE',
      entry: ['trackDemoStarted'],
      states: {
        DEMO_QUESTIONNAIRE: {
          entry: ['renderQuestionnaireDemo'],
          on: {
            STEP_COMPLETE: {
              target: 'DEMO_CITATION',
              actions: ['markQuestionnaireComplete', 'trackDemoStep'],
            },
          },
        },
        DEMO_CITATION: {
          entry: ['renderCitationDemo'],
          on: {
            STEP_COMPLETE: {
              target: '#onboarding.LEAD_CAPTURE',
              cond: 'demoFullyComplete',
              actions: ['markCitationComplete', 'trackDemoStep', 'trackDemoComplete'],
            },
          },
        },
      },
      on: {
        USER_EXITS: 'EXIT_GRACEFUL',
      },
    },
    LEAD_CAPTURE: {
      entry: ['sendLeadCaptureMessage', 'trackLeadCaptureShown'],
      on: {
        PROVIDES_EMAIL: {
          target: 'LEAD_CAPTURE_EMAIL',
          cond: 'validEmailFormat',
          actions: ['setEmail'],
        },
        INVALID_EMAIL: {
          target: 'LEAD_CAPTURE',
          actions: ['sendEmailRetryMessage'],
        },
        DECLINES_EMAIL: {
          target: 'LEAD_CAPTURE_SOFT',
        },
        HAS_QUESTIONS: {
          // Detour to Q&A, will re-enter LEAD_CAPTURE
          actions: ['enterQAMode'],
        },
        USER_EXITS: 'EXIT_GRACEFUL',
      },
    },
    LEAD_CAPTURE_EMAIL: {
      entry: ['storeLead', 'sendConfirmationMessage', 'trackEmailCaptured'],
      always: 'COMPLETE',
    },
    LEAD_CAPTURE_SOFT: {
      entry: ['storeSoftLead', 'sendSandboxLink', 'trackSoftCta'],
      always: 'COMPLETE',
    },
    COMPLETE: {
      type: 'final',
      entry: ['trackOnboardingComplete', 'setCompletedTimestamp'],
    },
    EXIT_GRACEFUL: {
      type: 'final',
      entry: ['sendExitMessage', 'trackOnboardingExit'],
    },
  },
});
```

---

## 8. API Routes to Create

### 8.1 `POST /api/onboarding/classify`

**Purpose:** Classify user free-text input for pain tag and intent.

**Request:**
```json
{
  "message": "We spend like 30 hours a month on these questionnaires",
  "context": { "currentState": "PROBLEM_ID", "greetingAnswer": "manual" }
}
```

**Response:**
```json
{
  "painTag": "pain:time_waste",
  "confidence": 0.92,
  "intent": "pain_expression",
  "reasoning": "User mentions specific hours spent monthly"
}
```

**Implementation:** Few-shot OpenAI call with this system prompt:
```
You classify user messages about security questionnaire pain points.
Return JSON with: painTag (pain:time_waste|pain:accuracy|pain:scale|pain:cost|pain:none), confidence (0-1), intent (pain_expression|affirmative|negative|question|off_topic|greeting), reasoning.
```

### 8.2 `POST /api/onboarding/lead`

**Purpose:** Store captured leads.

**Request:** Lead data object (see §3.8)  
**Response:** `{ success: true, leadId: "..." }`  
**Storage:** Vercel KV or Supabase. Encrypt email at rest.

### 8.3 `POST /api/onboarding/analytics`

**Purpose:** Server-side analytics event storage.

**Request:** `AnalyticsEvent` object  
**Response:** `{ ok: true }`  
**Storage:** Append to analytics table/log. Batch-forward to GA4/Segment if configured.

### 8.4 `POST /api/onboarding/session`

**Purpose:** Persist/restore session state for returning users.

**Methods:**
- `GET ?sessionId=...` — restore session
- `POST` — save session snapshot
- Uses Redis/KV with 24hr TTL

---

## 9. Component Inventory (to build)

| Component | Location | Purpose |
|---|---|---|
| `useOnboardingMachine` | `src/hooks/useOnboardingMachine.ts` | XState hook, sessionStorage sync, analytics bridge |
| `OnboardingChat` | `src/components/OnboardingChat.tsx` | Replaces current FloatingChat internals with state-driven flow |
| `QuickReplyButtons` | `src/components/chat/QuickReplyButtons.tsx` | Tappable response buttons below bot messages |
| `DemoQuestionnaire` | `src/components/chat/DemoQuestionnaire.tsx` | Inline demo — question + animated answer + confidence |
| `DemoCitation` | `src/components/chat/DemoCitation.tsx` | Inline demo — citation trail visualization |
| `TypingAnimation` | `src/components/chat/TypingAnimation.tsx` | Character-by-character text reveal |
| `ConfidenceBadge` | `src/components/chat/ConfidenceBadge.tsx` | Animated confidence score pill |
| `onboardingMachine` | `src/lib/onboarding-machine.ts` | XState v5 machine definition |
| `classifyPain` | `src/lib/classify-pain.ts` | Client-side keyword pre-filter + API call |

---

## 10. Migration Plan

1. **Keep existing `/api/chat` and `FloatingChat.tsx` untouched** — the onboarding flow wraps around them
2. New `OnboardingChat` component replaces `FloatingChat` in the layout
3. Once onboarding reaches `COMPLETE` or user asks a product question, delegate to existing chat API
4. Feature flag: `NEXT_PUBLIC_ONBOARDING_V2=true` gates the new flow
5. A/B test: 50% old widget, 50% onboarding flow, measure conversion lift

---

## 11. Cookie & Returning User Spec

```typescript
// Cookie name: vf_onb
// Value: JSON { sessionId, lastState, painTag, timestamp }
// Max-age: 30 days
// SameSite: Strict, Secure, HttpOnly: false (needs client read)
// First-party, functional — GDPR Art. 6(1)(f) exempt

function detectReturningUser(): PreviousSession | null {
  const cookie = getCookie('vf_onb');
  if (!cookie) return null;
  const prev = JSON.parse(cookie);
  if (Date.now() - prev.timestamp > 30 * 24 * 60 * 60 * 1000) return null;
  return prev;
}
```

If returning user detected AND previous `lastState` ∈ {`DEMO`, `DEMO_QUESTIONNAIRE`, `DEMO_CITATION`, `LEAD_CAPTURE*`, `COMPLETE`}:
> "Welcome back! Want to pick up where we left off, or start fresh?"

Quick replies: `Pick up where I left off` | `Start fresh`

---

*This spec is the complete implementation guide for the VaultFill onboarding chat flow. It translates the state machine architecture into exact code structures, conversation scripts, and integration points. The Technical Agent should implement components in the order listed in §9, starting with the XState machine definition.*
