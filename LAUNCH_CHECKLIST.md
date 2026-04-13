# Lithtrix — Pre-Launch Checklist

Run through this top to bottom before announcing. Each item has a curl command or location.
Check off each line as you go.

---

## 1. Railway Environment Variables

Verify all are set in Railway → lithtrix-api → Variables:

- [x] `BRAVE_API_KEY`
- [x] `SUPABASE_URL`
- [x] `SUPABASE_SERVICE_KEY`
- [x] `API_BASE_URL` = `https://lithtrix.ai`
- [x] `UPSTASH_REDIS_REST_URL`
- [x] `UPSTASH_REDIS_REST_TOKEN`
- [x] `STRIPE_SECRET_KEY`
- [x] `STRIPE_PUBLISHABLE_KEY`
- [x] `STRIPE_WEBHOOK_SECRET`
- [x] `ADMIN_API_KEY`
- [x] `ALLOWED_ORIGINS` = `https://lithtrix.ai,https://www.lithtrix.ai`
- [x] `FREE_TIER_LIFETIME_LIMIT` = `300`

---

## 2. Supabase Migration

Run in Supabase SQL editor (Dashboard → SQL Editor):

```sql
ALTER TABLE agents ALTER COLUMN monthly_limit SET DEFAULT 300;
UPDATE agents SET monthly_limit = 300 WHERE tier = 'free' AND monthly_limit = 1000;
```

- [x] Migration executed without errors

---

## 3. Stripe Webhook

In Stripe Dashboard → Developers → Webhooks:

- [x] Endpoint URL: `https://lithtrix.ai/v1/billing/webhook`
- [x] Events: `invoice.payment_succeeded`, `invoice.payment_failed`
- [x] Signing secret copied to Railway `STRIPE_WEBHOOK_SECRET`

Test the webhook:
```bash
# Stripe CLI (if installed)
stripe trigger invoice.payment_succeeded
```

---

## 3b. Switch Stripe to Live Mode

Do this immediately before announcing. Not required for API verification — required before real users pay.

### Step 1 — Get live keys from Stripe Dashboard
Stripe Dashboard → Developers → toggle **"Test mode" OFF** (top right) → API keys:
- Copy `sk_live_...` → this is your new `STRIPE_SECRET_KEY`
- Copy `pk_live_...` → this is your new `STRIPE_PUBLISHABLE_KEY`

### Step 2 — Register a live webhook
Still in live mode: Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://lithtrix.ai/v1/billing/webhook`
- Events: `invoice.payment_succeeded`, `invoice.payment_failed`
- Copy the new signing secret → this is your new `STRIPE_WEBHOOK_SECRET`

(The test webhook you set up in item 3 only fires in test mode — it will not receive live events.)

### Step 3 — Update Railway env vars
Railway → lithtrix-api → Variables — update all three:
```
STRIPE_SECRET_KEY      = sk_live_...
STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET  = whsec_... (the new live webhook secret)
```
Railway auto-redeploys on variable save.

### Step 4 — Verify
```bash
curl https://lithtrix.ai/v1/billing/config
# Expected: {"stripe_publishable_key":"pk_live_..."}
```
Confirm the key starts with `pk_live_` not `pk_test_`.

- [ ] Live Stripe keys set in Railway
- [ ] Live webhook endpoint registered in Stripe dashboard
- [ ] `/v1/billing/config` returns `pk_live_...`

---

## 4. Health Check

```bash
curl https://lithtrix.ai/health
# Expected: {"status":"ok"} or similar
```

- [ ] Returns 200

---

## 5. Service Status

```bash
curl https://lithtrix.ai/v1/status
# Expected: all dependencies green
```

- [ ] Supabase: connected
- [ ] Redis: connected
- [ ] Brave: reachable

---

## 6. Agent Discovery

```bash
curl https://lithtrix.ai/.well-known/ai-agent.json
# Expected: JSON with name=Lithtrix, url=https://lithtrix.ai
```

- [ ] Returns 200
- [ ] `url` field = `https://lithtrix.ai` (not a Railway URL)

---

## 7. Capabilities

```bash
curl https://lithtrix.ai/v1/capabilities
# Expected: free_tier = "300 calls (one-time trial, lifetime total)"
```

- [ ] Returns 200
- [ ] `rate_limits.free_tier` shows 300 lifetime calls (not 1000/month)

---

## 8. Agent Guide

```bash
curl https://lithtrix.ai/v1/guide
# Expected: 5-step JSON guide
```

- [ ] Returns 200
- [ ] 5 steps present: discover, register, search, check_usage, upgrade

---

## 9. End-to-End Agent Lifecycle

Register a fresh test agent:

```bash
curl -X POST https://lithtrix.ai/v1/register \
  -H "Content-Type: application/json" \
  -d '{"agent_name":"launch-test-agent","owner_identifier":"jayden@lithtrix.ai"}'
```

- [ ] Returns `api_key` starting with `ltx_`
- [ ] Save the key as `TEST_KEY`

Search:

