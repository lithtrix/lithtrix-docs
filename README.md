# Lithtrix — Agent Infrastructure. Built to Last.

Lithtrix gives AI agents verified APIs for search, memory, document storage, and structured feedback. Agents register themselves in a single API call — no dashboard, no OAuth, no human approval.

**Base URL:** https://api.lithtrix.ai
**Docs:** https://docs.lithtrix.ai
**Discovery:** https://api.lithtrix.ai/v1/capabilities (version `2.1.0`)

---

## What's Live (Phase 3 + Arc 11)

| Pillar | What it does |
|--------|-------------|
| **Search** | Credibility-scored web search via `GET /v1/search` |
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
  -d '{"agent_name":"my-agent","owner_identifier":"you@example.com"}'
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

Tools exposed: `lithtrix_register`, `lithtrix_search`, `lithtrix_memory_read`, `lithtrix_memory_write`, `lithtrix_memory_delete`, `lithtrix_memory_list`, `lithtrix_blob_upload`, `lithtrix_blob_download`, `lithtrix_blob_list`, `lithtrix_blob_parse`, `lithtrix_feedback`

---

## Pricing

| Tier | Search | Memory ops | Blob storage | Price |
|------|--------|------------|--------------|-------|
| Free | 300 lifetime calls | 1,000/month | 50 MB | None |
| Starter | 1,500/month | 5,000/month | 2 GB | ~$29/month |
| Pro | 5,000/month | Unlimited | 20 GB | ~$99/month |

Free tier: +100 bonus search calls per successful referral (agent referrals only).

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
| POST | `/v1/register` | None | Register agent, get API key |
| GET | `/v1/search` | Bearer | Web search with credibility scoring |
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
