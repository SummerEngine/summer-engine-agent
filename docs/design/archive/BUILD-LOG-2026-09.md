# Build log: Summer v3, September 2026

Wave-by-wave record cut from `ROADMAP.md` section 2 on 2026-09-10. Historical; counts and statuses are as they were on the dates given. Current facts: `../STATUS.md`.

## In flight (the v3 build, integration branch)

Waves; each gated by tsc + vitest + validate-library:

1. ✅ Contract + decisions + self-improving-library spec (`docs/design/`).
2. ✅ Inventory extraction (`migration/*.json`) — skills/tools/manifests/templates/references ground truth.
3. ✅ `registry/schemas/` + `scripts/validate-library` + capability lint + tests.
4. ✅ `src/` restructure → core / cli / mcp / project-memory / installer, import-direction test.
5. ✅ Registry compiler (`scripts/generate-registry`) → `registry/generated/` (index, all agent manifests, counts, aliases) + CI parity gate.
6. ✅ Library migration fleet: 79 skills → `library/skills/<slug>/` + resource.yaml (aliases for every old path); 63 tools → `library/tools/<slug>/` descriptors; references/ + docs → `library/references/`; templates → `library/templates/<slug>/` pinned (commit + tree_digest, resolved from live repos).
6b. ✅ Cutover: `summer skills list/install/info` + `summer setup` read `registry/generated/skills-registry.json` (installer copies from `library/skills/<slug>/`; `recommended` lives in resource.yaml, compiled into the registry); hand-written `SKILL_REGISTRY` deleted; legacy `skills/` + `references/` trees deleted (aliases keep old paths resolving); guard tests repointed at library/; package `files` ships `library/`, `registry/generated/`, `registry/schemas/`, `integrations/`.
7. ✅ MCP SDK pinned ^1.30.0 (no v2 major published yet — see watch item) (`@modelcontextprotocol/sdk` → v2 major; stdio unchanged; no elicitation to migrate).
8. ✅ AGENTS.md rewrite (trust / understand / navigate / work router) + README update; docs/.
9. ✅ Evals: routing eval suite (84 queries, recall@5 0.958 baseline) (query → expected entries) + per-kind scaffolding + CI workflow.
10. ✅ Feedback mailbox v1 (+ agent_model/client attribution): `summer_library_feedback` MCP tool (agent repo) + `/api/mcp/library-feedback` route + append-only table (web repo; table via Supabase direct SQL — Drizzle migrator history is unreliable; API-writes only, no anon insert policy, capped fields) + first-run telemetry notice + `SUMMER_NO_TELEMETRY` / `DO_NOT_TRACK`.
11. ✅ Full verify (tsc clean, 560/560, parity no-drift, npm pack verified) + branch pushed. PR open for owner sign-off.

**Ship posture for the hackathon (Sat 2026-09-06), recommended 2026-09-03:** do NOT flip `latest` before the event. Publish v3 as `npm publish --tag next` so `npx -y summer-engine@next` exists for team dogfooding Thu/Fri while participants stay on stable 2.8.2 (`@latest`). The 57 engine tools work on the shipped engine 0.5.65 (live-verified); the 11 gated tools need engine PRs #147/#155/#156/#158 built + merged + a new engine release — none built yet. Flip `latest` after a real end-to-end dogfood session (Claude Code + a game build) and ideally one Windows check; the flip is one `npm dist-tag add` away.

**Human-gated actions (owner only):** merge the PR; npm publish 3.0.0 (`next` first, then `latest`); GitHub repo rename → `summer` + org casing → `summerengine` (do both together when the new README lands); web-repo rename copy pass (one constant `src/lib/data/agent-guides.ts` + ~25 hard-coded spots: 6× i18n `home.json` L119, 3 blog MDX + 15 translations, `source-status/page.tsx` L7, Docs/plans).


