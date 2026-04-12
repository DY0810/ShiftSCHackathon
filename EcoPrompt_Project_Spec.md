# EcoPrompt — AI Usage Efficiency Layer

## Project Type
Hackathon project. Ethics-focused hackathon. Must incorporate AI and AWS.

## One-Line Summary
A standalone web app with a split-screen interface — AI chat on the left, sustainability dashboard on the right — that eliminates redundant compute, right-sizes model selection, and visualizes the environmental cost of AI usage in real time.

## Delivery Format
Standalone Next.js web application. NOT a Chrome extension, browser plugin, or wrapper around third-party chat UIs. The app owns the entire chat experience end-to-end.

## Core Thesis
The most sustainable AI compute is the compute you never run. EcoPrompt reduces AI energy waste through engineering — semantic deduplication, model right-sizing, and cost visibility — not guilt.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Web App (Split-Screen)            │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   LEFT: Chat Panel  │    │   RIGHT: Dashboard Panel    │ │
│  │                     │    │                             │ │
│  │  - Prompt input     │    │  - Total queries counter    │ │
│  │  - Chat history     │    │  - Cache hit rate           │ │
│  │  - Cache hit badge  │    │  - Model usage pie chart    │ │
│  │  - Model used label │    │  - Energy saved line chart  │ │
│  │                     │    │  - CO₂ saved headline stat  │ │
│  └─────────┬───────────┘    └──────────────▲──────────────┘ │
│            │                               │                │
└────────────┼───────────────────────────────┼────────────────┘
             │ POST /api/query               │ GET /api/metrics
             ▼                               │
