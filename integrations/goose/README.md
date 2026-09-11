# Goose integration

No manifest file is generated in this repo for Goose — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup goose` (aliases: `block-goose`, `codename-goose`), which writes:

- MCP config: `~/.config/goose/config.yaml`; Windows `%APPDATA%/Block/goose/config/config.yaml` (user); user scope only (project requests fall back with a warning).
  Shape: `extensions.summer-engine = { type: stdio, cmd, args, enabled, timeout }` (YAML).
- Skills: none. Goose has no skills folder; put project guidance in .goosehints. The MCP server ships summer_get_agent_playbook for in-chat guidance.
- After: Restart Goose (CLI or Desktop); summer-engine is listed under Extensions.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
