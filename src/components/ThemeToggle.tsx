"use client";

import * as React from "react";
import { useTheme } from "next-themes";

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = (current ?? "dark") === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 light:text-zinc-800"
    >
      <span
        className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-b from-blue-500/18 to-transparent text-blue-400 ring-1 ring-blue-400/18 transition-all group-hover:from-blue-500/22"
        aria-hidden="true"
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
