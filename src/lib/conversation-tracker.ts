/**
 * Conversation Tracker — prevents the bot from repeating questions
 * or asking for information the user already provided.
 *
 * Tracks:
 * - Frameworks the user has mentioned
 * - Topics/controls discussed
 * - Pain points identified
 * - Questions the bot has already asked
 * - Information the user has confirmed/denied
 */

export interface ConversationMemory {
  /** Frameworks explicitly mentioned by the user */
  mentionedFrameworks: Set<string>;
  /** Control topics discussed */
  discussedTopics: Set<string>;
  /** Pain points or needs identified */
  identifiedNeeds: Set<string>;
  /** Questions the bot has asked (normalized) */
  askedQuestions: Set<string>;
  /** Key facts the user has provided */
  providedFacts: Map<string, string>;
  /** Whether pricing has been discussed */
  pricingDiscussed: boolean;
  /** Whether the user has been asked about their role/company */
  roleAsked: boolean;
  /** Whether the user has been asked about their framework needs */
  frameworkAsked: boolean;
  /** Whether the user has been asked about specific pain points */
  painPointsAsked: boolean;
  /** Total exchanges */
  exchangeCount: number;
}

// In-memory store per session
const memoryStore = new Map<string, ConversationMemory>();

export function getConversationMemory(sessionId: string): ConversationMemory {
  if (!memoryStore.has(sessionId)) {
    memoryStore.set(sessionId, {
      mentionedFrameworks: new Set(),
      discussedTopics: new Set(),
      identifiedNeeds: new Set(),
      askedQuestions: new Set(),
      providedFacts: new Map(),
      pricingDiscussed: false,
      roleAsked: false,
      frameworkAsked: false,
      painPointsAsked: false,
      exchangeCount: 0,
    });
  }
  return memoryStore.get(sessionId)!;
}

/**
 * Update conversation memory from the user's latest message
 * and any detected frameworks/topics.
 */
