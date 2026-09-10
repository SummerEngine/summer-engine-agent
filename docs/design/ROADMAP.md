# Summer v3 — Roadmap: What Exists, What's Next

Single source of truth for sequencing. Every "later" from the v3 design sessions (2026-09-01) lives HERE, not in chat history. Update this file when anything ships or gets re-scoped. Rules live in `CONTRACT.md`, reasoning in `DECISIONS.md`, the feedback flywheel in `SELF_IMPROVING_LIBRARY.md`.

## 1. What is there (before this build)

- npm `summer-engine` 2.8.2 (~2.9k installs/mo), stdio MCP (62 tools), CLI (21 commands), 79 skills, 12-agent setup support.
- `.summer/` project memory (GameSoul.md, classified memory tree, locked flags). The v2 Summer Cloud sync (atomic writes, lock, 11 test files) that lived beside it was **removed in this build** — unmaintained research preview, Platform publish/releases is the wired path. Web-repo counterpart (`/cloud` page, `app/api/cloud/*` routes, cli-login `cloudToken` minting) is a separate cleanup PR.
- Update/staleness checks (`.summer-version` markers across 7 agent dirs; npm-latest doctor check).
- 21 prose eval specs (6 TBD stubs incl. make-game), no automated runner.
- Known debts fixed by this build: 6-way manifest drift, unpinned templates (mutable branch clone + `.git` deleted), hand-written registries, dead `summer skills count` hook call, stale count claims (44/50+/52/62).
- Platform-side Collections: web repo PR #274: 344 curated assets, 11 collections, R2 `collection.yaml` catalogs, project pinning, import tools. OPEN, 2 test failures + Vercel deploy failure at last check.

## 2. Build log (2026-09)

The wave-by-wave record of the v3 build (what shipped in which wave, with counts) moved to `archive/BUILD-LOG-2026-09.md`. Current facts live in `STATUS.md`.

## 3. Next (ordered fast-follows, design already locked)

