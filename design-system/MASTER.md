# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** AI Atlas
**Updated:** 2026-07-05
**Palette Source:** [Coolors — 0A0E13 / 363434 / 322217 / 554940 / 394B5A](https://coolors.co/palette/0a0e13-363434-322217-554940-394b5a)
**Category:** Educational Productivity Tool (dark theme)

---

## Global Rules

### Color Palette (Raw)

| Swatch | Hex | Name |
|--------|-----|------|
| Near-Black Blue | `#0A0E13` | Main background, gradient base |
| Dark Warm Gray | `#363434` | Elevated surfaces, cards |
| Dark Coffee Brown | `#322217` | Secondary surfaces, hover fills, warm gradient tint |
| Warm Taupe | `#554940` | Borders, muted elements, dividers |
| Slate Blue | `#394B5A` | Primary interactive: buttons, links, active states |

### Derived Tones

The raw palette has no light accent, so light text/accent tones are derived from
the slate and taupe hues while keeping WCAG contrast:

| Tone | Hex | Derived From | Role |
|------|-----|--------------|------|
| Lifted Slate | `#7FA3C0` | `#394B5A` | Accent: icons, section labels, links, glows |
| Slate Strong | `#A7C4DB` | `#394B5A` | Accent hover / emphasis |
| Cream | `#E8D5C4` | `#554940` | Highlight: badges, active tree item, active nav |
| Cream Strong | `#F2E4D8` | `#554940` | Highlight hover |
| Warm Tan | `#C8A88E` | `#554940` | Warm mid-tone accents (charts, gradients) |
| Primary Lifted | `#4A6075` | `#394B5A` | Button hover |
| Warm White | `#F2EFEC` | — | Primary text |

### Semantic Token Mapping

| Role | Value | CSS Variable | Contrast Notes |
|------|-------|--------------|----------------|
| Background | `#0A0E13` | `--color-background` | Gradient: `#0A0E13 → #10151C → #0A0E13` |
| Surface | `rgba(44,42,43,0.72)` | `--color-surface` | Glass panels tinted from `#363434` |
| Surface Strong | `rgba(54,52,52,0.90)` | `--color-surface-strong` | Drawers, modals |
| Foreground | `#F2EFEC` | `--color-foreground` | 16.9:1 on background |
| Muted Foreground | `rgba(242,239,236,0.64)` | `--color-muted-foreground` | ~9:1 on background |
| Primary | `#394B5A` | `--color-primary` | Buttons, active fills |
| On Primary | `#F2EFEC` | `--color-on-primary` | 7.4:1 on primary |
| Primary Lifted | `#4A6075` | `--color-primary-lifted` | Button hover (keeps light text) |
| Accent | `#7FA3C0` | `--color-accent` | 6.7:1 on background — labels, icons, links |
| Accent Strong | `#A7C4DB` | `--color-accent-strong` | Hover emphasis |
| Highlight | `#E8D5C4` | `--color-highlight` | 12.5:1 on background — badges, active states |
| Border | `rgba(138,122,109,0.32)` | `--color-border` | Lifted taupe at reduced opacity |
| Border Strong | `rgba(138,122,109,0.52)` | `--color-border-strong` | Emphasis dividers |
| Destructive | `#E0897A` | `--color-destructive` | Warm salmon, harmonized |
| Ring | `#7FA3C0` | `--color-ring` | Focus rings (accent) |

**Color Notes:** Near-black blue base with warm gray/brown surfaces and slate-blue
interactivity. Interactive glows and data-flow arrows use lifted slate
(`rgba(127,163,192,…)`); warm fills and hover tints use taupe/coffee
(`rgba(138,122,109,…)`, `rgba(50,34,23,…)`). Highlights (badges, active tree items)
use derived cream `#E8D5C4`, never raw `#554940`, which is too dark for text.

### Progress Status Colors (learning tracker)

| Status | Color | Usage |
|--------|-------|-------|
| Not started | `rgba(242,239,236,0.28)` gray dot | Tree indicator |
| Reading | `#C8A88E` warm tan | Tree dot, buttons, bars |
| Understood | `#7FA3C0` lifted slate | Tree dot, buttons, bars |
| Mastered | `#E8D5C4` cream | Tree dot, buttons, bars |

### Typography

- **Heading Font:** Lora (warm serif, educational, grounded)
- **Body Font:** Source Sans 3 (clean, professional, highly readable)
- **Mood:** dark, warm, focused, professional
- **Google Fonts:** [Lora + Source Sans 3](https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap)

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
| `--shadow-sm` | `0 1px 2px rgba(3, 5, 8, 0.5)` | Subtle lift |
| `--shadow-md` | `0 8px 20px rgba(3, 5, 8, 0.45)` | Cards, buttons |
| `--shadow-lg` | `0 20px 40px rgba(3, 5, 8, 0.55)` | Modals, drawers |
| `--shadow-xl` | `0 30px 60px rgba(3, 5, 8, 0.6)` | Featured panels |
| `--glow-accent` | `0 0 0 1px rgba(127,163,192,0.35), 0 8px 24px rgba(127,163,192,0.14)` | Interactive hover glow |

---

## Component Specs

### Buttons

```css
/* Primary CTA — slate blue, light text on hover too */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid rgba(127, 163, 192, 0.35);
}
.btn-primary:hover {
  background: var(--color-primary-lifted);
}

/* Secondary — slate outline */
.btn-secondary {
  background: transparent;
  color: var(--color-accent);
  border: 1px solid rgba(127, 163, 192, 0.4);
}
```

### Cards

```css
.card {
  background: var(--color-surface);       /* warm gray glass */
  border: 1px solid var(--color-border);  /* taupe at 32% */
  backdrop-filter: blur(14px);
}
```

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons — use Lucide SVG icons
- ❌ Hardcoded teal/mint/navy hex values from the previous palette
- ❌ Raw `#554940` or `#322217` as text color — too dark; use derived cream/tan
- ❌ Low contrast text — 4.5:1 minimum for body, 3:1 for large UI
- ❌ Missing cursor:pointer on clickable elements
- ❌ Instant state changes — use 150–300ms transitions
- ❌ Invisible focus states

---

## Pre-Delivery Checklist

- [ ] Semantic tokens only (no per-component hex overrides)
- [ ] Dark mode text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Loading/skeleton states on async content
- [ ] Responsive: 375px, 768px, 1024px, 1440px
