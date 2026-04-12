# EcoPrompt Design System

Three reference files, each providing a specific layer of the design system. When building UI, extract ONLY the specified aspect from each file.

## How to Use Each File

| File | Extract From It | Ignore |
|---|---|---|
| `colors.md` | Color palette, dark theme values, border colors, depth/elevation system, surface/overlay colors | Typography, layout, component examples |
| `fonts.md` | Font families (Geist Sans + Geist Mono), size scale, weight rules, letter-spacing, line-height, OpenType features | Colors, layout, component examples |
| `layout.md` | Spacing system, grid/container patterns, border-radius scale, component styling patterns, responsive breakpoints, whitespace philosophy | Colors, fonts |

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

**Layout:** Component patterns (from `layout.md`)
- Base spacing unit: 8px
- Cards: 4-6px border-radius, internal padding 16-24px
- Buttons: 6px radius, 8-16px padding
- Pill badges: 9999px radius
- Split-screen: chat left ~55%, dashboard right ~45%
- Responsive: stack vertically below 768px

## Conflict Resolution

When the three files disagree (e.g., colors.md says dark theme, layout.md assumes light), always defer to:
1. `colors.md` for any color/theme decision (dark mode wins)
2. `fonts.md` for any typography decision
3. `layout.md` for spacing, sizing, and component structure
