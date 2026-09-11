# Goose integration

No manifest file is generated in this repo for Goose — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup goose` (aliases: `block-goose`, `codename-goose`), which writes:

- MCP config: `~/.config/goose/config.yaml`; Windows `%APPDATA%/Block/goose/config/config.yaml` (user); user scope only (project requests fall back with a warning).
  Shape: `extensions.summer-engine = { type: stdio, cmd, args, enabled, timeout }` (YAML).
- Skills: `~/.config/agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Goose (CLI or Desktop); summer-engine is listed under Extensions.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
