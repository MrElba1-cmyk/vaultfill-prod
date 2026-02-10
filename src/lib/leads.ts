/**
 * Lead Capture Store
 *
 * In-memory lead store (production would use Postgres / CRM webhook).
 * Provides helpers for the email-intercept flow in the chat route.
 */

export interface Lead {
  email: string;
  company?: string;
  name?: string;
  sessionId: string;
  capturedAt: number;
  source: 'chat-email-intercept' | 'api';
}

// In-memory store (production: Postgres table or CRM API)
const leads = new Map<string, Lead>();

/**
 * Record a new lead. Keyed by email (deduped).
 * Returns true if this is a new lead, false if already captured.
 */
export function recordLead(lead: Lead): boolean {
  const key = lead.email.toLowerCase().trim();
  const isNew = !leads.has(key);
  leads.set(key, { ...lead, email: key });
  console.log(`[leads] ${isNew ? 'NEW' : 'UPDATE'} lead: [EMAIL_REDACTED] session=${lead.sessionId}`);
  return isNew;
}

/**
 * Get a lead by email.
 */
export function getLead(email: string): Lead | undefined {
  return leads.get(email.toLowerCase().trim());
}

/**
 * Get all captured leads (admin use).
 */
export function getAllLeads(): Lead[] {
  return Array.from(leads.values());
}

// ─── Email detection ────────────────────────────────────────────────────────

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

/**
 * Extract all email addresses from a string.
 */
export function extractEmails(text: string): string[] {
  return (text.match(EMAIL_RE) || []).map(e => e.toLowerCase().trim());
}

/**
 * Check if the user message looks like a signup / early-access intent.
 * We look at:
 *  - The user's own message for signup signals
 *  - The previous assistant message for email-ask / CTA signals
 */
export function isSignupIntent(
  userMessage: string,
  previousAssistantMessage?: string
): boolean {
  const lower = userMessage.toLowerCase();
  const prevLower = (previousAssistantMessage || '').toLowerCase();

  // Direct signup signals in user message
  const userSignals = [
    'sign up', 'signup', 'sign me up', 'early access', 'get started',
    'interested', 'try it', 'pilot', 'demo', 'trial', 'set it up',
    'yes', 'sure', 'sounds good', 'let\'s do it', 'go ahead',
    'send me', 'count me in', 'i\'d love', 'here\'s my email',
    'here is my email', 'my email is', 'reach me at', 'contact me',
    'you can reach me',
  ];

  if (userSignals.some(s => lower.includes(s))) return true;

  // If the message is JUST an email (possibly with light preamble), treat as signup
  // e.g. "john@example.com" or "sure, john@example.com"
  const stripped = lower.replace(EMAIL_RE, '').replace(/[^a-z]/g, '').trim();
  if (stripped.length < 20) return true; // short message with email = likely responding to CTA

  // Previous assistant message asked for email / offered CTA
  const prevSignals = [
    'email', 'set up a pilot', 'set up a demo', 'get you started',
    'reach out', 'send you', 'sign up', 'early access', 'get started',
    'would you like', 'shall i', 'can i set', 'interested in',
    'state:s6', 'state:s7', // state machine tags
    'drop your email', 'share your email', 'provide your email',
  ];

  if (prevSignals.some(s => prevLower.includes(s))) return true;

  return false;
}
