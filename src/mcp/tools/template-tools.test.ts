import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTemplateTools, listTemplates } from "./template-tools.js";
import {
  isTemplateRepoName,
  templateSlugForRepo,
  _resetTemplateCacheForTests,
} from "../../lib/remote-templates.js";

type RegisteredTool = {
  name: string;
  description: string;
  handler: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
};

function collectTools(): RegisteredTool[] {
  const tools: RegisteredTool[] = [];
  const fake = {
    tool: (name: string, description: string, _schema: unknown, handler: RegisteredTool["handler"]) => {
      tools.push({ name, description, handler });
    },
  } as unknown as McpServer;
  registerTemplateTools(fake);
  return tools;
}

const ghRepo = (name: string, description = "", extra: Record<string, unknown> = {}) => ({
  name,
  description,
  default_branch: "main",
  html_url: `https://github.com/SummerEngine/${name}`,
  clone_url: `https://github.com/SummerEngine/${name}.git`,
  stargazers_count: 1,
  updated_at: "2026-07-01T00:00:00Z",
  archived: false,
  fork: false,
  ...extra,
});

beforeEach(() => {
  vi.restoreAllMocks();
  _resetTemplateCacheForTests();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("template repo filter", () => {
  it("keeps canonical template-* repos and strips the prefix for the slug", () => {
    expect(isTemplateRepoName("template-2d-rpg")).toBe(true);
    expect(templateSlugForRepo("template-2d-rpg")).toBe("2d-rpg");
  });

  it("keeps legacy example repos that predate the prefix convention", () => {
    expect(isTemplateRepoName("FPS-template-Summer-Engine")).toBe(true);
    expect(isTemplateRepoName("Getting-Started-3D-Platformer")).toBe(true);
    expect(templateSlugForRepo("FPS-template-Summer-Engine")).toBe("fps-template-summer-engine");
  });

  it("excludes non-template org repos", () => {
    for (const name of ["summer-engine-agent", "docs", "OpenBird", "summercraft"]) {
      expect(isTemplateRepoName(name)).toBe(false);
    }
  });
});

describe("summer_list_templates", () => {
  it("registers with an engine-free, example-discovery description", () => {
    const [tool] = collectTools();
    expect(tool.name).toBe("summer_list_templates");
    expect(tool.description).toContain("WITHOUT the Summer Engine app open");
    expect(tool.description).toContain("npx -y summer-engine@latest create");
  });

  it("prefers the gateway listing and always includes builtins", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          templates: [
            {
              slug: "3d-fps-old-school",
              repo: "template-3d-fps-old-school",
              description: "old school fps",
              branch: "main",
              url: "https://github.com/SummerEngine/template-3d-fps-old-school",
              cloneUrl: "https://github.com/SummerEngine/template-3d-fps-old-school.git",
              stars: 5,
              updatedAt: "2026-07-01T00:00:00Z",
            },
          ],
        }),
      }))
    );
    const { templates, source } = await listTemplates();
    expect(source).toBe("gateway");
    expect(templates.some((t) => t.source === "builtin" && t.slug === "3d-basic")).toBe(true);
    const fps = templates.find((t) => t.slug === "3d-fps-old-school");
    expect(fps?.createCommand).toContain("create 3d-fps-old-school");
    expect(fps?.githubUrl).toContain("github.com/SummerEngine");
  });

  it("falls back to the GitHub org listing when the gateway 404s", async () => {
    const fetchMock = vi.fn(async (url: unknown) => {
      if (String(url).includes("/api/mcp/templates")) {
        return { ok: false, status: 404, json: async () => ({}) };
      }
      return {
        ok: true,
        json: async () => [ghRepo("template-2d-rpg", "rpg"), ghRepo("Getting-Started-City-Builder")],
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    const { templates, source } = await listTemplates();
    expect(source).toBe("github");
    expect(templates.some((t) => t.slug === "2d-rpg")).toBe(true);
    expect(templates.some((t) => t.slug === "getting-started-city-builder")).toBe(true);
  });

  it("still returns builtins with a browse-URL warning when everything is down", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const { templates, source, warning } = await listTemplates();
    expect(source).toBe("builtin-only");
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((t) => t.source === "builtin")).toBe(true);
    expect(warning).toContain("github.com/orgs/SummerEngine");
  });

  it("filters by query in the tool handler", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: unknown) => {
      if (String(url).includes("/api/mcp/templates")) {
        return { ok: false, status: 404, json: async () => ({}) };
      }
      return {
        ok: true,
        json: async () => [ghRepo("template-3d-fps-old-school", "shooter"), ghRepo("template-2d-rpg", "rpg")],
      };
    }));
    const [tool] = collectTools();
    const result = await tool.handler({ query: "fps" });
    const body = JSON.parse(result.content[0]!.text);
    expect(body.templates.map((t: { slug: string }) => t.slug)).toContain("3d-fps-old-school");
    expect(body.templates.map((t: { slug: string }) => t.slug)).not.toContain("2d-rpg");
    expect(body.totalAvailable).toBeGreaterThan(body.count);
  });
});
