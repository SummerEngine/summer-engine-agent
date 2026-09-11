# Trae integration

No manifest file is generated in this repo for Trae — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup trae` (aliases: `trae-ide`, `bytedance-trae`), which writes:

- MCP config: `~/.trae/mcp.json`; Windows `%USERPROFILE%/.trae/mcp.json` (user); user scope only (project requests fall back with a warning).
  Shape: `mcpServers.summer-engine = { command, args }`.
- Skills: `~/.trae/rules` (user) or `.trae/rules` (project) as rule files `summer-<skill>.md`.
- After: Restart Trae and open the MCP settings; summer-engine should show as connected.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
