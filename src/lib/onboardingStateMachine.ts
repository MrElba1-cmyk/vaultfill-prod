/**
 * Onboarding State Machine
 * 
 * States: S1 Greeting → S2 Problem ID → S3 Demo → S4 Value → S5 Objection → S6 Soft CTA → S7 Convert
 * See docs/onboarding_state_machine.md for full spec.
 *
 * v2 — flexible transitions, user-input detection, pricing handling, anti-loop guards.
 */

export type OnboardingState = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8';

export const STATE_LABELS: Record<OnboardingState, string> = {
  S1: 'Greeting',
  S2: 'Problem Identification',
  S3: 'Product Demo',
  S4: 'Value Reinforcement',
  S5: 'Objection Handling',
  S6: 'Soft CTA',
  S7: 'Convert / Lead Capture',
  S8: 'Payment Gate',
};

// ---------------------------------------------------------------------------
// Transitions — much more flexible now. The bot should DELIVER VALUE, not
// force users through a rigid funnel.
// ---------------------------------------------------------------------------
const TRANSITIONS: Record<OnboardingState, OnboardingState[]> = {
  S1: ['S2'],
  S2: ['S3', 'S4', 'S5', 'S6'],   // Can jump ahead when user gives clear signals
  S3: ['S4', 'S5', 'S6'],          // Demo can lead to value, objection, or CTA
  S4: ['S5', 'S6'],
  S5: ['S4', 'S6'],                // Objection can loop back to value or advance
  S6: ['S7', 'S4'],                // Soft CTA can convert or loop back
  S7: ['S8'],                       // Lead captured → payment gate
  S8: ['S4'],                       // Decline loops back to value; otherwise terminal
};

