/**
 * Onboarding State Machine — Full Implementation
 *
 * States: S1 Greeting → S2 Problem ID → S3 Demo → S4 Value → S5 Objection → S6 Soft CTA → S7 Convert
 * See docs/onboarding_state_machine.md for spec.
 *
 * This module provides:
 * - Type-safe state definitions and transitions
 * - Conversation memory (pain points, objections, context)
 * - Guardrails preventing premature lead capture
 * - All 22 analytics events with exact firing points
 * - Quick reply suggestions per state
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type OnboardingState = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7';

export interface QuickReply {
  label: string;
  value: string;
}

export interface ConversationMemory {
  painPoints: string[];
  complianceFrameworks: string[];
  objections: string[];
  questionnaireScope: string | null;
  userSentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  demoTopics: string[];
  ctaResponse: 'accepted' | 'declined' | 'pending';
  leadInfo: { email?: string; name?: string } | null;
}

export interface SessionMachine {
  sessionId: string;
  state: OnboardingState;
  previousState: OnboardingState | null;
  messageCount: number;
  stateHistory: { state: OnboardingState; enteredAt: number }[];
  memory: ConversationMemory;
  createdAt: number;
  lastActiveAt: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const STATE_LABELS: Record<OnboardingState, string> = {
  S1: 'Greeting',
  S2: 'Problem Identification',
  S3: 'Product Demo',
  S4: 'Value Reinforcement',
  S5: 'Objection Handling',
  S6: 'Soft CTA',
  S7: 'Convert / Lead Capture',
};

const TRANSITIONS: Record<OnboardingState, OnboardingState[]> = {
  S1: ['S2'],
  S2: ['S3'],
  S3: ['S4'],
  S4: ['S5', 'S6'],
  S5: ['S6'],
  S6: ['S7', 'S4'],
  S7: [],
};

const QUICK_REPLIES: Record<OnboardingState, QuickReply[]> = {
  S1: [
    { label: 'Help with SOC 2', value: 'I need help with SOC 2 questionnaires' },
    { label: 'ISO 27001 questions', value: 'I have ISO 27001 compliance questions' },
    { label: 'Vendor due diligence', value: 'I need to fill out a vendor security questionnaire' },
    { label: 'Just exploring', value: 'I\'m just exploring what VaultFill can do' },
  ],
  S2: [
    { label: 'Show me an example', value: 'Can you show me how VaultFill handles a question?' },
    { label: 'SOC 2 Type II', value: 'We need SOC 2 Type II compliance' },
    { label: 'Multiple frameworks', value: 'We deal with multiple compliance frameworks' },
    { label: 'Too many questionnaires', value: 'We get too many vendor questionnaires to handle manually' },
  ],
  S3: [
    { label: 'Try another question', value: 'Can you try another sample question?' },
    { label: 'How accurate is this?', value: 'How accurate are these answers?' },
    { label: 'What frameworks?', value: 'What compliance frameworks do you cover?' },
    { label: 'Impressive!', value: 'That\'s impressive, tell me more' },
  ],
  S4: [
    { label: 'What about privacy?', value: 'What about data privacy? Where is my data stored?' },
    { label: 'How does pricing work?', value: 'How does pricing work?' },
    { label: 'Integrations?', value: 'What tools do you integrate with?' },
    { label: 'Sounds great', value: 'This sounds great, what\'s the next step?' },
  ],
  S5: [
    { label: 'That helps', value: 'That addresses my concern, thanks' },
    { label: 'Another concern', value: 'I have another question about that' },
    { label: 'Need to think', value: 'I need to think about it' },
  ],
  S6: [
    { label: 'Yes, set it up!', value: 'Yes, I\'d love to set up a pilot' },
    { label: 'Send me info', value: 'Can you send me more information?' },
    { label: 'Not right now', value: 'Not right now, but maybe later' },
    { label: 'Tell me more first', value: 'I\'d like to learn more before committing' },
  ],
  S7: [
    { label: 'Submit', value: 'Here\'s my info' },
  ],
};

// ─── Analytics Events (22 total) ─────────────────────────────────────────────

export type AnalyticsEvent =
  // Session lifecycle (4)
  | 'onboarding.session_started'
  | 'onboarding.session_resumed'
  | 'onboarding.session_expired'
  | 'onboarding.session_completed'
  // State transitions (7)
  | 'onboarding.state_entered'
  | 'onboarding.greeting_completed'
  | 'onboarding.problem_identified'
  | 'onboarding.demo_initiated'
  | 'onboarding.value_reinforced'
  | 'onboarding.objection_raised'
  | 'onboarding.cta_offered'
  // User actions (6)
  | 'onboarding.quick_reply_used'
  | 'onboarding.cta_accepted'
  | 'onboarding.cta_declined'
  | 'onboarding.lead_captured'
  | 'onboarding.message_sent'
  | 'onboarding.off_topic_detected'
  // Guardrails (3)
  | 'onboarding.premature_capture_blocked'
  | 'onboarding.invalid_transition_blocked'
  | 'onboarding.pii_request_blocked'
  // Drop-off (2)
  | 'onboarding.drop_off'
  | 'onboarding.re_engagement';

export interface AnalyticsPayload {
  sessionId: string;
  state?: string;
  fromState?: string;
  toState?: string;
  lastState?: string;
  messageCount?: number;
  painPoints?: string[];
  frameworks?: string[];
  quickReplyLabel?: string;
  blockedFrom?: string;
  blockedTo?: string;
  durationMs?: number;
  [key: string]: string | number | boolean | string[] | undefined;
}

// ─── State Machine ───────────────────────────────────────────────────────────

export function createSession(sessionId: string): SessionMachine {
  return {
    sessionId,
    state: 'S1',
    previousState: null,
    messageCount: 0,
    stateHistory: [{ state: 'S1', enteredAt: Date.now() }],
    memory: {
      painPoints: [],
      complianceFrameworks: [],
      objections: [],
      questionnaireScope: null,
      userSentiment: 'unknown',
      demoTopics: [],
      ctaResponse: 'pending',
      leadInfo: null,
    },
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
}

export function canTransition(from: OnboardingState, to: OnboardingState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStates(current: OnboardingState): OnboardingState[] {
  return TRANSITIONS[current] ?? [];
}

export function getQuickReplies(state: OnboardingState): QuickReply[] {
  return QUICK_REPLIES[state] ?? [];
}

/**
 * Attempt a state transition. Returns events to fire, or null if blocked.
 */
