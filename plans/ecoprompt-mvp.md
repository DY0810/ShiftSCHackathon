# EcoPrompt MVP — Construction Plan

**Objective:** Build a standalone Next.js web app with split-screen UI (chat + sustainability dashboard) that reduces redundant AI compute via semantic deduplication, model right-sizing, and real-time environmental impact visualization.

**Exit criterion:** The demo script from the spec runs end-to-end — 5+ queries demonstrating cache hits, model routing, and live dashboard updates.

**Context:** ShiftSC Hackathon project. Optimize for speed-to-demo, not production robustness. Minimal error handling, no tests.

**Remote:** github.com/DY0810/ShiftSCHackathon (branch: `main`)

---

## Tech Stack (Locked)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14+ App Router + TypeScript + Tailwind CSS | Fast, full-stack, SSR |
| LLM | Amazon Bedrock (Claude Haiku 4.5 + Claude Sonnet 4.5) | AWS-sponsored hackathon, multi-model |
| Embeddings | Amazon Titan Embeddings v2 (via Bedrock) | AWS-native, 1024-dim vectors |
| Vector Cache | Amazon DynamoDB | Stores query embeddings + responses. Cosine similarity computed in-app (instant at hackathon scale <100 queries) |
| Metrics DB | Amazon DynamoDB (same table or separate) | Per-query energy/CO2 logs |
| Hosting | Vercel | Zero-config Next.js deploys |

**AWS Services Used:** Bedrock (LLM + Embeddings), DynamoDB (cache + metrics) — all-AWS backend.
**Why not OpenSearch Serverless for vectors?** Setup takes ~10 min to provision, SDK is verbose. DynamoDB + in-app cosine similarity is faster to build and works perfectly for demo scale. In production you'd swap to OpenSearch.

---

## Design System

Three reference files in `design/` control the visual design. Read `design/README.md` for full guidance. Summary:

### Visual Templates (PRIMARY — match these)

| File | What It Shows |
|---|---|
| `design/DesignTemplate1.png` | Landing/hero page: headline, stats row, CTA buttons |
| `design/DesignTemplate2.png` | Main app: split-screen chat + sustainability dashboard |
| `design/Logo.png` | Green leaf gradient logo — use in header/nav |

### Style Tokens (SECONDARY — extract values for implementation)

| File | Use For | Key Extractions |
|---|---|---|
| `design/colors.md` | Colors & theme | Dark mode: bg `#171717`, text `#fafafa`, green accent `#3ecf8e`, border hierarchy `#242424`→`#2e2e2e`→`#363636`. No shadows — depth via borders |
| `design/fonts.md` | Typography | Geist Sans + Geist Mono. Display 48px/600/-2.4px tracking. Body 16px/400. Three weights: 400, 500, 600 |
| `design/layout.md` | Layout & components | 8px base spacing. Cards 4-6px radius. Buttons 6px radius. Pills 9999px. Responsive stack below 768px |

**Priority:** Design template PNGs > colors.md > fonts.md > layout.md. If a style MD conflicts with the templates, **templates win**.

Read `design/README.md` for full guidance on how to use each file.

---

## Invariants (Verified After Every Phase)

1. `npm run build` succeeds with zero errors
2. `npm run dev` starts and the app renders at `localhost:3000`
3. No TypeScript errors (`npx tsc --noEmit`)
4. All previous-phase functionality still works (no regressions)

---

## Phase 1: Scaffold + Split-Screen UI Shell

**Branch:** `phase-1-scaffold`
**Depends on:** Nothing
**Model tier:** Default (Sonnet)

### Context Brief

Create a Next.js 14 App Router project with TypeScript and Tailwind CSS. Build two pages:

1. **Landing page** (`/`) — match `design/DesignTemplate1.png` exactly. Hero headline, stats row, CTA buttons. "See the demo" button links to `/app`.
2. **App page** (`/app`) — match `design/DesignTemplate2.png` exactly. Split-screen: ChatPanel left, DashboardPanel right.

All data is hardcoded/placeholder — no API calls, no Bedrock, no DynamoDB.

**Design system:** Read `design/README.md` first. The **PNG templates are the primary reference** for how the app should look. Extract color values from `design/colors.md`, font rules from `design/fonts.md`, and spacing from `design/layout.md`. Use `design/Logo.png` as the app logo (copy it to `public/logo.png`).

**Key details from DesignTemplate2 (the app page):**
- Chat header: "CHAT". Dashboard header: "SUSTAINABILITY DASHBOARD"
- Messages labeled "USER" and "ECOPROMPT" (not "assistant")
- Badge format: green pill "Small model - Haiku", "Cache hit - 0 LLM calls"
- Input: "Ask something..." placeholder with "Send" button
- Dashboard stat cards with subtitles: "live", "2 of 4 served", "2 LLM calls avoided", "EPA grid factors"
- Model Distribution: **horizontal bar chart** (not bar chart) — Cache hit / Small / Large with percentages
- Headline stat with scale projection: "At 1M queries/day with this hit rate: 500,000 server calls never happen."
- Query Log: timestamped list at bottom showing SMALL, HIT entries

