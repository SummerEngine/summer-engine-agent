import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { afterEach, describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { AGENT_CLIENTS } from "../core/skills-registry.js";
import { configureAgentMcp, mcpEntry, parseAgent, renderConfigSnippet, topLevelKey } from "./agent-config.js";
import {
  AGENT_IDS,
  agentAliasMap,
  agentSpec,
  allAgentSpecs,
  resolveMcpPath,
  resolveSkillPath,
  skillCapableAgents,
  supportedAgents,
  type PathContext,
} from "./agent-table.js";

const repoRoot = resolve(fileURLToPath(import.meta.url), "..", "..", "..");
const NPX_ARGS = ["-y", "summer-engine@latest", "mcp"];

const tmpDirs: string[] = [];
function tmp(): string {
  const dir = mkdtempSync(join(tmpdir(), "summer-agent-table-"));
  tmpDirs.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of tmpDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function ctx(os: NodeJS.Platform, env: NodeJS.ProcessEnv = {}): PathContext {
  return { home: os === "win32" ? "C:\\Users\\dev" : "/home/dev", os, env, cwd: "/work/game" };
}

describe("agent table integrity", () => {
  it("every id has exactly one spec and every alias is unique", () => {
    const ids = allAgentSpecs().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...AGENT_IDS].sort());
    expect(() => agentAliasMap()).not.toThrow();
    const map = agentAliasMap();
    for (const spec of allAgentSpecs()) {
      expect(parseAgent(spec.id)).toBe(spec.id);
      for (const alias of spec.aliases) expect(map[alias]).toBe(spec.id);
    }
  });

  it("help lists active agents only; legacy ids still parse and warn", () => {
    const legacy = allAgentSpecs().filter((s) => s.status === "legacy");
    expect(legacy.map((s) => s.id).sort()).toEqual(["gemini", "roo-code"]);
    for (const spec of legacy) {
      expect(supportedAgents).not.toContain(spec.id);
      expect(parseAgent(spec.id)).toBe(spec.id);
      expect(spec.legacyNote).toBeTruthy();
      expect(resolveMcpPath(spec, "user", ctx("darwin")).warnings).toContain(spec.legacyNote);
    }
    for (const spec of allAgentSpecs().filter((s) => s.status === "active")) {
      expect(resolveMcpPath(spec, "user", ctx("darwin")).warnings).toEqual([]);
    }
  });

  it("AGENT_CLIENTS (core) is summer + every skill-capable agent, in table order", () => {
    expect([...AGENT_CLIENTS]).toEqual(["summer", ...skillCapableAgents]);
  });

  it("agents without a skills home say why", () => {
    for (const spec of allAgentSpecs()) {
      if (spec.skills === null) expect(spec.noSkillsNote, spec.id).toBeTruthy();
    }
  });

  it("every agent has an integrations/<id>/ folder (or the claude legacy name)", () => {
    for (const spec of allAgentSpecs()) {
      const folder = spec.id === "claude-code" ? "claude" : spec.id;
      expect(existsSync(join(repoRoot, "integrations", folder, "README.md")), `integrations/${folder}/README.md`).toBe(true);
    }
  });

  it("env override names are unique and follow SUMMER_*_CONFIG_FILE", () => {
    const names = allAgentSpecs().map((s) => s.envOverride);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(name).toMatch(/^SUMMER_[A-Z0-9_]+_CONFIG_FILE$/);
  });
});