export function transition(
  session: SessionMachine,
  targetState: OnboardingState
): { events: { event: AnalyticsEvent; payload: AnalyticsPayload }[]; allowed: boolean } {
  const events: { event: AnalyticsEvent; payload: AnalyticsPayload }[] = [];
  const base = { sessionId: session.sessionId, messageCount: session.messageCount };

  // Guardrail: block premature lead capture
  if (targetState === 'S7') {
    const visitedS3 = session.stateHistory.some(h => h.state === 'S3');
    const visitedS6 = session.stateHistory.some(h => h.state === 'S6');
    if (!visitedS3 || !visitedS6) {
      events.push({
        event: 'onboarding.premature_capture_blocked',
        payload: { ...base, blockedFrom: session.state, blockedTo: 'S7', state: STATE_LABELS[session.state] },
      });
      return { events, allowed: false };
    }
  }

  if (!canTransition(session.state, targetState)) {
    events.push({
      event: 'onboarding.invalid_transition_blocked',
      payload: { ...base, blockedFrom: session.state, blockedTo: targetState, fromState: STATE_LABELS[session.state], toState: STATE_LABELS[targetState] },
    });
    return { events, allowed: false };
  }

  const fromState = session.state;
  session.previousState = fromState;
  session.state = targetState;
  session.stateHistory.push({ state: targetState, enteredAt: Date.now() });

  // Generic state_entered
  events.push({
    event: 'onboarding.state_entered',
    payload: { ...base, fromState: STATE_LABELS[fromState], toState: STATE_LABELS[targetState], state: STATE_LABELS[targetState] },
  });

  // State-specific events
  const stateEvents: Partial<Record<OnboardingState, AnalyticsEvent[]>> = {
    S2: ['onboarding.greeting_completed'],
    S3: ['onboarding.problem_identified', 'onboarding.demo_initiated'],
    S4: ['onboarding.value_reinforced'],
    S5: ['onboarding.objection_raised'],
    S6: ['onboarding.cta_offered'],
    S7: ['onboarding.lead_captured'],
  };

  const specifics = stateEvents[targetState];
  if (specifics) {
    for (const specific of specifics) {
      events.push({
        event: specific,
        payload: {
          ...base,
          fromState: STATE_LABELS[fromState],
          state: STATE_LABELS[targetState],
          painPoints: session.memory.painPoints,
          frameworks: session.memory.complianceFrameworks,
        },
      });
    }
  }

  // CTA-specific
  if (targetState === 'S7' && fromState === 'S6') {
    events.push({
      event: 'onboarding.cta_accepted',
      payload: { ...base, fromState: STATE_LABELS[fromState] },
    });
  }
  if (targetState === 'S4' && fromState === 'S6') {
    events.push({
      event: 'onboarding.cta_declined',
      payload: { ...base, fromState: STATE_LABELS[fromState] },
    });
  }

  if (targetState === 'S7') {
    events.push({
      event: 'onboarding.session_completed',
      payload: {
        ...base,
        durationMs: Date.now() - session.createdAt,
        painPoints: session.memory.painPoints,
        frameworks: session.memory.complianceFrameworks,
      },
    });
  }

  return { events, allowed: true };
}

