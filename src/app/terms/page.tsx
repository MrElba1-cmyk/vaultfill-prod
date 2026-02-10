import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "VaultFill terms of service.",
};

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-4xl">📋</div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Terms of Service</h1>
        <p className="text-sm text-[var(--muted)]">
          Our full terms of service are coming soon. We&apos;re committed to
          transparent, fair terms for all customers.
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
