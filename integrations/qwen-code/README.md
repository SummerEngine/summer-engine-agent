# Qwen Code integration

No manifest file is generated in this repo for Qwen Code — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup qwen-code` (aliases: `qwen`, `qwencode`), which writes:

- MCP config: `~/.qwen/settings.json`; Windows `%USERPROFILE%/.qwen/settings.json` (user); `.qwen/settings.json` (project).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.qwen/skills` (user) or `.qwen/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Qwen Code or run /mcp in a new session.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