1. **Remote stateless MCP (MCP v2, spec 2026-07-28).** Serve every `mcp.remote: true` tool (library search, generation, templates, feedback — engine-free) at `summerengine.com/mcp` as stateless Streamable HTTP on Vercel. Zero-install funnel. Depends on: registry compiler. Bonus: makes the already-published blog config (`"url": "https://www.summerengine.com/mcp"`) true instead of wrong.
2. **`.summer/state.json` deep spec.** Long-horizon resumability (what's built/verified/next, per-task state) — the thinnest part of the contract, flagged in DECISIONS D-audit. Must let a fresh agent resume a 3-week build with no conversation history.
3. **Collections unification.** Reconcile `library/collections/` schema with Tim's #274 platform system: add versioned/immutable asset refs (sha256 — today a curator re-upload silently changes content), style-rules + presets + recommended fields, agent-repo manifests bridging the R2 catalog, curator tooling. Extend his system; never build a parallel one.
4. **Eval runner (evidence stays live).** Execute examples/templates headless against pinned engine versions in CI; re-run the library on each engine release; auto-flag broken entries. Turns the 21 prose specs into executable gates; expands routing evals to admission-gate every new entry.
5. **Content factory.** Generalize the gameskill-capture pattern: verified moments from real sessions → candidate entries → CI gate → review. This is how "thousands of examples" actually happens; without it the library ambition has no production line.
6. **Librarian pipeline L1** (per SELF_IMPROVING_LIBRARY.md §4): daily isolated triage cron (no tools/no network/JSON-only), `/admin` verdict queue, Railway repair job → scoped PRs, merge webhook. Then ranking (Beta prior, per entry-version, weekly `health.json` PR) and the loop-health metrics dashboard.
7. **`summer_get_help` support channel.** v1 = registry/knowledge lookup + stuck-report capture (the highest-value gap signal); later = live support agent. Humans route through it too.
8. **`summer_library_contribute`.** Candidate examples from users' verified builds — double consent gate (chat ask + native app sheet showing the literal payload), ≤5 files / ≤32KB, evidence by captured asset id, candidate queue only.

### Added 2026-09-03 (Navigation — `summer open` / `summer_open`) ✅ toolkit side · reworked 2026-09-04 (`NAVIGATION-PLAN.md`)
- **Toolkit (`v3-foundation`):** `tool/open` (MCP `summer_open`, CLI `summer open <target>`, `summer tool open` — one behavior in `src/core/capabilities/navigation/`), `reference/product-map` (generated), `skill/navigate-summer`. The toolkit owns no destinations: web rows come from summerengine.com's `/agent-routes.json` (vendored `assets/navigation/web-routes.json`, `npm run sync:web-routes`); editor ids are forwarded to the engine's `Navigate` op and availability comes from the engine's `capabilities.navigation` advert (legacy fallback for scene/node/script/file/docks on older engines). The three legacy scene tools (`summer_open_scene`, `summer_select_node`, `summer_open_main_scene`) stay as build-workflow tools.
- **Engine PR `feat/navigate-op` (SummerEngine/summerengine, NOT BUILT by us):** one op `Navigate {target, …}` backed by one table (`editor/ops/navigate_ops.cpp`): editor-window, screen-2d/3d/script/game/assetlib, viewport-show/hide, assistant, project-settings, editor-settings, panel(name), dock(name), scene, node, script(path,line,col), file; `/api/health` advertises `capabilities.navigation.targets`; the chat webview bridge (`editor:show-viewport`, `editor:open` script branch) calls the same table so the agent-layout rework edits ONE file. Owner: engine — build, smoke (`summer tool open --args '{"target":"editor-window"}'`), merge, release. The toolkit needs no change when it lands: `summer open --list` starts showing the ids as available.
- **Web PR `feat/agent-routes-catalog` (publicsummerengine):** `src/lib/navigation/routes.ts` (one list; `ask-summer-registry.ts` routes must be in it — tested), `/agent-routes.json` (`force-static`), `agent-catalog.json` `navigation` key + entry point, `llms.txt` "Navigating summerengine.com" section. After deploy: `npm run sync:web-routes` in the toolkit refreshes the snapshot. Still separate: `/auth/callback?next=` validation — **in progress (session main), branch `fix/auth-callback-open-redirect`**; a public play URL for published games is a **product gap** (not invented in the map); v2 `/open?to=<target>` router (Cloudflare `?to=` pattern).
- **v2, not scheduled:** a `summer://` navigation scheme — the engine already registers `summerengine://` (macOS, auth-only) and spawns a second editor when one is running; a navigation scheme must forward to the running instance over the local API first (VS Code pattern), and Windows registration is a TODO stub.
- **Not verified yet:** a live-engine `Navigate` (engine PR unbuilt) and a live `summer open scene`/`node` on 0.5.65 — run TESTING.md §d with `summer open inspector` once an editor is open.

### Added 2026-09-01 (CLI/MCP parity + Node-less distribution)
- **MCP SDK v2 watch:** the 2026-07-28 spec is live but `@modelcontextprotocol/sdk` has published no v2 major (latest 1.30.0, protocol 2025-11-25). We are pinned at ^1.30.0; adopt the v2 SDK when it ships. stdio is unaffected by v2's statelessness change; the remote MCP endpoint (below) is where v2 matters.
- **Full CLI parity (this build):** generic `summer tool <name> --json '<args>'` passthrough exposing every tool via the shared capability layer, so shell-native agents get 100% of MCP capability with zero config. Both surfaces generated from one descriptor — parity is enforced, never maintained.
- **Native single-file binaries (fast-follow):** compile the CLI+MCP into per-platform executables (Bun/Deno compile) so Node is no longer required at all — the Unity CLI Loop v3 lesson without dropping MCP. One binary serves `summer …` and `summer mcp`.
- **Two setup modes (fast-follow):** `summer setup <agent>` default = MCP (one-paste onboarding, host permission UX); `--mode cli` = no MCP config at all — CLI-first for power users, headless, CI, and scripting loops (MCP's one-shot RPC can't express loops/pipes; CLI discovery via --help costs zero standing context vs ~62 always-loaded schemas). Watch real usage; flipping the recommended default for technical users is a docs change, not a rebuild. The incoming MCP-scripting and fully-headless agent work slots into this lane.
- **Headless per-project routing (ported, ships dark):** `src/core/headless/` + `docs/HEADLESS_ROUTING.md` — editor → live worker → spawned worker resolution behind `SUMMER_HEADLESS_ROUTING=1` (flag unset = byte-for-byte inert; the module is not even imported). Activation depends on the engine half: the `summerengine` branch `feature/headless-worker` (`--summer-worker` mode, `summer_processes.cfg` registry, v1.1 mutual-auth handshake) must merge and be rebased over 4.7.x before the flag does anything on a shipped build. Binary discovery reuses `src/core/engine-install.ts findEngineBinary` (`SUMMER_ENGINE_BIN` stays as the routing layer's own override on top of `SUMMER_ENGINE_BINARY`).


### Inputs from the team game-dev channel (2026-08-28 to 09-02): content-factory candidates
- The spatial work: the six-tool suite (`codex/world-tool-balanced-suite-ready`) AND `summer_starcast` (PR #147) are both ported (preview until engine ops merge); the suite's engine half is opened as a PR by us (git-only, like #155/#156). The related web PR #290 (embedded-agent `spatial-placement` skill) stays in the web repo. Policy correction (2026-09-03): assume contributors' work is good — `preview` is a label, not a burial; preview skills install by default (`--stable-only` to skip).
- Skill/example candidates surfaced by the team (each = a library entry once verified in-engine): a character movement system skill (valigo thread), particles techniques (video), wet-surface / rain shader look (TenMomo), MotionBricks-style real-time animation notes (NVIDIA), ECS data-oriented scene hierarchies (ajmmertens) as a reference, skin-tokens.cpp auto-rigging/skin weights (jichiep) as an asset-pipeline reference.
- `SummerEngine/summer-gamedev-knowledge` (private), the chat-thread-to-skill intake pipeline, IS the content factory's first intake source (§3.5). Its 7 skills are in the library (`preview`, source-cited, installed by default). NEXT: wire it directly — the pipeline commits into `library/skills/` (or opens PRs against this repo) and runs `validate:library` + routing evals as its gate, instead of a separate repo + manual port.

## 4. Later (design constraints recorded; not scheduled)

- **Automation ladder L2/L3** — auto-merge bounded classes then post-hoc review; written promotion criteria in SELF_IMPROVING_LIBRARY.md §6 are binding; per-class, auto-demotion on any revert.
- **Tiered feedback caps** — Tier 1 opt-in notes ≤1500 chars (anonymous stays ≤280).
- **Community registry / packs / trust tiers** — namespaced third-party resources searchable but labeled; capability lint applies to anything Summer's index serves; ClawHub incident (≈12% malware) is the reason this door opens last. Third-party *executable* tools are never hosted — separate MCP servers exist for that.
- **Registry as API** — gateway serves `index.json` (+ health) so agents query instead of reading files; repo stays source of truth.
- **Engine crash reports → same quarantine pipe** as agent feedback (endpoint/payload change only; engine work otherwise paused per the 180).
- **Editor surfacing of `.summer/`** (panel: GameSoul/plan/receipts) — engine, someday.
- **Engine-signed verified receipts** ("this playtest really ran") — L3-era trust upgrade.
- **Telemetry "what we collect" page** on summerengine.com + docs.
- **Summer Games / Store / analytics / grow / support tooling** — arrives as library entries with lifecycle facets (launch/grow/support): store publishing tools, read-analytics tools, retention skills, live-ops references. Structure never changes for this (DECISIONS D9).
- **Media/asset service for evidence at scale** — >200KB evidence media by URL+sha256; enforcement exists in lint; a proper upload path for contributors is needed when examples multiply.
- **Fix stale public claims** — blogs saying "37 tools", advertising the not-yet-real HTTP MCP; sweep after the remote MCP or correct outright.
- **Alias sunset** — legacy path/name aliases live ≥1 major release; removal needs changelog + sign-off.
- **Deprecate `references/template-registry.md`** once pinned template resources are live (it is a fourth hand-maintained mapping with 5 TBD rows).

## 5. North star

Build the deepest verified game-development library for AI agents — index quality + evidence quality compounding through real usage — wrapped in tools, memory, and proof, agent-neutral, one front door: `summerengine/summer`.