### Files to Create

| File | Purpose |
|---|---|
| `package.json` | Next.js 14, React 18, Tailwind, TypeScript deps |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind config with design system tokens |
| `postcss.config.mjs` | PostCSS for Tailwind |
| `next.config.ts` | Next.js config |
| `public/logo.png` | Logo copied from `design/Logo.png` |
| `app/layout.tsx` | Root layout with Geist font, metadata, dark bg |
| `app/page.tsx` | Landing page matching `DesignTemplate1.png` — hero, stats, CTAs |
| `app/app/page.tsx` | App page matching `DesignTemplate2.png` — split-screen chat + dashboard |
| `app/globals.css` | Tailwind directives + base dark theme styles |
| `lib/types.ts` | Shared types: `Message`, `DashboardMetrics`, `QueryResponse` — used across all phases |
| `components/ChatPanel.tsx` | Left panel: message list + input. Hardcoded 3 sample messages showing all badge types |
| `components/DashboardPanel.tsx` | Right panel: stat cards, bar chart, headline stat, query log. Hardcoded numbers |
| `components/ChatMessage.tsx` | Single message with USER/ECOPROMPT labels and badge pills |
| `components/MetricsCounter.tsx` | Stat card with label, number, and subtitle |
| `components/QueryLog.tsx` | Timestamped query history log at bottom of dashboard |
| `components/ModelDistribution.tsx` | Horizontal bar chart: cache hit / small / large with percentages |
| `.env.local.example` | Template for env vars (no secrets) |
| `.gitignore` | Node, Next.js, env files |

### Task List

1. Run `npx create-next-app@latest ecoprompt --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-npm` inside `/Users/dyl/shiftH/` — then move contents up or work inside the `ecoprompt/` subdirectory. **Decision: work inside `ecoprompt/` subdirectory** to keep spec files at repo root.
2. Set up Tailwind theme in `tailwind.config.ts` — extract all color tokens from `design/colors.md`: page bg `#171717`, card surfaces, brand green `#3ecf8e`, border hierarchy (`#242424`, `#2e2e2e`, `#363636`), text colors (`#fafafa`, `#b4b4b4`, `#898989`). Add Geist font family from `design/fonts.md`.
3. Copy `design/Logo.png` to `public/logo.png`.
4. Build `app/layout.tsx` — full viewport, dark bg `#171717`, Geist Sans font (load via `next/font/google` or CDN), title "EcoPrompt".
5. Build `app/page.tsx` — **landing page matching `design/DesignTemplate1.png`**: logo, top label "AI + AWS - Amazon Bedrock", hero headline "The most sustainable AI compute is the compute you never run.", subtitle, two CTA buttons ("See the demo" links to `/app`, "Read the architecture"), stats row at bottom (~10x, 0.92, 300k, 0 kg).
6. Build `app/app/page.tsx` — **app page matching `design/DesignTemplate2.png`**: flex row, ChatPanel left ~55%, DashboardPanel right ~45%, responsive (stack vertically on mobile).
5. Create `lib/types.ts` — shared types used across all phases:
   ```typescript
   export type Message = {
     role: 'user' | 'assistant';
     content: string;
     model_used?: 'haiku' | 'sonnet' | 'cache';
     cache_hit?: boolean;
     energy_kwh?: number;
     response_time_ms?: number;
   };

   export type DashboardMetrics = {
     total_queries: number;
     cache_hits: number;
     cache_hit_rate: number;
     small_model_count: number;
     large_model_count: number;
     total_energy_kwh: number;
     total_co2_kg: number;
     energy_saved_kwh: number;
     co2_saved_kg: number;
     timeline: { query_number: number; cumulative_energy_saved: number }[];
     distribution: { cache_hits: number; small_model: number; large_model: number };
   };

   export type QueryResponse = {
     answer: string;
     model_used: string;
     cache_hit: boolean;
     energy_kwh: number;
     co2_kg: number;
     response_time_ms: number;
   };
   ```
