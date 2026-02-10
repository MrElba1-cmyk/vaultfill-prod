/**
 * brain.ts — 3-Layer Brain Flow for VaultFill's Shield Bot
 *
 * Layer 1: Context Check — if last assistant message requested data, treat input as DATA
 * Layer 2: Intent Classifier — Class A (admin) vs Class B (security/technical)
 * Layer 3: Soft Fallback — non-hallucinatory fallback when vault lacks coverage
 *
 * @module brain
 */

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 1: CONTEXT CHECK — Data Intercept
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fields we look for in the last assistant message.
 * If the assistant asked for any of these, the next user reply is DATA.
 */
const DATA_REQUEST_PATTERNS: { field: string; patterns: RegExp[] }[] = [
  {
    field: 'email',
    patterns: [
      /\b(your|an?|drop\s+(your|an?)?|share\s+(your)?|provide\s+(your)?|enter\s+(your)?|what('?s|\s+is)\s+your)\s*e-?mail\b/i,
      /\be-?mail\s*(address)?\s*(so|and|to)\b/i,
      /\bdrop\b.*\be-?mail\b/i,
    ],
  },
  {
    field: 'company',
    patterns: [
      /\b(your|the)\s+(company|organization|org)\s*(name)?\b/i,
      /\bcompany\s*(name)?\s*(so|and|to)\b/i,
      /\bwhat\s+(company|organization|org)\b/i,
      /\bwhich\s+(company|organization|org)\b/i,
    ],
  },
  {
    field: 'name',
    patterns: [
      /\b(your|full)\s+name\b/i,
      /\bwhat('?s|\s+is)\s+your\s+name\b/i,
    ],
  },
  {
    field: 'role',
    patterns: [
      /\b(your|what('?s|\s+is)\s+your)\s+(role|title|position)\b/i,
    ],
  },
  {
    field: 'team_size',
    patterns: [
      /\bhow\s+(big|large|many)\s+(is\s+)?(your\s+)?(team|company|org)\b/i,
    ],
  },
];

export interface ContextCheckResult {
  /** True when the last assistant message was asking for data */
  isDataExpected: boolean;
  /** Which field(s) the assistant was asking about */
  expectedFields: string[];
}

/**
 * Layer 1: Inspect the last assistant message.
 * If it requested data (email, company, name, etc.), the user's reply is DATA
 * — skip RAG, skip security-clearance fallback.
 */
export function contextCheck(
  messages: Array<{ role: string; content: string }>,
): ContextCheckResult {
  // Find the last assistant message
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  if (!lastAssistant) {
    return { isDataExpected: false, expectedFields: [] };
  }

  const text = lastAssistant.content;
  const expectedFields: string[] = [];

  for (const { field, patterns } of DATA_REQUEST_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        expectedFields.push(field);
        break; // one match per field is enough
      }
    }
  }

  return {
    isDataExpected: expectedFields.length > 0,
    expectedFields,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 2: INTENT CLASSIFIER — Class A vs Class B
// ═══════════════════════════════════════════════════════════════════════════

export type IntentClass = 'A' | 'B';

export type IntentSubtype =
  | 'greeting'
  | 'signup_pricing'
  | 'email_capture'
  | 'farewell'
  | 'thanks'
  | 'affirmative'
  | 'meta_product'       // "what is VaultFill", "how does it work"
  | 'security_technical'; // anything that should hit RAG

export interface IntentResult {
  intentClass: IntentClass;
  subtype: IntentSubtype;
  confidence: number; // 0-1, heuristic
}

// Class A patterns — admin, greeting, signup, emails
const CLASS_A_RULES: { subtype: IntentSubtype; pattern: RegExp; confidence: number }[] = [
  // Greetings
  {
    subtype: 'greeting',
    pattern:
      /^(hi|hello|hey|howdy|good\s+(morning|afternoon|evening)|what'?s\s+up|yo|sup|hola)\b/i,
    confidence: 0.95,
  },
  // Farewell
  {
    subtype: 'farewell',
    pattern: /^(bye|goodbye|see\s+you|later|take\s+care|have\s+a\s+good)\b/i,
    confidence: 0.95,
  },
  // Thanks
  {
    subtype: 'thanks',
    pattern: /^(thanks|thank\s+you|thx|ty|appreciate\s+it|cheers)\b/i,
    confidence: 0.9,
  },
  // Affirmative / simple acknowledgement
  {
    subtype: 'affirmative',
    pattern: /^(ok(ay)?|sure|yes|yep|yeah|yup|got\s+it|sounds\s+good|perfect|great|awesome|nice|cool|alright)\s*[.!]?$/i,
    confidence: 0.9,
  },
  // Signup / pricing / conversion
  {
    subtype: 'signup_pricing',
    pattern:
      /\b(sign\s*up|signup|get\s+started|early\s+access|book\s+(a\s+)?demo|schedule\s+(a\s+)?demo|talk\s+to\s+sales|contact\s+(sales|team|us)|pricing|buy|purchase|subscribe|free\s+trial|start\s+(a\s+)?trial|join|register|onboard|want\s+to\s+(try|use|start)|how\s+much|what('?s|\s+does\s+it)\s+cost)\b/i,
    confidence: 0.9,
  },
  // Email capture signals (user proactively offering info)
  {
    subtype: 'email_capture',
    pattern:
      /\b(my\s+email\s+is|here'?s?\s+my\s+email|reach\s+me\s+at|contact\s+me\s+at|you\s+can\s+(reach|email|contact)\s+me)\b/i,
    confidence: 0.95,
  },
  // Looks like an email address
  {
    subtype: 'email_capture',
    pattern: /[\w.+-]+@[\w-]+\.[\w.]+/,
    confidence: 0.95,
  },
  // Meta-product questions (what is VaultFill, how does it work)
  {
    subtype: 'meta_product',
    pattern:
      /\b(what\s+is\s+vaultfill|how\s+does\s+(vaultfill|it|this|the\s+(bot|tool|product))\s+work|tell\s+me\s+about\s+vaultfill|what\s+do(es)?\s+(vaultfill|you)\s+do|features|capabilities)\b/i,
    confidence: 0.85,
  },
];

/**
 * Layer 2: Classify user intent.
 *
 * Class A (admin): greetings, signup/pricing, email capture, meta-product
 *   → routes to static scripts or lightweight LLM (no RAG needed)
 *
 * Class B (security/technical): compliance questions, framework queries
 *   → routes to RAG engine
 */
export function classifyIntent(query: string): IntentResult {
  const trimmed = query.trim();

  // Try Class A rules in order (first match wins)
  for (const rule of CLASS_A_RULES) {
    if (rule.pattern.test(trimmed)) {
      return {
        intentClass: 'A',
        subtype: rule.subtype,
        confidence: rule.confidence,
      };
    }
  }

  // Default: Class B (security/technical → RAG)
  return {
    intentClass: 'B',
    subtype: 'security_technical',
    confidence: 0.7,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER 3: SOFT FALLBACK — Non-hallucinatory fallback for Class B
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a soft fallback response when the vault lacks coverage for a Class B query.
 *
 * Strategy:
 * 1. Acknowledge the gap honestly
 * 2. Offer to accept an uploaded policy document
 * 3. Ask a clarifying question to narrow scope
 * 4. Provide GENERAL best-practices guidance, explicitly labeled as such
 *
 * @param query - The user's original question
 * @param topicHint - Optional detected framework/topic label for context
 */
export function buildSoftFallback(
  query: string,
  topicHint?: string,
): string {
  const topicLabel = topicHint ? ` about **${topicHint}**` : '';

  // Pick a contextual clarifying question based on query keywords
  const clarifyingQ = pickClarifyingQuestion(query);

  return [
    `I don't have a specific VaultFill-sourced policy${topicLabel} in my knowledge vault yet — and I won't make one up.`,
    ``,
    `Here's how I can still help:`,
    ``,
    `1. **Upload your policy** — If you have an existing document (security policy, SOP, evidence pack), you can upload it and I'll reference it directly in my answers.`,
    ``,
    `2. **Narrow the scope** — ${clarifyingQ}`,
    ``,
    `3. **General guidance** — I can share industry best-practice templates for this area. These would be clearly labeled as *general guidance*, not your organization's specific policy.`,
    ``,
    `Which option works best for you?`,
  ].join('\n');
}

/**
 * Pick a clarifying question contextually relevant to the user's query.
 */
function pickClarifyingQuestion(query: string): string {
  const lower = query.toLowerCase();

  if (/encrypt/i.test(lower)) {
    return 'Are you asking about encryption at rest, in transit, or key management specifically?';
  }
  if (/access\s*control|rbac|privilege/i.test(lower)) {
    return 'Are you focused on role-based access, privileged access management, or provisioning/deprovisioning?';
  }
  if (/incident/i.test(lower)) {
    return 'Are you looking at incident detection, response procedures, or post-incident review?';
  }
  if (/audit|log/i.test(lower)) {
    return 'Are you asking about audit log retention, monitoring alerts, or evidence collection for assessments?';
  }
  if (/backup|disaster|recovery|continuity/i.test(lower)) {
    return 'Are you focused on RPO/RTO targets, backup procedures, or full DR plan structure?';
  }
  if (/vendor|third.?party|supply/i.test(lower)) {
    return 'Are you asking about vendor risk assessment, onboarding due diligence, or ongoing monitoring?';
  }
  if (/vulnerab|pen\s*test|scan/i.test(lower)) {
    return 'Are you asking about scanning frequency, remediation SLAs, or penetration testing scope?';
  }
  if (/data\s*(retention|classif|delet)/i.test(lower)) {
    return 'Are you asking about retention schedules, classification tiers, or deletion procedures?';
  }
  if (/gdpr|privacy|data\s*subject|dpia/i.test(lower)) {
    return 'Are you focused on data subject rights, DPIAs, cross-border transfers, or consent management?';
  }
  if (/hipaa|phi|health/i.test(lower)) {
    return 'Are you asking about technical safeguards, administrative safeguards, or BAA requirements?';
  }
  if (/soc\s*2|type\s*(2|ii)/i.test(lower)) {
    return 'Which trust services criteria are you focused on — Security, Availability, Confidentiality, Processing Integrity, or Privacy?';
  }
  if (/iso\s*27001|isms/i.test(lower)) {
    return 'Are you looking at a specific Annex A control domain, or the ISMS management system requirements?';
  }
  if (/nist/i.test(lower)) {
    return 'Are you working with NIST CSF, 800-53, or 800-171? And which function — Identify, Protect, Detect, Respond, or Recover?';
  }

  // Generic fallback
  return 'Could you tell me which specific aspect or control area you need help with? That way I can give you the most relevant guidance.';
}

// ═══════════════════════════════════════════════════════════════════════════
// STATIC SCRIPTS — deterministic responses for Class A intents
// ═══════════════════════════════════════════════════════════════════════════

export interface StaticResponse {
  text: string;
  /** If true, caller should still send through LLM for natural tone */
  useLLM: boolean;
}

/**
 * Get a static (or semi-static) response for Class A intents.
 * Returns null if the subtype should go through the normal LLM path.
 */
export function getStaticResponse(subtype: IntentSubtype): StaticResponse | null {
  switch (subtype) {
    case 'greeting':
      return {
        text:
          "Hey there! 👋 I'm Shield Bot, VaultFill's AI compliance assistant. " +
          'I can help with SOC 2, ISO 27001, HIPAA, GDPR, NIST, and more. ' +
          'Ask me a security question, or tell me what compliance challenge you\'re working on!',
        useLLM: false,
      };

    case 'farewell':
      return {
        text:
          'Thanks for chatting! If you need help with security questionnaires or compliance, ' +
          "I'm always here. Have a great day! 🛡️",
        useLLM: false,
      };

    case 'thanks':
      return {
        text:
          "You're welcome! Let me know if there's anything else I can help with " +
          '— security policies, compliance frameworks, or anything in between. 🛡️',
        useLLM: false,
      };

    case 'affirmative':
      // Simple ack — let LLM handle with conversation context
      return null;

    case 'signup_pricing':
      return {
        text:
          "Great to hear you're interested! 🚀 VaultFill automates security questionnaires " +
          "so your team can close deals faster.\n\n" +
          "Drop your **email** and **company name**, and the VaultFill team will reach out to get you set up. " +
          "You can also use the form on this page to request early access.\n\n" +
          "In the meantime, feel free to ask me anything about SOC 2, ISO 27001, encryption, " +
          "or how VaultFill works — I'm here to help!",
        useLLM: false,
      };

    case 'email_capture':
      // Let the LLM handle — it needs to extract the email and confirm
      return null;

    case 'meta_product':
      return {
        text:
          "**VaultFill** is an AI-powered compliance platform that helps teams answer security questionnaires " +
          "in minutes instead of days.\n\n" +
          "Here's what it does:\n" +
          "- 🔍 **Knowledge Vault** — Upload your security policies, SOC 2 reports, and evidence. I index everything.\n" +
          "- 💬 **AI Shield Bot** (that's me!) — Ask compliance questions and get answers grounded in *your* actual policies.\n" +
          "- 📋 **Questionnaire Auto-Fill** — Paste a security questionnaire and get draft responses mapped to your vault.\n\n" +
          "What framework or compliance area are you working on? I can give you a live demo right here.",
        useLLM: false,
      };

    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL EXTRACTION — for Layer 1 data intercept
// ═══════════════════════════════════════════════════════════════════════════

export interface ExtractedData {
  email?: string;
  company?: string;
  name?: string;
  role?: string;
  /** Raw text that wasn't matched to any field */
  rawText: string;
}

/**
 * Extract structured data from user input when we're expecting data fields.
 */
export function extractUserData(
  userInput: string,
  expectedFields: string[],
): ExtractedData {
  const result: ExtractedData = { rawText: userInput.trim() };

  // Email extraction
  const emailMatch = userInput.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // If expecting company and no email found, or multi-field input
  // Try to parse "email, company" or "email at company" patterns
  if (expectedFields.includes('company')) {
    // Pattern: "email, CompanyName" or "email - CompanyName"
    const companyAfterEmail = userInput.match(
      /[\w.+-]+@[\w-]+\.[\w.]+[\s,\-—|]+(.+)/,
    );
    if (companyAfterEmail) {
      result.company = companyAfterEmail[1].trim();
    }
    // Pattern: "CompanyName" (if no email, the whole thing might be company)
    else if (!result.email && !expectedFields.includes('email')) {
      result.company = userInput.trim();
    }
    // Pattern: company is all non-email text
    else if (result.email) {
      const withoutEmail = userInput.replace(result.email, '').replace(/[,\-—|]/g, '').trim();
      if (withoutEmail.length > 1) {
        result.company = withoutEmail;
      }
    }
  }

  // Name extraction (when expecting name specifically)
  if (expectedFields.includes('name') && !result.email) {
    result.name = userInput.trim();
  }

  return result;
}

/**
 * Build a data-acknowledgement response when user provides requested data.
 */
export function buildDataAckResponse(data: ExtractedData, expectedFields: string[]): string | null {
  const parts: string[] = [];

  if (data.email) {
    parts.push(`Got your email: **${data.email}**`);
  }
  if (data.company) {
    parts.push(`Company: **${data.company}**`);
  }
  if (data.name) {
    parts.push(`Name: **${data.name}**`);
  }

  if (parts.length === 0) {
    // We expected data but couldn't extract anything structured
    return null; // let LLM handle
  }

  // Check what's still missing
  const missing: string[] = [];
  if (expectedFields.includes('email') && !data.email) missing.push('email');
  if (expectedFields.includes('company') && !data.company) missing.push('company name');

  let response = parts.join(' · ');

  if (missing.length > 0) {
    response += `\n\nCould you also share your **${missing.join(' and ')}**?`;
  } else {
    response +=
      '\n\n✅ You\'re all set! The VaultFill team will reach out shortly. ' +
      'In the meantime, feel free to keep asking me security and compliance questions — I\'m here to help! 🛡️';
  }

  return response;
}
