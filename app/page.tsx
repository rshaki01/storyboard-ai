import ScriptAnalyzer from "@/components/ScriptAnalyzer";

// Server Component: static shell only. All interactivity lives in ScriptAnalyzer.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">StoryboardAI</h1>
        <p className="mt-1 text-sm text-zinc-500">Paste a script and get a visual storyboard with image search ideas for every scene.</p>
      </header>
      <ScriptAnalyzer />
    </main>
  );
}