7. Build `components/ChatMessage.tsx` — match DesignTemplate2: message with "USER" or "ECOPROMPT" label, content text, optional badge pill. Badge format: green pill "Small model - Haiku", "Cache hit - 0 LLM calls", "Large model - Sonnet". Badge styling per `design/colors.md` and `design/layout.md` (9999px radius).
8. Build `components/ChatPanel.tsx` — match DesignTemplate2: "CHAT" header, scrollable message list, fixed input bar "Ask something..." with "Send" button. Hardcode 3 messages matching the template (photosynthesis Q&A + cache hit + Python CSV query).
9. Build `components/MetricsCounter.tsx` — stat card with label, large number, and subtitle (e.g., "live", "2 of 4 served", "2 LLM calls avoided", "EPA grid factors").
10. Build `components/ModelDistribution.tsx` — horizontal bar chart matching DesignTemplate2: three bars (Cache hit, Small, Large) with percentage labels. Hardcoded values: 50%, 25%, 25%.
11. Build `components/QueryLog.tsx` — timestamped query history matching DesignTemplate2: "QUERY LOG" header, entries like "0:04 SMALL What is photosynthesis?", "0:09 HIT Explain photosynthesis to me".
12. Build `components/DashboardPanel.tsx` — match DesignTemplate2: "SUSTAINABILITY DASHBOARD" header, grid of MetricsCounter cards (Total Queries: 4, Cache Hit Rate: 50%, Energy Saved: 0.01 kWh, CO2 Avoided: 0.004 kg), ModelDistribution bar chart, headline stat with scale projection, QueryLog at bottom.
13. Create `.env.local.example` with placeholder keys: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.

### Acceptance Criteria

- [ ] `npm run dev` starts, app renders at localhost:3000
- [ ] Landing page at `/` matches DesignTemplate1.png — hero, stats, CTAs
- [ ] "See the demo" button navigates to `/app`
- [ ] App page at `/app` matches DesignTemplate2.png — split-screen chat + dashboard
- [ ] Logo visible on landing page
- [ ] 3 hardcoded chat messages with USER/ECOPROMPT labels and badge pills
- [ ] 4 metric cards with subtitles display placeholder numbers
- [ ] Horizontal bar chart for model distribution
- [ ] Headline stat with scale projection text
- [ ] Query log with timestamped entries
- [ ] `npm run build` succeeds
- [ ] Dark theme throughout, Geist font

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
cd /Users/dyl/shiftH/ecoprompt && npx tsc --noEmit
cd /Users/dyl/shiftH/ecoprompt && npm run dev  # manual check: open localhost:3000
```

---

## Phase 2: Bedrock LLM Integration

**Branch:** `phase-2-bedrock`
**Depends on:** Phase 1
**Model tier:** Default (Sonnet)

### Context Brief

Wire up Amazon Bedrock for LLM calls. Create a `/api/query` route that accepts a user prompt, calls Bedrock (Claude Sonnet for now — model routing comes in Phase 4), and returns the response. The ChatPanel becomes functional: user types a prompt, it posts to the API, response appears in the chat. No deduplication, no embeddings, no metrics logging yet — just raw prompt-to-response.

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `lib/bedrock.ts` | Create | Bedrock client: `invokeModel()` function using `@aws-sdk/client-bedrock-runtime`. Takes prompt string, model ID, returns response text |
| `app/api/query/route.ts` | Create | POST handler: receives `{ prompt }`, calls `invokeModel()`, returns `{ answer, model_used, cache_hit: false, energy_kwh, response_time_ms }` |
| `components/ChatPanel.tsx` | Modify | Make input functional: on submit, POST to `/api/query`, append user message + assistant response to state. Show loading indicator while waiting |
| `components/ChatMessage.tsx` | Modify | Add response_time_ms display |
| `app/app/page.tsx` | Modify | Lift messages state to page level, pass to both ChatPanel and DashboardPanel |
| `package.json` | Modify | Add `@aws-sdk/client-bedrock-runtime` |
| `.env.local.example` | Modify | Add `BEDROCK_REGION` (default `us-east-1`) |

### Task List

1. `npm install @aws-sdk/client-bedrock-runtime`
2. Create `lib/bedrock.ts`:
   - Import `BedrockRuntimeClient`, `InvokeModelCommand` from `@aws-sdk/client-bedrock-runtime`
   - Create client with region from env `AWS_REGION` (default `us-east-1`)
   - Export `async function invokeModel(prompt: string, modelId: string): Promise<string>`
   - For Claude models, format the request body as: `{ anthropic_version: "bedrock-2023-05-31", max_tokens: 1024, messages: [{ role: "user", content: prompt }] }`
   - Parse response body, extract `content[0].text`
   - Default model ID: `us.anthropic.claude-haiku-4-5-20251001-v1:0` (will be parameterized in Phase 4)
3. Create `app/api/query/route.ts`:
   - POST handler accepts JSON body `{ prompt: string }`
   - Records start time
   - Calls `invokeModel(prompt, MODEL_ID)`
   - Calculates `response_time_ms`
   - Returns JSON: `{ answer, model_used: "sonnet", cache_hit: false, energy_kwh: 0.007, response_time_ms }`
   - Energy is hardcoded for now (Phase 5 will compute it properly)
4. Modify `components/ChatPanel.tsx`:
   - Replace hardcoded messages with `messages` state (prop from parent)
   - On input submit: add user message to state, POST to `/api/query`, add assistant message to state with metadata from response
   - Show "Thinking..." indicator while API call is in flight
   - Clear input after submit
5. Modify `app/page.tsx`:
   - State: `messages` array. Pass to ChatPanel. Pass to DashboardPanel (for future metric computation).
   - Import `Message` type from `lib/types.ts` (already defined in Phase 1)
6. Remove hardcoded sample messages — the chat starts empty.

### Acceptance Criteria

- [ ] User types a prompt, presses Enter/Send
- [ ] "Thinking..." indicator appears
- [ ] Real Bedrock response appears in chat within a few seconds
- [ ] Response shows model badge (hardcoded to one model for now)
- [ ] Response time is displayed on the message
- [ ] Multiple back-to-back queries work
- [ ] Dashboard still renders (still showing placeholders)
- [ ] `npm run build` succeeds

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
# Manual: open localhost:3000, type "What is photosynthesis?", verify Bedrock response appears
# Manual: type "Write hello world in Python", verify response appears
```