export function updateFromUserMessage(
  sessionId: string,
  userMessage: string,
  detectedLabels: string[],
): void {
  const mem = getConversationMemory(sessionId);
  const lower = userMessage.toLowerCase();
  mem.exchangeCount++;

  // Track mentioned frameworks
  for (const label of detectedLabels) {
    if (['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA', 'NIST', 'PCI DSS', 'FedRAMP', 'CMMC'].includes(label)) {
      mem.mentionedFrameworks.add(label);
    } else if (label === 'Pricing / Buying Signal') {
      mem.pricingDiscussed = true;
    } else {
      mem.discussedTopics.add(label);
    }
  }

  // Detect pain points from natural language
  const painPointPatterns: [RegExp, string][] = [
    [/tak(es?|ing) (too long|forever|hours|days|weeks)/i, 'time_pressure'],
    [/manual(ly)?/i, 'manual_process'],
    [/(audit|assessment|questionnaire) (coming up|deadline|due)/i, 'deadline_pressure'],
    [/(overwhelm|don'?t know where to start|confused)/i, 'overwhelmed'],
    [/(team is small|one person|solo|understaffed)/i, 'small_team'],
    [/(repeat|same questions|duplicate)/i, 'repetitive_work'],
    [/(customer|client|prospect) (asking|requesting|wants)/i, 'customer_demand'],
  ];

  for (const [pattern, need] of painPointPatterns) {
    if (pattern.test(lower)) {
      mem.identifiedNeeds.add(need);
    }
  }

  // Track company size hints
  if (/\b(startup|seed|series [a-c]|early stage|small company|smb)\b/i.test(lower)) {
    mem.providedFacts.set('company_stage', 'startup/small');
  }
  if (/\b(enterprise|large|fortune|global|multinational)\b/i.test(lower)) {
    mem.providedFacts.set('company_stage', 'enterprise');
  }

  // Track role hints
  if (/\b(ciso|security (lead|manager|director|engineer)|grc|compliance (manager|officer|lead|analyst))\b/i.test(lower)) {
    const match = lower.match(/\b(ciso|security (?:lead|manager|director|engineer)|grc|compliance (?:manager|officer|lead|analyst))\b/i);
    if (match) {
      mem.providedFacts.set('role', match[0]);
    }
  }
}

/**
 * Update conversation memory from the bot's response.
 * Tracks what questions the bot asked so it doesn't repeat them.
 */
export function updateFromBotResponse(sessionId: string, botResponse: string): void {
  const mem = getConversationMemory(sessionId);
  const lower = botResponse.toLowerCase();

  // Detect questions the bot asked
  const questionPatterns: [RegExp, string][] = [
    [/what (framework|standard|compliance).*(?:looking|working|need|prepar)/i, 'framework_question'],
    [/which (framework|standard|certification)/i, 'framework_question'],
    [/what('s| is) your (role|title|position)/i, 'role_question'],
    [/what (industry|sector|type of (company|business|organization))/i, 'industry_question'],
    [/what('s| is) your (biggest|main|primary) (challenge|pain point|concern)/i, 'pain_point_question'],
    [/how (big|large|many) is your (team|company|organization)/i, 'team_size_question'],
    [/what (specific|particular) (control|requirement|area)/i, 'specific_control_question'],
    [/have you (started|begun|worked on)/i, 'progress_question'],
    [/are you (currently|already|in the process)/i, 'progress_question'],
  ];

  for (const [pattern, qType] of questionPatterns) {
    if (pattern.test(lower)) {
      mem.askedQuestions.add(qType);
    }
  }

  // Track specific categories asked about
  if (/what (framework|standard)/i.test(lower)) {
    mem.frameworkAsked = true;
  }
  if (/what('s| is) your (role|title)/i.test(lower)) {
    mem.roleAsked = true;
  }
  if (/what('s| is).*?(challenge|pain|concern|struggle)/i.test(lower)) {
    mem.painPointsAsked = true;
  }
}

/**
 * Build a "do not ask" instruction for the system prompt based on
 * what the user has already told us and what we've already asked.
 */
export function buildNoRepeatInstructions(sessionId: string): string {
  const mem = getConversationMemory(sessionId);
  const instructions: string[] = [];

  if (mem.mentionedFrameworks.size > 0) {
    const frameworks = Array.from(mem.mentionedFrameworks).join(', ');
    instructions.push(
      `The user has ALREADY identified their framework(s): ${frameworks}. Do NOT ask "what framework are you working with?" or similar. Proceed with those frameworks.`
    );
  }

  if (mem.discussedTopics.size > 0) {
    const topics = Array.from(mem.discussedTopics).join(', ');
    instructions.push(
      `Topics already discussed: ${topics}. Build on these — don't ask about them as if new.`
    );
  }

  if (mem.identifiedNeeds.size > 0) {
    const needs = Array.from(mem.identifiedNeeds).join(', ');
    instructions.push(
      `User's identified needs/pain points: ${needs}. Reference these when relevant, don't re-ask.`
    );
  }

  if (mem.pricingDiscussed) {
    instructions.push(
      `Pricing has ALREADY been discussed. Don't re-introduce pricing unless the user asks again.`
    );
  }

  if (mem.providedFacts.size > 0) {
    const facts = Array.from(mem.providedFacts.entries())
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    instructions.push(`Known facts about this user: ${facts}. Don't ask for this info again.`);
  }

  if (mem.askedQuestions.size > 0) {
    const asked = Array.from(mem.askedQuestions).join(', ');
    instructions.push(
      `Questions already asked by you: ${asked}. NEVER repeat these questions.`
    );
  }

  if (instructions.length === 0) return '';

  return `\n[CONVERSATION MEMORY — DO NOT REPEAT]\n${instructions.join('\n')}\n`;
}

/**
 * Clean up session memory (called on session expiry).
 */
export function clearConversationMemory(sessionId: string): void {
  memoryStore.delete(sessionId);
}
