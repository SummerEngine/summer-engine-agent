# Hermes Agent integration

No manifest file is generated in this repo for Hermes Agent — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup hermes` (aliases: `hermes-agent`, `nous-hermes`), which writes:

- MCP config: `~/.hermes/config.yaml`; Windows `%USERPROFILE%/.hermes/config.yaml` (user); user scope only (project requests fall back with a warning).
  Shape: `mcp_servers.summer-engine = { command, args }` (YAML).
- Skills: `~/.hermes/skills` (user) or `.hermes/skills` (project) as `<skill>/SKILL.md`. Project skills need `hermes skills trust` before Hermes loads them.
- After: Run /reload-mcp in Hermes Agent (or restart it).

Source of truth: `src/installer/agent-table.ts` (one row per agent).