### Environment Setup Required

The executor must have a `.env.local` file with valid AWS credentials:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```
These credentials must have the following IAM permissions (covers all phases):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:TagResource"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/ecoprompt-*"
    }
  ]
}
```

---

## Phase 3: Semantic Deduplication

**Branch:** `phase-3-dedup`
**Depends on:** Phase 2
**Model tier:** Strongest (Opus) — this is the core algorithmic logic

### Context Brief

Add semantic deduplication — the primary differentiator. When a user sends a prompt: (1) generate an embedding via Titan Embeddings on Bedrock, (2) scan the DynamoDB `query_cache` table and compute cosine similarity in-app against all stored embeddings, (3) if similarity >= 0.92, return the cached response (cache hit — zero LLM call), (4) if no match, call Bedrock LLM, then store the new embedding + response in DynamoDB. The ChatPanel should show a yellow "Cache Hit" badge for cached responses.

**Why in-app cosine similarity instead of a vector database?** At hackathon scale (<100 queries), scanning all embeddings from DynamoDB and computing cosine similarity in Node.js takes <10ms total. This eliminates the need for pgvector/OpenSearch and keeps the stack all-AWS. In production you'd swap to OpenSearch Serverless.

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `lib/bedrock.ts` | Modify | Add `generateEmbedding(text: string): Promise<number[]>` using Titan Embeddings v2 |
| `lib/dynamodb.ts` | Create | Shared DynamoDB Document client + `ensureTable()` helper (reused by vectorStore.ts and metrics.ts) |
| `lib/vectorStore.ts` | Create | DynamoDB-backed cache. Functions: `searchSimilar(embedding, threshold)` scans table, computes cosine similarity in-app, returns best match or null. `storeEntry(prompt, embedding, response, model_used)` puts item to DynamoDB |
| `lib/dedup.ts` | Create | Orchestrates: `embed → search → hit/miss` logic. Exports `deduplicate(prompt): Promise<{ hit: boolean, response?: string, similarity?: number }>` |
| `app/api/query/route.ts` | Modify | Integrate dedup: call `deduplicate()` first. If hit, return cached response with `cache_hit: true`. If miss, call Bedrock, then store via vectorStore |
| `package.json` | Modify | Add `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` |

### Task List

1. `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`

2. Modify `lib/bedrock.ts` — add embedding function:
   - `async function generateEmbedding(text: string): Promise<number[]>`
   - Model ID: `amazon.titan-embed-text-v2:0`
   - Request body: `{ inputText: text, dimensions: 1024, normalize: true }`
   - Parse response, return the `embedding` array

3. Create `lib/dynamodb.ts` — **shared DynamoDB client** (reused by vectorStore.ts and metrics.ts):
   - Initialize DynamoDB Document client from `@aws-sdk/lib-dynamodb` using env `AWS_REGION`
   - Export the client instance
   - Export **`ensureTable(tableName, keySchema)` helper**:
     ```typescript
     async function ensureTable(tableName: string, keySchema: KeySchemaElement[]): Promise<void> {
       // Try DescribeTable; if ResourceNotFoundException:
       //   Try CreateTable with PAY_PER_REQUEST billing
       //   Catch ResourceInUseException (race condition — another request created it first) — treat as success
       //   Poll DescribeTable until status is ACTIVE
     }
     ```
   - This handles concurrent requests safely.

