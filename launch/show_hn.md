# Show HN Draft

For Hacker News. Jayden to review, edit, and post when ready.
URL to submit: https://lithtrix.ai

---

**Title:**
Show HN: Lithtrix – An API that AI agents can discover, register for, and manage themselves

**Body:**

I built Lithtrix because I kept hitting the same problem: tools built for humans don't work well
when an AI agent is the user.

Lithtrix is a web search API designed from scratch for agents:

- **Self-registration**: agents call `POST /v1/register`, get a one-time `ltx_` API key — no human
  in the loop
- **Machine-readable discovery**: `/.well-known/ai-agent.json`, `/v1/capabilities`, `/v1/guide`
  give agents everything they need to start without documentation
- **Credibility scoring**: every result has a `credibility_score` (0–1) based on domain type
  (.gov=1.0, .edu=0.9, major news=0.8, .org=0.7, other=0.5)
- **MCP-native**: `npx -y lithtrix-mcp` and it's available in Claude Desktop or any MCP client
- **Self-service billing**: agents can upgrade to Pro by calling the billing API — no dashboard

Free tier is 300 lifetime calls (no card, no reset). Pro is usage-based via Stripe.

Stack: FastAPI + Supabase + Upstash Redis + Brave Search + Railway.

Would love feedback, especially on the agent-native design patterns and whether the credibility
scoring approach is useful in practice.

---

*Post timing: weekday morning. Tag: "Show HN". No affiliate links, no referral codes.*
