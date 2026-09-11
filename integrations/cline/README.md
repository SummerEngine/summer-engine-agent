# Cline integration

No manifest file is generated in this repo for Cline — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup cline` (aliases: `cline-cli`), which writes:

- MCP config: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`; Linux `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`; Windows `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` (user); user scope only (project requests fall back with a warning).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.cline/skills` (user) or `.cline/skills` (project) as `<skill>/SKILL.md`.
- After: Restart VS Code so Cline reloads its MCP config.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