4. Create `lib/vectorStore.ts`:
   - Import shared client and `ensureTable` from `lib/dynamodb.ts`
   - Table name constant: `QUERY_CACHE_TABLE = 'ecoprompt-query-cache'`
   - Call `ensureTable(QUERY_CACHE_TABLE, [{AttributeName: 'id', KeyType: 'HASH'}])` before first operation
   - **Cosine similarity function** (pure math, no dependencies):
     ```typescript
     function cosineSimilarity(a: number[], b: number[]): number {
       let dot = 0, magA = 0, magB = 0;
       for (let i = 0; i < a.length; i++) {
         dot += a[i] * b[i];
         magA += a[i] * a[i];
         magB += b[i] * b[i];
       }
       return dot / (Math.sqrt(magA) * Math.sqrt(magB));
     }
     ```
   - `searchSimilar(embedding: number[], threshold: number = 0.65)` (lowered from 0.92 — Titan v2 normalized embeddings produce cosine similarities of 0.68–0.76 for paraphrases vs <0.09 for different topics; 0.65 sits safely in the gap):
     - `Scan` the `ecoprompt-query-cache` table (all items)
     - For each item, compute `cosineSimilarity(embedding, item.embedding)`
     - Find the item with the highest similarity
     - If highest similarity >= threshold, return `{ hit: true, response: item.response, similarity }`
     - Otherwise return `{ hit: false }`
     - **Performance note:** At <100 items with 1024-dim vectors, this scan + compute takes <10ms
   - `storeEntry(prompt, embedding, response, model_used)`:
     - `PutItem` to DynamoDB: `{ id: uuid(), prompt, embedding (stored as List of Numbers), response, model_used, created_at: ISO timestamp }`

4. Create `lib/dedup.ts`:
   - Import `generateEmbedding` from bedrock, `searchSimilar`, `storeEntry` from vectorStore
   - Export `async function deduplicate(prompt: string)`:
     - Generate embedding for prompt
     - Search for similar cached queries
     - Return `{ hit: boolean, response?: string, similarity?: number, embedding: number[] }`
   - The embedding is returned so the caller can store it after a cache miss without re-computing

5. Modify `app/api/query/route.ts`:
   - Call `deduplicate(prompt)` first
   - If hit: return `{ answer: cached_response, cache_hit: true, model_used: "cache", energy_kwh: 0, response_time_ms }`
   - If miss: call `invokeModel()`, then call `storeEntry(prompt, embedding, response, model_used)`, return with `cache_hit: false`
   - Cache hits should be noticeably faster (no LLM latency)

6. Update `components/ChatMessage.tsx` — ensure "cache_hit" badge renders as yellow with lightning bolt icon.

### Acceptance Criteria

- [ ] First query ("What is photosynthesis?") calls Bedrock, returns response with model badge
- [ ] Second similar query ("Explain photosynthesis to me") returns cached response with "Cache Hit" badge
- [ ] Cache hit response is visibly faster (no LLM call latency)
- [ ] Different query ("What is gravity?") is a cache miss, calls Bedrock
- [ ] DynamoDB `ecoprompt-query-cache` table has items after queries
- [ ] `npm run build` succeeds

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
# Manual test sequence:
# 1. "What is photosynthesis?" → expect model badge (miss)
# 2. "Explain photosynthesis to me" → expect Cache Hit badge (hit)
# 3. "What is gravity?" → expect model badge (miss)
# 4. "Tell me about gravity" → expect Cache Hit badge (hit)
```

### Environment Setup Required

The same `.env.local` AWS credentials from Phase 2 are used. The IAM user needs these additional permissions:
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:CreateTable",
    "dynamodb:DescribeTable",
    "dynamodb:PutItem",
    "dynamodb:Scan"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/ecoprompt-*"
}
```
The DynamoDB table is auto-created on first use — no manual setup needed.

---

## Phase 4: Model Right-Sizing

**Branch:** `phase-4-routing`
**Depends on:** Phase 3
**Model tier:** Default (Sonnet)

### Context Brief

Add a prompt complexity classifier that routes simple prompts to Claude Haiku (small, cheap, fast) and complex prompts to Claude Sonnet (large, capable). The classifier uses heuristic rules — no ML. Each chat message displays which model was used: green badge for Haiku, blue badge for Sonnet.

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `lib/classifier.ts` | Create | `classifyComplexity(prompt: string): 'simple' \| 'complex'` — heuristic rules |
| `lib/bedrock.ts` | Modify | Make `invokeModel()` accept model ID parameter, add constants for both model IDs |
| `app/api/query/route.ts` | Modify | Call classifier on cache miss, route to appropriate model |
| `components/ChatMessage.tsx` | Modify | Distinguish Haiku (green) vs Sonnet (blue) badges |

### Task List

1. Create `lib/classifier.ts`:
   - Export `function classifyComplexity(prompt: string): 'simple' | 'complex'`
   - **Simple if ALL of:**
     - Token count < 100 (approximate: split by spaces, count words)
     - No code fence (triple backticks) or inline code (single backticks)
     - No keywords: "write code", "function", "algorithm", "implement", "debug", "refactor", "analyze", "compare", "JSON", "table", "step by step", "explain in detail"
     - No math symbols: `=`, `+`, `*`, `/`, `^`, `∑`, `∫` (beyond simple punctuation context)
   - **Complex otherwise**
   - Export the function and also export `MODEL_IDS` constant:
     ```typescript
     export const MODEL_IDS = {
       simple: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
       complex: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
     } as const;
     ```