┌──────────────────────────────┐             │
│  Next.js API Route OR        │             │
│  AWS Lambda (via API Gateway)│─────────────┘
│                              │
│  1. Embed the incoming query │
│  2. Search vector store for  │
│     semantically similar     │
│     past queries             │
│  3. If similarity > threshold│
│     → return cached result   │
│     (CACHE HIT)              │
│  4. If no match:             │
│     → classify complexity    │
│     → route to appropriate   │
│       model (small vs large) │
│     → call Bedrock           │
│     → store query embedding  │
│       + result in vector DB  │
│     (CACHE MISS)             │
│  5. Log metrics to DB        │
│  6. Return response + meta   │
│     { answer, cache_hit,     │
│       model_used, energy }   │
└──────────────────────────────┘
```

---

## Three Core Components

### Component 1: Semantic Deduplication (Primary Differentiator)

**What it does:** Prevents redundant LLM calls by detecting when a new prompt is semantically equivalent to a previously answered one.

**How it works:**
1. Every incoming prompt is converted to a vector embedding.
2. The embedding is compared against a vector store of all previous query embeddings using cosine similarity.
3. If similarity score ≥ threshold (e.g., 0.92), return the cached response. No LLM call is made.
4. If similarity score < threshold, proceed to Component 2.
5. After receiving a new LLM response, store the query embedding and response in the vector store for future deduplication.

**Key technical concepts:** Memoization, locality-sensitive hashing, approximate nearest neighbor search, dynamic programming principle (reuse previously computed subproblems).

**Configurable parameters:**
- `SIMILARITY_THRESHOLD`: float, 0.0–1.0, default 0.92. Higher = stricter matching, fewer cache hits. Lower = more aggressive caching, risk of returning imprecise results.
- `EMBEDDING_MODEL`: The model used to generate query embeddings (e.g., Amazon Titan Embeddings via Bedrock, or `text-embedding-3-small` via API).
- `MAX_CACHE_AGE`: Optional TTL for cached results (e.g., 24h, 7d, never expire).

---

### Component 2: Model Right-Sizing

**What it does:** Routes prompts to the smallest/cheapest model capable of answering them correctly, rather than defaulting to the largest model.

**How it works:**
1. Classify incoming prompt complexity using heuristics or a lightweight classifier.
2. Route to the appropriate model tier.

**Classification heuristics (start simple, iterate):**
- **Simple tier** (use small model, e.g., Claude Haiku / Llama 3 8B):
  - Query length < 100 tokens
  - No code blocks or structured output requested
  - Single-turn factual questions
  - Greeting, simple Q&A, rephrasing tasks
- **Complex tier** (use large model, e.g., Claude Sonnet / Llama 3 70B):
  - Query length > 100 tokens
  - Contains code, math, or multi-step reasoning
  - Requests structured output (JSON, tables)
  - Multi-turn context dependency

**Configurable parameters:**
- `MODEL_SMALL`: Model ID for simple queries (Bedrock model ARN).
- `MODEL_LARGE`: Model ID for complex queries (Bedrock model ARN).
- `COMPLEXITY_CLASSIFIER`: "heuristic" | "ml". Start with heuristic.

---

### Component 3: Sustainability Dashboard (Demo Centerpiece)

**What it does:** Visualizes cumulative environmental savings from Components 1 and 2.

**Metrics to display:**
| Metric | Source | Calculation |
|---|---|---|
| Total queries received | Request counter | Increment per request |
| Cache hits (deduplicated) | Component 1 | Count of similarity ≥ threshold |
| Cache hit rate | Derived | cache_hits / total_queries × 100 |
| Model downgrades | Component 2 | Count of queries routed to small model |
| Estimated energy saved (kWh) | Derived | cache_hits × avg_energy_per_query + downgrades × energy_delta |
| Estimated CO₂ saved (kg) | Derived | energy_saved × grid_emission_factor |

**Reference values for estimation:**
- Energy per large model query: ~0.005–0.01 kWh (source: IEA, various estimates for GPT-4-class models)
- Energy per small model query: ~0.0005–0.001 kWh
- US average grid emission factor: 0.386 kg CO₂/kWh (source: EPA eGRID 2023)
- Energy saved per cache hit: full cost of avoided query (~0.005–0.01 kWh)
- Energy saved per model downgrade: large_cost − small_cost (~0.004–0.009 kWh)

**Dashboard UI elements:**
- Real-time counters (total queries, cache hits, downgrades)
- Line chart: cumulative energy saved over time
- Pie chart: query distribution (cache hit vs small model vs large model)
- Single "headline" stat: "X queries avoided, saving ~Y kWh / Z kg CO₂"

---

## UI Layout (Split-Screen)

```
┌──────────────────────────────────────────────────────────────────┐
│  EcoPrompt                                          [darkmode]   │
├────────────────────────────┬─────────────────────────────────────┤
│                            │                                     │
│   CHAT PANEL (left, ~55%)  │   DASHBOARD PANEL (right, ~45%)     │
│                            │                                     │
│   ┌──────────────────────┐ │   ┌─────────┐ ┌─────────┐          │
│   │ 🟢 Small Model       │ │   │ Queries │ │ Cache   │          │
│   │ "Photosynthesis is   │ │   │   4     │ │ Hit Rate│          │
│   │  the process by..."  │ │   │         │ │  50%    │          │
│   └──────────────────────┘ │   └─────────┘ └─────────┘          │
│   ┌──────────────────────┐ │                                     │
│   │ ⚡ Cache Hit          │ │   ┌─────────────────────────────┐  │
│   │ "Photosynthesis is   │ │   │ Cumulative Energy Saved     │  │
│   │  the process by..."  │ │   │ ~~~~~~~~/                   │  │
│   └──────────────────────┘ │   │        /                    │  │
│   ┌──────────────────────┐ │   │ ──────/                     │  │
│   │ 🔵 Large Model       │ │   └─────────────────────────────┘  │
│   │ "```python            │ │                                     │
│   │  def parse_csv()..." │ │   ┌─────────────────────────────┐  │
│   └──────────────────────┘ │   │  🌱 0.01 kWh saved          │  │
│                            │   │  🌍 0.004 kg CO₂ avoided    │  │
│   ┌──────────────────────┐ │   └─────────────────────────────┘  │
│   │ Type a message...    │ │                                     │
│   └──────────────────────┘ │   [Cache Hit] [Small] [Large] pie  │
│                            │                                     │
├────────────────────────────┴─────────────────────────────────────┤
│  Built with Amazon Bedrock · Titan Embeddings · Supabase pgvec  │
└──────────────────────────────────────────────────────────────────┘
```

**Per-message metadata (shown as badges on each chat bubble):**
- `⚡ Cache Hit` — response served from vector store, zero LLM compute
- `🟢 Small Model` — routed to lightweight model (e.g., Haiku)
- `🔵 Large Model` — routed to full model (e.g., Sonnet)
- Response time (ms) — visibly faster for cache hits

**Dashboard updates in real time** after every query. No page reload.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + Tailwind CSS | Split-screen UI: chat panel + dashboard panel |
| Backend API | Next.js API Routes (preferred for speed) OR AWS Lambda + API Gateway | Prompt routing, dedup logic, logging. Use API routes for hackathon speed; Lambda if you want stronger AWS narrative |
| LLM Access | Amazon Bedrock | Access to multiple model sizes (Haiku, Sonnet, Titan, Llama, etc.) |
| Vector Store | Supabase with pgvector (faster to set up) OR Amazon OpenSearch Serverless | Store and search query embeddings |
| Embeddings | Amazon Titan Embeddings (via Bedrock) | Generate vector embeddings of prompts |
| Metrics DB | Supabase (Postgres) OR Amazon DynamoDB | Store per-query logs (timestamp, cache_hit, model_used, estimated_energy) |
| Hosting | Vercel (fastest) OR AWS Amplify | Host the Next.js app |

### Tech Stack Decision: Hackathon Speed vs AWS Narrative
- **Maximum speed:** Next.js API routes + Supabase (pgvector + metrics) + Vercel. Fewer moving parts, faster iteration, you already know this stack.
- **Maximum AWS:** Lambda + API Gateway + OpenSearch Serverless + DynamoDB + Amplify. Stronger AWS story for judges, but more setup time.
- **Recommended compromise:** Next.js API routes + Bedrock + Supabase + Vercel. Bedrock is the core AWS service (LLM + embeddings), which is the most meaningful AWS usage. The rest optimizes for build speed.

---

## Explicit Scope Boundaries

### In Scope (Build This)
- Semantic deduplication via vector similarity search
- Model right-sizing via prompt complexity classification
- Per-query energy/CO₂ estimation using published reference values
- Dashboard displaying cumulative sustainability metrics
- Demo-able end-to-end flow: user sends prompt → middleware processes → result returned → dashboard updates

### Out of Scope (Do NOT Build This)
- Chrome extension or browser plugin (fragile DOM scraping of third-party chat UIs, not worth hackathon time)
- Wrapping or intercepting ChatGPT / Gemini / any third-party AI interface
- Water footprint tracking (insufficient data available from AWS)
- Regional task routing to low-carbon data centers (infrastructure-level problem, not hackathon-scale)
- Gamification / reward systems (product feature, not MVP)
- Actual hardware-level energy measurement (use estimates only)
- Multi-tenant / production-grade auth
- Fine-tuning or training any models

---

## Ethics Narrative (For Presentation)

**Problem:** AI is treated as free and infinite. Every query has a physical cost — electricity, water, cooling, hardware manufacturing — but this cost is invisible to users. This invisibility leads to waste: redundant queries, oversized models for simple tasks, no incentive to be efficient.

**Solution:** EcoPrompt makes AI's environmental cost legible and reduces it through engineering:
1. **Don't recompute what you already know.** Semantic deduplication catches repeat/similar queries and serves cached results — zero additional compute.
2. **Don't use a sledgehammer for a thumbtack.** Model right-sizing routes simple queries to small, efficient models.
3. **Make the invisible visible.** The dashboard quantifies what was saved, creating awareness and accountability.

**Ethical principle:** Sustainability through efficiency, not restriction. Users still get answers. They just get them with less waste.

---

## File Structure (Suggested)

```
ecoprompt/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Split-screen: ChatPanel (left) + DashboardPanel (right)
│   ├── api/
│   │   ├── query/route.ts     # Main endpoint: embed → dedup check → route → respond → log
│   │   └── metrics/route.ts   # Returns aggregated metrics for the dashboard
│   └── globals.css
├── components/
│   ├── ChatPanel.tsx          # Left side: prompt input, chat history, per-message metadata
│   ├── DashboardPanel.tsx     # Right side: metrics counters, charts, headline stat
│   ├── ChatMessage.tsx        # Single message bubble with cache/model badges
│   ├── MetricsCounter.tsx     # Animated counter component (total queries, cache hits, etc.)
│   ├── EnergyChart.tsx        # Line chart: cumulative energy saved over time
│   ├── QueryDistribution.tsx  # Pie chart: cache hit vs small model vs large model
│   └── HeadlineStat.tsx       # Big number: "X kWh saved / Y kg CO₂ avoided"
├── lib/
│   ├── bedrock.ts             # Bedrock client: embedding generation + LLM calls
│   ├── dedup.ts               # Semantic dedup: embed query → cosine search → hit/miss
│   ├── classifier.ts          # Prompt complexity classifier (heuristic rules)
│   ├── metrics.ts             # Energy/CO₂ estimation logic + DB read/write
│   └── vectorStore.ts         # Supabase pgvector or OpenSearch client
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## Implementation Priority Order

