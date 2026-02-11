export const metadata = {
  title: 'Request High-Security Briefing — VaultFill',
  description:
    'Request a high-security briefing for VaultFill. Enterprise onboarding designed for compliance-led teams.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: '#0a0a0a' }}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs tracking-widest text-zinc-400">ENTERPRISE PORTAL</p>
        <h1 className="mt-3 text-4xl font-semibold text-zinc-50">Request High-Security Briefing</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          For security-led teams that need an accelerated evaluation. We’ll walk through how VaultFill produces
          citation-backed answers, surfaces control gaps, and turns evidence into board-ready exports.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-400">Work email</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Company</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Framework priority</label>
              <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100">
                <option>SOC 2</option>
                <option>ISO 27001</option>
                <option>SOC 2 + ISO 27001</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400">Timeline</label>
              <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100">
                <option>ASAP (this week)</option>
                <option>2–4 weeks</option>
                <option>1–2 months</option>
                <option>Exploring</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">What are you trying to prove?</label>
              <textarea
                className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600"
                placeholder="Example: We need audit-ready evidence for SOC 2 Security, reduce DDQ cycle time, and share compliance status with prospects."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Privacy-first: submit only what you’re comfortable sharing. We’ll ask for documents later if needed.
            </p>
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400"
              type="button"
            >
              Send Request →
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-400">
          <span>🔐 Encryption-forward</span>
          <span>·</span>
          <span>🧾 Citation-backed outputs</span>
          <span>·</span>
          <span>🧠 AI-first workflows</span>
        </div>
      </div>
    </main>
  );
}
