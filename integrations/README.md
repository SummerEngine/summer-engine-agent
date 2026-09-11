# integrations/ — the complete, honest map of agent support

One folder per supported client. This directory is the single place that
says which agents Summer supports and how each one consumes the library.
Adding a new agent = one row in `src/installer/agent-table.ts` + one folder
here + an empty entry in `scripts/generate-registry/targets.ts` (plus, if it
has a manifest file, a builder in `scripts/generate-registry/manifests.ts`) +
`npm run generate:registry` — never hand-editing root files. Tests fail when
the table, this directory, and targets.ts disagree.

Each folder contains:

- `README.md` — what gets generated where, or (for clients with no manifest
  file in this repo) exactly what `summer setup <client>` writes at install
  time: MCP config path and skills destination.

`summer setup <client>` (default `--scope user`) writes the MCP config AND
installs every skill (`skills install --all`, preview included; `--stable-only`
skips preview) in the SAME scope,
so a user-scope MCP config never ends up beside project-scope skills.
`--scope project` moves both; `--recommended` installs only the recommended
subset. Clients whose MCP config is user-only (see the table) fall back to user
scope with a warning. `.mcp.json` at the repo root
(the MCP pointer the claude / codex / cursor / factory manifests share) is
generated too — `registry/generated/mcp.json -> .mcp.json`.
- `manifest-target.json` — mapping of generated file -> repo-root destination
  (empty when nothing is generated). Mirrors
  `scripts/generate-registry/targets.ts`; a test fails if they drift.

