# GitHub Copilot in VS Code integration

No manifest file is generated in this repo for GitHub Copilot in VS Code — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup vscode-copilot` (aliases: `vscode`, `vs-code`, `vs-code-copilot`, `github-copilot-vscode`), which writes:

- MCP config: `~/Library/Application Support/Code/User/mcp.json`; Linux `~/.config/Code/User/mcp.json`; Windows `%APPDATA%/Code/User/mcp.json` (user); `.vscode/mcp.json` (project).
  Shape: `servers.summer-engine = { type: "stdio", command, args }`.
- Skills: `~/.copilot/skills` (user) or `.github/skills` (project) as `<skill>/SKILL.md`.
- After: Restart VS Code or run MCP: List Servers, then start summer-engine in Copilot Agent mode.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
