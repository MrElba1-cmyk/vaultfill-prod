'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Shield Icon Component with Glassmorphism Effect
const ShieldIcon = ({ className = "", glowing = false }: { className?: string; glowing?: boolean }) => (
  <div
    className={`flex items-center justify-center ${className}`}
    style={{
      background: glowing 
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(96, 165, 250, 0.15) 100%)'
        : 'rgba(59, 130, 246, 0.12)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: glowing 
        ? '0 0 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        : '0 4px 16px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    }}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[var(--vault-blue)]"
    >
      <path
        d="M12 2L3 7V12.18C3 16.95 6.3 21.47 12 23C17.7 21.47 21 16.95 21 12.18V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(59, 130, 246, 0.08)"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted messages on mount
  useEffect(() => {
    const saved = localStorage.getItem('vaultfill-chat-messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error('Error loading chat history:', e);
        setMessages([WELCOME_MESSAGE]);
      }
    }
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('vaultfill-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: trimmed,
            messages: messages.slice(-8) // Send last 8 messages for context
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to get response');
        }

        // Check if the response is a stream (from AI SDK) or JSON (fallback)
        const contentType = res.headers.get('content-type');
        
        if (contentType?.includes('text/plain')) {
          // Handle streaming response
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let responseContent = '';

          if (reader) {
            // Add empty assistant message that we'll update
            const assistantMsg: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('0:')) {
                  try {
                    const jsonStr = line.substring(2);
                    const data = JSON.parse(jsonStr);
                    if (data && typeof data === 'string') {
                      responseContent += data;
                      // Update the assistant message with accumulated content
                      setMessages((prev) => {
                        const updated = [...prev];
                        const lastMsg = updated[updated.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant') {
                          lastMsg.content = responseContent;
                        }
                        return updated;
                      });
                    }
                  } catch (e) {
                    // Ignore parse errors for streaming
                  }
                }
              }
            }
          }
        } else {
          // Handle JSON response (fallback)
          const data = await res.json();
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply || "I'm having trouble right now. Please try again.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (!isOpen) setHasUnread(true);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isOpen, messages]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }, [input, sendMessage]);

  const sendSuggestedMessage = useCallback((text: string) => {
    if (isLoading) return;
    setInput(text);
    setTimeout(() => {
      sendMessage(text);
    }, 10);
  }, [sendMessage, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem('vaultfill-chat-messages');
  }, []);

  // Simple markdown-lite renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <p key={i} className={line === '' ? 'h-2' : ''}>
        {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-semibold text-[var(--fg)]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <em key={j} className="opacity-70">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <>
      {/* Floating Chat Bubble with Shield Icon */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(96, 165, 250, 0.8))',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
              className="text-lg text-white font-medium"
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
              <ShieldIcon className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg" glowing />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread indicator */}
        {hasUnread && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3 sm:h-4 sm:w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500" />
          </span>
        )}
      </motion.button>

      {/* Chat Panel with Enhanced Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-16 right-4 sm:bottom-24 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{
              width: 'min(380px, calc(100vw - 2rem))',
              height: 'min(520px, calc(100vh - 140px))',
              minHeight: '400px',
              background: 'var(--card)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-natural), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Header with Shield Avatar */}
            <div
              className="flex items-center gap-3 border-b px-4 sm:px-5 py-3 sm:py-4"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card-2)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <ShieldIcon className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--fg)] truncate">VaultFill AI Assistant</h3>
                <p className="text-xs text-[var(--muted-2)] truncate">Technical Support</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs text-[var(--muted-2)] hidden sm:inline">Online</span>
              </div>
              <button
                onClick={clearChat}
                className="p-1 rounded hover:bg-[var(--border)] transition-colors shrink-0"
                title="Clear chat history"
              >
                <svg className="h-4 w-4 text-[var(--muted-2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm leading-relaxed"
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
                              backdropFilter: 'blur(14px)',
                            }
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div
                      className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                      style={{
                        background: 'var(--card-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--muted-2)]" style={{ animationDelay: '0ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--muted-2)]" style={{ animationDelay: '150ms' }} />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--muted-2)]" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions — show only if just welcome message */}
              {messages.length === 1 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[var(--muted-2)]">Try asking:</p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendSuggestedMessage(q)}
                      disabled={isLoading}
                      className="block w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:border-blue-500/40 disabled:opacity-50"
                      style={{
                        background: 'var(--card-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--muted)',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Input with Form */}
            <div
              className="border-t px-3 sm:px-4 py-3"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card-2)',
              }}
            >
              <form onSubmit={handleSubmit}>
                <div
                  className="flex items-center gap-2 rounded-xl border px-3 py-2"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--card)',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about compliance, security..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-2)]"
                    style={{ color: 'var(--fg)' }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-sm transition-all disabled:opacity-30"
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
                Session ID: {sessionId.slice(-8)} • Powered by VaultFill Knowledge Vault
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}