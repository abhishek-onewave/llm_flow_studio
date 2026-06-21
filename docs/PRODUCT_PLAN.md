# LLM Flow Studio Product Plan

## Product

LLM Flow Studio is a visual workspace where users build AI workflows by connecting LLMs and tools.

## Core idea

Users drag nodes onto a canvas:

Input
→ LLM
→ LLM
→ Tool
→ Output

Each LLM node has:
- Provider
- Model
- Instructions
- Prompt template
- Input mapping
- Output format
- Execution output
- Run/Pause/Stop controls

## MVP

The first version is front-end only with mock execution.

Pages:
- Landing
- Dashboard
- Workflow builder
- Run detail
- Templates
- Models
- Integrations
- Files
- Settings
- Docs/help

Core interactions:
- Drag nodes
- Connect nodes
- Select node
- Configure node
- Run mock workflow
- Show mock streaming output
- Save workflow to localStorage

## Later backend

After front-end POC:
- Auth
- Postgres
- Workflow persistence
- Real LLM provider adapters
- Model registry
- Execution engine
- File storage
- GitHub integration
- Vercel integration
- Database connectors