2. Modify `lib/bedrock.ts`:
   - `invokeModel()` already takes a `modelId` parameter — ensure it works with both Haiku and Sonnet model IDs
   - Both models use the same Messages API format via Bedrock

3. Modify `app/api/query/route.ts`:
   - On cache miss: call `classifyComplexity(prompt)` to get tier
   - Use `MODEL_IDS[tier]` to select model
   - Pass to `invokeModel(prompt, modelId)`
   - Return `model_used: tier === 'simple' ? 'haiku' : 'sonnet'` in response

4. Modify `components/ChatMessage.tsx`:
   - Badge logic: `cache_hit` → yellow ⚡, `model_used === 'haiku'` → green 🟢, `model_used === 'sonnet'` → blue 🔵
   - Badge text: "Cache Hit", "Small Model (Haiku)", "Large Model (Sonnet)"

### Acceptance Criteria

- [ ] "What is photosynthesis?" → green badge (Small Model / Haiku)
- [ ] "Write a Python function to parse CSV and compute rolling averages" → blue badge (Large Model / Sonnet)
- [ ] Simple prompts get noticeably faster responses than complex ones
- [ ] Cache hits still work (return cached response regardless of original model)
- [ ] `npm run build` succeeds

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
# Manual test:
# 1. "Hello, how are you?" → Haiku (green badge)
# 2. "What is photosynthesis?" → Haiku (green badge)
# 3. "Write a Python function to parse CSV and compute rolling averages" → Sonnet (blue badge)
# 4. "What is photosynthesis?" again → Cache Hit (yellow badge)
```

---

## Phase 5: Metrics Logging + Live Dashboard

**Branch:** `phase-5-metrics`
**Depends on:** Phase 4
**Model tier:** Default (Sonnet)

### Context Brief

Add per-query metric logging to DynamoDB and make the dashboard display real, live data. Every query logs: timestamp, cache_hit, model_used, estimated energy, estimated CO2. The dashboard reads metrics and updates after each query without page reload.

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `lib/metrics.ts` | Create | Energy/CO2 estimation constants + `logMetric()` + `getMetrics()` functions |
| `app/api/query/route.ts` | Modify | Call `logMetric()` after every query (hit or miss) |
| `app/api/metrics/route.ts` | Create | GET handler returning aggregated metrics |
| `app/page.tsx` | Modify | After each query, refresh metrics and pass to DashboardPanel |
| `components/DashboardPanel.tsx` | Modify | Accept real metrics props, display live data |
| `components/MetricsCounter.tsx` | Modify | Accept value as prop instead of hardcoded |

### Task List

1. **DynamoDB table** — auto-created on first use (same pattern as Phase 3):
   - Table name: `ecoprompt-query-metrics`
   - PK: `id` (S)
   - On-demand billing (PAY_PER_REQUEST)
   - Items: `{ id, prompt_preview, cache_hit (BOOL), model_used (S), energy_kwh (N), co2_kg (N), response_time_ms (N), created_at (S) }`

2. Create `lib/metrics.ts`:
   - Import shared DynamoDB client and `ensureTable` from `lib/dynamodb.ts` (created in Phase 3)
   - Call `ensureTable('ecoprompt-query-metrics', [{AttributeName: 'id', KeyType: 'HASH'}])` before first operation
   - Energy constants:
     ```typescript
     export const ENERGY = {
       large_model_kwh: 0.007,    // ~0.005-0.01 per spec, use midpoint
       small_model_kwh: 0.0007,   // ~0.0005-0.001 per spec
       cache_hit_kwh: 0.0001,     // negligible — just the embedding lookup
       grid_emission_factor: 0.386, // kg CO2 per kWh, EPA eGRID 2023
     } as const;
     ```
   - `function estimateEnergy(cache_hit: boolean, model_used: string): { energy_kwh: number, co2_kg: number }`:
     - Cache hit: `ENERGY.cache_hit_kwh`
     - Haiku: `ENERGY.small_model_kwh`
     - Sonnet: `ENERGY.large_model_kwh`
     - CO2 = energy * grid_emission_factor
     - Also compute `energy_saved`: difference between what would have been used (large model) and what was used
   - `async function logMetric(data: MetricEntry): Promise<void>` — PutItem to DynamoDB `ecoprompt-query-metrics` table
   - `async function getAggregatedMetrics(): Promise<DashboardMetrics>`:
     - Scan `ecoprompt-query-metrics` table
     - Return: `{ total_queries, cache_hits, cache_hit_rate, small_model_count, large_model_count, total_energy_kwh, total_co2_kg, energy_saved_kwh, co2_saved_kg, timeline: [{timestamp, cumulative_energy_saved}] }`
     - `energy_saved` = sum of (large_model_energy - actual_energy) for each query

3. Modify `app/api/query/route.ts`:
   - After getting response (hit or miss), compute energy estimates
   - Call `logMetric()`
   - Include energy data in response JSON

4. Create `app/api/metrics/route.ts`:
   - GET handler: call `getAggregatedMetrics()`, return JSON

5. Modify `app/page.tsx`:
   - Import `DashboardMetrics` from `lib/types.ts` (already defined in Phase 1)
   - Add `metrics` state of type `DashboardMetrics`
   - After each query completes, fetch `/api/metrics` and update state
   - Pass `metrics` to `DashboardPanel`

6. Modify `components/DashboardPanel.tsx`:
   - Accept `metrics: DashboardMetrics` prop
   - Display real values in MetricsCounter cards:
     - Total Queries
     - Cache Hit Rate (%)
     - Energy Saved (kWh)
     - CO2 Avoided (kg)
   - Keep chart placeholders (Phase 6 adds charts)

7. Modify `components/MetricsCounter.tsx`:
   - Accept `value` and `label` props, display dynamically

### Acceptance Criteria

- [ ] Each query logs an item to DynamoDB `ecoprompt-query-metrics` table
- [ ] Dashboard counters update after each query (no page reload)
- [ ] Cache hits show lower energy than model calls
- [ ] Total queries counter matches actual query count
- [ ] Cache hit rate computes correctly
- [ ] Energy saved and CO2 avoided increment with each cache hit
- [ ] `npm run build` succeeds

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
# Manual: send 4 queries from demo script, verify dashboard numbers match expected values
# Check DynamoDB ecoprompt-query-metrics table has 4 items
```

