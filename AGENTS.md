# AI Atlas — Agent Instructions

## Project

Local-first Next.js learning app for the AI Landscape Map taxonomy (~220 nodes).

## Stack

- Next.js 15 App Router, TypeScript (strict, no `any`)
- Tailwind CSS 4
- Drizzle ORM + SQLite (`data/ai-atlas.db`)
- KaTeX via `react-katex`
- RSS via `rss-parser`

## Structure

```
src/
  app/           # Pages and API routes
  components/    # UI components (explore, feed, agent)
  data/          # taxonomy.ts — single source of truth for node knowledge
  db/            # Drizzle schema and client
  lib/           # Feed fetchers, agent providers, utilities
```

## Key files

- `src/data/taxonomy.ts` — tree data + index utilities (byId, byName, search, path)
- `src/data/math-content.ts` — KaTeX formulas for math-bearing nodes
- `src/data/skillup-content.ts` + `src/data/skillup.ts` — Skillup notes/roadmap (markdown bodies + index)
- `src/lib/progress/store.ts` — progress event log queries (node_progress table)
- `src/components/progress/` — ProgressProvider context, mark buttons, dashboard
- `src/lib/agent/local-guide.ts` — deterministic guide (no API key)
- `src/lib/feed/` — arXiv, HN, RSS fetchers + keyword tagger

## Routes

- `/learn` — 3-column workspace; `/skillup` + `/skillup/[slug]` — Skillup library
- `/progress` — learning tracker dashboard; `/api/progress` — GET snapshot / POST status

## Conventions

- Node knowledge lives in `taxonomy.ts`; news lives in SQLite
- Agent provider selected via `AGENT_PROVIDER` env var
- UI: flat design, no emojis, no gradients, consistent 4/8/16/24px spacing
- Every async operation needs loading + error states

## UI/UX design

All UI/UX work must follow the **ui-ux-pro-max** skill:

- Skill file: `~/.cursor/skills/ui-ux-pro-max/SKILL.md`
- Repo: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Before designing: run the design-system generator (`scripts/search.py --design-system`)
- Stack: Next.js + Tailwind (`--stack nextjs`)
- Persist tokens to `design-system/MASTER.md` for multi-page consistency

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Integration tests
npm run db:generate  # Drizzle migrations
```

## Branch

Work on `feature/ai-atlas-v1`. Commit per section; push only when asked.
