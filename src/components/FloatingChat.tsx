'use client';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'vaultfill.chat.messages.v1';
const SESSION_KEY = 'vaultfill.chat.sessionId.v1';

function safeParseMessages(raw: string | null): UIMessage[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (m) => m && typeof m === 'object' && typeof (m as any).role === 'string'
    ) as UIMessage[];
  } catch {
    return [];
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const sid = crypto.randomUUID?.() ?? String(Date.now());
  window.localStorage.setItem(SESSION_KEY, sid);
  return sid;
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [initial, setInitial] = useState<UIMessage[]>([]);

  useEffect(() => {
    setInitial(safeParseMessages(window.localStorage.getItem(STORAGE_KEY)));
    getOrCreateSessionId();
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return <FloatingChatInner open={open} setOpen={setOpen} initialMessages={initial} />;
}

function FloatingChatInner({
  open,
  setOpen,
  initialMessages,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  initialMessages: UIMessage[];
}) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, error, setMessages } = useChat({
    messages: initialMessages,
    transport: {
      api: '/api/chat',
      headers: {
        'x-vaultfill-session-id': sessionId,
      },
    } as any,
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Panel */}
      <div
        className={
          open
            ? 'pointer-events-auto mb-3 w-[92vw] max-w-[420px] overflow-hidden rounded-2xl border border-vault-cardBorder bg-vault-card shadow-glass backdrop-blur-glass'
            : 'pointer-events-none mb-3 w-[92vw] max-w-[420px] overflow-hidden rounded-2xl border border-vault-cardBorder bg-vault-card shadow-glass backdrop-blur-glass opacity-0 translate-y-2'
        }
        style={{ transition: 'all 160ms ease' }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">AI Assistant</div>
            <div className="truncate text-xs text-white/60">
              GRC + security questionnaires • remembers this session
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
              onClick={() => {
                window.localStorage.removeItem(STORAGE_KEY);
                setMessages([]);
              }}
              title="Clear chat"
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">
              Ask about SOC 2, ISO 27001, vendor questionnaires, evidence requests, or how to word a
              control response.
            </div>
          ) : null}

          <div className="mt-3 space-y-3">
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} parts={m.parts} />
            ))}
          </div>

          {error ? (
            <div className="mt-3 text-xs text-red-200">
              Something went wrong. Please try again.
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-white/10 px-3 py-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a security or GRC question…"
            rows={1}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className="h-[44px] rounded-xl bg-vault-accent px-4 text-sm font-medium text-white shadow hover:brightness-110 disabled:opacity-50"
          >
            {isLoading ? '…' : 'Send'}
          </button>
        </form>
      </div>

      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-glass backdrop-blur-glass hover:bg-white/15"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <span className="text-lg">{open ? '✕' : '💬'}</span>
      </button>
    </div>
  );
}

function ChatBubble({ role, parts }: { role: string; parts: UIMessage['parts'] }) {
  const isUser = role === 'user';
  const textContent = parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || '';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-vault-accent/90 px-3 py-2 text-sm text-white'
            : 'max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90'
        }
      >
        <div className="whitespace-pre-wrap leading-relaxed">{textContent}</div>
      </div>
    </div>
  );
}
