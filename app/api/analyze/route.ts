import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AnalysisSchema, AnalyzeRequestSchema } from "@/lib/schemas";
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/prompts";
import type { Scene } from "@/lib/types";

const MODEL = "claude-opus-5-5";

// Reads ANTHROPIC_API_KEY from the environment (.env.local). Server-only.
const client = new Anthropic();

// POST /api/analyze  { script: string }  →  { scenes: Scene[] }
export async function POST(request: Request) {
  // 1. Validate the request body.
  const body = await request.json().catch(() => null);
  const input = AnalyzeRequestSchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: input.error.issues[0].message }, { status: 400 });
  }

  // 2. Ask Claude for scenes, constrained to AnalysisSchema.
  let response;
  try {
    response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      // If the model declines for policy reasons, the API retries on a default fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low", // simple extraction task: keep it fast and cheap
        format: zodOutputFormat(AnalysisSchema),
      },
      system: ANALYZE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `<script>\n${input.data.script}\n</script>` }],
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
    } else {
      console.error("Unexpected error calling Anthropic:", error);
    }
    return Response.json({ error: "Script analysis failed. Try again." }, { status: 502 });
  }

  // 3. Check the model actually finished and produced valid output.
  if (response.stop_reason === "refusal") {
    return Response.json({ error: "The model declined to analyze this script." }, { status: 502 });
  }
  if (response.stop_reason === "max_tokens") {
    return Response.json({ error: "Script too long to analyze in one pass." }, { status: 502 });
  }
  if (!response.parsed_output) {
    return Response.json({ error: "The model returned an unexpected format." }, { status: 502 });
  }

  // 4. Add ids and empty selections — the LLM never produces these.
  const scenes: Scene[] = response.parsed_output.scenes.map((draft) => ({
    id: crypto.randomUUID(),
    excerpt: draft.excerpt,
    editingNotes: draft.editingNotes,
    concepts: draft.concepts.map((concept) => ({ ...concept, id: crypto.randomUUID() })),
    selectedImage: null,
  }));

  console.log(
    `analyze: ${scenes.length} scenes, ${response.usage.input_tokens} in / ${response.usage.output_tokens} out tokens`,
  );

  return Response.json({ scenes });
}
