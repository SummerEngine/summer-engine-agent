# Kimi Code CLI integration

No manifest file is generated in this repo for Kimi Code CLI — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup kimi-code` (aliases: `kimi`, `kimi-cli`, `kimicode`), which writes:

- MCP config: `~/.kimi/mcp.json`; Windows `%USERPROFILE%/.kimi/mcp.json` (user); user scope only (project requests fall back with a warning).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.kimi/skills` (user) or `.kimi/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Kimi Code CLI so it reconnects its MCP servers.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