### Port wave 2026-09-02 (other sessions' MCP work → v3-foundation) ✅
- **Headless routing layer** ported (`src/core/headless/`, flag `SUMMER_HEADLESS_ROUTING=1`, byte-inert off; contract `docs/HEADLESS_ROUTING.md`). Engine half (`--summer-worker` module) lives on engine branch `feature/headless-worker` (now pushed) — must rebase over 4.7.x and merge before routing activates. Smoke: `tests/1summer_engine/headless_worker_smoke.py` (engine repo).
- **Scene scripting + perception** ported: `summer_run_script`, `summer_run_editor_script`, `summer_api_docs` (remote-capable), `summer_world_snapshot`, `summer_snapshot_diff`, `summer_get_runtime_tree`, `summer_inspect_runtime_node`, `summer_import_hdri`; capability-skew pre-flight (engine `/api/health capabilities` authoritative, incl. `singleOnlyOps`); opt-in trajectory capture (`SUMMER_TRAJECTORY_DIR`); playbook as MCP prompt; 3 new skills + 15 skill content fixes. Engine ops (RunSceneScript, snapshots, runtime reads) remain unmerged on `origin/claude/summerengine-python-scene-scripting-qar1us` — tools degrade honestly until merged.
- **Linux/cloud engine install** (`summer install` on Linux, `SUMMER_ENGINE_BINARY`, `~/.summer/engine`), api-docs bundle (500 KB, ships), `running-in-the-cloud` skill; `SUMMER_TOKEN` env override; shared binary resolver.
- **Summer Cloud REMOVED** (unmaintained research preview; Platform is the wired path): 7 tools, `summer cloud`, sync engine, cloud-token auth, skill — −5.8k lines. Web-side cleanup (`/cloud` page, `app/api/cloud/*`, cli-login cloudToken) = separate PR (task chip issued).
- Registry after wave: 173 resources — 64 tools / 82 skills / 19 templates / 8 references. Suite 575 green.
- **Decisions surfaced for the owner:** (a) `summer-compatibility.ts` still declares engine 4.6.1 while the scripting branch bumped to 4.7.2 — engine-version floor is a product call; (b) `summer_record_feedback` (per-change user verdict accept/reject/correction) was dropped in favor of `summer_library_feedback` — if the Librarian wants a user-verdict signal it becomes a FIELD on library_feedback, never a second tool; (c) routing eval now indexes tools alongside skills — several skill queries surface tool entries in top-5; kind-aware ranking is the next index-quality fix.
- NOT ported (ownership unconfirmed): three spatial-tool branches (6 tools: align/distribute, snap-to-surface, camera framing/visibility, navigation probe, placement test; global text-result cap; exact-SaveScene local-API fix).


