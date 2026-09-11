# OpenCode integration

No manifest file is generated in this repo for OpenCode — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup opencode` (aliases: `open-code`), which writes:

- MCP config: `~/.config/opencode/opencode.json`; Windows `%APPDATA%/opencode/opencode.json` (user); `opencode.json` (project).
  Shape: `mcp.summer-engine = { type: "local", command: [npx, ...], enabled: true }`.
- Skills: `~/.agents/skills` (user) or `.agents/skills` (project) as `<skill>/SKILL.md`. OpenCode loads skills from this folder on the next session. Summer 3.0 wrote markdown under agents/summer and 3.1.0 wrote opencode/skills; `--force` removes both.
- After: Restart OpenCode so it reloads opencode.json.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
