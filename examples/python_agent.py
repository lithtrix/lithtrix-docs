"""
Lithtrix — full lifecycle example (Python).

Demonstrates: discover → register → search → check usage → upgrade prompt.

Requirements: Python 3.9+, requests (`pip install requests`)

Usage:
    python python_agent.py

To skip registration (if you already have a key):
    LITHTRIX_API_KEY=ltx_your_key python python_agent.py
"""

import os

import requests

BASE_URL = "https://lithtrix.ai"


def discover() -> dict:
    """Read service capabilities."""
    resp = requests.get(f"{BASE_URL}/v1/capabilities", timeout=10)
    resp.raise_for_status()
    return resp.json()


def register(agent_name: str, owner_identifier: str) -> str:
    """Register as a new agent. Returns the one-time API key."""
    resp = requests.post(
        f"{BASE_URL}/v1/register",
        json={"agent_name": agent_name, "owner_identifier": owner_identifier},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    print(f"[register] agent_id={data['agent_id']}")
    print(f"[register] api_key={data['api_key']}  ← store this securely!")
    return data["api_key"]


def search(api_key: str, query: str, num_results: int = 5) -> list[dict]:
    """Search the web. Returns credibility-scored results."""
    resp = requests.get(
        f"{BASE_URL}/v1/search",
        params={"q": query, "num_results": num_results},
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    usage = data.get("usage", {})
    print(
        f"[search] calls_total={usage.get('calls_total')}  "
        f"calls_remaining={usage.get('calls_remaining')}  "
        f"cached={data.get('cached')}"
    )
    return data["results"]


def check_usage(api_key: str) -> dict:
    """Check current tier, usage, and limit."""
    resp = requests.get(
        f"{BASE_URL}/v1/billing",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def main() -> None:
    # Step 1: Discover
    print("\n--- Step 1: Discover ---")
    caps = discover()
    print(f"Service: {caps['service']}  version={caps['version']}")
    print(f"Free tier: {caps['rate_limits']['free_tier']}")

    # Step 2: Register (or use existing key from env)
    api_key = os.getenv("LITHTRIX_API_KEY")
    if not api_key:
        print("\n--- Step 2: Register ---")
        api_key = register(
            agent_name="python-example-agent",
            owner_identifier="example@lithtrix.ai",
        )
    else:
        print(f"\n--- Step 2: Using existing key from env ---")

    # Step 3: Search
    print("\n--- Step 3: Search ---")
    query = "Singapore climate policy 2025"
    results = search(api_key, query, num_results=3)
    for i, r in enumerate(results, 1):
        print(
            f"  {i}. [{r['credibility_score']:.1f}] {r['title']}\n"
            f"     {r['url']}"
        )

    # Step 4: Check usage
    print("\n--- Step 4: Check Usage ---")
    billing = check_usage(api_key)
    print(f"Tier: {billing['tier']}")
    print(f"calls_total={billing['calls_total']}  call_limit={billing['call_limit']}")
    if billing.get("over_limit"):
        print("NOTE: over_limit=true — upgrade to Pro to continue searching.")
        print(f"Upgrade path: GET {BASE_URL}/v1/billing/config → POST {BASE_URL}/v1/billing/setup")

    print("\nDone.")


if __name__ == "__main__":
    main()
