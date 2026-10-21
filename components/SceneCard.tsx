import type { Scene } from "@/lib/types";

type Props = {
  scene: Scene;
  number: number;
};

// Read-only view of one scene. No state — it just renders what it's given.
// Search buttons and image selection arrive in M3/M4.
export default function SceneCard({ scene, number }: Props) {
  return (
    <li className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Scene {number}</p>
      <blockquote className="mb-4 border-l-2 border-zinc-300 pl-3 text-sm leading-6 dark:border-zinc-700">
        {scene.excerpt}
      </blockquote>

      <ul className="flex flex-col gap-2">
        {scene.concepts.map((concept) => (
          <li key={concept.id} className="text-sm">
            <span className="mr-2 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {concept.assetType}
            </span>
            <span className="font-medium">{concept.query}</span>
            <p className="mt-0.5 text-zinc-500">{concept.description}</p>
          </li>
        ))}
      </ul>

      {scene.editingNotes && (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Editing notes:</span> {scene.editingNotes}
        </p>
      )}
    </li>
  );
}
