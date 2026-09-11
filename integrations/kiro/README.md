# Kiro integration

No manifest file is generated in this repo for Kiro — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup kiro` (aliases: `kiro-ide`, `aws-kiro`), which writes:

- MCP config: `~/.kiro/settings/mcp.json`; Windows `%USERPROFILE%/.kiro/settings/mcp.json` (user); `.kiro/settings/mcp.json` (project).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.kiro/skills` (user) or `.kiro/skills` (project) as `<skill>/SKILL.md`.
- After: Kiro reloads MCP config on save; open the MCP Servers view to confirm summer-engine is connected.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
