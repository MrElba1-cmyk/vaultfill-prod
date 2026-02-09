# VaultFill Error Buffer — HITL Error Handling System

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  /api/leads  │────▶│              │────▶│  ErrorNotifier   │
│  /api/knowl. │     │  ErrorBuffer │     │  (Telegram/Hook) │
│  LivePreview │────▶│   (Core)     │     └─────────────────┘
└─────────────┘     │              │     ┌─────────────────┐
                    │              │────▶│  ErrorLogger     │
                    └──────┬───────┘     │  (Structured)    │
                           │             └─────────────────┘
                    ┌──────▼───────┐
                    │  Dashboard   │
                    │  API + UI    │
                    │  (Review/    │
                    │   Retry/     │
                    │   Dismiss)   │
                    └──────────────┘
```

## Module Structure

```
src/error-buffer/
├── core/
│   ├── types.ts           # All type definitions
│   ├── ErrorBuffer.ts     # Core engine (singleton)
│   └── ErrorLogger.ts     # Structured logging
├── notifications/
│   └── ErrorNotifier.ts   # Telegram, webhook, console
├── middleware/
│   └── errorBufferMiddleware.ts  # Next.js + Express wrappers
├── api/
│   └── errorBufferApi.ts  # Dashboard REST endpoints
├── hooks/
│   └── useErrorBuffer.ts  # React hook for client-side capture
└── index.ts               # Public API barrel
```

## Integration Points

### 1. `/api/leads` endpoint
```ts
import { withErrorBuffer } from '@/error-buffer';

const handler = async (req) => { /* existing logic */ };
export const POST = withErrorBuffer(handler, 'api/leads', 'high');
```

### 2. `/api/knowledge` endpoint
```ts
export const POST = withErrorBuffer(knowledgeHandler, 'api/knowledge', 'medium');
```

### 3. LivePreview component
```tsx
import { useErrorBuffer } from '@/error-buffer/hooks/useErrorBuffer';

function LivePreview() {
  const { wrapAsync } = useErrorBuffer();
  
  const handleGenerate = () => wrapAsync(
    () => fetch('/api/generate').then(r => r.json()),
    { source: 'live-preview', severity: 'medium' }
  );
}
```

### 4. Dashboard API (mount at `/api/error-buffer`)
- `GET /api/error-buffer` — List errors (filters: status, source, severity)
- `POST /api/error-buffer/:id/acknowledge` — Mark as seen
- `POST /api/error-buffer/:id/retry` — Retry with optional `{ correctedInput }`
- `POST /api/error-buffer/:id/dismiss` — Close out

## Notification Setup

```ts
import { getErrorBuffer } from '@/error-buffer';

const buffer = getErrorBuffer({
  notificationChannels: [
    { type: 'console', config: {}, enabled: true },
    { type: 'telegram', config: { botToken: '...', chatId: '...' }, enabled: true },
    { type: 'webhook', config: { url: 'https://hooks.example.com/errors' }, enabled: false },
  ],
  notifySeverityThreshold: 'medium',
});
```

## Retry/Correction Flow (Conceptual)

1. Error occurs → captured in buffer → notification sent
2. Human reviews in dashboard (or receives Telegram alert)
3. Human can:
   - **Acknowledge**: "I see this, working on it"
   - **Retry with correction**: Edit the input data and resubmit
   - **Dismiss**: Not actionable, close it out
4. Retry handler (registered per source) re-processes with corrected input
5. On success → status becomes `resolved`

## Design Principles

- **Modular**: Each concern (capture, notify, log, retry) is a separate module
- **Singleton**: One buffer instance per process, accessed via `getErrorBuffer()`
- **Non-blocking**: Error capture never throws; the original request gets a 503 with an error ID
- **Extensible**: Add notification channels, retry handlers, or persistence layers without touching core
