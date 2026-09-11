# Hermes Agent integration

No manifest file is generated in this repo for Hermes Agent — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup hermes` (aliases: `hermes-agent`, `nous-hermes`), which writes:

- MCP config: `~/.hermes/config.yaml`; Windows `%USERPROFILE%/.hermes/config.yaml` (user); user scope only (project requests fall back with a warning).
  Shape: `mcp_servers.summer-engine = { command, args }` (YAML).
- Skills: `~/.hermes/skills` (user) — user scope only as `<skill>/SKILL.md`.
- After: Restart Hermes Agent so it reconnects its MCP servers.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
