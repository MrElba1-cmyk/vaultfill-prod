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

/* ─── Apex Shield SVG (glow variant for FAB) ─── */

const ApexShieldGlow = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden="true">
    <defs>
      <filter id="fabGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/>
        <feFlood floodColor="#00D4FF" floodOpacity="0.35" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="shadow"/>
        <feMerge>
          <feMergeNode in="shadow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#fabGlow)">
      <polygon points="128,48 128,126 70,146" fill="#00D4FF"/>
      <polygon points="128,48 128,126 186,146" fill="#6366F1"/>
      <polygon points="71,149 185,149 128,222" fill="#CBD5E1"/>
    </g>
  </svg>
);

/* ─── Chat header avatar ─── */

const ShieldBotAvatar = ({ size = 36 }: { size?: number }) => (
  <div
    className="flex shrink-0 items-center justify-center rounded-xl"
    style={{
      width: size,
      height: size,
      background: 'rgba(0, 212, 255, 0.08)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(0, 212, 255, 0.15)',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.12)',
    }}
  >
    <svg viewBox="0 0 256 256" width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} aria-hidden="true">
      <polygon points="128,48 128,126 70,146" fill="#00D4FF"/>
      <polygon points="128,48 128,126 186,146" fill="#6366F1"/>
      <polygon points="71,149 185,149 128,222" fill="#CBD5E1"/>
    </svg>
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
      {/* ── Pulsing Shield FAB ── */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 35%, rgba(0, 212, 255, 0.18), rgba(12, 18, 32, 0.92) 70%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 212, 255, 0.20)',
          animation: isOpen ? 'none' : 'shield-pulse 2.5s ease-in-out infinite',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open VaultFill AI Assistant'}
      >
        {/* Expanding ring animation */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: '1.5px solid rgba(0, 212, 255, 0.30)',
              animation: 'shield-ring 2.5s ease-out infinite',
            }}
            aria-hidden="true"
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-lg text-cyan-300 font-medium select-none"
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
              <ApexShieldGlow size={28} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg)]" />
          </span>
        )}
      </motion.button>

      {/* ── Glassmorphism Chat Panel ── */}
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
              backdropFilter: 'blur(20px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
              border: '1px solid rgba(0, 212, 255, 0.10)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 212, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{
                borderColor: 'rgba(0, 212, 255, 0.08)',
                background: 'var(--card-2)',
              }}
            >
              <ShieldBotAvatar size={36} />
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
                              background: 'linear-gradient(135deg, #00D4FF, #6366F1)',
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
                        <span key={delay} className="inline-block h-1.5 w-1.5 animate-bounce rounded-full" style={{ backgroundColor: '#00D4FF', animationDelay: `${delay}ms` }} />
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
                      className="block w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors disabled:opacity-50"
                      style={{
                        background: 'var(--card-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--muted)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.25)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Input ── */}
            <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(0, 212, 255, 0.08)', background: 'var(--card-2)' }}>
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
                      background: input.trim() ? 'linear-gradient(135deg, #00D4FF, #6366F1)' : 'transparent',
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
