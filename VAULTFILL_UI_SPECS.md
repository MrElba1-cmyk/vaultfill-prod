# Vaultfill UI Specs - Cinematic Agency Palette

## Brand & Vibe
- **Brand**: Vaultfill
- **Goal**: Trust
- **Vibe**: CINEMATIC RECOMMENDED PREMIUM COMBO (Agency Cinematic Story)
- **Core Principles**: Optimized performance, purposeful hierarchy, accessible motion.

## Required Techniques
1. **Cinematic Masked Reveals**: Clip-path transitions ('sliding door' or 'iris') on large imagery.
2. **Subtle Micro-Parallax**: Link movement to scroll, capped at 4-5% of viewport height.
3. **Subtle Scroll Reveals**: Translate Y (20px -> 0px) with Opacity (0 -> 1). Snappy.
4. **Sticky Nav (Optional)**: 8-12px blur, 1px border-bottom (white/10), appears after 50px scroll.

## Style Tokens (Must Follow Exactly)
- **Spacing Scale**: 8, 16, 32, 64, 128 px
- **Type Scale**: 56, 32, 18 px
- **Radius**: 24, 48 px
- **Shadow**: deep
- **Motion**: 1000/1500ms | 100px | easeOutSine
- **Colors**: High contrast vibrant palettes.

## Page Structure
1. Video Background Hero
2. The Problem
3. The Impact
4. Work Gallery

## Component Inventory
- Floating Nav
- Cursor Follower
- Video Player

## Motion Spec
- **Scroll Reveals**: Subtle, consistent (easeOutSine).
- **Hover States**: Snap-lift + subtle shadow (140–180ms).
- **Reduced Motion**: Respect `prefers-reduced-motion`.
