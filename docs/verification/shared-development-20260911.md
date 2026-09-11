# Shared development integration: 2026-09-11

## Inputs and resolution

- Fresh `origin/main`: `11cc6a32f261a868624d2ca24f69fd501fa6086c`.
- PR #20 head: `7cdf3f4c97dd15e80842ab5d87d8df1acc2dfd7e`.
- PR #20 lacked 273 commits reachable from main (including the v3 migration).
- Integration branch: `codex/shared-development-20260911`. Source PR and main were not changed.
- Generation conflicts retain main's shared boolean `imageGenerationArgsSchema`, modern description, and MCP/CLI forwarding tests for omitted/true/false flags and string rejection.
- Deleted v2 `src/commands/login.test.ts` stays deleted. Migrated `src/cli/commands/login.test.ts` already compares the persisted token with the original fixture, preserving PR #20's flake correction.
- The resolved source tree is identical to fresh main. The merge records both histories; this report is the only extra file.

## Local work review

The original checkout is clean on `codex/multi-editor-mcp` at `970909aa7b8111c173c867ec7a48746bccbf34b9`. Its matching-editor implementation was incorporated in PR #8 (`1e3dcbe`, merge `933fc30`). The original and incorporated `src/lib/engine.ts` and `src/lib/api-client.ts` are identical. Do not cherry-pick the old v2 commit into v3. The original checkout was preserved.

## Verification

- `npm ci --ignore-scripts`: passed.
- `npm test`: 102 test files passed, 2 skipped; 1,448 tests passed, 10 skipped.
- Library validation: 208 resources, zero errors; 178 advisory warnings and 11 declared lint exceptions remain.
- `npm run build`: passed.
- `npm run generate:registry -- --check`: no drift.
- `npm run eval:routing`: passed, recall@5 = 1 on 103 scored queries.
- Existing generation coverage exercises MCP and CLI boolean schema and payload forwarding, without a paid provider call.
- `npm audit --omit=dev` reports 8 existing transitive advisories (4 high, 3 moderate, 1 low). Dependencies match main; no automatic broad dependency update was applied.

This is source/build/test evidence, not a staging deployment, desktop integration proof, or live background-removal provider proof. No npm publication or production mutation occurred.

## Staging gateway selection

`resolveGatewayUrl()` already supports `SUMMER_GATEWAY_URL` first, then `summer config set gateway.url https://<staging-host>`, then production. HTTPS is required except HTTP loopback. Login, generation, assets, polling, and feedback share the resolver. Prefer process-scoped `SUMMER_GATEWAY_URL` for a staging MCP process so the user's persistent configuration is preserved.

The token store is shared at `~/.summer`; gateway selection alone does not isolate credentials or downstream services. Supply a staging-specific `SUMMER_TOKEN` to the staging process and use an independently isolated staging backend. Creator publication has a separate `creator.apiUrl` setting and credential audience, so changing the gateway does not redirect publishing. No gateway or credential settings were changed in this verification.
