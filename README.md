# Lithtrix — Agent-Native Search API

Lithtrix gives AI agents credibility-scored web search with zero human setup required.
Agents discover the service, register themselves, and get a one-time API key — entirely via API.

**Base URL:** https://lithtrix.ai  
**Docs:** https://docs.lithtrix.ai  
**OpenAPI:** https://lithtrix.ai/openapi.json

This repository is the **public docs + examples** home for Lithtrix. The Mintlify site at **docs.lithtrix.ai** is built from the same tree (`mint.json` + `.mdx` pages). Example code lives in [`examples/`](examples/).

---

## Quickstart (3 calls)

### 1. Discover
```bash
curl https://lithtrix.ai/v1/capabilities
```

### 2. Register (one time — store the key immediately)
```bash
curl -X POST https://lithtrix.ai/v1/register \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"my-agent","owner_identifier":"you@example.com"}'
```
Returns `{ "api_key": "ltx_...", "agent_id": "..." }`. The key is shown once.

### 3. Search
```bash
curl "https://lithtrix.ai/v1/search?q=Singapore+climate+policy" \
  -H "Authorization: Bearer ltx_your_key"
```

---

## MCP Integration

Install via npx (no global install required):

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

Tools exposed: `lithtrix_search`, `lithtrix_register`

---

## Pricing

| Tier | Calls | Rate limit | Billing |
|------|-------|------------|---------|
| Free | 300 lifetime (trial, never resets) | 60/min | None required |
| Pro  | Unlimited | 600/min | Stripe (via API) |

Upgrade path: `GET /v1/billing/config` → create Stripe PaymentMethod → `POST /v1/billing/setup`

---

## Credibility Scoring

Every result includes `credibility_score` (0.0–1.0):

| Score | Source type |
|-------|-------------|
| 1.0 | `.gov` domains |
| 0.9 | `.edu` domains |
| 0.8 | Major news (BBC, Reuters, AP News, NPR...) |
| 0.7 | `.org` domains |
| 0.5 | All other sources |

---

## API Reference

Full reference: https://lithtrix.ai/openapi.json  
Docs: https://docs.lithtrix.ai

Key endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/guide` | None | Machine-readable agent quickstart |
| GET | `/v1/capabilities` | None | Service capabilities + rate limits |
| POST | `/v1/register` | None | Register agent, get API key |
| GET | `/v1/search?q=...` | Bearer | Web search with credibility scoring |
| GET | `/v1/me` | Bearer | Agent profile |
| GET | `/v1/billing` | Bearer | Tier, usage, limit |
| POST | `/v1/billing/setup` | Bearer | Upgrade to Pro via Stripe |
| POST | `/v1/keys/rotate` | Bearer | Rotate API key |
| GET | `/health` | None | Health check |

---

## Examples

- [`examples/python_agent.py`](examples/python_agent.py) — full lifecycle in Python
- [`examples/node_agent.js`](examples/node_agent.js) — full lifecycle in Node.js

---

## License

MIT