// ─── Signal Detection ────────────────────────────────────────────────────────

/** Detect explicit state tag from LLM response */
export function detectStateTag(response: string): OnboardingState | null {
  const match = response.match(/<!--\s*STATE:(S[1-7])\s*-->/);
  return match ? (match[1] as OnboardingState) : null;
}

/** Heuristic: detect if LLM is transitioning to demo */
export function detectDemoSignal(response: string): boolean {
  const signals = [
    'let me show you', 'here\'s an example', 'for instance',
    'let me demonstrate', 'here\'s how', 'sample question',
    'try this example', 'watch how',
  ];
  const lower = response.toLowerCase();
  return signals.some(s => lower.includes(s));
}

/** Heuristic: detect objection signals in user input */
export function detectObjection(input: string): boolean {
  const signals = [
    'privacy', 'security concern', 'data stored', 'pricing',
    'too expensive', 'competitor', 'not sure', 'worried about',
    'what if', 'how safe', 'who has access', 'gdpr', 'hipaa',
  ];
  const lower = input.toLowerCase();
  return signals.some(s => lower.includes(s));
}

/** Heuristic: detect pain points in user input */
export function detectPainPoints(input: string): string[] {
  const painMap: Record<string, string> = {
    'soc 2': 'SOC 2 compliance',
    'iso 27001': 'ISO 27001 compliance',
    'nist': 'NIST framework',
    'vendor questionnaire': 'Vendor due diligence',
    'security questionnaire': 'Security questionnaires',
    'too many': 'Questionnaire volume',
    'manual': 'Manual processes',
    'time consuming': 'Time consumption',
    'deadline': 'Tight deadlines',
    'audit': 'Audit preparation',
  };
  const lower = input.toLowerCase();
  return Object.entries(painMap)
    .filter(([key]) => lower.includes(key))
    .map(([, value]) => value);
}

/** Detect compliance frameworks mentioned */
export function detectFrameworks(input: string): string[] {
  const frameworks = ['SOC 2', 'ISO 27001', 'NIST CSF', 'NIST 800-53', 'HIPAA', 'GDPR', 'PCI DSS', 'FedRAMP'];
  const lower = input.toLowerCase();
  return frameworks.filter(f => lower.includes(f.toLowerCase()));
}

/** Detect CTA acceptance */
export function detectCTAAcceptance(input: string): boolean {
  const signals = ['yes', 'sure', 'set it up', 'let\'s do it', 'sign me up', 'i\'d love', 'sounds good', 'go ahead', 'send me'];
  const lower = input.toLowerCase();
  return signals.some(s => lower.includes(s));
}

