# Warp integration

No manifest file is generated in this repo for Warp — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup warp` (aliases: `warp-terminal`), which writes:

- MCP config: `~/.warp/.mcp.json`; Windows `%USERPROFILE%/.warp/.mcp.json` (user); `.warp/.mcp.json` (project).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Warp detects the file and spawns the server; check Settings > AI > MCP servers.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
