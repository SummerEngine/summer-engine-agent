# Amp integration

No manifest file is generated in this repo for Amp — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup amp` (aliases: `sourcegraph-amp`, `ampcode`), which writes:

- MCP config: `~/.config/amp/settings.json`; Windows `%APPDATA%/amp/settings.json` (user); user scope only (project requests fall back with a warning).
  Shape: `"amp.mcpServers".summer-engine = { command, args }`.
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Amp so it reloads settings.json.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