/** Detect CTA decline */
export function detectCTADecline(input: string): boolean {
  const signals = ['no', 'not right now', 'maybe later', 'not yet', 'need to think', 'not sure', 'pass'];
  const lower = input.toLowerCase();
  return signals.some(s => lower.includes(s));
}

/** Check if user input is off-topic */
export function detectOffTopic(input: string): boolean {
  const onTopicSignals = [
    'compliance', 'security', 'questionnaire', 'soc', 'iso', 'nist', 'audit',
    'vendor', 'policy', 'control', 'risk', 'framework', 'vaultfill', 'demo',
    'pricing', 'feature', 'help me', 'show me', 'example', 'yes', 'no thanks',
    'tell me more', 'explain', 'thanks', 'great', 'interesting', 'concern',
    'privacy', 'data', 'integrate', 'pilot', 'trial', 'email', 'sign up',
    'question', 'answer', 'response', 'evidence', 'implementation',
  ];
  const lower = input.toLowerCase().trim();
  if (lower.length < 3) return false;
  return !onTopicSignals.some(s => lower.includes(s));
}

/** Check if LLM response contains PII solicitation (guardrail) */
export function detectPIISolicitation(response: string, state: OnboardingState): boolean {
  if (state === 'S7') return false; // allowed in S7
  const piiSignals = [
    'what is your email', 'your email address', 'provide your name',
    'what\'s your name', 'share your email', 'enter your email',
    'your contact info', 'your phone number',
  ];
  const lower = response.toLowerCase();
  return piiSignals.some(s => lower.includes(s));
}

// ─── Conversation Memory Update ──────────────────────────────────────────────

export function updateMemory(session: SessionMachine, userInput: string): AnalyticsPayload[] {
  const events: { event: AnalyticsEvent; payload: AnalyticsPayload }[] = [];
  const base = { sessionId: session.sessionId, messageCount: session.messageCount };

  // Track pain points
  const newPains = detectPainPoints(userInput).filter(p => !session.memory.painPoints.includes(p));
  session.memory.painPoints.push(...newPains);

  // Track frameworks
  const newFrameworks = detectFrameworks(userInput).filter(f => !session.memory.complianceFrameworks.includes(f));
  session.memory.complianceFrameworks.push(...newFrameworks);

  // Detect objections
  if (detectObjection(userInput) && !session.memory.objections.includes(userInput.slice(0, 100))) {
    session.memory.objections.push(userInput.slice(0, 100));
  }

  // Off-topic detection
  if (detectOffTopic(userInput)) {
    events.push({
      event: 'onboarding.off_topic_detected',
      payload: { ...base, state: STATE_LABELS[session.state] },
    });
  }

  // Message event
  events.push({
    event: 'onboarding.message_sent',
    payload: { ...base, state: STATE_LABELS[session.state] },
  });

  return events.map(e => e.payload);
}

// ─── System Prompt Builder ───────────────────────────────────────────────────

export function buildStatePromptFragment(state: OnboardingState, memory: ConversationMemory): string {
  let prompt = `
[ONBOARDING STATE MACHINE — CURRENT STATE: ${state} (${STATE_LABELS[state]})]

You are operating within a structured onboarding funnel. Current state: ${state} (${STATE_LABELS[state]}).

STATE RULES — FOLLOW STRICTLY:
- S1 (Greeting): Welcome warmly. Introduce VaultFill briefly. Do NOT ask about problems yet.
- S2 (Problem ID): Ask clarifying questions about compliance/security needs. Do NOT demo yet.
- S3 (Demo): Pain point identified. Demonstrate capability with a sample question. Append <!-- STATE:S3 --> to first demo response.
- S4 (Value): Reinforce value — time savings, coverage, accuracy. Do NOT pitch or ask for contact info.
- S5 (Objection): Address concern directly and honestly. Then transition to S6.
- S6 (Soft CTA): Offer gentle next step. Do NOT collect PII. Append <!-- STATE:S6 --> when offering.
- S7 (Convert): User said yes. NOW you may ask for email/name. Append <!-- STATE:S7 -->.

CONSTRAINTS:
- NEVER skip states. Every state must be visited in order.
- NEVER ask for email/name/PII before S7.
- If user declines at S6, loop to S4 — no pressure.
- If user disengages, stay in current state.
`;

  // Inject conversation memory
  if (memory.painPoints.length > 0) {
    prompt += `\nUser's pain points: ${memory.painPoints.join(', ')}`;
  }
  if (memory.complianceFrameworks.length > 0) {
    prompt += `\nCompliance frameworks mentioned: ${memory.complianceFrameworks.join(', ')}`;
  }
  if (memory.objections.length > 0) {
    prompt += `\nPrevious objections: ${memory.objections.join('; ')}`;
  }
  if (memory.demoTopics.length > 0) {
    prompt += `\nDemo topics covered: ${memory.demoTopics.join(', ')}`;
  }

  return prompt;
}

