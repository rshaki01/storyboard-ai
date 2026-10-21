"use client";

import { useState } from "react";
import type { Scene } from "@/lib/types";
import { MAX_SCRIPT_CHARS } from "@/lib/schemas";
import SceneCard from "./SceneCard";

// Owns the page's state: the script text, the request status, and the scenes.
// Everything below it (SceneCard) is display-only and receives data as props.
export default function ScriptAnalyzer() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      // The route returns { error } on 4xx/5xx and { scenes } on success.
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      console.log(data);
      setScenes(data.scenes);
    } catch {
      setError("Couldn't reach the server. Is `npm run dev` running?");
    } finally {
      setIsLoading(false);
    }
  }

  const canAnalyze = script.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <label htmlFor="script" className="text-sm font-medium">
          Your script
        </label>
        <textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          maxLength={MAX_SCRIPT_CHARS}
          rows={10}
          placeholder="Paste your script here…"
          className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm leading-6 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isLoading ? "Analyzing…" : "Analyze script"}
          </button>
          {isLoading && (
            <span className="text-sm text-zinc-500">Breaking your script into scenes — this takes about 20 seconds.</span>
          )}
          <span className="ml-auto text-xs text-zinc-500">
            {script.length.toLocaleString()} / {MAX_SCRIPT_CHARS.toLocaleString()}
          </span>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
      </section>

      {scenes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Storyboard · {scenes.length} scenes</h2>
          <ol className="flex flex-col gap-4">
            {scenes.map((scene, index) => (
              <SceneCard key={scene.id} scene={scene} number={index + 1} />
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
