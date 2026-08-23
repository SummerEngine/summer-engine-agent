# Bionic integration

No manifest file is generated in this repo for Bionic —
`manifest-target.json` is intentionally empty. Support is delivered at install
time by `summer setup bionic`, which writes:

- MCP config: `~/.lmstudio/mcp.json` — the public integration file Bionic
  discovers under **Settings → Connected Apps**. The file is app-global; when
  `--scope project` is requested, the entry is statically bound to the current
  project instead (its stdio `cwd` and `SUMMER_ENGINE_PROJECT` are pinned to
  the game directory, and setup warns that re-running from another project
  switches the binding). Bionic currently starts global MCP servers outside
  the active Code Project and does not update the connection when the project
  changes, so re-run setup from the new game directory when switching games.
  The MCP server also honours MCP Roots when a client advertises them
  (`src/mcp/client-roots.ts`): a single unambiguous Summer project root binds
  the session, ambiguity fails closed, and explicit CLI/env binding wins.
- Skills: `summer setup bionic` installs the whole library in the same scope as
  the MCP config — `~/.lmstudio/skills/<skill>/SKILL.md` (user) or
  `.agents/skills/<skill>/SKILL.md` (project). After install, enable
  `summer-engine` under **Settings → Connected Apps** and verify the Summer
  skills under **Settings → Skills**.

Bionic is a separate agentic app from LM Studio; the `lm-studio` setup target
remains MCP-only. Bionic owns its internal enabled/connection state; Summer
does not write Bionic's private app-state files.

Full guide: `docs/BIONIC.md`. Aliases: `bionic`, `lm-bionic`,
`lm-studio-bionic`, `lmstudiobionic`.

Source of truth: `src/installer/agent-config.ts`,
`src/installer/skill-locations.ts`, `src/installer/version-check.ts`.