---

## Phase 6: Polish — Charts, Animations, Demo-Ready

**Branch:** `phase-6-polish`
**Depends on:** Phase 5
**Model tier:** Default (Sonnet)

### Context Brief

Final polish pass. Add animated number counters, a line chart showing cumulative energy saved over time, a bar chart showing query distribution (cache hit vs small model vs large model), and a prominent headline stat. Tune the similarity threshold. Verify the full demo script runs successfully.

### Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `components/EnergyChart.tsx` | Create | Line chart: cumulative energy saved over time (use recharts or lightweight chart lib) |
| `components/QueryDistribution.tsx` | Modify | Update `ModelDistribution.tsx` (created in Phase 1) with live data from metrics |
| `components/HeadlineStat.tsx` | Create | Large prominent stat: "X queries avoided, saving ~Y kWh / Z kg CO2" |
| `components/MetricsCounter.tsx` | Modify | Add count-up animation (CSS or lightweight JS) |
| `components/DashboardPanel.tsx` | Modify | Integrate charts + headline stat, replace placeholders |
| `lib/metrics.ts` | Modify | Return timeline data for line chart |
| `app/api/metrics/route.ts` | Modify | Include timeline + distribution data in response |
| `package.json` | Modify | Add `recharts` (lightweight chart lib) |

### Task List

1. `npm install recharts`

2. Create `components/EnergyChart.tsx` (**must include `"use client"` directive** — recharts requires client-side rendering):
   - Line chart using recharts `<LineChart>` + `<Line>` + `<XAxis>` + `<YAxis>` + `<Tooltip>`
   - Data: array of `{ query_number, cumulative_energy_saved_kwh }`
   - Green line on dark bg
   - Responsive, fills container width

3. Update `components/ModelDistribution.tsx` (created in Phase 1 with hardcoded data):
   - Accept live distribution data as props
   - Keep the horizontal bar chart format from DesignTemplate2 — do NOT switch to a bar chart
   - Update bar widths and percentage labels dynamically

4. Create `components/HeadlineStat.tsx`:
   - Large centered text: "X LLM calls avoided"
   - Subtitle: "saving ~Y kWh / Z kg CO2"
   - Use the green accent color, prominent font size
   - Values from metrics props

5. Modify `components/MetricsCounter.tsx`:
   - Animate number from 0 to target value on mount/update
   - Use `requestAnimationFrame` or CSS `transition` for smooth counting
   - Format numbers: integers for counts, 3 decimal places for kWh/kg

6. Modify `lib/metrics.ts`:
   - `getAggregatedMetrics()` now also returns:
     - `timeline`: array of `{ query_number, cumulative_energy_saved }` for line chart
     - `distribution`: `{ cache_hits: N, small_model: N, large_model: N }` for bar chart

7. Modify `app/api/metrics/route.ts`:
   - Return extended metrics including timeline and distribution

8. Modify `components/DashboardPanel.tsx`:
   - Replace chart placeholders with actual `<EnergyChart>` and `<QueryDistribution>` components
   - Add `<HeadlineStat>` at the top of the dashboard
   - Layout: HeadlineStat → Metric cards row → Energy chart → Bar chart

