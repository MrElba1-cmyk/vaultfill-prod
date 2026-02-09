import TrustBadges from '../components/TrustBadges';
import SandboxBanner from '../components/SandboxBanner';

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <div className="space-y-8">
        {/* Sandbox Mode Banner */}
        <SandboxBanner />

        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            VaultFill
          </h1>
          <p className="max-w-2xl text-lg text-white/60">
            AI-powered security questionnaire automation.{' '}
            <span className="text-emerald-400/80">Private by design.</span>
          </p>
        </div>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Privacy Promise */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2 className="text-sm font-semibold text-white">Our Privacy Promise</h2>
          </div>
          <p className="text-sm leading-relaxed text-white/50">
            VaultFill operates on a <span className="text-white/70 font-medium">zero-knowledge architecture</span>. 
            We don&apos;t store your queries, track your usage, or require an account. 
            Every session is anonymous and ephemeral. Your compliance data never leaves your control.
          </p>
        </div>

        {/* Try Prompts */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-white">Try it — completely anonymous</h2>
          <p className="mt-1 text-xs text-white/40">Use the chat bubble in the corner. No signup required.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/60">
            <li>&ldquo;How should I answer a vendor questionnaire about SOC 2 availability controls?&rdquo;</li>
            <li>&ldquo;What evidence is typically acceptable for access reviews?&rdquo;</li>
            <li>&ldquo;Draft a concise response to a question about encryption at rest.&rdquo;</li>
          </ul>
        </div>

        {/* Footer privacy note */}
        <p className="text-center text-[11px] text-white/25">
          VaultFill Autonomous Systems · No cookies · No tracking · No data retention
        </p>
      </div>
    </main>
  );
}
