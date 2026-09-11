# STATUS: where everything is, what actually works

Single page. If it is not here, it is not real. Updated 2026-09-10. Companions: `ROADMAP.md` (sequencing), `CONTRACT.md` (rules), `DECISIONS.md` (reasoning). Dated session records live in `archive/`.

## Where the code is

- Toolkit: this repository (`SummerEngine/summer-engine-agent`), npm package `summer-engine` 3.0.0, unpublished. npm `latest` is still 2.8.2. Release order and rollback: `docs/RELEASE-3.0.0.md`.
- Engine: Summer Engine 0.5.66 is the combined build the toolkit is verified against (125 ops); 0.5.65 is the shipped engine today.
- Web: the library-feedback endpoint (`POST /api/mcp/library-feedback`) is a 404 in production until its web PR merges; until then every report returns `dropped:true, reason: endpoint_missing`.

## Verified (how)

| Thing | Verified by |
|---|---|
| Library: 208 resources (86 tools / 94 skills / 19 templates / 9 references), 0 errors | `npm run validate:library` |
| Registry, manifests, counts and aliases generated from `library/` with no drift | `node scripts/generate-registry/cli.ts --check` |
| Suite: 1444 tests pass, 6 skip (engine-dependent), 1 file skipped; `tsc --noEmit` clean | `npm test` on Node 22 |
| Engine repo-lint tests read the engine's `origin/main` (op registry, probe base) and skip by name without a checkout | `src/core/op-registry-drift.test.ts`, `src/core/autopilot-assets.test.ts` |
| Engine 0.5.65: 61 tools full function (39 engine tools live-verified, 22 engine-free); 25 `preview` tools return structured `engine_lacks_op` on both faces | live e2e 2026-09-03 (`archive/E2E-2026-09-03.md`) |
| Engine 0.5.66: all 86 tools, `capabilitySkewWarning` empty, scene-script-placed code running in the game, spatial and starcast ops applied, `summer open` through the `Navigate` op, `summer run --background` | toolkit-driven run 2026-09-09 (`archive/TK-VS-FOLD-2026-09-07.md`) |
| Published 2.8.2 MCP server works against engine 0.5.66 (10 of 10 calls clean), so the engine can ship before the toolkit | same record |
| Template pinning: fetch at pinned SHA, tree-digest verify, refuse on mismatch, bounded network fetch (`SUMMER_FETCH_TIMEOUT_S`) | unit tests + live fetch |
| Autopilot scaffold: import pre-pass, smoke run by default, fails only on engine ERROR lines | `src/core/autopilot-assets.test.ts` + pristine template run (`archive/TEMPLATES-PRISTINE-BOOT-2026-09-03.md`) |
| Routing eval: held-out recall@5 0.84 | `npm run eval:routing:heldout` |

## Not yet done

- Cold-model eval: 1 of 8 MITL tasks run (`evals/mitl/`); needs a Claude login token and a launch window.
- A human session on the release build; Windows launch posture; the release build and auto-update path.
- Headless worker routing (`SUMMER_HEADLESS_ROUTING=1`) is the least-tested surface.
- Template repos: the 14 default branches must be fast-forwarded so the pins are reachable from `main` (`archive/TEMPLATES-FF-2026-09-04.md`).
- Argument naming drift across tools (`path` / `nodePath` / `subjectPath`, `scenePath` / `scene_path`): documented, deferred because a rename is breaking.
- Engine-side leftovers noted in the e2e record: `ViewportSnapshot` blank first frame (worked around in the toolkit), missing `scene_kind` on `ScenePreview`, mojibake in a few C string literals.

## Ship gates

In `docs/RELEASE-3.0.0.md`: engine 0.5.66 tagged first; merge the integration PR to `main`; publish `--tag next`, soak, then move `latest`; merge the web feedback endpoint PR with or before the publish; fast-forward the template default branches.
