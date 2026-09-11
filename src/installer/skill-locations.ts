/**
 * Where `summer skills install` puts skills for each agent client.
 *
 * Lives in the installer layer (not cli/) so `summer setup` can report the
 * destination and count without importing the CLI (import-direction contract
 * §2: shared layers never import cli or mcp). The per-agent paths come from
 * the one agent table (agent-table.ts); only the `summer` pseudo-client is
 * resolved here.
 */

import { join } from "path";
import { homedir } from "os";
import { AGENT_CLIENTS, type AgentClient } from "../core/skills-registry.js";
import { tildeify } from "../core/format.js";
import {
  agentSpec,
  defaultPathContext,
  resolveSkillPath,
  type SkillLocationKind,
} from "./agent-table.js";

export const SKILL_SCOPES = ["user", "project"] as const;
export type SkillScope = (typeof SKILL_SCOPES)[number];

/** The agent/scope flags `summer skills install` accepts (legacy aliases included). */
export interface SkillInstallSelection {
  agent?: string;
  scope?: string;
  asClaudeSkill?: boolean;
  asCursorSkill?: boolean;
}

function isAgentClient(value: string): value is AgentClient {
  return (AGENT_CLIENTS as readonly string[]).includes(value);
}

function isSkillScope(value: string): value is SkillScope {
  return (SKILL_SCOPES as readonly string[]).includes(value);
}

/** Throws with a user-facing message on an unknown agent. */
export function parseSkillAgent(value: string): AgentClient {
  if (isAgentClient(value)) return value;
  throw new Error(`Unknown agent: ${value}. Use one of: ${AGENT_CLIENTS.join(", ")}.`);
}

/** Throws with a user-facing message on an unknown scope. */
export function parseSkillScope(value: string): SkillScope {
  if (isSkillScope(value)) return value;
  throw new Error(`Unknown scope: ${value}. Use user or project.`);
}

/** Pick the agent from --agent / legacy --as-claude-skill / --as-cursor-skill
 *  (default "summer"); throws on conflicting flags. */
export function resolveSkillAgent(opts: SkillInstallSelection): AgentClient {
  if (opts.asClaudeSkill && opts.asCursorSkill) {
    throw new Error("Use only one legacy alias: --as-claude-skill or --as-cursor-skill.");
  }

  const legacyAgent = opts.asClaudeSkill
    ? "claude-code"
    : opts.asCursorSkill
      ? "cursor"
      : undefined;

  if (opts.agent && legacyAgent && opts.agent !== legacyAgent) {
    throw new Error(
      `Conflicting agent options: --agent ${opts.agent} with legacy alias for ${legacyAgent}.`
    );
  }

  return parseSkillAgent(opts.agent ?? legacyAgent ?? "summer");
}

/** Explicit --scope wins; otherwise the agent's default (rule-file agents default to "project"). */
export function resolveSkillScope(agent: AgentClient, opts: SkillInstallSelection): SkillScope {
  if (opts.scope) return parseSkillScope(opts.scope);
  if (agent === "summer") return "user";
  return agentSpec(agent).skills?.defaultScope ?? "user";
}

export interface InstallLocation {
  kind: SkillLocationKind;
  path: string;
}

export function resolveInstallLocation(
  agent: AgentClient,
  scope: SkillScope
): InstallLocation {
  const overrideDir = process.env.SUMMER_SKILLS_DIR;

  if (agent === "summer") {
    const root = scope === "user" ? homedir() : process.cwd();
    return { kind: "skill-dir", path: overrideDir ?? join(root, ".summer", "skills") };
  }

  const spec = agentSpec(agent);
  const resolved = resolveSkillPath(spec, scope, defaultPathContext());
  if (!resolved) {
    throw new Error(`${spec.label} has no skills folder. ${spec.noSkillsNote ?? ""}`.trim());
  }
  if (overrideDir) {
    return {
      kind: resolved.kind,
      path: resolved.kind === "windsurf-rule-file" ? join(overrideDir, ".windsurfrules") : overrideDir,
    };
  }
  return { kind: resolved.kind, path: resolved.path };
}

/** One-line, human path pattern for where an install location puts skills. */
export function describeInstallLocation(location: InstallLocation): string {
  const p = tildeify(location.path);
  switch (location.kind) {
    case "skill-dir":
      return `${p}/<skill>/SKILL.md`;
    case "cursor-rule-dir":
      return `${p}/summer-<skill>.mdc`;
    case "cline-rule-dir":
    case "opencode-skill-dir":
      return `${p}/summer-<skill>.md`;
    case "windsurf-rule-file":
      return p;
  }
}
