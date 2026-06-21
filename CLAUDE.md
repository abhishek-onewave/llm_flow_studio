# CLAUDE.md

## Project

We are building **LLM Flow Studio**, a web-based visual workflow builder for chaining LLMs and tools.

Users can:
- Drag LLM/tool nodes onto a canvas.
- Connect nodes with arrows.
- Click a node to configure instructions.
- Run a whole workflow or individual nodes.
- Inspect intermediate outputs.
- Chat with node outputs.
- Save and reuse workflows.

## Current milestone

Build a front-end proof of concept only.

Do not build real backend integrations yet.
Do not call real LLM APIs yet.
Do not add authentication yet.
Do not add payments yet.
Do not add production databases yet.

First milestone:
- Landing page
- Dashboard
- Workflow builder
- LLM node inspector
- Mock workflow execution
- Run detail page
- Templates page
- Models page
- Integrations page
- Files page
- Settings page
- Docs/help page

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- @xyflow/react for workflow canvas
- Zustand for front-end state
- Zod for runtime schemas
- lucide-react for icons
- localStorage for temporary workflow persistence

## Design source of truth

Use these in this order:

1. Stitch MCP screen data
2. `docs/DESIGN.md`
3. Exported screenshots in `design/stitch/`

If Stitch conflicts with `docs/DESIGN.md`, follow `docs/DESIGN.md`.

## Visual design rules

The design must follow the PostHog-inspired design analysis in `docs/DESIGN.md`, but do not use PostHog name, logo, or copyrighted mascot assets.

Use:
- Canvas: `#eeefe9`
- Primary CTA: `#f7a501`
- Primary CTA pressed: `#dd9001`
- On primary: `#23251d`
- Ink/headings: `#23251d`
- Body text: `#4d4f46`
- Muted text: `#6c6e63`
- Hairline border: `#bfc1b7`
- Soft hairline: `#dcdfd2`
- Soft surface: `#e5e7e0`
- Card surface: `#ffffff`
- Doc surface: `#fcfcfa`
- Dark code surface: `#23251d`
- On dark: `#ffffff`

Typography:
- Use IBM Plex Sans Variable everywhere.
- Use ui-monospace or Source Code Pro for code.
- Body text should feel tight and developer-tool-like.
- Do not introduce decorative fonts.

Shapes:
- Use mostly 6px border radius.
- Use 4px for smaller controls.
- Use full pill radius only for filters and pill CTAs.

Layout:
- Marketing pages use 80px major section rhythm.
- App pages use tighter spacing.
- Product cards use 24px padding.
- Pricing or large setup cards may use 32px padding.
- Nav height should be 56px.
- Doc/sidebar width should be around 240px.

Do not:
- Do not use shadows.
- Do not use gradients.
- Do not use glassmorphism.
- Do not use dark SaaS hero sections.
- Do not use neon AI styling.
- Do not use generic blue/purple AI gradients.
- Do not overuse yellow.
- Do not make cards overly rounded.
- Do not use actual PostHog branding or assets.

Mascots:
- Use simple original placeholder mascot components only.
- The mascot can be an original AI hedgehog / robot-hog doodle.
- Keep it small and marginal, like sketchbook decoration.
- Do not import external mascot images.

## Stitch MCP workflow

Before implementing any visual page:
1. Use Stitch MCP to inspect the relevant screen.
2. Summarize the layout, colors, spacing, typography, and components.
3. Compare the screen against `docs/DESIGN.md`.
4. Implement clean reusable React components.
5. Do not paste raw exported HTML as production code unless specifically asked.

## Code style

- Use TypeScript strictly.
- Prefer small reusable components.
- Prefer composition over giant page files.
- Put reusable UI in `src/components`.
- Put workflow-specific UI in `src/components/workflow`.
- Put mock data in `src/lib/mock`.
- Put workflow state/types in `src/lib/workflow` and `src/types`.
- Use Zod for schemas when useful.
- Keep server components and client components clearly separated.
- Add `"use client"` only where required.

## Workflow builder rules

Use @xyflow/react.

Required layout:
- Top workflow toolbar
- Left node palette
- Center workflow canvas
- Right node inspector
- Bottom run console

MVP node types:
- Input
- OpenAI
- Claude
- Gemini
- Mistral
- OpenRouter
- Custom model
- File Reader
- File Writer
- GitHub
- Vercel
- Database
- HTTP API
- Web Search
- Code Executor
- Human Approval
- Condition
- Output

MVP behavior:
- User can add nodes.
- User can connect nodes.
- User can select nodes.
- User can edit node label, provider, model, instructions, and prompt template.
- User can run a mock workflow.
- User can run one mock node.
- User can see mock streaming output.
- Workflow saves to localStorage.

## Commands

Use these after implementation tasks:

```bash
pnpm lint
pnpm build
```

## Verification rules

Every implementation task must end with:

- `pnpm lint`
- `pnpm build`
- A summary of changed files
- Any known issues

For visual pages:

- Compare against Stitch MCP design.
- Compare against exported screenshots when available.
- List visible differences and fix major mismatches.

## Security

- Never commit real API keys.
- Never add secrets to code.
- Use `.env.example` only.
- Do not call real LLM providers during the front-end POC.
- Do not run destructive commands.
- Ask before adding new dependencies.
