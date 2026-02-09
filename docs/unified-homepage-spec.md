# Unified Homepage Spec — vaultfill.com

> Generated 2026-02-09. This document defines the canonical section order and component mapping for the unified VaultFill homepage, merging the production site (main branch `page.tsx`) with the preview site's privacy-first additions (commit `8b9686e`).

---

## Section Order

| # | Section | Source |
|---|---------|--------|
| 1 | Sandbox Mode Banner | Preview |
| 2 | Hero | Production |
| 3 | Security Trust Cards | Preview |
| 4 | Live Questionnaire Demo | Production |
| 5 | Privacy Promise | Preview |
| 6 | Knowledge Vault + Search & Fill Demo | Production |
| 7 | Capabilities (4 feature cards) | Production |
| 8 | 3-Step Workflow | Production |
| 9 | Social Proof | Preview |
| 10 | FAQ | Production |
| 11 | "Try It" CTA | Preview |
| 12 | Footer | Production |
| 13 | FloatingChat Widget | Preview |

---

## Section Details

### 1 · Sandbox Mode Banner

- **Source:** Preview site (commit `8b9686e`)
- **Component:** `SandboxBanner`
- **Source file:** `src/components/SandboxBanner.tsx`
- **Exists on main?** ❌ No — was added in `8b9686e` but later removed/lost.
- **Description:** Full-width emerald-green banner pinned above the header. Contains a shield icon, a "Sandbox Mode" pill badge, and body text: *"You're in a private sandbox. No account needed…"*. Dismissible via an × button (state stored locally so it stays dismissed).

---

### 2 · Hero

- **Source:** Production site (main branch)
- **Component:** Inline JSX in `Home` (the `<motion.section>` immediately inside `<main>`)
- **Source file:** `src/app/page.tsx` — Hero section (lines ~120–250 approx.)
- **Exists on main?** ✅ Yes
- **Description:**
  - Headline: *"Eliminate Security Questionnaire Pain: Save 400+ hours and cut compliance costs by 85%."*
  - Two CTAs: **Start Free Trial** (opens lead modal) + **See the workflow** (anchor `#how-it-works`)
  - Compliance badges inline: SOC 2 Type II · ISO 27001 · GDPR · AES-256
  - Right column: animated questionnaire draft card (3 Q&A items with citation badges, "8 minutes / 47 of 52" stats)

---

### 3 · Security Trust Cards (4-grid)

- **Source:** Preview site (commit `8b9686e`)
- **Component:** `TrustBadges`
- **Source file:** `src/components/TrustBadges.tsx`
- **Exists on main?** ❌ No — was added in `8b9686e` but later removed/lost.
- **Description:** A 4-column responsive grid of glassmorphism cards in emerald tones. Each card has an icon + title + short description:
  1. **No Data Stored** — sessions are ephemeral
  2. **End-to-End Encrypted** — AES-256 / TLS 1.3
  3. **SOC 2 Ready** — audit-ready architecture
  4. **Anonymous by Default** — no PII required

---

### 4 · Live Questionnaire Demo

- **Source:** Production site
- **Component:** `LivePreview`
- **Source file:** `src/components/LivePreview.tsx`
- **Exists on main?** ✅ Yes
- **Description:** Interactive document selector (SOC 2 Type II, ISO 27001, Global Privacy Policy) with four extraction fields (Info-Sec roles, Asset management, Access control, Audit trail). Calls `/api/chat` with `mode: "extract"` to fetch real AI-generated answers. Wrapped in `<ErrorBoundary>`.

---

### 5 · Privacy Promise

- **Source:** Preview site (commit `8b9686e`)
- **Component:** Does not exist as a standalone component. Was inline JSX added to `page.tsx` in `8b9686e`.
- **Source file:** N/A (needs to be created or inlined)
- **Exists on main?** ❌ No
- **Description:** A centered messaging block emphasizing VaultFill's **zero-knowledge architecture**. Key points: no data stored server-side after session ends, no training on customer data, tenant-isolated processing. Visually: emerald accent border or background, concise paragraph + bullet points.

---

### 6 · Knowledge Vault + Search & Fill Demo

- **Source:** Production site
- **Component:** Inline JSX in `Home` — the large 8-col bento card inside the Features section
- **Source file:** `src/app/page.tsx` — within the `#features` `<motion.section>` (the `md:col-span-8` card)
- **Exists on main?** ✅ Yes
- **Description:** Bento-style card titled *"Your evidence becomes a compounding asset."* Shows 6 tag chips (Policies, SOC 2, ISO Artifacts, Pen Tests, Customer Docs, Standard Answers) representing indexed document types. For the unified page this section should be extracted from the features grid and promoted to its own standalone section.

---

### 7 · Capabilities (4 feature cards)

- **Source:** Production site
- **Component:** Inline JSX in `Home` — the `features` array + bento grid
- **Source file:** `src/app/page.tsx` — `#features` section
- **Exists on main?** ✅ Yes
- **Description:** Four feature cards rendered in a bento grid:
  1. 🛡️ Automated Questionnaire Drafting
  2. 🔗 RAG-Powered Citations
  3. 📚 Evidence Knowledge Vault
  4. 🔒 Security-First Architecture

