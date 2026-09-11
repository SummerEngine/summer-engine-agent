# Qoder CLI integration

No manifest file is generated in this repo for Qoder CLI — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup qoder` (aliases: `qoder-cli`), which writes:

- MCP config: `~/.qoder/settings.json`; Windows `%USERPROFILE%/.qoder/settings.json` (user); `.mcp.json` (project).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.qoder/skills` (user) or `.qoder/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Qoder CLI so it reloads its MCP settings (the Qoder IDE manages servers in its UI).

Source of truth: `src/installer/agent-table.ts` (one row per agent).
