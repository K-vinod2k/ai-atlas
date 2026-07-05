# AI Atlas

Interactive learning app for the AI Landscape Map — explore ~165 taxonomy nodes with definitions, math, cross-links, a live news feed, and an offline guide agent.

## Features

- **Explore** — zoomable tree + node detail pages with KaTeX math formulas and symbol walkthroughs
- **News** — arXiv (cs.LG/cs.CL/cs.AI), Hacker News, and lab blog RSS, auto-tagged to map nodes
- **Guide** — deterministic local agent (no API key): explain, compare, route, navigate

## Setup

```bash
cd ai-atlas
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/explore`.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `./data/ai-atlas.db` | SQLite database path |
| `AGENT_PROVIDER` | `local` | `local`, `anthropic`, or `openai` |
| `ANTHROPIC_API_KEY` | — | Dormant until set |
| `OPENAI_API_KEY` | — | Dormant until set |
| `FEED_STALE_HOURS` | `6` | Hours before feed is considered stale |

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run typecheck    # TypeScript check
npm run test         # Integration tests
npm run db:generate  # Drizzle migrations
```

## Project structure

```
src/
  data/          taxonomy.ts — single source of truth (~165 nodes)
  app/           Next.js pages and API routes
  components/    Explore, feed, and agent UI
  db/            Drizzle + SQLite schema
  lib/           Feed fetchers, agent providers
```

## Data sources

Taxonomy ported from the AI Landscape Map canvas (`AI-landscape-map.canvas.tsx`). Node knowledge lives in `src/data/taxonomy.ts`; news items live in SQLite.

## Agent commands

- `explain attention` — node definition + math
- `compare RAG vs fine-tuning` — side-by-side
- `route MCP` — which layer a term belongs to
- `find transformer` — search nodes
- `help` — list commands

## Branch

Development on `feature/ai-atlas-v1`.
