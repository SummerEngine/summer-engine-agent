# GitHub Copilot in JetBrains IDEs integration

No manifest file is generated in this repo for GitHub Copilot in JetBrains IDEs — `manifest-target.json`
is intentionally empty. Support is delivered at install time by
`summer setup copilot-jetbrains` (aliases: `jetbrains-copilot`, `intellij-copilot`, `copilot-intellij`), which writes:

- MCP config: `~/.config/github-copilot/intellij/mcp.json`; Windows `%APPDATA%/github-copilot/intellij/mcp.json` (user); user scope only (project requests fall back with a warning).
  Shape: `servers.summer-engine = { type: "stdio", command, args }`.
- Skills: `~/.copilot/skills` (user) or `.github/skills` (project) as `<skill>/SKILL.md`.
- After: Restart the JetBrains IDE and open Copilot Chat in Agent mode; summer-engine shows in the tools list.

Source of truth: `src/installer/agent-table.ts` (one row per agent).
