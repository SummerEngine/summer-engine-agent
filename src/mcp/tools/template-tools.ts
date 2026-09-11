import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchRemoteTemplates, type RemoteTemplate } from "../../lib/remote-templates.js";
import { BUILTIN_TEMPLATES } from "../../commands/create.js";

const GATEWAY_URL =
  process.env.SUMMER_GATEWAY_URL || "https://www.summerengine.com";

/** Shape returned to the model for each template — includes the exact command
 *  to materialize it, so the agent never has to guess the CLI syntax. */
interface TemplateListing {
  slug: string;
  description: string;
  source: "builtin" | "github";
  githubUrl?: string;
  stars?: number;
  updatedAt?: string;
  createCommand: string;
}

function createCommand(slug: string): string {
  return `npx -y summer-engine@latest create ${slug} <project-dir>`;
}

function toListing(t: RemoteTemplate): TemplateListing {
  return {
    slug: t.slug,
    description: t.description ?? "",
    source: "github",
    githubUrl: t.url,
    stars: t.stars,
    updatedAt: t.updatedAt,
    createCommand: createCommand(t.slug),
  };
}

/** Gateway-first listing: the web API is the curation point (server-side
 *  cache, no GitHub rate limits, can reorder/annotate without a CLI release).
 *  Falls back to the GitHub org listing when the gateway doesn't have the
 *  endpoint yet or is unreachable. Exported for unit tests. */
export async function listTemplates(): Promise<{
  templates: TemplateListing[];
  source: "gateway" | "github" | "builtin-only";
  warning?: string;
}> {
  const builtins: TemplateListing[] = BUILTIN_TEMPLATES.map((t) => ({
    slug: t.name,
    description: t.description,
    source: "builtin" as const,
    createCommand: createCommand(t.name),
  }));

  try {
    const res = await fetch(`${GATEWAY_URL}/api/mcp/templates`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const data = (await res.json()) as { templates?: RemoteTemplate[] };
      if (Array.isArray(data.templates) && data.templates.length > 0) {
        return {
          templates: [...builtins, ...data.templates.map(toListing)],
          source: "gateway",
        };
      }
    }
  } catch {
    // Gateway missing or unreachable — GitHub fallback below.
  }

  try {
    const remote = await fetchRemoteTemplates();
    return {
      templates: [...builtins, ...remote.map(toListing)],
      source: "github",
    };
  } catch (err) {
    return {
      templates: builtins,
      source: "builtin-only",
      warning: `Could not list community templates (${(err as Error).message}). Browse them at https://github.com/orgs/SummerEngine/repositories instead.`,
    };
  }
}

export function registerTemplateTools(server: McpServer): void {
  server.tool(
    "summer_list_templates",
    `List Summer Engine starter templates and example projects.

Use this when the user asks for examples, starters, templates, sample projects,
or "how do I begin a <genre> game" — FPS, third-person, 2D platformer, RPG,
racing, tower defense, voxel sandbox, multiplayer and more. These are complete,
open-source Godot projects maintained at github.com/SummerEngine.

Each entry includes the exact command to materialize it:
  npx -y summer-engine@latest create <slug> <project-dir>
Run that with your shell tool (it git-clones and detaches history), then open
the project in Summer Engine. Built-in slugs (empty, 3d-basic) work offline.

Cloud tool — works WITHOUT the Summer Engine app open. No authentication needed.`,
    {
      query: z
        .string()
        .default("")
        .describe("Optional filter, e.g. 'fps', '2d', 'multiplayer'. Empty lists everything."),
    },
    async ({ query }) => {
      const { templates, source, warning } = await listTemplates();
      const q = query.trim().toLowerCase();
      const filtered = q
        ? templates.filter(
            (t) =>
              t.slug.toLowerCase().includes(q) ||
              (t.description ?? "").toLowerCase().includes(q)
          )
        : templates;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                templates: filtered,
                count: filtered.length,
                totalAvailable: templates.length,
                source,
                ...(warning ? { warning } : {}),
                hint: `Create one with: ${createCommand("<slug>")}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
