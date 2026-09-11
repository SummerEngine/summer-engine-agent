# Crush integration

No manifest file is generated in this repo for Crush — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup crush` (aliases: `charm-crush`), which writes:

- MCP config: `~/.config/crush/crush.json`; Windows `%APPDATA%/crush/crush.json` (user); `.crush.json` (project).
  Shape: `mcp.summer-engine = { type: "stdio", command, args }`.
- Skills: none. Crush has no skills folder; put project guidance in CRUSH.md. The MCP server ships summer_get_agent_playbook for in-chat guidance.
- After: Restart Crush so it reloads crush.json.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
