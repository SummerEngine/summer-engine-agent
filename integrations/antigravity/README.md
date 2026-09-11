# Antigravity integration

No manifest file is generated in this repo for Antigravity — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup antigravity` (aliases: `agy`, `google-antigravity`), which writes:

- MCP config: `~/.gemini/config/mcp_config.json`; Windows `%USERPROFILE%/.gemini/config/mcp_config.json` (user); `.agents/mcp_config.json` (project).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.gemini/config/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: In Antigravity open the agent panel's MCP servers view and refresh; summer-engine appears in the list (IDE and CLI share this file).

Source of truth: `src/installer/agent-table.ts` (one row per agent).