---

### 8 · 3-Step Workflow

- **Source:** Production site
- **Component:** `WorkflowDemo`
- **Source file:** `src/components/WorkflowDemo.tsx`
- **Exists on main?** ✅ Yes
- **Description:** Interactive 3-step animated demo:
  1. **Ingest Evidence** — document upload & indexing animation
  2. **Generate Drafts** — RAG question-matching with citation generation
  3. **Approve & Export** — review and export flow
  Auto-plays through steps; users can also click to navigate.

---

### 9 · Social Proof

- **Source:** Preview site
- **Component:** Does not exist as a standalone component.
- **Source file:** N/A (needs to be created). The current main branch has a simple "Trusted by" section with placeholder names (Acme Corp, TechVault, etc.).
- **Exists on main?** ❌ No (current "Trusted by" strip is a placeholder, not this section)
- **Description:**
  - **Stats counters:** animated number counters (e.g., hours saved, questionnaires completed, customers)
  - **Scrolling company ticker:** Meridian Health, NovaPay, Spektra Cloud, Ironclad Labs, ClearVault, Apex Financial, SentryOps, TrueNorth Cyber — infinite horizontal scroll animation
  - **3 Testimonial cards:**
    - **Sarah Chen** — CISO perspective
    - **James Okafor** — Compliance lead perspective
    - **Anna Lindqvist** — Security engineer perspective

---

### 10 · FAQ

- **Source:** Production site
- **Component:** Inline JSX in `Home` — the `faqs` array + 2-col bento grid
- **Source file:** `src/app/page.tsx` — `#faq` section
- **Exists on main?** ✅ Yes
- **Description:** Four Q&A cards in a 2-column grid:
  1. What questionnaire formats do you support?
  2. How is this different from Vanta or Drata?
  3. Is our data safe?
  4. How fast can we see results?

---

### 11 · "Try It" CTA

- **Source:** Preview site
- **Component:** Does not exist as a standalone component.
- **Source file:** N/A (needs to be created)
- **Exists on main?** ❌ No
- **Description:** A call-to-action block encouraging visitors to interact with the FloatingChat widget. Headline: *"Try it yourself"*. Body: *"Use the chat bubble in the corner to ask a security question."* Includes 3 example prompt chips users can click to auto-fill the chat:
  - "How does encryption at rest work?"
  - "What are your MFA requirements?"
  - "Tell me about SOC 2 compliance"

---

### 12 · Footer

- **Source:** Production site
- **Component:** Inline JSX in `Home` — `<footer>` element
- **Source file:** `src/app/page.tsx`
- **Exists on main?** ✅ Yes
- **Description:** Contains the ApexLogo, "VaultFill" branding, "Houston-born" pill, and links: Privacy · Terms · Security · © year.

---

### 13 · FloatingChat Widget

- **Source:** Preview site (originally added earlier, refined in privacy-first commit)
- **Component:** `FloatingChat`
- **Source file:** `src/components/FloatingChat.tsx`
- **Exists on main?** ✅ Yes (component exists but is **not** rendered on the homepage — `page.tsx` does not import or mount it)
- **Description:** Fixed bottom-right chat bubble. Opens into a full chat panel with welcome message, suggested questions, and AI responses via `/api/chat`. Includes onboarding state machine integration and analytics tracking. Must be added to the homepage layout or page.

---

## Component Inventory Summary

| Component | File | On main? | Action needed |
|-----------|------|----------|---------------|
| `SandboxBanner` | `src/components/SandboxBanner.tsx` | ❌ | Recreate from `8b9686e` |
| `TrustBadges` | `src/components/TrustBadges.tsx` | ❌ | Recreate from `8b9686e` |
| `PrivacyPromise` | N/A | ❌ | Create new component |
| `SocialProof` | N/A | ❌ | Create new component |
| `TryItCTA` | N/A | ❌ | Create new component |
| `LivePreview` | `src/components/LivePreview.tsx` | ✅ | No change |
| `WorkflowDemo` | `src/components/WorkflowDemo.tsx` | ✅ | No change |
| `FloatingChat` | `src/components/FloatingChat.tsx` | ✅ | Mount on homepage |
| Hero (inline) | `src/app/page.tsx` | ✅ | No change |
| Features (inline) | `src/app/page.tsx` | ✅ | Extract Knowledge Vault into own section |
| FAQ (inline) | `src/app/page.tsx` | ✅ | No change |
| Footer (inline) | `src/app/page.tsx` | ✅ | No change |

---

## Recovery Notes

- Commits `8b9686e` (privacy-first UI) and `8f17c38` (onboarding state machine) contain the preview-site code. Components were added but later lost during branch consolidation (commit `4c7c8cb`).
- `git show 8b9686e:src/components/SandboxBanner.tsx` and `git show 8b9686e:src/components/TrustBadges.tsx` can be used to recover the original implementations.
- The `dangling-recovery` and `dangling-recovery-onboarding` branches may also contain relevant code.
