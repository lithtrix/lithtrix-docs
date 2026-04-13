/**
 * Lithtrix — full lifecycle example (Node.js).
 *
 * Demonstrates: discover → register → search → check usage.
 *
 * Requirements: Node.js 18+ (uses built-in fetch)
 *
 * Usage:
 *   node node_agent.js
 *
 * To skip registration (if you already have a key):
 *   LITHTRIX_API_KEY=ltx_your_key node node_agent.js
 */

const BASE_URL = "https://lithtrix.ai";

async function discover() {
  const res = await fetch(`${BASE_URL}/v1/capabilities`);
  if (!res.ok) throw new Error(`discover failed: ${res.status}`);
  return res.json();
}

async function register(agentName, ownerIdentifier) {
  const res = await fetch(`${BASE_URL}/v1/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_name: agentName, owner_identifier: ownerIdentifier }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`register failed: ${res.status} ${err.message ?? ""}`);
  }
  const data = await res.json();
  console.log(`[register] agent_id=${data.agent_id}`);
  console.log(`[register] api_key=${data.api_key}  ← store this securely!`);
  return data.api_key;
}

async function search(apiKey, query, numResults = 5) {
  const url = new URL(`${BASE_URL}/v1/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("num_results", String(numResults));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`search failed: ${res.status} ${err.message ?? ""}`);
  }
  const data = await res.json();
  const { calls_total, calls_remaining } = data.usage ?? {};
  console.log(`[search] calls_total=${calls_total}  calls_remaining=${calls_remaining}  cached=${data.cached}`);
  return data.results;
}

async function checkUsage(apiKey) {
  const res = await fetch(`${BASE_URL}/v1/billing`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`billing failed: ${res.status}`);
  return res.json();
}

async function main() {
  // Step 1: Discover
  console.log("\n--- Step 1: Discover ---");
  const caps = await discover();
  console.log(`Service: ${caps.service}  version=${caps.version}`);
  console.log(`Free tier: ${caps.rate_limits.free_tier}`);

  // Step 2: Register (or use existing key from env)
  let apiKey = process.env.LITHTRIX_API_KEY;
  if (!apiKey) {
    console.log("\n--- Step 2: Register ---");
    apiKey = await register("node-example-agent", "example@lithtrix.ai");
  } else {
    console.log("\n--- Step 2: Using existing key from env ---");
  }

  // Step 3: Search
  console.log("\n--- Step 3: Search ---");
  const results = await search(apiKey, "Singapore climate policy 2025", 3);
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.credibility_score.toFixed(1)}] ${r.title}`);
    console.log(`     ${r.url}`);
  });

  // Step 4: Check usage
  console.log("\n--- Step 4: Check Usage ---");
  const billing = await checkUsage(apiKey);
  console.log(`Tier: ${billing.tier}`);
  console.log(`calls_total=${billing.calls_total}  call_limit=${billing.call_limit}`);
  if (billing.over_limit) {
    console.log("NOTE: over_limit=true — upgrade to Pro to continue searching.");
    console.log(`Upgrade path: GET ${BASE_URL}/v1/billing/config → POST ${BASE_URL}/v1/billing/setup`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