```bash
curl "https://lithtrix.ai/v1/search?q=hello+world&num_results=3" \
  -H "Authorization: Bearer $TEST_KEY"
```

- [ ] Returns results with `credibility_score` on each
- [ ] `usage.calls_total` = 1, `usage.calls_remaining` = 299
- [ ] `over_limit` = false

Check billing:

```bash
curl https://lithtrix.ai/v1/billing \
  -H "Authorization: Bearer $TEST_KEY"
```

- [ ] `tier` = `free`
- [ ] `calls_total` = 1
- [ ] `call_limit` = 300
- [ ] `over_limit` = false

---

## 10. Admin Access

```bash
curl https://lithtrix.ai/admin/stats \
  -H "X-Admin-Key: $ADMIN_API_KEY"
```

- [ ] Returns 200 with agent/usage stats

---

## 11. MCP Server

```bash
npx -y lithtrix-mcp --help 2>&1 || echo "check package published"
```

- [ ] `lithtrix-mcp` published to npm
- [ ] Installs without errors
- [ ] LITHTRIX_API_KEY env var picked up correctly

---

## 12. Landing Page

- [ ] `https://lithtrix.ai` loads (Cloudflare Pages deployed)
- [ ] Pricing shows "300 calls" (not 1000/month)
- [ ] "Agent Quickstart →" links to `/v1/guide`
- [ ] No JavaScript errors in browser console

---

## 13. Docs

- [ ] `https://docs.lithtrix.ai` loads (Mintlify deployed)
- [ ] Navigation matches `mint.json` (Getting Started, API Reference, Concepts, Integrations)

---

## 14. Public GitHub Repo

- [ ] `https://github.com/lithtrix/lithtrix-docs` is public
- [ ] README renders correctly
- [ ] Examples link is live

---

## 15. MCP Registry Submission

- [ ] PR opened on [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) (see `mcp-registry/anthropic-pr-entry.md`)
- [ ] Submitted to [glama.ai/mcp/servers](https://glama.ai/mcp/servers)
- [ ] Submitted to [mcp.so](https://mcp.so)

---

## 16. Announce

- [ ] Launch tweet reviewed and posted from @lithtrixhq (see `launch/tweet.md`)
- [ ] Show HN posted if going that route (see `launch/show_hn.md`)

---

**All 16 items checked = Lithtrix is live.**

---

## Finish batch — items 13–16 (copy-paste)

This repo (`lithtrix-docs/`) now includes **Mintlify pages** + **README**, **examples/**, **launch/**, **mcp-registry/**, and ops checklists. Push it once to **`lithtrix/lithtrix-docs`** on GitHub, then wire Mintlify and registries.

### 13 + 14 — GitHub + Mintlify (one repo)

**A. Create the public repo** (GitHub web UI or `gh` CLI):

- New repository: **`lithtrix/lithtrix-docs`**, **Public**, empty (no README from GitHub).

**B. Push this folder** (from your machine; adjust if your clone path differs):

```bash
cd /path/to/lithtrix/lithtrix-docs
git init
git branch -M main
git remote add origin https://github.com/lithtrix/lithtrix-docs.git
git add .
git commit -m "docs: Lithtrix public docs, Mintlify site, and examples"
git push -u origin main
```

If the repo was created with a default commit on GitHub, use:

```bash
git pull origin main --rebase
git push -u origin main
```

**C. Mintlify** ([mintlify.com](https://mintlify.com) → sign in → New project):

1. **Connect** → GitHub → select **`lithtrix/lithtrix-docs`**.
2. Root directory: **`.`** (repo root — `mint.json` is there).
3. Production domain: **`docs.lithtrix.ai`**.
4. Mintlify shows a **DNS record** for `docs` (usually a **CNAME** — **copy their target hostname exactly**; it may differ from product to product).
5. In **Cloudflare** → **DNS** for `lithtrix.ai` → add that **CNAME** for **`docs`** (or follow Mintlify’s “Cloudflare” doc if they use a TXT verification step first).
6. Wait until Mintlify shows domain **Active**, then open **https://docs.lithtrix.ai**.

### 15 — MCP registries

1. **Anthropic list:** Fork [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers), add the line from [`mcp-registry/anthropic-pr-entry.md`](mcp-registry/anthropic-pr-entry.md) to their community README (match their table format), open a PR.
2. **Glama:** [glama.ai/mcp/servers](https://glama.ai/mcp/servers) → submit / add server → **npm:** `lithtrix-mcp`, homepage **https://lithtrix.ai**, repo **https://github.com/lithtrix/lithtrix-docs**.
3. **mcp.so:** [mcp.so](https://mcp.so) → submit with the same fields.

### 16 — Announce

- Pick a tweet from [`launch/tweet.md`](launch/tweet.md).
- Optional: [`launch/show_hn.md`](launch/show_hn.md) on HN.

### Before announcing — Stripe live (checklist §3b)

Flip **test → live** keys + **live** webhook secret in Railway, then confirm:

```bash
curl https://lithtrix.ai/v1/billing/config
```

Response must include **`pk_live_...`**.
