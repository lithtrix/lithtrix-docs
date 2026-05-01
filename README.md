# Lithtrix — Agent Infrastructure. Built to Last.

Lithtrix gives AI agents verified APIs for search, **Browse** (server-side public web for agents with a **Sprint** / **Mission** / **Deploy** pack), memory, document storage, and structured feedback. Agents register themselves in a single API call — no dashboard, no OAuth, no human approval.

**Base URL:** https://api.lithtrix.ai
**Docs:** https://docs.lithtrix.ai
**Discovery:** https://api.lithtrix.ai/v1/capabilities (version **`2.5.0`** — `tier_descriptions`, `pricing`, `commons`, `GET /v1/community`, extended `_lithtrix.usage` + `community` on authenticated responses)
**Pricing:** [docs/pricing.mdx](./pricing.mdx) — **Spark** trial, **Sprint / Mission / Deploy** packs, **$0.005** per-call rates, auto top-up (Mintlify nav **Getting Started → Pricing**).

---

## What's Live (Phase 3 + Arc 11)

| Pillar | What it does |
|--------|-------------|
| **Search** | Credibility-scored web search via `GET /v1/search` |
| **Browse** | Server-side public web — **buy Sprint** (or Mission / Deploy) **to unlock** (`POST /v1/browse`, `GET /v1/browse/{id}`) |
| **Memory** | Per-agent persistent JSON KV + semantic search via `/v1/memory` |
| **Documents** | Binary blob storage, parsing (PDF/DOCX/CSV/XLSX), semantic chunk search via `/v1/blobs` |
| **Feedback** | Structured signal on any result via `POST /v1/feedback` (Arc 11) |

---

## Quickstart (3 calls)

### 1. Discover
```bash
curl https://api.lithtrix.ai/v1/capabilities
```

### 2. Register
```bash
curl -X POST https://api.lithtrix.ai/v1/register \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"my-agent","owner_identifier":"you@example.com","agree_to_terms":true}'
```
Returns `{ "api_key": "ltx_...", "agent_id": "..." }`. The key is shown once — store it immediately.

### 3. Search
```bash
curl "https://api.lithtrix.ai/v1/search?q=Singapore+climate+policy" \
  -H "Authorization: Bearer ltx_your_key"
```

---

## MCP Integration

```bash
npx -y lithtrix-mcp
```

Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lithtrix": {
      "command": "npx",
      "args": ["-y", "lithtrix-mcp"],
      "env": {
        "LITHTRIX_API_KEY": "ltx_your_key_here"
      }
    }
  }
}
```

Tools exposed include: `lithtrix_register`, `lithtrix_search`, `lithtrix_browse`, `lithtrix_feedback`, memory (`lithtrix_memory_*`), and blob tools (`lithtrix_blob_*`). See [MCP](https://docs.lithtrix.ai/integrations/mcp) and [Browse](https://docs.lithtrix.ai/api-reference/browse).

---

## Pricing

**Spark to start. Sprint, Mission, or Deploy when your agent has work to do.**  
Credit packs — **Spark** trial on register (**$5**, no card), then one-off **Sprint** ($25), **Mission** ($50), **Deploy** ($100) via **`POST /v1/billing/packs/checkout`**. Pack grants **expire in 90 days** (UTC). Metered **Search $0.005** and **Browse $0.005** per successful call. Paid packs are a **private workspace** for your agent to **search, browse, and remember.** **Auto top-up:** set a threshold — we refill automatically. Full detail: [pricing.mdx](./pricing.mdx).

| Pack | Price | Notes |
|------|-------|--------|
| **Spark** (trial) | **$5** credits on register | **Browse not included** — buy Sprint (or Mission / Deploy) to unlock Browse |
| **Sprint** | **$25** | One-off credits · **90-day expiry** |
| **Mission** | **$50** | One-off credits · **90-day expiry** |
| **Deploy** | **$100** | One-off credits · **90-day expiry** |
| **Volume** | Custom | **Need more? Get in touch:** hello@lithtrix.ai |

Optional `referral_agent` on register credits the referrer +$0.50 per validated signup (see `GET /v1/capabilities` `referral_rewards`). Some older accounts may still show **Starter / Pro** monthly billing in **`GET /v1/billing`** — contact support if you need to migrate.

---

## Credibility Scoring

Every search result includes `credibility_score` (0.0–1.0):

| Score | Source type |
|-------|-------------|
| 1.0 | `.gov` domains |
| 0.9 | `.edu` domains |
| 0.8 | Major news (BBC, Reuters, AP News, NPR…) |
| 0.7 | `.org` domains |
| 0.5 | All other sources |

---

## Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/capabilities` | None | Discovery — version, endpoints, rate limits |
| GET | `/.well-known/ai-agent.json` | None | Agent discovery file |
| GET | `/v1/guide` | None | Machine-readable agent quickstart |
| POST | `/v1/register` | None | Register agent, get API key (`agree_to_terms` required) |
| POST | `/v1/billing/packs/checkout` | Bearer | Buy Sprint / Mission / Deploy credit pack |
| GET | `/v1/search` | Bearer | Web search with credibility scoring |
| POST | `/v1/browse` | Bearer | Server-side public web (static or dynamic) |
| GET | `/v1/browse/{browse_id}` | Bearer | Retrieve logged browse result |
| PUT/GET/DELETE | `/v1/memory/{key}` | Bearer | Per-agent JSON memory |
| GET | `/v1/memory/search` | Bearer | Semantic memory search |
| PUT/GET/DELETE | `/v1/blobs/{id}` | Bearer | Binary blob storage |
| POST | `/v1/blobs/{id}/parse` | Bearer | Parse PDF/DOCX/CSV/XLSX |
| GET | `/v1/blobs/search` | Bearer | Semantic chunk search |
| POST | `/v1/feedback` | Bearer | Structured signal on any result |
| GET | `/v1/feedback/stats` | Bearer | Rolling 7d/30d feedback aggregates |
| GET | `/v1/me` | Bearer | Agent profile + referral code |
| GET | `/v1/usage` | Bearer | Monthly usage + 7-day breakdown |
| POST | `/v1/keys/rotate` | Bearer | Rotate API key |
| GET | `/health` | None | Health check |

---

## License

MIT
