"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [monthlyVolume, setMonthlyVolume] = React.useState<
    "1-5" | "6-20" | "20+" | ""
  >("");
  const [currentProcess, setCurrentProcess] = React.useState<
    "Manual/Spreadsheets" | "Existing Tool" | "No Process" | ""
  >("");
  const [primaryFormats, setPrimaryFormats] = React.useState<
    "SOC 2" | "ISO 27001" | "SIG" | "DDQ" | "CAIQ" | "Custom" | ""
  >("");
  const [role, setRole] = React.useState<
    "GRC" | "Security" | "Compliance" | "Procurement" | "Other" | ""
  >("");
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (effectiveOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [effectiveOpen, onClose]);

  React.useEffect(() => {
    if (!effectiveOpen) {
      setEmail("");
      setMonthlyVolume("");
      setCurrentProcess("");
      setPrimaryFormats("");
      setRole("");
      setStatus("idle");
    }
  }, [effectiveOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-2)] p-5 shadow-[var(--shadow-natural)] sm:rounded-3xl sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div
                  className="text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--vault-blue)" }}
                >
                  Founding Member
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--fg)] sm:text-2xl">
                  Join the cohort.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  Join the exclusive Founding Member cohort and reduce questionnaire time by 80%.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-2.5 sm:gap-3">
                      <div>
                        <label
                          className="text-xs font-semibold text-[var(--muted-2)]"
                          htmlFor="lead-email"
                        >
                          Work email
                        </label>
                        <input
                          id="lead-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--muted-2)] outline-none transition-all focus:ring-2 focus:ring-[color:var(--vault-blue)]/35"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            className="text-xs font-semibold text-[var(--muted-2)]"
                            htmlFor="lead-role"
                          >
                            Your role (optional)
                          </label>
                          <select
                            id="lead-role"
                            value={role}
                            onChange={(e) =>
                              setRole(
                                e.target.value as
                                  | ""
                                  | "GRC"
                                  | "Security"
                                  | "Compliance"
                                  | "Procurement"
                                  | "Other"
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-3 text-sm text-[var(--fg)] outline-none transition-all focus:ring-2 focus:ring-[color:var(--vault-blue)]/35"
                          >
                            <option value="">Select…</option>
                            <option value="GRC">GRC</option>
                            <option value="Security">Security</option>
                            <option value="Compliance">Compliance</option>
                            <option value="Procurement">Procurement/Vendor Mgmt</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className="text-xs font-semibold text-[var(--muted-2)]"
                            htmlFor="lead-formats"
                          >
                            Primary format (optional)
                          </label>
                          <select
                            id="lead-formats"
                            value={primaryFormats}
                            onChange={(e) =>
                              setPrimaryFormats(
                                e.target.value as
                                  | ""
                                  | "SOC 2"
                                  | "ISO 27001"
                                  | "SIG"
                                  | "DDQ"
                                  | "CAIQ"
                                  | "Custom"
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-3 text-sm text-[var(--fg)] outline-none transition-all focus:ring-2 focus:ring-[color:var(--vault-blue)]/35"
                          >
                            <option value="">Select…</option>
                            <option value="SOC 2">SOC 2</option>
                            <option value="ISO 27001">ISO 27001</option>
                            <option value="SIG">SIG</option>
                            <option value="DDQ">DDQ</option>
                            <option value="CAIQ">CAIQ</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="text-xs font-semibold text-[var(--muted-2)]"
                            htmlFor="lead-volume"
                          >
                            Monthly volume
                          </label>
                          <select
                            id="lead-volume"
                            value={monthlyVolume}
                            onChange={(e) =>
                              setMonthlyVolume(
                                e.target.value as "" | "1-5" | "6-20" | "20+"
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-3 text-sm text-[var(--fg)] outline-none transition-all focus:ring-2 focus:ring-[color:var(--vault-blue)]/35"
                          >
                            <option value="">Select…</option>
                            <option value="1-5">1–5</option>
                            <option value="6-20">6–20</option>
                            <option value="20+">20+</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className="text-xs font-semibold text-[var(--muted-2)]"
                            htmlFor="lead-process"
                          >
                            Current process
                          </label>
                          <select
                            id="lead-process"
                            value={currentProcess}
                            onChange={(e) =>
                              setCurrentProcess(
                                e.target.value as
                                  | ""
                                  | "Manual/Spreadsheets"
                                  | "Existing Tool"
                                  | "No Process"
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-3 text-sm text-[var(--fg)] outline-none transition-all focus:ring-2 focus:ring-[color:var(--vault-blue)]/35"
                          >
                            <option value="">Select…</option>
                            <option value="Manual/Spreadsheets">Manual/Spreadsheets</option>
                            <option value="Existing Tool">Existing Tool</option>
                            <option value="No Process">No Process</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {status === "error" && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        Something went wrong — try again.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(59,130,246,0.30)] ring-1 ring-blue-300/30 transition-all hover:brightness-110 disabled:opacity-60"
                    >
                      {status === "submitting" ? "Joining…" : "Join Cohort"}
                      <span className="vault-power" aria-hidden="true" />
                    </button>

                    <p className="text-xs text-[var(--muted-2)]">
                      No spam. We’ll only email you about Founding Member access.
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 ring-1 ring-blue-400/25"
                        initial={{ scale: 0.8, rotate: -6 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        style={{ color: "var(--vault-blue)" }}
                      >
                        <CheckIcon />
                      </motion.div>
                      <div>
                        <div className="text-base font-semibold text-[var(--fg)]">Thank you.</div>
                        <div className="mt-0.5 text-sm text-[var(--muted)]">
                          Thanks! A Vault Specialist will review your volume and reach out regarding your shortlist status.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-5 w-full rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-white/10"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
