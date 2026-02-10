import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VaultFill privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted)]">
          Our full privacy policy is coming soon. We take data protection
          seriously — your evidence stays encrypted and under your control.
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
