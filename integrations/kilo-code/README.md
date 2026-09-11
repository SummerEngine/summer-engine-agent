# Kilo Code integration

No manifest file is generated in this repo for Kilo Code — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup kilo-code` (aliases: `kilo`, `kilocode`), which writes:

- MCP config: `~/.config/kilo/kilo.json`; Windows `%APPDATA%/kilo/kilo.json` (user); `kilo.json` (project).
  Shape: `mcp.summer-engine = { type: "local", command: [npx, ...], enabled: true }`.
- Skills: `~/.kilo/skills` (user) or `.kilo/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Kilo (CLI or the VS Code extension) so it reloads kilo.json.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
