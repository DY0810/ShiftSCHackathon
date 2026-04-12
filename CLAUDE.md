# EcoPrompt Project Instructions

## Model Settings

Use Opus with max effort (`/model opus max`) for all work in this project.

## Project Structure

- `plans/ecoprompt-mvp.md` — 6-phase MVP blueprint
- `design/` — Design system (colors, fonts, layout). Read `design/README.md` first.
- `EcoPrompt_Project_Spec.md` — Full project spec
- `ecoprompt/` — Next.js app (created in Phase 1)

## Tech Stack

- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Amazon Bedrock (Claude Haiku/Sonnet + Titan Embeddings v2)
- Amazon DynamoDB (query cache + metrics)
- Vercel for hosting

## Conventions

- Hackathon project — optimize for speed-to-demo, not production robustness
- Minimal error handling, no tests unless they speed up development
- Push all changes to github.com/DY0810/ShiftSCHackathon
