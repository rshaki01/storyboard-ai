import { z } from "zod";

// The fixed list of asset types a concept can suggest.
// Keep in sync with the definitions in lib/prompts.ts.
export const ASSET_TYPES = [
  "photo",
  "product",
  "screenshot",
  "archival",
  "stock-broll",
] as const;

export const AssetTypeSchema = z.enum(ASSET_TYPES);

// --- LLM output contract ---------------------------------------------------
// This is exactly what Claude must return. It deliberately has no ids and no
// selectedImage: the server adds ids, and images are chosen later by the user.
//
// Counts (2–3 concepts per scene) are asked for in the prompt rather than
// enforced here, because structured outputs only support a subset of JSON
// Schema constraints.

export const ConceptDraftSchema = z.object({
  description: z.string(),
  query: z.string(),
  assetType: AssetTypeSchema,
});

export const SceneDraftSchema = z.object({
  excerpt: z.string(),
  editingNotes: z.string(),
  concepts: z.array(ConceptDraftSchema),
});

export const AnalysisSchema = z.object({
  scenes: z.array(SceneDraftSchema),
});

// --- Request body for POST /api/analyze ------------------------------------

export const MAX_SCRIPT_CHARS = 20_000;

export const AnalyzeRequestSchema = z.object({
  script: z.string().trim().min(1, "Script is empty").max(MAX_SCRIPT_CHARS, "Script is too long"),
});
