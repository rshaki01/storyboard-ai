import type { z } from "zod";
import type { AssetTypeSchema, ConceptDraftSchema, SceneDraftSchema } from "./schemas";

// LLM-produced shapes are derived from the Zod schemas so they can't drift apart.
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type ConceptDraft = z.infer<typeof ConceptDraftSchema>;
export type SceneDraft = z.infer<typeof SceneDraftSchema>;

// --- App domain types (what the rest of the app works with) ----------------

export type Concept = ConceptDraft & {
  id: string;
};

// Metadata for the one image the user picked. We store URLs only —
// never the image itself (see CLAUDE.md, licensing).
export type SelectedImage = {
  provider: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourcePageUrl: string;
  sourceDomain: string;
  title: string;
  width?: number;
  height?: number;
  license?: string;
  attribution?: string;
  selectedAt: string; // ISO timestamp
};

export type Scene = {
  id: string;
  excerpt: string;
  editingNotes: string;
  concepts: Concept[];
  selectedImage: SelectedImage | null;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  originalScript: string; // read-only reference; scenes are the source of truth
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
};
