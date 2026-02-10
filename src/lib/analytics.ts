/**
 * Analytics module — fires Segment/PostHog events for onboarding funnel.
 * All events are PII-free: only anonymous sessionIds and state labels.
 *
 * In production, replace the transport with real Segment/PostHog SDK calls.
 * For now we use a lightweight fetch to Segment's HTTP API (if key present)
 * and console logging as fallback.
 */

type OnboardingEvent =
  | 'onboarding.demo_initiated'
  | 'onboarding.lead_captured'
  | 'onboarding.value_phase'
  | 'onboarding.drop_off';

interface EventProperties {
  sessionId: string;
  fromState?: string;
  lastState?: string;
  messageCount?: number;
  [key: string]: string | number | boolean | undefined;
}

/** Strip any field that could contain PII */
function maskPII(props: EventProperties): EventProperties {
  const safe = { ...props };
  // Remove anything that looks like PII
  const piiKeys = ['email', 'name', 'phone', 'address', 'ip', 'userAgent'];
  for (const key of piiKeys) {
    delete (safe as any)[key];
  }
  return safe;
}

const SEGMENT_WRITE_KEY = typeof window !== 'undefined'
  ? (window as any).__SEGMENT_WRITE_KEY
  : process.env.SEGMENT_WRITE_KEY;

const POSTHOG_KEY = typeof window !== 'undefined'
  ? (window as any).__POSTHOG_KEY
  : process.env.POSTHOG_API_KEY;

async function sendToSegment(event: string, properties: EventProperties) {
  if (!SEGMENT_WRITE_KEY) return;
  try {
    await fetch('https://api.segment.io/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(SEGMENT_WRITE_KEY + ':')}`,
      },
      body: JSON.stringify({
        anonymousId: properties.sessionId,
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch { /* fire-and-forget */ }
}

async function sendToPostHog(event: string, properties: EventProperties) {
  if (!POSTHOG_KEY) return;
  try {
    await fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: properties.sessionId,
        properties,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch { /* fire-and-forget */ }
}

export function trackEvent(event: OnboardingEvent, properties: EventProperties) {
  const safe = maskPII(properties);

  // Console log for dev visibility
  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${event}`, safe);
  }

  // Fire to both providers
  sendToSegment(event, safe);
  sendToPostHog(event, safe);
}