export function canTransition(from: OnboardingState, to: OnboardingState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStates(current: OnboardingState): OnboardingState[] {
  return TRANSITIONS[current] ?? [];
}

// ---------------------------------------------------------------------------
// Detect state from LLM response (HTML comment tags)
// ---------------------------------------------------------------------------
export function detectStateFromResponse(response: string): OnboardingState | null {
  const match = response.match(/<!--\s*STATE:(S[1-8])\s*-->/);
  return match ? (match[1] as OnboardingState) : null;
}

// ---------------------------------------------------------------------------
// Detect state advancement signals from USER INPUT
// ---------------------------------------------------------------------------
const FRAMEWORK_KEYWORDS = [
  'soc 2', 'soc2', 'soc-2',
  'iso 27001', 'iso27001', 'iso-27001',
  'nist', 'nist csf', 'nist 800-53', 'nist 800-171',
  'gdpr', 'hipaa', 'pci dss', 'pci-dss', 'fedramp', 'cmmc',
  'ccpa', 'sox', 'hitrust', 'cis controls',
];

const PRICING_KEYWORDS = [
  'how much', 'pricing', 'price', 'cost', 'costs',
  'how much does', 'what does it cost', 'subscription',
  'free trial', 'free tier', 'enterprise plan', 'plans',
  'budget', 'affordable', 'expensive', 'pay',
];

const COMPLIANCE_TOPIC_KEYWORDS = [
  'encryption', 'mfa', 'multi-factor', 'access control',
  'audit', 'logging', 'monitoring', 'backup', 'disaster recovery',
  'incident response', 'vulnerability', 'penetration test',
  'data retention', 'data classification', 'vendor management',
  'risk assessment', 'security policy', 'password',
  'single sign-on', 'sso', 'rbac', 'least privilege',
];

export interface UserInputSignal {
  /** Suggested next state based on user input */
  suggestedState: OnboardingState | null;
  /** Whether a framework was explicitly named */
  frameworkMentioned: string | null;
  /** Whether pricing/cost was asked about */
  pricingAsked: boolean;
  /** Whether a specific compliance topic was mentioned */
  complianceTopicMentioned: boolean;
}

export function detectStateFromUserInput(
  userMessage: string,
  currentState: OnboardingState,
): UserInputSignal {
  const lower = userMessage.toLowerCase();

  let frameworkMentioned: string | null = null;
  for (const kw of FRAMEWORK_KEYWORDS) {
    if (lower.includes(kw)) {
      frameworkMentioned = kw;
      break;
    }
  }

  const pricingAsked = PRICING_KEYWORDS.some(kw => lower.includes(kw));
  const complianceTopicMentioned = COMPLIANCE_TOPIC_KEYWORDS.some(kw => lower.includes(kw));

  let suggestedState: OnboardingState | null = null;

  // Pricing → jump to S5 (Objection Handling) or S6 (Soft CTA)
  if (pricingAsked) {
    if (currentState === 'S2' || currentState === 'S3' || currentState === 'S4') {
      suggestedState = 'S5';
    } else if (currentState === 'S5') {
      suggestedState = 'S6';
    }
  }

  // Framework name mentioned while in S2 → advance to S3 (Demo) immediately
  if (frameworkMentioned && currentState === 'S2') {
    suggestedState = 'S3';
  }

  // Specific compliance topic while in S2 → advance to S3
  if (complianceTopicMentioned && currentState === 'S2') {
    suggestedState = 'S3';
  }

  return {
    suggestedState,
    frameworkMentioned,
    pricingAsked,
    complianceTopicMentioned,
  };
}

// ---------------------------------------------------------------------------
// System prompt fragment — rewritten to DELIVER VALUE, not interrogate.
// ---------------------------------------------------------------------------
export function buildStatePromptFragment(
  state: OnboardingState,
  extra?: {
    s2ExchangeCount?: number;
    frameworkMentioned?: string | null;
    pricingAsked?: boolean;
  },
): string {
  const framework = extra?.frameworkMentioned ?? null;
  const pricingAsked = extra?.pricingAsked ?? false;

  let fragment = `
[ONBOARDING STATE MACHINE — CURRENT STATE: ${state} (${STATE_LABELS[state]})]

You are operating within a structured onboarding funnel. Current state: ${state} (${STATE_LABELS[state]}).

CORE PRINCIPLE: Your job is to DELIVER VALUE quickly. Do NOT interrogate the prospect. Answer questions with substance. When a user provides information, ACKNOWLEDGE it and ACT on it — never ask for the same info twice.

STATE GUIDELINES:
- S1 (Greeting): Welcome the user warmly. Let them speak first.
- S2 (Problem ID): The user has engaged. If they mention a specific framework or topic, IMMEDIATELY provide a substantive answer and advance to S3. Ask at most ONE clarifying question. Never ask the same question twice.
- S3 (Demo): Demonstrate VaultFill's capability by giving real, useful answers. Show how VaultFill helps with their specific needs.
- S4 (Value): Reinforce value — time savings, coverage, accuracy. Do NOT pitch or ask for contact info yet.
- S5 (Objection Handling): User raised a concern or asked about pricing. Address it directly and honestly. For pricing: "VaultFill offers lean startup pricing — we'll have specific plans available soon. Want to join the early access list?" Then transition toward S6.
- S6 (Soft CTA): Offer a gentle next step — "Want to unlock the full report?". Do NOT collect PII yet. Append <!-- STATE:S6 --> when offering.
- S7 (Convert): User said yes. NOW you may ask for email/name. Append <!-- STATE:S7 -->.
- S8 (Payment Gate): Lead captured. Offer the full analysis report behind a payment gate. Say: "Your personalized compliance report is ready — click **Unlock Full Report** below to access it." Append <!-- STATE:S8 -->. The UI will render the checkout button.

CRITICAL RULES:
- NEVER ask the same clarifying question twice. If the user already answered, move forward.
- NEVER ask for email, name, or personal info before S7.
- When the user names a framework (SOC 2, ISO 27001, GDPR, HIPAA, etc.) → treat the problem as identified and give a substantive demo answer immediately.
- When the user asks about pricing/cost → acknowledge it, give a positioning answer about lean startup pricing with early access, then continue helping.
- When the user asks a technical question → answer it with substance (suggested response, evidence examples, implementation notes).
- Always prefer GIVING an answer over ASKING another question.
`;

  // Extra context based on signals
  if (state === 'S3' && framework) {
    fragment += `\nThe user has identified their framework as: ${framework.toUpperCase()}. Give a demo-quality answer showing VaultFill's expertise in this framework. Do NOT ask what framework they need.\n`;
  }

  if (pricingAsked) {
    fragment += `\nThe user asked about pricing. This is a BUYING SIGNAL. Respond with: VaultFill offers lean startup pricing — specific plans will be available soon. Offer to add them to the early access list. Then continue helping with their technical questions.\n`;
  }

  // Anti-loop for S2
  if (state === 'S2' && (extra?.s2ExchangeCount ?? 0) >= 2) {
    fragment += `\nYou have been in S2 for ${extra?.s2ExchangeCount} exchanges. STOP asking clarifying questions. Advance to S3 by providing a substantive answer based on what you know so far.\n`;
  }

  return fragment;
}