9. Final styling pass:
   - Ensure consistent dark theme
   - Ensure charts have dark backgrounds with light text
   - Verify responsive behavior
   - Add subtle transitions/animations

10. **Demo script dry run** — execute the exact 5-query demo from the spec:
    - Query 1: "What is photosynthesis?" → 🟢 Small Model. Dashboard: 1 query, 0 cache hits.
    - Query 2: "Explain photosynthesis to me" → ⚡ Cache Hit. Dashboard: 2 queries, 1 cache hit, energy saved ticks up.
    - Query 3: "Write a Python function to parse a CSV and compute rolling averages" → 🔵 Large Model. Dashboard: 3 queries, 1 cache hit, 1 small + 1 large.
    - Query 4: Same as query 3 → ⚡ Cache Hit. Dashboard: 4 queries, 2 cache hits.
    - Query 5: (bonus) Any new simple query to show the system still works.
    - Verify: Headline stat reads "2 LLM calls avoided, saving ~0.01 kWh / 0.004 kg CO2" (approximately).
    - Verify: Line chart shows upward trend. Bar chart shows distribution.

### Acceptance Criteria

- [ ] Animated number counters on metric cards
- [ ] Line chart renders and updates with each query
- [ ] Bar chart shows correct distribution with matching badge colors
- [ ] Headline stat prominently displays savings
- [ ] Full demo script (5 queries) runs end-to-end
- [ ] Cache hits are visibly instant vs model calls
- [ ] Dashboard updates in real time after each query
- [ ] Green/blue/yellow badge colors are consistent between chat and bar chart
- [ ] `npm run build` succeeds
- [ ] App looks polished and demo-ready

### Verification Commands

```bash
cd /Users/dyl/shiftH/ecoprompt && npm run build
# Run full demo script manually — this IS the exit criterion
```

### Exit Criterion (Project-Level)

The 5-query demo script from `EcoPrompt_Project_Spec.md` Section "Demo Script" runs end-to-end:
1. Simple query → Small Model badge + dashboard update
2. Similar query → Cache Hit badge + energy saved counter increases
3. Complex query → Large Model badge + dashboard update
4. Repeat complex query → Cache Hit badge + energy saved increases
5. Dashboard headline shows correct cumulative savings
6. Line chart trends upward, bar chart reflects distribution

---

## Dependency Graph

```
Phase 1 (Scaffold)
    │
    ▼
Phase 2 (Bedrock LLM)
    │
    ▼
Phase 3 (Dedup)  ← strongest model recommended
    │
    ▼
Phase 4 (Routing)
    │
    ▼
Phase 5 (Metrics)
    │
    ▼
Phase 6 (Polish)
```

All phases are serial — each depends on the previous. No parallel execution opportunities because each phase builds directly on the prior phase's code.

---

## Risk Register

| Risk | Mitigation |
|---|---|
| AWS credentials not configured | Phase 2 blocks until `.env.local` has valid Bedrock + DynamoDB creds. Confirm before starting |
| IAM permissions too narrow | IAM user needs `bedrock:InvokeModel`, `dynamodb:CreateTable`, `dynamodb:DescribeTable`, `dynamodb:PutItem`, `dynamodb:Scan`. Use the policy in Phase 3 |
| Titan Embeddings dimension mismatch | Spec says 1024 dims. Verify in Phase 3 by logging first embedding length |
| DynamoDB scan latency at scale | At <100 items, scan is <10ms. For hackathon demo this is fine. In production, swap to OpenSearch Serverless |
| Cosine similarity threshold too strict/loose | Default 0.92 from spec. Tune in Phase 6 if needed. Log similarity scores to debug |
| Recharts SSR issues in Next.js | Use `"use client"` directive on all chart components. Dynamic import with `ssr: false` if needed |
| Bedrock model ID changes | Pin exact model IDs in `classifier.ts` constants. Update if API errors |
| Rate limiting on Bedrock | Unlikely for hackathon volume. If hit, add basic retry with backoff |

---

## Executor Notes

- **Hackathon speed**: Skip error handling, skip tests, skip loading states beyond basics. Optimize for "it works in the demo."
- **All work in `ecoprompt/` subdirectory**: The repo root has spec files; the Next.js app lives in `ecoprompt/`.
- **Commit after each phase**: Push to `main` on the remote after each phase passes verification.
- **All-AWS backend**: Bedrock (LLM + embeddings) + DynamoDB (cache + metrics). No Supabase, no external DB. DynamoDB tables auto-create on first use — no manual setup between phases.
- **IAM permissions**: The AWS credentials need `bedrock:InvokeModel` + DynamoDB CRUD on `ecoprompt-*` tables. A single IAM policy covers all phases.
- **`.env.local`**: Never commit this file. Only 3 vars needed: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
