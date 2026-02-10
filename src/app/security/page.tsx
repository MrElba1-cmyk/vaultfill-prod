import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "VaultFill security practices — how we protect your data.",
};

export default function SecurityPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-4xl">🛡️</div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Security</h1>
        <p className="text-sm text-[var(--muted)]">
          Our full security page is coming soon. VaultFill is built with
          SOC&nbsp;2 Type&nbsp;II and ISO&nbsp;27001 principles from day one —
          AES-256 encryption, zero data retention on LLM calls.
        </p>
        <a
          href="/"
          className="inline-block text-sm text-[var(--apex-emerald)] underline underline-offset-4 transition-colors hover:text-[var(--fg)]"
        >
          ← Back to home
        </a>
      </div>
    </main>
  );
}
