'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types & constants ─── */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Welcome to VaultFill Technical Support. I can help you with SOC 2, ISO 27001, encryption, access controls, GDPR compliance, and how VaultFill automates security questionnaires. How can I assist you today?",
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  'How does encryption at rest work?',
  'What are your MFA requirements?',
  'Tell me about SOC 2 compliance',
  'How do you handle access controls?',
];

/* ─── AI Chatbot SVG Icon ─── */

const ChatBotSVG = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: 'block' }}
  >
    {/* Speech bubble body */}
    <path
      d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2h-4l-4 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="rgba(59, 130, 246, 0.10)"
    />
    {/* AI "brain" dots — three connected nodes */}
    <circle cx="8" cy="11" r="1.3" fill="currentColor" opacity="0.9" />
    <circle cx="12" cy="8.5" r="1.3" fill="currentColor" opacity="0.9" />
    <circle cx="16" cy="11" r="1.3" fill="currentColor" opacity="0.9" />
    {/* Neural connection lines */}
    <path
      d="M9.1 10.4L11 9.1M13 9.1L14.9 10.4M8.5 12.3L11.5 13.5L15.5 12.3"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
    {/* Tiny sparkle — AI indicator */}
    <path
      d="M18.5 4.5L19 3.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
);

/* ─── Chatbot avatar used in header ─── */

const ChatBotAvatar = ({ size = 36 }: { size?: number }) => (
  <div
    className="flex shrink-0 items-center justify-center rounded-xl"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(96, 165, 250, 0.10) 100%)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(59, 130, 246, 0.18)',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    }}
  >
    <ChatBotSVG size={Math.round(size * 0.55)} className="text-[var(--vault-blue)]" />
  </div>
);

/* ─── Main component ─── */

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Persist / restore */
  useEffect(() => {
    const saved = localStorage.getItem('vaultfill-chat-messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch { setMessages([WELCOME_MESSAGE]); }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('vaultfill-chat-messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) { setHasUnread(false); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  /* Send */
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, messages: messages.slice(-8) }),
      });
      if (!res.ok) throw new Error('Failed');

      const contentType = res.headers.get('content-type');

      if (contentType?.includes('text/plain')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let responseContent = '';

        if (reader) {
          const assistantMsg: ChatMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: '', timestamp: new Date() };
          setMessages(prev => [...prev, assistantMsg]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value).split('\n')) {
              if (line.startsWith('0:')) {
                try {
                  const data = JSON.parse(line.substring(2));
                  if (typeof data === 'string') {
                    responseContent += data;
                    setMessages(prev => {
                      const updated = [...prev];
                      const last = updated[updated.length - 1];
                      if (last?.role === 'assistant') last.content = responseContent;
                      return updated;
                    });
                  }
                } catch { /* stream parse */ }
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`, role: 'assistant',
          content: data.reply || "I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        }]);
      }

      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`, role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isOpen, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }, [input, sendMessage]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault(); sendMessage(input);
  }, [input, sendMessage]);

  const sendSuggested = useCallback((text: string) => {
    if (isLoading) return;
    setInput(text);
    setTimeout(() => sendMessage(text), 10);
  }, [sendMessage, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem('vaultfill-chat-messages');
  }, []);

  /* Markdown-lite */
  const renderContent = (content: string) =>
    content.split('\n').map((line, i) => (
      <p key={i} className={line === '' ? 'h-2' : ''}>
        {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={j} className="font-semibold text-[var(--fg)]">{part.slice(2, -2)}</strong>;
          if (part.startsWith('*') && part.endsWith('*'))
            return <em key={j} className="opacity-70">{part.slice(1, -1)}</em>;
          return part;
        })}
      </p>
    ));

  /* ─── Render ─── */

  return (
    <>
      {/* ── FAB ── */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.92), rgba(37, 99, 235, 0.88))',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open VaultFill AI Assistant'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg text-white font-medium select-none"
            >
              ✕
            </motion.span>
          ) : (
            <motion.div
              key="shield"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatBotSVG size={24} className="text-white drop-shadow-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-[var(--bg)]" />
          </span>
        )}
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[5.5rem] right-5 z-50 flex flex-col overflow-hidden rounded-2xl"
            style={{
              width: 'min(380px, calc(100vw - 2.5rem))',
              height: 'min(520px, calc(100vh - 8rem))',
              minHeight: '400px',
              background: 'var(--card)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-natural), 0 0 0 1px rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card-2)',
              }}
            >
              <ChatBotAvatar size={36} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[var(--fg)] truncate">VaultFill AI Assistant</h3>
                <p className="text-xs text-[var(--muted-2)] truncate">Security & GRC Support</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-[var(--muted-2)] hidden sm:inline">Online</span>
              </div>
              <button
                onClick={clearChat}
                className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--border)]"
                title="Clear chat history"
              >
                <svg className="h-3.5 w-3.5 text-[var(--muted-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="space-y-3">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              color: 'white',
                              borderBottomRightRadius: '6px',
                            }
                          : {
                              background: 'var(--card-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--fg)',
                              borderBottomLeftRadius: '6px',
                            }
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div
                      className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                      style={{ background: 'var(--card-2)', border: '1px solid var(--border)' }}
                    >
                      {[0, 150, 300].map(delay => (
                        <span key={delay} className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted-2)]" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[var(--muted-2)]">Try asking:</p>
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendSuggested(q)}
                      disabled={isLoading}
                      className="block w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors hover:border-blue-500/30 disabled:opacity-50"
                      style={{ background: 'var(--card-2)', borderColor: 'var(--border)', color: 'var(--muted)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Input ── */}
            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--card-2)' }}>
              <form onSubmit={handleSubmit}>
                <div
                  className="flex items-center gap-2 rounded-xl border px-3.5 py-2"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about compliance, security..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-2)]"
                    style={{ color: 'var(--fg)' }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                    style={{
                      background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                      color: input.trim() ? 'white' : 'var(--muted-2)',
                    }}
                  >
                    ↑
                  </button>
                </div>
              </form>
              <p className="mt-2 text-center text-[10px] text-[var(--muted-2)]">
                Powered by VaultFill Knowledge Vault
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
