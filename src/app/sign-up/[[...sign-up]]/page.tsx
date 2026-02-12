'use client';

import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-emerald-400 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        <SignUp routing="path" path="/sign-up" />
      </div>
    </main>
  );
}