### Wave 3 2026-09-02 ✅
- **Spatial tools ported** (6: snap-to-surface, align-distribute-3d, frame-camera, test-placement, camera-visibility, navigation-probe) + `world-building-3d` skill; all `status: preview` until the engine ops merge — flip to stable then. Blanket 5 KB result cap deliberately NOT ported (contradicts v3's documented no-silent-truncation policy); per-tool compact caps kept. Starcast (`summer_starcast`, PR #147) and its `spatial-placement` skill: first skipped as "superseded", REVERSED 2026-09-03 by owner decision — it is complementary directional evidence, ported as a gated tool. Codex `canary-gateway` blind A/B harness: ported into `evals/canary/` (2026-09-03). **frame-camera + camera-visibility REMOVED 2026-09-03** — their author dropped them after further benchmarks showed no significant improvement; they may leave engine PR #158 as well. Spatial suite is now 4 ops + starcast.
- **Engine halves prepared for owners** (git-only, nothing built): SummerEngine/SummerEngine PR #155 (headless worker, 13 commits rebased onto 4.7.2 main) and PR #156 (scene scripting, 34 commits, clean rebase). Both carry "NOT BUILT — owner must build + smoke". The unpushed engine local-main 2.8.2 CLI commit is redundant with public main — abandon; private→public sync is retired.
- **Kind-aware registry search** (`src/core/registry-search.ts`, shared by the eval runner and future runtime search): BM25 + light stemming + compound fallback + kind prior rules + related boost. Routing recall@5 0.838 → 0.934 (ranking) → **1.0** after 9 library metadata fixes (user-phrased use_when, related links). 12 tool-intent queries added (tool routing 1.0). This closed the eval → content-fix → eval loop end to end for the first time.
- Registry after wave: **180 resources — 70 tools / 83 skills / 19 templates / 8 references.** Suite 640 green, parity clean.
- Engine floor kept at 4.6.1 (conservative; revisit when 4.7.x engine is the shipped minimum).


### Hardening 2026-09-02 ✅ (see REVIEW-2026-09-02.md)
- Six adversarial reviews + cold-install e2e → 8 P0 / ~25 P1 fixed in one wave; three follow-up passes (library metadata honesty, docs/contract truth, src consolidation). Final: 179 resources (69/83/19/8), 844 tests, parity clean, held-out routing recall@5 0.80 (tuning 1.0).
- Real template pinning; descriptor↔zod + mirror parity gates; validator cross-checks registrations; hardened capability lint (+destructive-command rule); hooks fire; OpenCode loads skills; setup installs all skills; install/open/run/unknown-command safe; login loop terminal; gateway.url everywhere; Summer Cloud gone; 359 stale refs purged.
- Process rules adopted (DECISIONS D14): single writer per surface, `git commit --only -- <paths>` in shared worktrees, review agents read-only and never run side-effecting product commands.
- NEXT for the index: close the tuning/held-out gap with content (use_when phrasing) — held-out is the number that counts. NEXT for tools: merge engine PRs #155/#156, then flip the 14 preview resources to stable and run the live-engine e2e step.


### Scripting & headless — honest state (2026-09-03)
- **Shipped today (engine 0.5.65):** `RunEditorScript` (editor-side GDScript via `summer_run_editor_script` — was mislabelled preview, now stable), `RunVerification` (runtime probe scripts: report/save_frame/press/key/finish), `RunCommand`. Agents CAN script the editor today; the toolkit exposes it on both faces.
- **Not shipped:** `RunSceneScript` (compile-first, checkpoint/rollback, ctx helpers — the Blender-`bpy`-class door) + world snapshot/diff + runtime tree reads = engine PR #156; headless worker (`--summer-worker`, loopback protocol, per-project routing) = PR #155; spatial ops = #147/#158. Toolkit halves are wired and gated; the engine halves are unbuilt. This is the single largest gap between "what the branch contains" and "what a user can do".
- **Python:** there is no Python scripting of the engine. The "python script" in the headless work is `tests/1summer_engine/headless_worker_smoke.py` — the acceptance test for the worker, engine-side. DECISION for the owner: if Python control matters (CI, evals, data scientists), add a thin Python client over the local HTTP API / MCP (`pip install summer-engine` shape) — a small toolkit addition, no engine change. Agents themselves use MCP/CLI; Python is for scripts and pipelines.


### Night 2026-09-03 ✅ — navigation, runtime librarian, tag discipline
- **`summer open <target>` / `summer_open`** + product-map reference (64 rows, code is source of truth) + `navigate-summer` skill (CLI-navigation session; research in NAVIGATION-RESEARCH.md, design in NAVIGATION-DESIGN.md). 11 editor targets `planned` → engine ops: SetMainScreen, FocusChat, OpenProjectSettings, OpenEditorSettings, ShowBottomPanel, FocusEditorWindow, OpenScript{line}, more dock ids; `summer://` forwarding = v2. Web PR list: /agent-routes.json from ask-summer-registry.ts, llms.txt section, /dashboard/settings redirect, derived toolsNumber, /open?to= router, public play URL (product gap).
- **Runtime librarian:** `summer_search_library` (BM25 + RRF semantic fusion when `registry/generated/embeddings.json` + a provider exist; lexical offline) and `summer_read_library` (entry + feedback footer `entry_id@hash` — closes the "feedback has no trigger" gap). `generate:registry --embed` builds the sidecar keyed by content_hash (never fails `--check`). Sizes: 200 entries 0.4 MB, 10k 21.5 MB (int8 → ~6 MB). Scale plan: local ≤10k; 10k–100k = hosted search (Supabase pgvector via the remote MCP); external vector SaaS only at millions. NEXT: web `/api/mcp/embed` endpoint + run `--embed` in the publish flow.
- **Tag discipline:** `registry/schemas/domains.json` (60 domains, 12 modalities) enforced via schema `$ref`; ≥2 domains + ≥2 real use_when per entry; 150 violations fixed in 126 files; reciprocity WARN (161 one-way links = content backlog). Held-out recall 0.80 → 0.84 as a side effect.
- Registry: 191 resources — 71 tools / 92 skills / 19 templates / 9 references. 1012 tests.
- Web security: open redirect on `/auth/callback?next=` fixed + adversarially reviewed → PublicSummerEngine PR #328 (unmerged); follow-up filed: pin redirect origin instead of trusting `x-forwarded-host`.

