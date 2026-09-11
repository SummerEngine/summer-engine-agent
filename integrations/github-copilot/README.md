# GitHub Copilot CLI integration

No manifest file is generated in this repo for GitHub Copilot CLI — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup github-copilot` (aliases: `copilot`, `copilot-cli`, `github-copilot-cli`), which writes:

- MCP config: `~/.copilot/mcp-config.json`; Windows `%USERPROFILE%/.copilot/mcp-config.json` (user); `.mcp.json` (project).
  Shape: `mcpServers.summer-engine = { type: "local", command, args, tools: ["*"] }`.
- Skills: `~/.copilot/skills` (user) or `.github/skills` (project) as `<skill>/SKILL.md`.
- After: Restart Copilot CLI, or run /mcp reload and /skills reload in the active session.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
