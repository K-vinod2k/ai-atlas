# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** AI Atlas
**Updated:** 2026-07-05
**Palette Source:** [Color Hunt — 607456 / EEE0CC / BA6A4C / 7B2525](https://colorhunt.co/palette/607456eee0ccba6a4c7b2525)
**Category:** Educational Productivity Tool

---

## Global Rules

### Color Palette (Raw)

| Swatch | Hex | Name |
|--------|-----|------|
| Sage Green | `#607456` | Primary brand / navigation / links |
| Warm Cream | `#EEE0CC` | Page background |
| Terracotta | `#BA6A4C` | Accent highlights, warm emphasis |
| Deep Burgundy | `#7B2525` | Body text / foreground |

### Semantic Token Mapping

| Role | Hex | CSS Variable | Contrast Notes |
|------|-----|--------------|----------------|
| Background | `#EEE0CC` | `--color-background` | Warm cream base |
| Surface | `#FFFBF6` | `--color-surface` | Elevated cards on cream |
| Foreground | `#7B2525` | `--color-foreground` | 7.6:1 on background |
| Muted Foreground | `#6B5244` | `--color-muted-foreground` | 5.6:1 on background (secondary text) |
| Primary | `#607456` | `--color-primary` | Sage — links, active nav, badges |
| On Primary | `#FFFFFF` | `--color-on-primary` | 5.1:1 on primary |
| Secondary | `#8FA87C` | `--color-secondary` | Light sage — tags, subtle fills |
| Accent | `#BA6A4C` | `--color-accent` | Terracotta — highlights, warm emphasis |
| Accent CTA | `#96553D` | `--color-accent-cta` | Darkened terracotta — 5.7:1 with white button text |
| On Accent | `#FFFFFF` | `--color-on-accent` | CTA button label |
| Muted | `#E4D9C8` | `--color-muted` | Skeletons, subtle fills |
| Border | `#C4B5A0` | `--color-border` | Warm tan dividers |
| Destructive | `#9B2C2C` | `--color-destructive` | Harmonized with burgundy family |
| Ring | `#607456` | `--color-ring` | Focus rings (primary) |

**Color Notes:** Earthy sage + warm cream + terracotta accent + burgundy text. Derived tokens (surface, muted, border, accent-cta) are palette-tinted for WCAG AA contrast. Primary green is for UI chrome and large labels, not small body copy.

### Typography

Baloo 2 / Comic Neue were replaced — too playful for this earthy, editorial palette.

- **Heading Font:** Lora (warm serif, educational, grounded)
- **Body Font:** Source Sans 3 (clean, professional, highly readable)
- **Mood:** warm, educational, professional, approachable, earthy
- **Google Fonts:** [Lora + Source Sans 3](https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(123, 37, 37, 0.06)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(123, 37, 37, 0.08)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(123, 37, 37, 0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(123, 37, 37, 0.12)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary CTA — darkened terracotta for WCAG AA */
.btn-primary {
  background: var(--color-accent-cta);
  color: var(--color-on-accent);
}

/* Secondary — sage outline */
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent);
}
```

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons — use Lucide SVG icons
- ❌ Hardcoded teal/cyan hex values — use semantic tokens
- ❌ Low contrast text — 4.5:1 minimum for body, 3:1 for large UI
- ❌ Missing cursor:pointer on clickable elements
- ❌ Instant state changes — use 150–300ms transitions
- ❌ Invisible focus states

---

## Pre-Delivery Checklist

- [ ] Semantic tokens only (no per-component hex overrides)
- [ ] Light mode text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Loading/skeleton states on async content
- [ ] Responsive: 375px, 768px, 1024px, 1440px
