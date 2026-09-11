# Grok Build integration

No manifest file is generated in this repo for Grok Build — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup grok-build` (aliases: `grok`, `xai-grok`), which writes:

- MCP config: `~/.grok/config.toml`; Windows `%USERPROFILE%/.grok/config.toml` (user); `.grok/config.toml` (project).
  Shape: `[mcp_servers.summer-engine]` table (TOML).
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Grok Build so it reloads config.toml (it also reads ~/.claude.json and .cursor/mcp.json).

Source of truth: `src/installer/agent-table.ts` (one row per agent).
