import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-emerald-400 px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-xs tracking-widest text-zinc-400">SECURE PORTAL</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fg)]">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">Emerald Stealth access required.</p>
          <div className="mt-6">
            <SignIn routing="path" path="/sign-in" />
          </div>
        </div>
      </div>
    </main>
  );
}
