"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Icons ─── */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2l7 4v5c0 5.25-3.5 8.75-7 10-3.5-1.25-7-4.75-7-10V6l7-4z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Validation ─── */
function validateEmail(v: string): string | null {
  if (!v) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com", "protonmail.com"];
  const domain = v.split("@")[1]?.toLowerCase();
  if (domain && freeProviders.includes(domain)) return "Please use your work email";
  return null;
}

/* ─── Select Field ─── */
function SelectField({
  id, label, value, onChange, options, optional,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: { value: string; label: string }[];
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[var(--muted)]" htmlFor={id}>
        {label}{optional && <span className="ml-1 text-[var(--muted-2)] font-normal">optional</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-3.5 py-2.5 pr-8 text-sm text-[var(--fg)] outline-none transition-all duration-200 focus:border-[var(--vault-blue)] focus:ring-2 focus:ring-[var(--vault-blue)]/20 hover:border-[var(--muted-2)]"
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-2)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LeadModal({
  isOpen,
  open,
  onClose,
}: {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}) {
  const effectiveOpen = isOpen ?? open ?? false;
  const [email, setEmail] = React.useState("");
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [monthlyVolume, setMonthlyVolume] = React.useState("");
  const [currentProcess, setCurrentProcess] = React.useState("");
  const [primaryFormats, setPrimaryFormats] = React.useState("");
  const [role, setRole] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");

  const emailError = emailTouched ? validateEmail(email) : null;

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (effectiveOpen) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [effectiveOpen, onClose]);

  React.useEffect(() => {
    if (!effectiveOpen) {
      setEmail(""); setEmailTouched(false);
      setMonthlyVolume(""); setCurrentProcess("");
      setPrimaryFormats(""); setRole("");
      setStatus("idle");
    }
  }, [effectiveOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    if (validateEmail(email) || status === "submitting") return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, monthlyVolume, currentProcess, primaryFormats, role }),
      });
      if (!res.ok) throw new Error("bad_response");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {effectiveOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-label="Request early access to VaultFill"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_68px_rgba(0,0,0,0.55),0_8px_20px_rgba(0,0,0,0.35)] sm:rounded-3xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtle top gradient accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            <div className="p-6 sm:p-8">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--muted-2)] transition-colors hover:bg-white/5 hover:text-[var(--fg)]"
                aria-label="Close"
              >
                <XIcon />
              </button>

              {/* Header */}
              <div className="pr-8">
                <motion.div
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-400">
                    Founding Members
                  </span>
                </motion.div>
                <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg)] sm:text-2xl">
                  Get early access to VaultFill
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  Be among the first to automate security questionnaires.
                  Founding members get priority onboarding&nbsp;+&nbsp;lifetime pricing.
                </p>
              </div>

              {/* Body */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {status !== "success" ? (
                    <motion.form
                      key="form"
                      onSubmit={submit}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                      noValidate
                    >
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[var(--muted)]" htmlFor="lead-email">
                          Work email
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoFocus
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted-2)] outline-none transition-all duration-200 bg-[var(--bg)]/60 ${
                            emailError
                              ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                              : "border-[var(--border)] focus:border-[var(--vault-blue)] focus:ring-2 focus:ring-[var(--vault-blue)]/20 hover:border-[var(--muted-2)]"
                          }`}
                          placeholder="you@company.com"
                        />
                        <AnimatePresence>
                          {emailError && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-[12px] text-red-400 overflow-hidden"
                            >
                              {emailError}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 2x2 grid */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SelectField
                          id="lead-role" label="Your role" value={role} onChange={setRole} optional
                          options={[
                            { value: "GRC", label: "GRC" },
                            { value: "Security", label: "Security" },
                            { value: "Compliance", label: "Compliance" },
                            { value: "Procurement", label: "Procurement / Vendor Mgmt" },
                            { value: "Other", label: "Other" },
                          ]}
                        />
                        <SelectField
                          id="lead-formats" label="Primary format" value={primaryFormats} onChange={setPrimaryFormats} optional
                          options={[
                            { value: "SOC 2", label: "SOC 2" },
                            { value: "ISO 27001", label: "ISO 27001" },
                            { value: "SIG", label: "SIG" },
                            { value: "DDQ", label: "DDQ" },
                            { value: "CAIQ", label: "CAIQ" },
                            { value: "Custom", label: "Custom" },
                          ]}
                        />
                        <SelectField
                          id="lead-volume" label="Monthly volume" value={monthlyVolume} onChange={setMonthlyVolume}
                          options={[
                            { value: "1-5", label: "1–5 questionnaires" },
                            { value: "6-20", label: "6–20 questionnaires" },
                            { value: "20+", label: "20+ questionnaires" },
                          ]}
                        />
                        <SelectField
                          id="lead-process" label="Current process" value={currentProcess} onChange={setCurrentProcess}
                          options={[
                            { value: "Manual/Spreadsheets", label: "Manual / Spreadsheets" },
                            { value: "Existing Tool", label: "Existing Tool" },
                            { value: "No Process", label: "No Process Yet" },
                          ]}
                        />
                      </div>

                      {/* Error banner */}
                      <AnimatePresence>
                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                              Something went wrong. Please try again — or email us at <span className="font-medium text-red-200">hello@vaultfill.com</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_32px_rgba(59,130,246,0.25)] ring-1 ring-inset ring-white/10 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_40px_rgba(59,130,246,0.35)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {status === "submitting" ? (
                          <>
                            <SpinnerIcon />
                            Requesting access…
                          </>
                        ) : (
                          "Request Early Access"
                        )}
                      </button>

                      {/* Social proof + privacy */}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="flex items-center gap-1.5 text-[12px] text-[var(--muted-2)]">
                          <ShieldIcon />
                          <span>200+ security teams already using VaultFill</span>
                        </p>
                        <p className="text-[11px] text-[var(--muted-2)] shrink-0">No spam, ever.</p>
                      </div>
                    </motion.form>
                  ) : (
                    /* ─── Success State ─── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-center"
                    >
                      <motion.div
                        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25 text-emerald-400"
                        initial={{ scale: 0.5, rotate: -12 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <CheckIcon />
                      </motion.div>

                      <h4 className="mt-5 text-lg font-semibold text-[var(--fg)]">
                        You&apos;re on the list!
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        A Vault Specialist will review your request and reach out within 24 hours
                        with your onboarding details.
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="rounded-xl border border-[var(--border)] bg-white/[0.02] p-4">
                          <p className="text-[13px] font-medium text-[var(--fg)]">While you wait</p>
                          <ul className="mt-2 space-y-1.5 text-[13px] text-[var(--muted)]">
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-emerald-400">✓</span>
                              Check your inbox for a confirmation email
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-emerald-400">✓</span>
                              Prepare a sample questionnaire to upload
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-0.5 text-emerald-400">✓</span>
                              Gather your security documentation
                            </li>
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-6 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors duration-200 hover:bg-white/10"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