describe("agent table paths", () => {
  it("resolves a user and (where supported) a project MCP path on every OS without throwing", () => {
    for (const spec of allAgentSpecs()) {
      for (const os of ["darwin", "linux", "win32"] as const) {
        const user = resolveMcpPath(spec, "user", ctx(os));
        expect(user.path.length, `${spec.id}/${os}`).toBeGreaterThan(0);
        const project = resolveMcpPath(spec, "project", ctx(os));
        if (spec.mcp.project) {
          expect(project.scope).toBe("project");
          expect(project.path.startsWith("/work/game")).toBe(true);
        } else {
          expect(project.scope).toBe("user");
          expect(project.warnings.some((w) => /user scope/.test(w) || w === spec.mcp.projectNote)).toBe(true);
        }
        if (spec.skills) {
          expect(resolveSkillPath(spec, "user", ctx(os))?.path.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("Claude Desktop config follows the OS app-config root", () => {
    const spec = agentSpec("claude-desktop");
    expect(resolveMcpPath(spec, "user", ctx("darwin")).path).toBe(
      "/home/dev/Library/Application Support/Claude/claude_desktop_config.json"
    );
    expect(resolveMcpPath(spec, "user", ctx("linux")).path).toBe("/home/dev/.config/Claude/claude_desktop_config.json");
    expect(resolveMcpPath(spec, "user", ctx("win32", { APPDATA: "C:\\Users\\dev\\AppData\\Roaming" })).path).toBe(
      join("C:\\Users\\dev\\AppData\\Roaming", "Claude", "claude_desktop_config.json")
    );
  });

  it("Goose uses XDG on macOS/Linux and Block\\goose on Windows", () => {
    const spec = agentSpec("goose");
    expect(resolveMcpPath(spec, "user", ctx("darwin")).path).toBe("/home/dev/.config/goose/config.yaml");
    expect(resolveMcpPath(spec, "user", ctx("win32", { APPDATA: "C:\\AD" })).path).toBe(
      join("C:\\AD", "Block", "goose", "config", "config.yaml")
    );
  });

  it("Cursor and Devin Desktop now get SKILL.md skills, not rule files", () => {
    expect(resolveSkillPath(agentSpec("cursor"), "user", ctx("darwin"))).toEqual({
      kind: "skill-dir",
      path: "/home/dev/.cursor/skills",
      scope: "user",
    });
    expect(resolveSkillPath(agentSpec("windsurf"), "user", ctx("darwin"))?.path).toBe("/home/dev/.codeium/windsurf/skills");
  });
});

describe("config file shapes", () => {
  async function write(agent: Parameters<typeof configureAgentMcp>[0]["agent"], fileName: string, seed?: string) {
    const dir = tmp();
    const path = join(dir, fileName);
    if (seed !== undefined) writeFileSync(path, seed);
    const spec = agentSpec(agent);
    const result = await configureAgentMcp({
      agent,
      scope: "user",
      env: { [spec.envOverride]: path } as NodeJS.ProcessEnv,
    });
    expect(result.wrote).toBe(true);
    return { path, text: readFileSync(path, "utf-8"), result };
  }

  it("json-stdio (Factory): mcpServers entry typed stdio", async () => {
    const { text } = await write("factory", "mcp.json");
    expect(JSON.parse(text).mcpServers["summer-engine"]).toEqual({ type: "stdio", command: "npx", args: NPX_ARGS });
  });

  it("json-vscode (Visual Studio, Copilot JetBrains): servers entry typed stdio", async () => {
    for (const agent of ["visual-studio", "copilot-jetbrains"] as const) {
      const { text } = await write(agent, "mcp.json");
      expect(JSON.parse(text).servers["summer-engine"]).toEqual({ type: "stdio", command: "npx", args: NPX_ARGS });
    }
  });

  it("json-zed: context_servers entry with source custom and an env map, other settings kept", async () => {
    const { text } = await write("zed", "settings.json", JSON.stringify({ theme: "One Dark", context_servers: { other: { source: "custom", command: "x", args: [] } } }));
    const parsed = JSON.parse(text);
    expect(parsed.theme).toBe("One Dark");
    expect(parsed.context_servers.other.command).toBe("x");
    expect(parsed.context_servers["summer-engine"]).toEqual({ source: "custom", command: "npx", args: NPX_ARGS, env: {} });
  });

  it("json-amp: amp.mcpServers dotted key", async () => {
    const { text } = await write("amp", "settings.json", JSON.stringify({ "amp.notifications.enabled": true }));
    const parsed = JSON.parse(text);
    expect(parsed["amp.notifications.enabled"]).toBe(true);
    expect(parsed["amp.mcpServers"]["summer-engine"]).toEqual({ command: "npx", args: NPX_ARGS });
  });

  it("json-crush: mcp entry typed stdio", async () => {
    const { text } = await write("crush", "crush.json");
    expect(JSON.parse(text).mcp["summer-engine"]).toEqual({ type: "stdio", command: "npx", args: NPX_ARGS });
  });

  it("plain json agents (Antigravity, Kiro, Trae, Qwen, Kimi, Junie, Claude Desktop) write mcpServers", async () => {
    for (const agent of ["antigravity", "kiro", "trae", "qwen-code", "kimi-code", "junie", "claude-desktop"] as const) {
      const { text } = await write(agent, "mcp.json");
      expect(JSON.parse(text).mcpServers["summer-engine"], agent).toEqual({ command: "npx", args: NPX_ARGS });
    }
  });

  it("yaml-goose: extensions entry with cmd/args/enabled/timeout, comments and other keys preserved", async () => {
    const seed = "# my goose config\nGOOSE_PROVIDER: ollama\nextensions:\n  developer:\n    type: builtin\n    name: developer\n    enabled: true\n";
    const { text } = await write("goose", "config.yaml", seed);
    expect(text.startsWith("# my goose config")).toBe(true);
    const parsed = parseYaml(text);
    expect(parsed.GOOSE_PROVIDER).toBe("ollama");
    expect(parsed.extensions.developer.type).toBe("builtin");
    expect(parsed.extensions["summer-engine"]).toMatchObject({
      type: "stdio",
      name: "summer-engine",
      cmd: "npx",
      args: NPX_ARGS,
      enabled: true,
      timeout: 300,
      envs: {},
    });
  });

  it("yaml-goose: second run is a no-op", async () => {
    const dir = tmp();
    const path = join(dir, "config.yaml");
    const env = { SUMMER_GOOSE_CONFIG_FILE: path } as NodeJS.ProcessEnv;
    await configureAgentMcp({ agent: "goose", scope: "user", env });
    const again = await configureAgentMcp({ agent: "goose", scope: "user", env });
    expect(again.changed).toBe(false);
  });

  it("yaml-hermes: mcp_servers entry with command/args", async () => {
    const { text } = await write("hermes", "config.yaml", "model: hermes-4\n");
    const parsed = parseYaml(text);
    expect(parsed.model).toBe("hermes-4");
    expect(parsed.mcp_servers["summer-engine"]).toEqual({ command: "npx", args: NPX_ARGS });
  });

  it("yaml: refuses a file whose top level is not a mapping", async () => {
    const dir = tmp();
    const path = join(dir, "config.yaml");
    writeFileSync(path, "- just\n- a list\n");
    await expect(
      configureAgentMcp({ agent: "goose", scope: "user", env: { SUMMER_GOOSE_CONFIG_FILE: path } as NodeJS.ProcessEnv })
    ).rejects.toThrow(/YAML mapping/);
  });

  it("OpenCode keeps its $schema; Kilo (same shape) does not get it", () => {
    expect(renderConfigSnippet("opencode", { command: "npx", args: NPX_ARGS })).toContain("opencode.ai/config.json");
    expect(renderConfigSnippet("kilo-code", { command: "npx", args: NPX_ARGS })).not.toContain("$schema");
  });

  it("snippets render for every agent and mention the launcher", () => {
    for (const spec of allAgentSpecs()) {
      const snippet = renderConfigSnippet(spec.id, { command: "npx", args: NPX_ARGS });
      expect(snippet, spec.id).toContain("summer-engine");
      expect(snippet, spec.id).toContain("npx");
      const key = topLevelKey(spec.format);
      if (spec.format !== "json-gemini") expect(snippet, spec.id).toContain(key);
    }
  });

  it("mcpEntry carries env into each shape's env field", () => {
    const server = { command: "npx", args: NPX_ARGS, env: { SUMMER_GATEWAY_URL: "https://staging.summerengine.com" } };
    expect(mcpEntry("json", server).env).toEqual(server.env);
    expect(mcpEntry("json-opencode", server).environment).toEqual(server.env);
    expect(mcpEntry("json-zed", server).env).toEqual(server.env);
    expect(mcpEntry("yaml-goose", server).envs).toEqual(server.env);
    expect(mcpEntry("json-copilot", server).tools).toEqual(["*"]);
  });
});
