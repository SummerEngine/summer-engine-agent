# Crush integration

No manifest file is generated in this repo for Crush — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup crush` (aliases: `charm-crush`), which writes:

- MCP config: `~/.config/crush/crushrc`; Windows `%USERPROFILE%/.config/crush/crushrc` (user); `.crushrc` (project).
  Shape: `mcp.summer-engine = { type: "stdio", command, args }`.
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Crush so it reloads crushrc.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
