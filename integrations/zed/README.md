# Zed integration

No manifest file is generated in this repo for Zed — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup zed` (aliases: `zed-editor`), which writes:

- MCP config: `~/.config/zed/settings.json`; Windows `%APPDATA%/zed/settings.json` (user); user scope only (project requests fall back with a warning).
  Shape: `context_servers.summer-engine = { source: "custom", command, args, env }`.
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Zed reloads settings.json live; open the Agent panel and check summer-engine under MCP servers.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
