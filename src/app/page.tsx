export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          VaultFill
        </h1>
        <p className="max-w-2xl text-white/75">
          Ask questions about security questionnaires, controls, evidence requests, and GRC best
          practices. Use the chat bubble in the corner.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Try prompts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-white/70">
            <li>"How should I answer a vendor questionnaire about SOC 2 availability controls?"</li>
            <li>"What evidence is typically acceptable for access reviews?"</li>
            <li>"Draft a concise response to a question about encryption at rest."</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