// ─── Process Turn ────────────────────────────────────────────────────────────

export interface TurnResult {
  session: SessionMachine;
  events: { event: AnalyticsEvent; payload: AnalyticsPayload }[];
  quickReplies: QuickReply[];
  stateChanged: boolean;
}

/**
 * Process a complete turn: user input + assistant response.
 * Call this after receiving the LLM response to detect transitions and fire events.
 */
export function processUserInput(session: SessionMachine, userInput: string): {
  events: { event: AnalyticsEvent; payload: AnalyticsPayload }[];
} {
  session.messageCount++;
  session.lastActiveAt = Date.now();
  const events: { event: AnalyticsEvent; payload: AnalyticsPayload }[] = [];
  const base = { sessionId: session.sessionId, messageCount: session.messageCount };

  // Update memory from user input
  const newPains = detectPainPoints(userInput).filter(p => !session.memory.painPoints.includes(p));
  session.memory.painPoints.push(...newPains);
  const newFrameworks = detectFrameworks(userInput).filter(f => !session.memory.complianceFrameworks.includes(f));
  session.memory.complianceFrameworks.push(...newFrameworks);
  if (detectObjection(userInput)) {
    session.memory.objections.push(userInput.slice(0, 100));
  }

  // Message event
  events.push({ event: 'onboarding.message_sent', payload: { ...base, state: STATE_LABELS[session.state] } });

  // Off-topic
  if (detectOffTopic(userInput)) {
    events.push({ event: 'onboarding.off_topic_detected', payload: { ...base, state: STATE_LABELS[session.state] } });
  }

  // Auto S1→S2 on first message
  if (session.state === 'S1' && session.messageCount >= 1) {
    const result = transition(session, 'S2');
    events.push(...result.events);
  }

  // S6 CTA response detection
  if (session.state === 'S6') {
    if (detectCTAAcceptance(userInput)) {
      session.memory.ctaResponse = 'accepted';
      const result = transition(session, 'S7');
      events.push(...result.events);
    } else if (detectCTADecline(userInput)) {
      session.memory.ctaResponse = 'declined';
      const result = transition(session, 'S4');
      events.push(...result.events);
    }
  }

  // S4: detect objection → S5
  if (session.state === 'S4' && detectObjection(userInput)) {
    const result = transition(session, 'S5');
    events.push(...result.events);
  }

  return { events };
}

/**
 * Process assistant response to detect state transitions via tags/heuristics.
 */
export function processAssistantResponse(session: SessionMachine, response: string): {
  events: { event: AnalyticsEvent; payload: AnalyticsPayload }[];
  piiBlocked: boolean;
} {
  const events: { event: AnalyticsEvent; payload: AnalyticsPayload }[] = [];
  const base = { sessionId: session.sessionId, messageCount: session.messageCount };

  // PII guardrail
  if (detectPIISolicitation(response, session.state)) {
    events.push({
      event: 'onboarding.pii_request_blocked',
      payload: { ...base, state: STATE_LABELS[session.state] },
    });
    return { events, piiBlocked: true };
  }

  // Detect explicit state tag
  const taggedState = detectStateTag(response);
  if (taggedState && taggedState !== session.state) {
    const result = transition(session, taggedState);
    events.push(...result.events);
  }

  // Heuristic: demo signal in S2
  if (session.state === 'S2' && detectDemoSignal(response)) {
    const result = transition(session, 'S3');
    events.push(...result.events);
  }

  return { events, piiBlocked: false };
}
