/**
 * Read a file from the engine repo's `origin/main`, not from whatever branch
 * the sibling checkout happens to have on disk.
 *
 * Repo-lint tests compare this package against the engine's shipped surface
 * (its op registry, its canonical probe base). Reading the working tree made
 * those checks describe the developer's current engine branch instead; a
 * feature branch with extra ops turned the honesty test red, and a branch
 * missing ops hid real drift. `git show origin/main:<path>` pins the source to
 * the last fetched main regardless of the checkout.
 *
 * Engine checkout resolution: $SUMMER_ENGINE_REPO, else the `summerengine`
 * sibling of this package. When the repo is absent or has no `origin/main`
 * ref the caller gets a reason string and should skip visibly, never fail.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const engineRepo = process.env.SUMMER_ENGINE_REPO
  ? resolve(process.env.SUMMER_ENGINE_REPO)
  : resolve(packageRoot, "..", "summerengine");

export const ENGINE_MAIN_REF = "origin/main";

export type EngineMainFile = { text: string; skipReason?: undefined } | { text?: undefined; skipReason: string };

/** `git show origin/main:<repoRelativePath>` from the engine checkout. */
export function readEngineMainFile(repoRelativePath: string): EngineMainFile {
  const where = `${engineRepo} (${ENGINE_MAIN_REF}:${repoRelativePath}; set SUMMER_ENGINE_REPO to point at the engine checkout)`;
  if (!existsSync(engineRepo)) return { skipReason: `no engine checkout at ${where}` };
  try {
    const text = execFileSync("git", ["-C", engineRepo, "show", `${ENGINE_MAIN_REF}:${repoRelativePath}`], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20_000,
    });
    return { text };
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    return { skipReason: `could not read ${where}: ${detail}` };
  }
}
