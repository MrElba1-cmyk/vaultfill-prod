import AINodeIcon from '@/components/icons/AINodeIcon';

export const metadata = {
  title: 'Integrations — VaultFill',
  description:
    'AI-native connectors for the systems that prove your security posture: cloud, identity, code, and monitoring.',
};

const INTEGRATIONS = [
  { name: 'AWS', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'Azure', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'Google Cloud', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'Okta', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'Microsoft Entra ID', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'GitHub', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'GitLab', badge: 'AI‑Native Connector', status: 'Coming soon' },
  { name: 'Jira', badge: 'AI‑Native Connector', status: 'Coming soon' },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen px-6 py-20" style={{ background: '#0a0a0a' }}>
      <div className="mx-auto max-w-5xl">
        <p className="text-xs tracking-widest text-zinc-400">CONNECTORS</p>
        <h1 className="mt-3 flex items-center gap-3 text-4xl font-semibold text-zinc-50">
          <span className="text-emerald-300">
            <AINodeIcon variant="link" size={22} glow />
          </span>
          Integrations
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          VaultFill is building AI-native connectors that turn operational signals into audit-ready evidence.
          These connectors are designed to map artifacts to controls automatically (no spreadsheet triage).
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((i) => (
            <div
              key={i.name}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-50">{i.name}</div>
                  <div className="mt-1 text-xs text-zinc-400">{i.status}</div>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                  {i.badge}
                </span>
              </div>

              <div className="mt-4 h-10 rounded-2xl border border-white/10 bg-black/30" />
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Evidence-ready outputs, mapped to controls, with citations.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-6">
          <h2 className="text-lg font-semibold text-zinc-50">Want a connector prioritized?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Tell us which systems you need to prove access control, logging, encryption, and change management.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Request High-Security Briefing →
          </a>
        </div>
      </div>
    </main>
  );
}
