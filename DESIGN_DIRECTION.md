# VaultFill — Design Direction

> Premium, security-focused aesthetic for a $500/mo enterprise security product.

---

## Brand Identity

**Positioning:** Enterprise-grade security questionnaire automation.
**Tone:** Authoritative, trustworthy, precise. Not playful — professional.
**Benchmark Products:** Linear, Vercel, Stripe, 1Password.

---

## Color System — "Trust Blue" Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--vf-black` | `#09090B` | Page background (zinc-950) |
| `--vf-surface` | `#18181B` | Card/panel backgrounds (zinc-900) |
| `--vf-surface-elevated` | `#27272A` | Elevated surfaces, hover states (zinc-800) |
| `--vf-border` | `rgba(255,255,255,0.08)` | Subtle borders, dividers |
| `--vf-border-active` | `rgba(255,255,255,0.15)` | Active/hover borders |
| `--vf-text-primary` | `#FAFAFA` | Headlines, primary copy (zinc-50) |
| `--vf-text-secondary` | `#A1A1AA` | Body text, descriptions (zinc-400) |
| `--vf-text-muted` | `#71717A` | Metadata, captions (zinc-500) |
| **Trust Blue (Primary)** | `#3B82F6` | Primary accent — CTAs, links, key highlights (blue-500) |
| **Trust Blue Light** | `#60A5FA` | Hover states, secondary accents (blue-400) |
| **Trust Blue Glow** | `rgba(59,130,246,0.15)` | Ambient glow, radial gradients |
| **Trust Blue Ring** | `rgba(59,130,246,0.30)` | Focus rings, active borders |
| **Success** | `#22C55E` | Status indicators, verification badges (green-500) |
| **Warning** | `#F59E0B` | Low-confidence flags (amber-500) |

### Gradient Definitions
- **Hero glow:** `radial-gradient(70% 50% at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 65%)`
- **Card shimmer:** `linear-gradient(135deg, rgba(59,130,246,0.05) 0%, transparent 50%)`
- **CTA button:** `linear-gradient(to bottom, #3B82F6, #2563EB)` with `ring-1 ring-blue-400/30`

---

## Typography

| Element | Font | Weight | Size | Line-Height | Tracking |
|---------|------|--------|------|-------------|----------|
| H1 (Hero) | Geist Sans | 700 (bold) | 56px / 3.5rem | 1.1 | -0.025em |
| H2 (Section) | Geist Sans | 600 (semibold) | 36px / 2.25rem | 1.2 | -0.02em |
| H3 (Card title) | Geist Sans | 600 | 20px / 1.25rem | 1.3 | -0.01em |
| Body | Geist Sans | 400 | 16px / 1rem | 1.75 | 0 |
| Body Large | Geist Sans | 400 | 18px / 1.125rem | 1.75 | 0 |
| Caption | Geist Sans | 500 | 12px / 0.75rem | 1.5 | 0.02em |
| Code/Mono | Geist Mono | 400 | 14px / 0.875rem | 1.6 | 0 |

---

## Spacing & Layout

- **Max content width:** 1152px (72rem / max-w-6xl)
- **Section vertical padding:** 96px (py-24)
- **Card padding:** 32px (p-8)
- **Card border-radius:** 16px (rounded-2xl)
- **Component gap:** 24px standard, 32px between sections
- **Hero top padding:** 80px minimum

---

## Component Patterns

### Cards
- Background: `bg-zinc-900/50` with `backdrop-blur-sm`
- Border: `ring-1 ring-white/[0.08]`
- Hover: `ring-white/[0.15]` + subtle `translate-y-[-2px]` transition
- No heavy shadows — rely on border + background contrast

### Buttons
- **Primary CTA:** Trust Blue gradient, white text, `ring-1 ring-blue-400/30`, `shadow-lg shadow-blue-500/20`
- **Secondary:** `bg-white/5 ring-1 ring-white/10`, white text, hover `bg-white/10`
- **Ghost:** text-only, `hover:text-white` transition
- Border-radius: 12px (rounded-xl)
- Padding: `px-6 py-3` (comfortable click target)

### Badges / Pills
- Background: `bg-blue-500/10`
- Text: `text-blue-400`
- Border: `ring-1 ring-blue-500/20`
- Border-radius: full

### Trust Indicators
- Green dot + label for verified/active status
- Shield icon for security features
- Lock icon for encryption references
- Checkmark badges for compliance (SOC 2, ISO 27001, GDPR)

---

## Animation Guidelines

- **Entrance:** `fade-in` + `translate-y-[10px]` with `duration-500 ease-out`
- **Hover transitions:** `duration-200 ease-in-out`
- **Stagger children:** 50-75ms delay between siblings
- **No bouncing, spinning, or attention-seeking animation**
- **Scroll-triggered reveals:** Intersection Observer, once-only

---

## Hero Section Specifications

### Headline Strategy
- Primary: **"Automate Your Security Questionnaires."**
- Subtext: Value proposition emphasizing speed, accuracy, and trust
- Trust Blue gradient text on key word ("Automate" or "Security")

### Hero Layout
- Left: Copy + dual CTA + trust badges
- Right: Live product preview (questionnaire card with citations)
- Background: Single Trust Blue radial glow from top-center

### Social Proof Bar (below hero)
- Muted enterprise logos (grayscale, `opacity-40 hover:opacity-70`)
- Caption: "Trusted by security teams at..."
- Horizontal scroll on mobile

---

## Sections Architecture

1. **Nav** — Logo + links + single CTA (sticky on scroll)
2. **Hero** — Headline + sub + dual CTA + product preview
3. **Social Proof** — Logo bar
4. **Features** — 2x2 grid, icon + title + description
5. **How It Works** — 3-step horizontal flow with numbered badges
6. **Security Credentials** — Compliance badges + architecture trust signals
7. **Testimonials** — Quote cards (when available)
8. **Pricing** — Single premium tier card
9. **Final CTA** — Full-width gradient card
10. **Footer** — Links + legal + trust badges

---

## Key Principles

1. **Whitespace is premium.** Don't fill every pixel. Let content breathe.
2. **One accent color.** Trust Blue only. No rainbow gradients.
3. **Dark ≠ gloomy.** Use surface elevation and subtle borders for depth.
4. **Every element earns its place.** If it doesn't convert or build trust, cut it.
5. **Mobile-first responsive.** Enterprise buyers check on phones too.

---

_This document is the single source of truth for VaultFill's visual direction. All implementation should reference these tokens and patterns._
