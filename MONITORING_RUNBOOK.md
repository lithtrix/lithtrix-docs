# Lithtrix — Monitoring Runbook

Day-to-day operational reference. Read once, keep handy.

---

## Daily Checks (< 5 minutes)

### 1. Health
```bash
curl https://lithtrix.ai/health
curl https://lithtrix.ai/v1/status
```
Both should return 200. If `/v1/status` shows a dependency down, check Railway logs.

### 2. Admin Stats
```bash
curl https://lithtrix.ai/admin/stats \
  -H "X-Admin-Key: $ADMIN_API_KEY"
```
Review: total agents, total searches (last 24h), error rate. No threshold set yet — build a sense of baseline in the first week.

### 3. Railway Logs
Check Railway → lithtrix-api → Logs for:
- Any `500` or `502` responses
- `CIRCUIT_OPEN` log lines (Brave Search circuit breaker tripped)
- `rate_limit_exceeded` at unusual volume

---

## First Agent Registration Alert

Supabase can send a webhook when a row is inserted into `agents`. To set up:

1. In Supabase: Database → Webhooks → Create Webhook
2. Table: `agents`, Event: `INSERT`
3. Webhook URL: a simple email relay (e.g. [webhook.site](https://webhook.site) for testing, or a Zapier/Make webhook → email)
4. You'll get an email/ping every time a new agent registers

Alternatively, run this query in Supabase SQL Editor periodically:
```sql
SELECT agent_name, owner_identifier, created_at
FROM agents
ORDER BY created_at DESC
LIMIT 10;
```

---

## Suspending a Bad Agent

If an agent is abusing the API or violating terms:

```bash
# Get agent ID from admin list
curl https://lithtrix.ai/admin/agents \
  -H "X-Admin-Key: $ADMIN_API_KEY"

# Suspend by agent ID
curl -X POST https://lithtrix.ai/admin/agents/{agent_id}/suspend \
  -H "X-Admin-Key: $ADMIN_API_KEY"
```

Suspended agents get `403` on all authenticated endpoints. To reinstate:
```bash
curl -X POST https://lithtrix.ai/admin/agents/{agent_id}/reinstate \
  -H "X-Admin-Key: $ADMIN_API_KEY"
```

---

## Rate Limit Behaviour

| Tier | Global cap | Per-agent cap |
|------|-----------|---------------|
| Free | 1200/min (global middleware) | 60/min |
| Pro  | 1200/min (global middleware) | 600/min |

A `429` response includes `Retry-After` header. Repeated abuse triggers an abuse flag in Redis.

---

## Circuit Breaker (Brave Search)

If Brave Search goes down, the circuit breaker opens after 5 consecutive failures. During open state (60s), all search requests return `503` immediately. After 60s it moves to half-open and retries.

Watch for `CIRCUIT_OPEN` in Railway logs. If Brave is having an extended outage, there is no fallback — searches will fail until Brave recovers.

---

## Stripe Webhook Failures

Check Stripe Dashboard → Developers → Webhooks → lithtrix endpoint for failed deliveries.

If `STRIPE_WEBHOOK_SECRET` is wrong or rotated, webhook verification will fail silently (logged but not surfaced to users). Symptoms: Pro upgrade appears to work but tier doesn't change in DB. Fix: update `STRIPE_WEBHOOK_SECRET` in Railway and re-send failed events from Stripe dashboard.

---

## Key Metrics to Track (Week 1)

| Metric | Where | Target |
|--------|-------|--------|
| Registrations | `GET /admin/stats` | >0 in first 48h post-launch |
| Search calls | `GET /admin/stats` | Increasing week-on-week |
| Pro conversions | Supabase: `SELECT COUNT(*) FROM agents WHERE tier='pro'` | Any by end of week 2 |
| Error rate | Railway logs | <1% of requests |
| Circuit opens | Railway logs | 0 per day |

---

## Railway Redeployment

If a bad deploy goes out:
1. Railway → lithtrix-api → Deployments → select previous good deploy → Redeploy
2. No data loss — Supabase and Redis are external

---

## Secrets Rotation

All secrets live in Railway environment variables. To rotate:
1. Generate new value
2. Update in Railway → Variables
3. Redeploy (Railway auto-redeploys on var change)
4. For `ADMIN_API_KEY`: update your local env too

Never rotate `SUPABASE_SERVICE_KEY` without checking all Supabase RLS policies first.
