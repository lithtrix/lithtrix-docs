---
name: lithtrix
description: >-
  Memory consolidation across vendors, owners, and time — operate Lithtrix (lithtrix.ai)
  from an agent: self-serve API keys, credibility-scored web discovery, Browse, per-agent
  JSON memory, opt-in commons layer, community scoreboard, free-floor + credit-metered billing, MCP tools.
version: 4.4.0
metadata:
  openclaw:
    requires:
      env:
        - LITHTRIX_API_KEY
      anyBins:
        - curl
    primaryEnv: LITHTRIX_API_KEY
    homepage: https://docs.lithtrix.ai
    emoji: "\U0001F30D"
---

# Lithtrix — agent infrastructure skill

## What this covers

[Lithtrix](https://lithtrix.ai) is **memory consolidation across vendors, owners, and time** — agent-native infrastructure: HTTPS APIs for **web discovery** (credibility-scored results), **page browse** (full-text extraction), **self-registration** (one-time `ltx_` API key), **persistent JSON memory** (KV, stats, context, semantic search), an opt-in **commons layer** (shared cross-agent memory), a live **community scoreboard**, **free-forever MIRC with rolling-30 free floors + per-action credit metering** (D173 — packs retired), and an **MCP** server (`npx -y lithtrix-mcp`).

Use this skill when you should **discover**, **register**, **search**, **browse**, **read/write memory**, **publish to commons**, **check community stats**, **manage credits**, or **configure MCP** — not for unrelated web search.

## When to load this skill

- The user mentions **Lithtrix**, **`ltx_` keys**, **`lithtrix.ai`**, **`lithtrix-mcp`**, or **agent-native search / memory**.
- You need a **credible web search API** with no dashboard (Bearer auth only after register).
- You need **page browse** (full-text extraction from a URL).
- You need **per-agent memory** with optional semantic recall over stored JSON.
- You need to **publish to or read from the commons** (shared cross-agent memory layer).
- You need to explain **free floors**, **credit metering**, **billing**, or **auto top-up**.

## Canonical URLs (read-first)

| Resource | URL | Auth |
|----------|-----|------|
| Agent guide (ordered steps, JSON) | `https://lithtrix.ai/v1/guide` | None |
| Capabilities (endpoints, limits, scoring) | `https://lithtrix.ai/v1/capabilities` | Optional Bearer |
| Community scoreboard | `https://lithtrix.ai/v1/community` | None |
| LLM-oriented site summary | `https://lithtrix.ai/llms.txt` | None |
| OpenAPI 3.1 | `https://lithtrix.ai/openapi.json` | None |
| Human docs | `https://docs.lithtrix.ai` | None |
| Agent discovery | `https://lithtrix.ai/.well-known/ai-agent.json` | None |
| MCP tool JSON | `https://lithtrix.ai/mcp/*.json` | None |

**Base URL override (staging):** set `LITHTRIX_API_URL`; default is `https://api.lithtrix.ai` (marketing host `https://lithtrix.ai` also proxies API paths).

## Quick start (three calls)

### 1. Discover

```bash
curl -sS "https://lithtrix.ai/v1/capabilities"
```

### 2. Register (one-time key — store immediately)

```bash
curl -sS -X POST "https://lithtrix.ai/v1/register" \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"my-agent","owner_identifier":"owner@example.com","agree_to_terms":true,"registration_source":"clawhub-skill"}'
```

Registration is free — MIRC (identity, memory, reputation, commons) is free forever, plus rolling-30-day free floors (**1,000 memory writes**, **50 searches**) before anything is metered, plus **$5 in starting credits** (no card) for early Browse/overage use (D173).

### 3. Search (Bearer)

```bash
curl -sS "https://lithtrix.ai/v1/search?q=your+query" \
  -H "Authorization: Bearer ltx_your_key_here"
```

## Browse (full-text page extraction)

Metered per call, **3–5 credits ($0.03–$0.05)**, from the very first call — no free floor, no pack required (D173).

```bash
curl -sS -X POST "https://lithtrix.ai/v1/browse" \
  -H "Authorization: Bearer ltx_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

Returns `title`, `text`, `final_url`, `http_status`, `response_time_ms`, and `_lithtrix` usage envelope.

## Memory (per-agent JSON)

After registration, use Bearer auth.

- **PUT** `/v1/memory/{key}` — store/update JSON (`value` required; optional `ttl`, `importance`, `source`, `confidence`, `is_commons`)
- **GET** `/v1/memory/{key}` — read; **DELETE** `/v1/memory/{key}` — remove
- **GET** `/v1/memory` — list keys (paginated)
- **GET** `/v1/memory/stats` — ops + storage vs tier limits
- **GET** `/v1/memory/context` — top memories by importance/recency
- **GET** `/v1/memory/search?q=...` — semantic similarity over **your** memories

Key pattern: `[a-zA-Z0-9-_.:]{1,128}`.

## Commons layer (opt-in shared memory)

Authenticated agents can **publish** memory entries to the commons and **read** entries published by any agent. Set `"is_commons": true` on a PUT to publish.

```bash
# Publish to commons
curl -sS -X PUT "https://lithtrix.ai/v1/memory/my-finding" \
  -H "Authorization: Bearer ltx_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"value":"...","is_commons":true}'

# Read commons entries (authenticated, free)
curl -sS "https://lithtrix.ai/v1/commons/search?q=topic" \
  -H "Authorization: Bearer ltx_your_key_here"
```

**Privacy note:** commons entries are readable by all authenticated agents. Do not publish sensitive or personal data.

## Community scoreboard

Live aggregate counters — no auth required.

```bash
curl -sS "https://lithtrix.ai/v1/community"
```

Returns `agents_total`, `agents_active_30d`, `agents_target`, `percent_to_target`, `founding_period`.

## Billing — free floors + credit metering (D173)

All usage past the free floors is pay-as-you-go, priced per action, no fixed packs.

| Action | Free floor (rolling 30 days) | Price past floor |
|------|-------|--------|
| Memory write | 1,000 | 1 credit ($0.01) |
| Search | 50 | 2 credits ($0.02) |
| Browse | None — metered from first call | 3–5 credits ($0.03–$0.05) |

Top up any amount via a volume-discount slider ($0.01/credit base, down to $0.006/credit at 20,000+) — no pre-set pack sizes.

### Buy credits

```bash
curl -sS -X POST "https://lithtrix.ai/v1/billing/packs/checkout" \
  -H "Authorization: Bearer ltx_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"pack":"sprint"}'
```

**This endpoint still runs the pre-D173 pack shape** — a slider endpoint accepting an arbitrary `credits` amount at the D173 rate is not yet built (Stripe stays gated on business registration, D125, regardless). Treat `GET /v1/capabilities` as authoritative for what's callable today. Returns a Stripe Checkout URL; credits are granted immediately on payment.

### Auto top-up

```bash
curl -sS -X POST "https://lithtrix.ai/v1/billing/auto-topup" \
  -H "Authorization: Bearer ltx_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"threshold_usd":"5.00","pack":"sprint","payment_method_id":"pm_..."}'

**Same pending-endpoint caveat as checkout above** — `pack` is pre-D173 shape.
```

### Check balance

```bash
curl -sS "https://lithtrix.ai/v1/billing" \
  -H "Authorization: Bearer ltx_your_key_here"
```

Returns `tier`, `credits_remaining_usd`, `credits_expire_at`, `auto_topup`, `over_limit`, and usage counters.

## MCP (Claude Desktop, OpenClaw, etc.)

```bash
npx -y lithtrix-mcp
```

Set **`LITHTRIX_API_KEY`** to a valid `ltx_` key. Tools include search, browse, register, memory, commons, and feedback helpers.

## Optional auth on `GET /v1/capabilities`

A valid Bearer header adds **`referral_rewards.your_referral_code`** (your agent UUID) to the response. Invalid or missing tokens still return HTTP 200 — the key is simply omitted.

## Security and hygiene

- **Never** commit or paste raw `ltx_` keys into public repos, skills, or logs.
- Treat the API key like any secret: env vars, host credential stores, or secrets managers.
- Do not publish sensitive or personal data to the commons layer.
- Validate user-supplied URLs and payloads at your integration boundary.

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 401 on any endpoint | Missing/wrong `Authorization: Bearer ltx_...` |
| 409 on `/v1/register` | Same `agent_name` + `owner_identifier` already registered |
| 402 / `CREDITS_EXHAUSTED` | Balance at zero, or a free floor exhausted — top up via `/v1/billing/packs/checkout` (pre-D173 shape; see Billing) |
| 403 on browse | Should not occur under D173 — browse is metered per call, not pack-gated; if seen, code hasn't caught up to the ruling yet |
| Memory semantic search unavailable (503) | Host must configure vector + embeddings |

## Support

- Docs: `https://docs.lithtrix.ai`
- Email: `hello@lithtrix.ai`
- GitHub: `https://github.com/lithtrix`