Generated root dot-files (`.claude-plugin/plugin.json`, `gemini-extension.json`,
…) are build artifacts of `integrations/<agent>` + `library/` — their
`_generated` banner says so ("GENERATED from integrations/<agent> — do not
edit; npm run generate:registry"). CI `--check` fails on any drift between
`library/`, `registry/generated/`, and the applied root files.

How the plugin manifests reference skills, and what is verified:

- **Claude Code** — the plugin-manifest `skills` field accepts a string or an
  array of `./`-relative directory paths and *extends* the default `skills/`
  scan (Claude Code plugins reference, "Plugin manifest schema"). The
  generated `.claude-plugin/plugin.json` lists one entry per skill
  (`./library/skills/<slug>/`). The docs do not say whether a listed
  directory is loaded as one skill or scanned for skill subfolders, and this
  repo has not yet loaded the generated manifest through the real plugin
  path (the smoke tests exercise the `summer setup` install path, not the
  marketplace one) — treat the marketplace install as unverified until that
  run exists.
- **Codex** — `.codex-plugin/plugin.json` carries the same per-skill `skills`
  array. Whether Codex reads that field, and with which type, is
  **unverified**; the v2 manifest carried it and nobody has confirmed a load.
- **Factory** — reads skills only from a root `skills/` directory; the
  manifest's `skills` array is not read (open gap, see the table).

| Client | Manifest generated in this repo | `summer setup` writes |
|---|---|---|
| claude | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.mcp.json` | MCP: `~/.claude.json`; Windows `%USERPROFILE%/.claude.json` / `.mcp.json`; skills: `~/.claude/skills` / `.claude/skills` (`<skill>/SKILL.md`) |
| claude-desktop | — | MCP: `~/Library/Application Support/Claude/claude_desktop_config.json`; Linux `~/.config/Claude/claude_desktop_config.json`; Windows `%APPDATA%/Claude/claude_desktop_config.json`; no skills folder (MCP only) |
| codex | `.codex-plugin/plugin.json` | MCP: `~/.codex/config.toml`; Windows `%USERPROFILE%/.codex/config.toml` / `.codex/config.toml`; skills: `~/.agents/skills` / `.agents/skills` (`<skill>/SKILL.md`) |
| cursor | `.cursor-plugin/plugin.json` | MCP: `~/.cursor/mcp.json`; Windows `%USERPROFILE%/.cursor/mcp.json` / `.cursor/mcp.json`; skills: `~/.cursor/skills` / `.cursor/skills` (`<skill>/SKILL.md`) |
| windsurf | — | MCP: `~/.codeium/windsurf/mcp_config.json`; Windows `%USERPROFILE%/.codeium/windsurf/mcp_config.json`; skills: `~/.codeium/windsurf/skills` / `.windsurf/skills` (`<skill>/SKILL.md`) |
| antigravity | — | MCP: `~/.gemini/antigravity/mcp_config.json`; Windows `%USERPROFILE%/.gemini/antigravity/mcp_config.json`; skills: `~/.gemini/antigravity/skills` / `.agents/skills` (`<skill>/SKILL.md`) |
| gemini (legacy) | `gemini-extension.json` | MCP: `~/.gemini/extensions/summer-engine/gemini-extension.json`; Windows `%USERPROFILE%/.gemini/extensions/summer-engine/gemini-extension.json`; skills: `~/.gemini/extensions/summer-engine/skills` (`<skill>/SKILL.md`) |
| cline | — | MCP: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`; Linux `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`; Windows `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`; skills: `~/.cline/skills` / `.cline/skills` (`<skill>/SKILL.md`) |
| roo-code (legacy) | — | MCP: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`; Linux `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`; Windows `%APPDATA%/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`; skills: `~/Documents/Roo/Rules` / `.clinerules` (rule files `summer-<skill>.md`) |
| kilo-code | — | MCP: `~/.config/kilo/kilo.json`; Windows `%APPDATA%/kilo/kilo.json` / `kilo.json`; skills: `~/.kilo/skills` / `.kilo/skills` (`<skill>/SKILL.md`) |
| github-copilot | — | MCP: `~/.copilot/mcp-config.json`; Windows `%USERPROFILE%/.copilot/mcp-config.json` / `.mcp.json`; skills: `~/.copilot/skills` / `.github/skills` (`<skill>/SKILL.md`) |
| vscode-copilot | — | MCP: `~/Library/Application Support/Code/User/mcp.json`; Linux `~/.config/Code/User/mcp.json`; Windows `%APPDATA%/Code/User/mcp.json` / `.vscode/mcp.json`; skills: `~/.copilot/skills` / `.github/skills` (`<skill>/SKILL.md`) |
| visual-studio | — | MCP: `~/.mcp.json`; Windows `%USERPROFILE%/.mcp.json` / `.mcp.json`; no skills folder (MCP only) |
| copilot-jetbrains | — | MCP: `~/.config/github-copilot/intellij/mcp.json`; Windows `%APPDATA%/github-copilot/intellij/mcp.json`; skills: `~/.copilot/skills` / `.github/skills` (`<skill>/SKILL.md`) |
| opencode | — | MCP: `~/.config/opencode/opencode.json`; Windows `%APPDATA%/opencode/opencode.json` / `opencode.json`; skills: `~/.config/opencode/skills` / `.opencode/skills` (`<skill>/SKILL.md`) |
| zed | — | MCP: `~/.config/zed/settings.json`; Windows `%APPDATA%/zed/settings.json` / `.zed/settings.json`; skills: `~/.agents/skills` / `.agents/skills` (`<skill>/SKILL.md`) |
| kiro | — | MCP: `~/.kiro/settings/mcp.json`; Windows `%USERPROFILE%/.kiro/settings/mcp.json` / `.kiro/settings/mcp.json`; skills: `~/.kiro/skills` / `.kiro/skills` (`<skill>/SKILL.md`) |
| goose | — | MCP: `~/.config/goose/config.yaml`; Windows `%APPDATA%/Block/goose/config/config.yaml`; no skills folder (MCP only) |
| hermes | — | MCP: `~/.hermes/config.yaml`; Windows `%USERPROFILE%/.hermes/config.yaml`; skills: `~/.hermes/skills` (`<skill>/SKILL.md`) |
| trae | — | MCP: `~/.trae/mcp.json`; Windows `%USERPROFILE%/.trae/mcp.json`; skills: `~/.trae/rules` / `.trae/rules` (rule files `summer-<skill>.md`) |
| qwen-code | — | MCP: `~/.qwen/settings.json`; Windows `%USERPROFILE%/.qwen/settings.json` / `.qwen/settings.json`; skills: `~/.qwen/skills` / `.qwen/skills` (`<skill>/SKILL.md`) |
| kimi-code | — | MCP: `~/.kimi/mcp.json`; Windows `%USERPROFILE%/.kimi/mcp.json`; skills: `~/.kimi/skills` / `.kimi/skills` (`<skill>/SKILL.md`) |
| crush | — | MCP: `~/.config/crush/crush.json`; Windows `%APPDATA%/crush/crush.json` / `.crush.json`; no skills folder (MCP only) |
| amp | — | MCP: `~/.config/amp/settings.json`; Windows `%APPDATA%/amp/settings.json`; skills: `~/.config/agents/skills` / `.agents/skills` (`<skill>/SKILL.md`) |
| factory | `.factory-plugin/plugin.json` | MCP: `~/.factory/mcp.json`; Windows `%USERPROFILE%/.factory/mcp.json` / `.factory/mcp.json`; skills: `~/.factory/skills` / `.factory/skills` (`<skill>/SKILL.md`) |
| junie | — | MCP: `~/.junie/mcp/mcp.json`; Windows `%USERPROFILE%/.junie/mcp/mcp.json` / `.junie/mcp/mcp.json`; no skills folder (MCP only) |
| lm-studio | — | MCP: `~/.lmstudio/mcp.json`; Windows `%USERPROFILE%/.lmstudio/mcp.json`; no skills folder (MCP only) |

Source of truth for the setup paths: `src/installer/agent-config.ts` and
`src/cli/commands/skills.ts`.
