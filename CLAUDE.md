@AGENTS.md

# StoryboardAI

Turns a written video script into an editable visual storyboard: an LLM splits the script into scenes and suggests visual concepts + search queries, real images are retrieved from search providers, and the user picks, edits, saves, and exports a shot list.

The app finds **existing visual references** — it does not generate images.

## How we work

- The user owns system design; Claude writes the code in **small vertical slices** (1–4 files).
- Before each slice: a ~5-line spec (inputs, outputs, files, edge cases) that the user approves.
- After each slice: a short walkthrough — data path, why it's built this way, "if this breaks, look here", and which files are core vs. boilerplate.
- Prefer clear, predictable code over clever code. Don't add libraries without agreeing on them first.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Zod · Anthropic SDK (`@anthropic-ai/sdk`) · Firebase Auth + Firestore.

## Architecture decisions

1. **API keys are server-only.** All LLM and image-search calls go through Next.js Route Handlers under `app/api/`. Never import secrets or provider SDKs into client components.
2. **The browser talks to Firestore directly** for project CRUD, protected by owner-only security rules. No CRUD API routes.
3. **Scenes are the source of truth after analysis.** The full script = scene excerpts joined in order. `originalScript` is kept read-only for reference. No character-offset syncing.
4. **One Firestore document per project, scenes embedded as an array.** Atomic reorder/merge/split. Move to a `scenes` subcollection only if we add collaboration or projects exceed a few hundred scenes.
5. **Scene operations are pure functions** in `lib/scenes.ts` (`reorderScene`, `mergeScenes`, `splitScene`, …). UI calls them; a separate save step persists the result. Storage details never leak into the UI.
6. **LLM output is validated.** Claude is called with structured outputs (JSON schema); the response is validated with the same Zod schema before use. The LLM never produces `id`s or `selectedImage` — the server adds ids.
7. **Image providers sit behind one adapter interface** (`search(query) → ImageResult[]`) in `lib/providers/`. Brave Search API first; Openverse later as a "licensed only" option.
8. **Search is on demand, per concept** — never for all scenes up front.
9. **Every concept has a search query** (option A). Asset types: `photo`, `product`, `screenshot`, `archival`, `stock-broll`. A "capture this yourself" flag (option B) was considered and deferred — revisit in M4 if interaction-heavy scripts become common.
10. **The LLM must not invent URLs.** Source URLs for capture targets are user-entered.
11. **Licensing:** never download, re-host, or proxy full images. Store URLs + metadata only (`imageUrl`, `thumbnailUrl`, `sourcePageUrl`, license/attribution if known). Open-web results are labeled "license unknown — verify before use". Search results are not persisted; only the selected image's metadata is.

## Folder layout (planned)

```
app/                 pages + app/api/* route handlers
components/          React components ("use client" only where state/events are needed)
lib/types.ts         domain types (Project, Scene, Concept, SelectedImage, ImageResult)
lib/schemas.ts       Zod schemas (LLM output contract)
lib/scenes.ts        pure scene operations
lib/providers/       image search adapters (brave.ts, openverse.ts)
lib/firebase/        Firebase client setup + persistence
```

## Milestones

- M0 Setup · M1 Script → scenes (API only) · M2 Editor + read-only storyboard · M3 Image search · M4 Selection + scene editing · M5 Auth + Firestore · M6 CSV/JSON export · M7 Hardening + deploy

## Environment

Secrets live in `.env.local` (gitignored). `.env.example` lists the required variable names.
