/**
 * Anonymous Session Manager (Server-Side)
 *
 * Maintains conversation context per anonymous session ID.
 * No email or personal info required — sessions are keyed by UUID from localStorage.
 * Conversation history is kept server-side for context continuity.
 */

type SessionData = {
  id: string;
  createdAt: number;
  lastActiveAt: number;
  messageCount: number;
  /** Rolling summary of conversation for context injection */
  contextSummary: string;
  /** Last N messages for short-term memory */
  recentMessages: { role: string; content: string; ts: number }[];
  /** Receptionist bypass: true when bot has asked for email */
  waitingForEmail: boolean;
  /** Receptionist bypass: true when bot has asked for company name */
  waitingForCompany: boolean;
  /** Receptionist bypass: email captured from conversation */
  capturedEmail: string | null;
};

const MAX_RECENT = 20;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory store (production would use Redis/KV)
const sessions = new Map<string, SessionData>();

export function getOrCreateSession(sessionId: string): SessionData {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.lastActiveAt = Date.now();
    return existing;
  }

  const session: SessionData = {
    id: sessionId,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    messageCount: 0,
    contextSummary: '',
    recentMessages: [],
    waitingForEmail: false,
    waitingForCompany: false,
    capturedEmail: null,
  };
  sessions.set(sessionId, session);
  return session;
}

export function recordMessage(sessionId: string, role: string, content: string): void {
  const session = getOrCreateSession(sessionId);
  session.messageCount++;
  session.lastActiveAt = Date.now();
  session.recentMessages.push({ role, content: content.slice(0, 500), ts: Date.now() });

  // Trim to max
  if (session.recentMessages.length > MAX_RECENT) {
    session.recentMessages = session.recentMessages.slice(-MAX_RECENT);
  }
}

export function updateContextSummary(sessionId: string, summary: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.contextSummary = summary.slice(0, 1000);
  }
}

export function getSessionContext(sessionId: string): string {
  const session = sessions.get(sessionId);
  if (!session || session.recentMessages.length === 0) return '';

  let ctx = '';
  if (session.contextSummary) {
    ctx += `Conversation summary so far: ${session.contextSummary}\n\n`;
  }
  ctx += `This anonymous user has sent ${session.messageCount} messages in this session. `;
  ctx += `Session started ${new Date(session.createdAt).toISOString()}.`;
  return ctx;
}

// ---- Receptionist bypass state helpers ----

export function setWaitingForEmail(sessionId: string, waiting: boolean): void {
  const session = getOrCreateSession(sessionId);
  session.waitingForEmail = waiting;
}

export function isWaitingForEmail(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  return session?.waitingForEmail ?? false;
}

export function setWaitingForCompany(sessionId: string, waiting: boolean): void {
  const session = getOrCreateSession(sessionId);
  session.waitingForCompany = waiting;
}

export function isWaitingForCompany(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  return session?.waitingForCompany ?? false;
}

export function setCapturedEmail(sessionId: string, email: string): void {
  const session = getOrCreateSession(sessionId);
  session.capturedEmail = email;
}

export function getCapturedEmail(sessionId: string): string | null {
  const session = sessions.get(sessionId);
  return session?.capturedEmail ?? null;
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastActiveAt > SESSION_TTL_MS) sessions.delete(id);
  }
}, 60 * 60 * 1000); // every hour
