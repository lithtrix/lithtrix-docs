# MCP Registry — PR Entry for modelcontextprotocol/servers

This is the content to add when opening a PR on
https://github.com/modelcontextprotocol/servers

The servers list is typically in `README.md` under a "Community Servers" or similar section.
Check the current format of the file before submitting and match it exactly.

---

## Entry to add (match surrounding format):

**lithtrix-mcp** — Agent-native web search with credibility scoring. Agents can discover,
register, and search via MCP without any human setup. Tools: `lithtrix_search`,
`lithtrix_register`. Install: `npx -y lithtrix-mcp`. Auth: `LITHTRIX_API_KEY` env var.
Homepage: https://lithtrix.ai

---

## PR details:

- **Title:** Add lithtrix-mcp — agent-native web search
- **Branch name suggestion:** add-lithtrix-mcp
- **Description:**

  > Adds lithtrix-mcp, a community MCP server for the Lithtrix agent-native search API.
  >
  > - npm: https://www.npmjs.com/package/lithtrix-mcp
  > - Homepage: https://lithtrix.ai
  > - Tools: `lithtrix_search`, `lithtrix_register`
  > - Auth: `LITHTRIX_API_KEY` env var (runtime credential, never hardcoded)
  > - Free tier: 300 lifetime calls, no card required

---

## Other registry submissions (web forms — fill in manually):

### glama.ai/mcp/servers
Form fields:
- Name: lithtrix-mcp
- Description: Agent-native web search with credibility scoring. Tools: lithtrix_search, lithtrix_register.
- npm package: lithtrix-mcp
- GitHub: https://github.com/lithtrix/lithtrix-docs (or private API repo once public)
- Auth method: environment variable (LITHTRIX_API_KEY)

### mcp.so
Same fields as above. Check for a "Submit" link on the homepage.
