# Operational Hierarchy: VaultFill Project

This document outlines the chain of command, agent interactions, decision-making flow, and cost-optimization strategy for the VaultFill project.

---

## 1. Chain of Command

### Founder (Abdul)
- Ultimate authority, strategic vision, final decision-maker
- Sets priorities, approves major architectural changes, controls budget

### Zeus (Main Agent — Orchestrator)
- Central project manager receiving directives from the Founder
- Delegates tasks to specialized agents, manages inter-agent communication
- Consolidates reports, ensures project momentum
- Primary interface between Founder and all specialized agents

### Metis (Systems Architect Agent)
- Strategic advisor for systems thinking, scaling, and infrastructure
- Designs blueprints for the VaultFill ecosystem
- Engaged at phase milestones and critical architectural decisions (not daily ops)
- Ensures all efforts align with a scalable, automated, product-led model

### Technical Agent
- Implements features (API routes, database schemas, AI chat, evidence processing)
- Fixes bugs, deploys code, manages CI/CD pipeline
- Owns: Next.js app, Prisma schema, API routes, Vercel deployment

### Creative Director Agent
- UI/UX design, mobile responsiveness, animations
- Brand consistency and premium aesthetic across all surfaces

### Sales & Marketing Agent
- Outreach strategy, lead generation, funnel tracking
- Marketing assets and competitive intelligence

---

## 2. System Components & Agent Ownership

| Component | Owner | Technology |
|---|---|---|
| Frontend (Landing + Chat) | Creative / Technical | Next.js 16, React 19, Framer Motion, Tailwind |
| Shield Bot (AI Chat API) | Technical | Vercel AI SDK, OpenAI GPT, `/api/chat` |
| Lead Capture & CRM | Technical / Sales | `/api/leads`, Prisma + PostgreSQL |
| Knowledge Base & RAG | Technical | pgvector, `/api/knowledge`, vector-search |
| Evidence Upload | Technical | `/api/evidence/upload`, PDF parsing |
| Health Monitoring | Technical | `/api/cron/health` (daily), Telegram alerts |
| Email (Transactional) | Technical | SendGrid (contact@vaultfill.com) |
| Alerting | Technical | Telegram Bot API |
| Hosting & CI/CD | Technical | Vercel (auto-deploy from Git) |
| Database | Technical | Vercel Postgres (PostgreSQL + pgvector) |

---

## 3. Decision-Making Flow

```
Founder (Abdul)
    │
    ▼
Zeus (Orchestrator)
    │
    ├──► Metis (Architecture reviews at milestones)
    │       │
    │       └──► Strategic blueprints feed back to Zeus
    │
    ├──► Technical Agent (implementation)
    │       │
    │       └──► Code → Git → Vercel auto-deploy
    │
    ├──► Creative Director (design)
    │       │
    │       └──► UI specs → Technical Agent implements
    │
    └──► Sales & Marketing (growth)
            │
            └──► Lead data → Technical Agent integrates
```

**Escalation path:** Agent → Zeus → Founder (for budget/strategic decisions)

---

## 4. Metis Engagement Protocol

**TRIGGERS:**
1. Project kickoff — initial architecture audit
2. Phase milestones — end of MVP, beta, v1.0
3. Project completion — final audit & scale-ready recommendations
4. Critical issues — architectural emergencies only (on-demand)

**METIS DOES NOT:**
- Participate in daily/weekly routine operations
- Auto-wake for routine checks
- Handle tactical execution (that's Zeus + specialized agents)

---

## 5. Cost Optimization

**Status:** Optimized and Maintained.

- **Metis (opus)** reserved for high-level architecture — reduces expensive model usage
- **Specialized agents** iterate independently within their domains
- **Zeus** translates Metis blueprints into actionable directives
- **Separation of concerns** minimizes context switching and redundant LLM calls
- Metis defines the *what* and *why*; execution agents determine the *how*
