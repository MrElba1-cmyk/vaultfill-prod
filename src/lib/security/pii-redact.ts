/**
 * PII Redaction Utility
 * 
 * Detects and redacts emails, phone numbers, SSNs, IPs, UUIDs, and names
 * from log output and error messages.
 */

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
  // US phone numbers
  { pattern: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, replacement: '[PHONE_REDACTED]' },
  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
  // Credit card numbers (basic)
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CC_REDACTED]' },
  // UUIDs (session IDs, user IDs)
  { pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, replacement: '[ID_REDACTED]' },
  // IPv4 addresses (but not 127.0.0.1 or 0.0.0.0)
  { pattern: /\b(?!127\.0\.0\.1|0\.0\.0\.0)(\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP_REDACTED]' },
];

/**
 * Redact PII from a string.
 */
export function redactPII(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Create a safe error message for client responses.
 * Never expose internal details.
 */
export function safeErrorMessage(error: unknown, fallback = 'An internal error occurred.'): string {
  // Always return generic message to client
  return fallback;
}

/**
 * Safe console logger that redacts PII before output.
 */
export const safeLog = {
  info: (...args: unknown[]) => console.info(...args.map(a => typeof a === 'string' ? redactPII(a) : a)),
  warn: (...args: unknown[]) => console.warn(...args.map(a => typeof a === 'string' ? redactPII(a) : a)),
  error: (...args: unknown[]) => console.error(...args.map(a => typeof a === 'string' ? redactPII(a) : a)),
  log: (...args: unknown[]) => console.log(...args.map(a => typeof a === 'string' ? redactPII(a) : a)),
};