1. **First:** Scaffold Next.js app with split-screen layout (ChatPanel left, DashboardPanel right). Get the UI shell rendering with hardcoded placeholder data.
2. **Second:** Wire up Bedrock LLM calls via a Next.js API route (`/api/query`). User types prompt → API route calls Bedrock → response appears in chat panel. End-to-end flow working.
3. **Third:** Add embedding generation (Titan Embeddings via Bedrock) + vector store (Supabase pgvector). Implement semantic dedup: embed query → cosine search → cache hit returns stored result, cache miss calls Bedrock and stores the new embedding + response.
4. **Fourth:** Add prompt complexity classifier (heuristic rules in `classifier.ts`). Route simple prompts to small model, complex to large. Show which model was used as a badge on each chat message.
5. **Fifth:** Add per-query metric logging. Each query logs: timestamp, cache_hit (bool), model_used, estimated_energy_kwh. Dashboard reads from this and updates in real time.
6. **Last:** Polish dashboard — animated counters, line chart (cumulative energy saved), pie chart (query distribution), headline stat. Tune similarity threshold.

---

## Demo Script (Suggested)

1. Open the web app — split screen visible. Chat panel on the left (empty), dashboard on the right (all zeros).
2. Type a prompt in the chat: "What is photosynthesis?" → Response appears in chat with a badge: `🟢 Small Model`. Dashboard updates: 1 query, 0 cache hits, 1 small model call.
3. Type a near-duplicate: "Explain photosynthesis to me" → Response appears instantly with badge: `⚡ Cache Hit`. Dashboard updates: 2 queries, 1 cache hit, energy saved counter ticks up.
4. Type a complex prompt: "Write a Python function to parse a CSV and compute rolling averages" → Response appears with badge: `🔵 Large Model`. Dashboard: 3 queries, 1 cache hit, 1 large model call, 1 small model call.
5. Type the same complex prompt again → Instant response, badge: `⚡ Cache Hit`. Dashboard: 4 queries, 2 cache hits.
6. Point to the dashboard headline: "2 LLM calls avoided, saving ~0.01 kWh / 0.004 kg CO₂."
7. Close with: "Now imagine this at the scale of millions of queries per day. Every cache hit is a server that didn't spin up."
