import { z } from "zod";

/** Shared MCP/CLI image request contract; optional flags preserve omission. */
export const imageGenerationArgsSchema = z.object({
      prompt: z.string().describe("Description of the image to generate"),
      model: z
        .string()
        .default("nano-banana-2")
        .describe("Model name or full provider ID"),
      style: z
        .string()
        .default("realistic")
        .describe("Style preset: realistic, cartoon, anime, or 'none' to skip"),
      referenceImageUrl: z
        .string()
        .optional()
        .describe("Source image URL for img2img / edit mode. The prompt describes how to transform this image."),
      removeBackground: z.boolean().optional().describe(
        "Remove the background server-side and return an alpha PNG for sprites, icons, or isolated objects."
      ),
      options: z
        .record(z.any())
        .optional()
        .describe("Provider-specific params (guidance_scale, seed, image_size, negative_prompt, etc.)"),
    });
