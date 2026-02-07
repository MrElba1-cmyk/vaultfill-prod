import Link from "next/link";

const features = [
  {
    title: "Automated Security Questionnaires",
    desc: "Draft consistent answers fast using your internal evidence—policies, SOC 2 reports, pen-test summaries, and more.",
  },
  {
    title: "RAG with citations",
    desc: "Every answer can include a citation back to the exact evidence snippet—built for reviewer trust.",
  },
  {
    title: "Security-first multi-tenant",
    desc: "Tenant isolation from day one with row-level security patterns designed for Supabase.",
  },
  {
    title: "Evidence vault for PDFs",
    desc: "Store and retrieve evidence PDFs quickly so you can answer, verify, and ship with confidence.",
  },
];

const steps = [
  {
    k: "1",
    title: "Upload evidence",
    desc: "Drop in policies, SOC 2/ISO artifacts, vendor docs, and standard responses.",
  },
  {
    k: "2",
    title: "Generate answers",
    desc: "VaultFill drafts responses with citations and flags low-confidence gaps.",
  },
  {
    k: "3",
    title: "Export & respond",
    desc: "Ship the questionnaire and keep a traceable audit trail for approvals.",
  },
];

const faqs = [
  {
    q: "What does ‘security-first’ mean here?",
    a: "Least privilege, tenant isolation, and an evidence-backed workflow. The product is designed around storing evidence and generating answers with citations you can defend.",
  },
  {
    q: "Do you support DDQs and SIG?",
    a: "That’s the goal. VaultFill is built to handle common questionnaire formats and export answers with citations attached.",
  },
  {
    q: "How fast can we see value?",
    a: "If you already have core evidence (policies + audit artifacts), you can generate a useful first draft in about 10 minutes.",
  },
  {
    q: "Is this a replacement for Vanta?",
    a: "No—VaultFill focuses on questionnaire response speed and evidence-grounded answers. Many teams use compliance tools and still struggle with questionnaires.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(56,189,248,0.18)_0%,rgba(0,0,0,0)_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(168,85,247,0.14)_0%,rgba(0,0,0,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_80%_25%,rgba(34,197,94,0.10)_0%,rgba(0,0,0,0)_60%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      {/* Nav */}
      <header className="mx-auto w-full max-w-6xl px-6">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400/80 via-fuchsia-400/70 to-emerald-400/70 ring-1 ring-white/10" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">VaultFill</div>
              <div className="text-xs text-zinc-400">Security Questionnaire Automation</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm text-zinc-300 md:flex">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#how-it-works">
             How it works
            </a>
            <a className="hover:text-white" href="#faq">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-white/10 ring-1 ring-white/20 hover:bg-zinc-100"
            >
              Get early access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto w-full max-w-6xl px-6">
        <section className="pb-20 pt-10 md:pt-16">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Security-first • Evidence-backed • Tenant-isolated
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Go live in 10 minutes, not 10 weeks.
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
                VaultFill turns your security evidence into a searchable <span className="text-white">Knowledge Vault</span>,
                then drafts questionnaire answers with <span className="text-white">RAG-based citations</span> so you can move
                faster without sacrificing trust.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  id="get-started"
                  href="#"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-white to-zinc-100 px-5 py-3 text-sm font-semibold text-black ring-1 ring-white/20 hover:from-white hover:to-white"
                >
                  Request early access
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                >
                  See what you get
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Citations to your PDFs
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                  Tenant isolation patterns
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Audit-ready trail
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Security Questionnaire</div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-500/30">
                  Drafting
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-black/40 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Q: Do you encrypt data at rest?</div>
                  <div className="mt-2 text-sm">
                    Yes. Data is encrypted at rest using industry-standard encryption. Evidence: Security Policy (Section 3.2).
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Citation: policy.pdf#3.2
                  </div>
                </div>

                <div className="rounded-xl bg-black/40 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Q: How do you manage vendor risk?</div>
                  <div className="mt-2 text-sm">
                    Vendors are assessed pre-engagement and reviewed periodically. Evidence: Vendor Management Procedure.
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                    Citation: vmp.pdf
                  </div>
                </div>

                <div className="rounded-xl bg-black/40 p-4 ring-1 ring-white/10">
                  <div className="text-xs text-zinc-400">Q: Do you have an incident response plan?</div>
                  <div className="mt-2 text-sm">
                    Yes. The IR plan defines roles, timelines, and post-incident review steps. Evidence: IR-Plan (Appendix A).
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Citation: IR-Plan.pdf#A
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-zinc-400">Typical turnaround time</div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-semibold">~10 minutes</div>
                    <div className="text-xs text-zinc-400">for a first draft</div>
                  </div>
                  <div className="text-xs text-zinc-400">(after evidence upload)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16">
          <div className="flex items-end justify-between gap-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Built for speed. Designed for trust.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                Stop rewriting answers. Centralize evidence, generate consistent responses, and keep citations close for
                reviewers.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="text-base font-semibold">{f.title}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
            A simple workflow that turns your existing security artifacts into a compounding asset.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold ring-1 ring-white/15">
                    {s.k}
                  </div>
                  <div className="text-base font-semibold">{s.title}</div>
                </div>
                <div className="mt-3 text-sm leading-6 text-zinc-300">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-10 ring-1 ring-white/15">
            <h3 className="text-2xl font-semibold tracking-tight">Reduce security questionnaire turnaround time.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              VaultFill is building the fastest path from evidence → citations → completed questionnaires.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black ring-1 ring-white/20 hover:bg-zinc-100"
              >
                Request early access
              </a>
              <a
                href="#faq"
                className="inline-flex items-center justify-center rounded-xl bg-black/40 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-black/60"
              >
                Read the FAQ
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="text-base font-semibold">{f.q}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-14 pt-10 text-sm text-zinc-400">
          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400/80 via-fuchsia-400/70 to-emerald-400/70 ring-1 ring-white/10" />
              <div>
                <div className="text-zinc-200">VaultFill</div>
                <div className="text-xs">Evidence-backed answers for security questionnaires.</div>
              </div>
            </div>
            <div className="text-xs">© {new Date().getFullYear()} VaultFill. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
