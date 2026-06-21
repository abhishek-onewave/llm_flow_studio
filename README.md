# LLM Flow Studio

A visual workflow builder for chaining LLMs and tools. Drag nodes onto a canvas, connect them with arrows, configure instructions, and run multi-model workflows — all from the browser.

> **Status:** Frontend proof of concept. No real LLM API calls, no backend, no authentication. All execution is mocked.

## What it does

- **Visual workflow builder** — Drag-and-drop canvas powered by React Flow. Connect OpenAI, Claude, Gemini, Mistral, and 12+ other node types into directed acyclic graphs.
- **Node inspector** — Click any node to configure its model, system prompt, temperature, max tokens, and prompt template with `{{variable}}` references.
- **Mock execution engine** — Run entire workflows or individual nodes. Nodes execute in topological order with simulated streaming output, status transitions, and cost estimation.
- **Run history** — View past runs with per-node timing, token usage, cost breakdown, and output inspection.
- **Template library** — 11 pre-built workflow templates (contract review, PR review, research briefs, agent loops, etc.) filterable by category and searchable.
- **Model registry** — Browse models across 6 providers with context windows, pricing, and capability metadata. Toggle providers on/off.
- **Integrations dashboard** — 14 connectors (GitHub, Vercel, PostgreSQL, Supabase, Slack, etc.) with permission badges and status tracking.
- **File manager** — Upload, index, and manage documents. Files are chunked and made available to workflow nodes.
- **Settings** — Workspace config, team members, billing, usage limits, secrets management, and audit log placeholders.
- **Docs** — Getting-started guide with code blocks, callouts, and table of contents.
- **Landing page** — Marketing page with feature grid, workflow diagram, and CTA.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) |
| Canvas | [@xyflow/react](https://reactflow.dev) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |
| Validation | [Zod v4](https://zod.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Testing | [Jest](https://jestjs.io) + ts-jest |
| Fonts | IBM Plex Sans, Source Code Pro |

## Getting started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open in browser
open http://localhost:3000
```

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # ESLint check
pnpm test         # Run 93 unit tests
pnpm test:watch   # Run tests in watch mode
```

## Project structure

```
src/
  app/
    page.tsx                          # Landing page
    (app)/
      layout.tsx                      # App shell (sidebar + top nav)
      dashboard/page.tsx              # Dashboard with stats, runs, checklist
      workflows/
        page.tsx                      # Workflow list
        builder/page.tsx              # Visual workflow builder
      runs/
        page.tsx                      # Run history table
        [runId]/page.tsx              # Run detail with node timeline
      templates/page.tsx              # Template gallery
      models/page.tsx                 # Model registry
      integrations/page.tsx           # Integration connectors
      files/page.tsx                  # File manager
      settings/page.tsx               # Workspace settings
      docs/page.tsx                   # Documentation
  components/
    layout/                           # App shell, nav, sidebar, footer
    workflow/                         # Canvas, nodes, inspector, palette, toolbar, console
    ui/                               # shadcn/ui primitives + mascot placeholder
  lib/
    workflow/
      store.ts                        # Zustand store (nodes, edges, run state)
      node-defaults.ts                # Default configs for 18 node types
      schemas.ts                      # Zod schemas for workflow validation
      mock-runner.ts                  # Simulated workflow execution engine
      __tests__/                      # 93 unit tests
    mock/                             # Centralized mock data (workflows, runs, models, etc.)
  types/                              # TypeScript interfaces (workflow, runs, models, integrations)
docs/
  DESIGN.md                           # Design system specification
```

## Design system

The UI follows a custom design system documented in [`docs/DESIGN.md`](docs/DESIGN.md):

- **Canvas:** `#eeefe9` (cream) — no shadows, no gradients, no glassmorphism
- **Cards:** `#ffffff` on cream with `1px #bfc1b7` borders and `6px` radius
- **Primary CTA:** `#f7a501` (amber) — used sparingly, only for primary actions
- **Typography:** IBM Plex Sans everywhere, monospace for code
- **Spacing:** 24px card padding, 80px section rhythm, 56px nav height

## Workflow node types

The builder supports 18 node types across four categories:

**LLM nodes** — OpenAI, Claude, Gemini, Mistral, OpenRouter, Custom Model

**Tool nodes** — File Reader, File Writer, GitHub, Vercel, Database, HTTP API, Web Search, Code Executor

**Logic nodes** — Condition, Human Approval

**I/O nodes** — Input, Output

## Tests

93 unit tests covering non-visual workflow logic:

- **Store tests** — CRUD operations, React Flow callbacks, localStorage persistence
- **Node defaults** — Config generation for all 18 node types
- **Schema validation** — Zod schemas for LLM configs, tool configs, conditions, workflows
- **Mock runner** — Topological sort, downstream traversal, execution lifecycle, pause/resume/stop

```bash
pnpm test
```

## Current limitations

This is a frontend POC. The following are intentionally not implemented:

- No real LLM API calls (all outputs are mocked)
- No backend server or database
- No user authentication or authorization
- No real file uploads or processing
- No payment processing
- Workflows persist to `localStorage` only

## License

Private. All rights reserved.
