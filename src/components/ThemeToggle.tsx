"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--card-2)]"
      />
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = (current ?? "dark") === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card-2)] text-[var(--muted)] shadow-sm backdrop-blur-[14px] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--vault-blue)_30%,var(--border))] hover:bg-[var(--card)] hover:text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-cyan-400"
          >
            <MoonIcon />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 30, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -30, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-amber-500"
          >
            <SunIcon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
