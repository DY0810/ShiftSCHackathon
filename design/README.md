# EcoPrompt Design System

## Visual Templates (PRIMARY — the app must look like these)

| File | What It Shows | Use For |
|---|---|---|
| `DesignTemplate1.png` | Landing/hero page with headline, stats row, CTA buttons | Building the landing page at `/` |
| `DesignTemplate2.png` | Main app: split-screen chat + sustainability dashboard | Building the app interface at `/app` (or main page) |
| `Logo.png` | Green leaf gradient logo on black background | App logo in header/nav, landing page, favicon |

**These templates are the source of truth for how the MVP should look.** Match them as closely as possible.

## Style Reference Files (SECONDARY — extract tokens for implementation)

| File | Extract From It | Ignore |
|---|---|---|
| `colors.md` | Color palette, dark theme values, border colors, depth/elevation system, surface/overlay colors | Typography, layout, component examples |
| `fonts.md` | Font families (Geist Sans + Geist Mono), size scale, weight rules, letter-spacing, line-height, OpenType features | Colors, layout, component examples |
| `layout.md` | Spacing system, grid/container patterns, border-radius scale, component styling patterns, responsive breakpoints, whitespace philosophy | Colors, fonts |

**Do NOT confuse these MD files with the design templates.** The MDs define the style tokens (what colors, fonts, spacing to use). The PNGs define the actual layout and appearance (what the app looks like).

## Priority Order

1. **DesignTemplate PNGs** — match the visual layout and component arrangement
2. **colors.md** — use these exact color values
3. **fonts.md** — use these font families and sizing rules
4. **layout.md** — use these spacing and component patterns

If a style MD file conflicts with what's shown in the design templates, **the templates win**.

## Quick Reference

**Theme:** Dark mode (from `colors.md`)
- Page background: `#171717`
- Card/surface: `#1a1a2e` or slightly lighter dark surfaces
- Primary text: `#fafafa`
- Secondary text: `#b4b4b4`
- Muted text: `#898989`
- Brand green accent: `#3ecf8e` (sparingly — links, badges, highlights)
- Borders: `#242424` (subtle) → `#2e2e2e` (standard) → `#363636` (prominent)
- No shadows — depth through border contrast and transparency

**Typography:** Geist system (from `fonts.md`)
- Primary: `Geist` (sans-serif)
- Monospace: `Geist Mono`
- Display: 48px, weight 600, letter-spacing -2.4px, line-height 1.0
- Headings: 24-32px, weight 600, negative letter-spacing
- Body: 16px, weight 400, line-height 1.5
- UI/buttons: 14px, weight 500
- Three weights only: 400 (body), 500 (UI), 600 (headings)

## Key Details from Design Templates

**DesignTemplate1 (Landing Page):**
- Top bar label: "AI + AWS - Amazon Bedrock"
- Headline: "The most sustainable AI compute is the compute you never run."
- Two CTA buttons: "See the demo" (primary), "Read the architecture" (secondary/outline)
- Stats row at bottom: ~10x energy difference, 0.92 similarity threshold, 300k LLM calls avoided, 0 kg CO2

**DesignTemplate2 (App Interface):**
- Split screen: "CHAT" header left, "SUSTAINABILITY DASHBOARD" header right
- Chat messages labeled "USER" and "ECOPROMPT" (not "assistant")
- Badge format: green pill "Small model - Haiku", green pill "Cache hit - 0 LLM calls"
- Input bar: "Ask something..." placeholder with "Send" button
- Dashboard stat cards: Total Queries (with "live" indicator), Cache Hit Rate (with "X of Y served"), Energy Saved (with "X LLM calls avoided"), CO2 Avoided (with "EPA grid factors")
- Model Distribution: horizontal bar chart (not pie chart) — Cache hit / Small / Large with percentages
- Headline stat with scale projection: "At 1M queries/day with this hit rate: 500,000 server calls never happen."
- Query Log: timestamped list showing SMALL, HIT, etc.
