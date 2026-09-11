# Cline CLI integration

No manifest file is generated in this repo for Cline CLI — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup cline-cli` (aliases: `clinecli`), which writes:

- MCP config: `~/.cline/data/settings/cline_mcp_settings.json`; Windows `%USERPROFILE%/.cline/data/settings/cline_mcp_settings.json` (user); user scope only (project requests fall back with a warning).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.cline/skills` (user) or `.cline/skills` (project) as `<skill>/SKILL.md`.
- After: Restart the Cline CLI so it reloads its MCP settings.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
