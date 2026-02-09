/**
 * Onboarding State Machine
 * 
 * States: S1 Greeting → S2 Problem ID → S3 Demo → S4 Value → S5 Objection → S6 Soft CTA → S7 Convert
 * See docs/onboarding_state_machine.md for full spec.
 */

export type OnboardingState = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';

export const STATE_LABELS: Record<OnboardingState, string> = {
  S1: 'Greeting',
  S2: 'Problem Identification',
  S3: 'Product Demo',
  S4: 'Value Reinforcement',
  S5: 'Objection Handling',
  S6: 'Soft CTA',
  S7: 'Convert / Lead Capture',
};

// Valid transitions: from → allowed next states
const TRANSITIONS: Record<OnboardingState, OnboardingState[]> = {
  S1: ['S2'],
  S2: ['S3'],
  S3: ['S4'],
  S4: ['S5', 'S6'],
  S5: ['S6'],
  S6: ['S7', 'S4'], // S4 loop-back if user declines
  S7: [],            // terminal
};

export function canTransition(from: OnboardingState, to: OnboardingState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStates(current: OnboardingState): OnboardingState[] {
  return TRANSITIONS[current] ?? [];
}

/**
 * Detect what state the conversation should advance to based on signals
 * from the assistant's latest response. The API route tags responses with
 * a JSON metadata line: <!-- STATE:S3 -->
 */
export function detectStateFromResponse(response: string): OnboardingState | null {
  const match = response.match(/<!--\s*STATE:(S[1-7])\s*-->/);
  return match ? (match[1] as OnboardingState) : null;
}

/**
 * Build state context string to inject into the system prompt so the LLM
 * knows the current onboarding phase.
 */
export function buildStatePromptFragment(state: OnboardingState): string {
  return `
[ONBOARDING STATE MACHINE — CURRENT STATE: ${state} (${STATE_LABELS[state]})]

You are operating within a structured onboarding funnel. The user is currently in state ${state} (${STATE_LABELS[state]}).

STATE RULES — FOLLOW STRICTLY:
- S1 (Greeting): Welcome the user warmly. Do NOT ask about their problems yet — let them speak first.
- S2 (Problem ID): The user has engaged. Ask clarifying questions about their compliance/security needs. Do NOT demo yet.
- S3 (Demo): The user's pain point is identified. Now demonstrate VaultFill's capability by answering a sample question or walking through features. Append <!-- STATE:S3 --> to your first demo response.
- S4 (Value): Demo complete. Reinforce the value — time savings, coverage breadth, accuracy. Do NOT pitch or ask for contact info.
- S5 (Objection): User raised a concern. Address it directly and honestly. Then transition to S6.
- S6 (Soft CTA): Offer a gentle next step: "Want me to set up a quick pilot?" or "I can send you a summary." Do NOT collect PII yet. Append <!-- STATE:S6 --> when offering.
- S7 (Convert): The user explicitly said yes to S6's offer. NOW and ONLY NOW you may ask for their email/name to set up a demo/trial. Append <!-- STATE:S7 --> when capturing.

CONSTRAINTS:
- NEVER skip from S1/S2 directly to S7. Every state must be visited in order.
- NEVER ask for email, name, or personal information before reaching S7.
- If the user declines at S6, loop back to S4 (more value) — do not pressure.
- If the user seems disengaged, do not chase. Stay in current state.
- Valid transitions: S1→S2→S3→S4→S5|S6→S7. S6 can loop to S4.
`;
}
