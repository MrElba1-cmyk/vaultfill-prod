import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import {
  queryKnowledgeVaultStructured,
  extractSectionFromChunk,
  type RAGResult,
} from '../../../lib/embeddings';
import { getOrCreateSession, recordMessage, getSessionContext } from '../../../lib/sessions';
import {
  type OnboardingState,
  detectStateFromResponse,
  detectStateFromUserInput,
  canTransition,
  STATE_LABELS,
} from '../../../lib/onboardingStateMachine';
import {
  detectFrameworksAndTopics,
  buildAugmentedQuery,
  hasBuyingSignal,
  type DetectedContext,
} from '../../../lib/framework-detector';
import {
  getConversationMemory,
  updateFromUserMessage,
  updateFromBotResponse,
  buildNoRepeatInstructions,
} from '../../../lib/conversation-tracker';
import { trackEvent } from '../../../lib/analytics';

export const runtime = 'nodejs';

// ---- Per-session onboarding state (in production, persist to DB) ----
interface SessionOnboardingState {
  state: OnboardingState;
  messageCount: number;
  /** Exchanges spent in S2 specifically */
  s2ExchangeCount: number;
  /** Track the last framework the user mentioned */
  lastFramework: string | null;
  /** Track if pricing was asked */
  pricingAsked: boolean;
}

const sessionStates = new Map<string, SessionOnboardingState>();

function getSessionState(sessionId: string): SessionOnboardingState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, {
      state: 'S1',
      messageCount: 0,
      s2ExchangeCount: 0,
      lastFramework: null,
      pricingAsked: false,
    });
  }
  return sessionStates.get(sessionId)!;
}

// ---- Helpers ----

/** Strip messages to only {role, content} and limit to last N. */
function sanitizeMessages(
  msgs: Array<{ role: string; content: string; [k: string]: unknown }>,
  maxMessages: number,
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const clean = msgs
    .filter(
      (m) =>
        ['user', 'assistant', 'system'].includes(m.role) && typeof m.content === 'string',
    )
    .map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
  return clean.slice(-maxMessages);
}

// ---- Token estimation & chunk truncation ----

/** Rough token count (~4 chars per token for English text). */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Truncate a chunk to ~500 tokens, keeping the first portion and appending an ellipsis. */
function truncateChunk(content: string, maxTokens = 500): string {
  const est = estimateTokens(content);
  if (est <= maxTokens) return content;
  // Keep first ~maxTokens worth of characters
  const maxChars = maxTokens * 4;
  return content.slice(0, maxChars).trimEnd() + ' …[truncated]';
}

// ---- Citation formatter ----

/**
 * Build citation-annotated RAG context for the system prompt.
 * Each chunk gets a citation tag. Chunks over 500 tokens are truncated.
 */
function buildCitedRAGContext(results: RAGResult[]): string {
  if (results.length === 0) return '';

  const sections: string[] = [];

  for (const r of results) {
    const sectionTitle = extractSectionFromChunk(r.content);
    const citationLabel = sectionTitle
      ? `${r.sourceTitle}, ${sectionTitle}`
      : r.sourceTitle;
    const trimmedContent = truncateChunk(r.content.trim());

    sections.push(
      `[${citationLabel}]\n${trimmedContent}`,
    );
  }

  return sections.join('\n\n');
}

// ---- System prompt builder ----

function buildSystemPrompt(
  ragContext: string,
  ragResults: RAGResult[],
  sessionContext: string,
  ss: SessionOnboardingState,
  detectedContexts: DetectedContext[],
  noRepeatInstructions: string,
) {

  let prompt = `You are Shield Bot, VaultFill's AI compliance assistant (SOC 2, ISO 27001, NIST, HIPAA, GDPR).

RULES: Answer immediately. Max 1 follow-up question per response. Be concise with bullets. Cite vault sources as "Based on [Title, Section]: …" — never fabricate citations. No internal state references.
If pricing asked: "VaultFill offers startup-friendly pricing — plans announced soon. Drop your email for early access."
After 3+ exchanges, suggest saving analysis via email.
`;

  // Lean context injection
  if (hasBuyingSignal(detectedContexts)) {
    prompt += `User asked about pricing.\n`;
  }
  const frameworks = detectedContexts.filter(
    (c) => c.category === 'framework' || c.category === 'privacy',
  );
  if (frameworks.length > 0) {
    prompt += `Frameworks: ${frameworks.map((f) => f.label).join(', ')}.\n`;
  }
  if (noRepeatInstructions) {
    prompt += noRepeatInstructions + '\n';
  }
  if (ss.pricingAsked) {
    prompt += `Pricing already discussed.\n`;
  }
  if (ragContext) {
    prompt += `\nKNOWLEDGE_VAULT:\n${ragContext}\n`;
  }

  return prompt;
}

// ---- POST handler ----

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Accept both formats:
    //  { messages: [{role, content}, ...] }          — Vercel AI SDK / rich client
    //  { message: "..." }                            — simple / legacy
    //  { messages: [...], message: "..." }            — ChatWidget (message = current user input)
    const incomingMessages: Array<Record<string, unknown>> | null =
      Array.isArray(body?.messages) ? body.messages : null;
    const singleMessage: string | null =
      typeof body?.message === 'string' ? body.message : null;

    // Build a clean conversation array
    let conversationMessages: Array<{ role: string; content: string }> = [];

    if (incomingMessages && incomingMessages.length > 0) {
      conversationMessages = incomingMessages
        .filter(
          (m: Record<string, unknown>) =>
            typeof m.role === 'string' && typeof m.content === 'string',
        )
        .map((m: Record<string, unknown>) => ({
          role: m.role as string,
          content: m.content as string,
        }));
    }

    // If `message` field is provided separately, append it as the latest user message
    if (singleMessage) {
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      if (!(lastMsg && lastMsg.role === 'user' && lastMsg.content === singleMessage)) {
        conversationMessages.push({ role: 'user', content: singleMessage });
      }
    }

    if (conversationMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sliding window memory: keep only the last 10 turns (20 messages) to bound token usage
    const messages = sanitizeMessages(conversationMessages, 20);

    const sessionId = req.headers.get('x-vaultfill-session-id') || 'anonymous';

    // Track session
    getOrCreateSession(sessionId);
    const ss = getSessionState(sessionId);
    ss.messageCount++;

    // Auto-advance S1→S2 on first user message
    if (ss.state === 'S1' && ss.messageCount >= 1) {
      ss.state = 'S2';
    }

    // Extract the latest user query
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const query = lastUser?.content ?? '';

    // Record the user message
    if (query) recordMessage(sessionId, 'user', query);

    // ==================================================================
    // PHASE 1: FRAMEWORK & TOPIC DETECTION
    // ==================================================================
    const detectedContexts = detectFrameworksAndTopics(query);
    const detectedLabels = detectedContexts.map((c) => c.label);

    console.log(
      `[chat] Session ${sessionId} | State: ${ss.state} | Detected: [${detectedLabels.join(', ')}]`,
    );

    // ==================================================================
    // PHASE 2: UPDATE CONVERSATION MEMORY (anti-repeat)
    // ==================================================================
    updateFromUserMessage(sessionId, query, detectedLabels);

    // ------------------------------------------------------------------
    // User-input-based state detection (BEFORE LLM call)
    // ------------------------------------------------------------------
    const userSignals = detectStateFromUserInput(query, ss.state);

    // Track framework mentions
    if (userSignals.frameworkMentioned) {
      ss.lastFramework = userSignals.frameworkMentioned;
    }

    // Track pricing interest
    if (userSignals.pricingAsked) {
      ss.pricingAsked = true;
    }

    // Apply suggested state transition from user input
    if (userSignals.suggestedState && canTransition(ss.state, userSignals.suggestedState)) {
      const fromState = ss.state;
      ss.state = userSignals.suggestedState;

      if (userSignals.suggestedState === 'S3') {
        trackEvent('onboarding.demo_initiated', {
          sessionId,
          fromState: STATE_LABELS[fromState],
          trigger: 'user_input',
        });
      }
    }

    // Auto-advance S2 → S3 after 1 exchange in S2 (prevent interrogation loops)
    if (ss.state === 'S2') {
      ss.s2ExchangeCount++;
      if (ss.s2ExchangeCount >= 1) {
        ss.state = 'S3';
        trackEvent('onboarding.demo_initiated', {
          sessionId,
          fromState: STATE_LABELS['S2'],
          trigger: 'auto_advance',
        });
      }
    }

    // ==================================================================
    // PHASE 3: RETRIEVAL-FIRST — ALWAYS query Knowledge Vault
    // ==================================================================
    let ragResults: RAGResult[] = [];
    let ragContext = '';

    try {
      if (query) {
        // Build augmented query using detected frameworks/topics for better recall
        const augmentedQuery = buildAugmentedQuery(query, detectedContexts);

        console.log(`[chat] RAG query: "${augmentedQuery.slice(0, 120)}..."`);

        // Top-3 rule: fetch only 3 most relevant chunks to minimize input tokens
        ragResults = await queryKnowledgeVaultStructured(augmentedQuery, 3, 0.25);

        console.log(
          `[chat] RAG returned ${ragResults.length} results. Top scores: [${ragResults.slice(0, 3).map((r) => r.score.toFixed(3)).join(', ')}]`,
        );

        // Build citation-annotated context
        ragContext = buildCitedRAGContext(ragResults);
      }
    } catch (ragErr) {
      console.error('[chat] RAG query failed, continuing without context:', ragErr);
    }

    // ==================================================================
    // PHASE 4: BUILD NO-REPEAT INSTRUCTIONS
    // ==================================================================
    const noRepeatInstructions = buildNoRepeatInstructions(sessionId);

    const sessionContext = getSessionContext(sessionId);

    const systemPrompt = buildSystemPrompt(
      ragContext,
      ragResults,
      sessionContext,
      ss,
      detectedContexts,
      noRepeatInstructions,
    );

    console.log(`[chat] System prompt length: ${systemPrompt.length}`);
    console.log(`[chat] Messages count: ${messages.length}`);

    // DIAGNOSTIC MODE: Use generateText to catch errors, then return as plain text
    // This will reveal the actual error instead of silently returning empty stream
    console.log(`[chat] About to call generateText with model gpt-4o-mini`);

    const genResult = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      temperature: 0.5,
    });

    const generatedText = genResult.text;
    console.log(`[chat] generateText succeeded, text length: ${generatedText.length}`);

    // Record the response
    recordMessage(sessionId, 'assistant', generatedText);
    updateFromBotResponse(sessionId, generatedText);

    // Detect state transition from response
    const detectedState = detectStateFromResponse(generatedText);
    if (detectedState && canTransition(ss.state, detectedState)) {
      const fromState = ss.state;
      ss.state = detectedState;
      if (detectedState === 'S3') {
        trackEvent('onboarding.demo_initiated', { sessionId, fromState: STATE_LABELS[fromState] });
      }
      if (detectedState === 'S7') {
        trackEvent('onboarding.lead_captured', { sessionId, fromState: STATE_LABELS[fromState] });
      }
    }

    // Heuristic: if LLM demonstrated capability while in S3, advance to S4
    if (
      ss.state === 'S3' &&
      (generatedText.toLowerCase().includes('let me show you') ||
        generatedText.toLowerCase().includes("here's an example") ||
        generatedText.toLowerCase().includes('for instance') ||
        generatedText.toLowerCase().includes('suggested response') ||
        generatedText.toLowerCase().includes('based on ['))
    ) {
      ss.state = 'S4';
      trackEvent('onboarding.value_phase', { sessionId, fromState: STATE_LABELS['S3'] });
    }

    // Return as plain text (matches what toTextStreamResponse would produce)
    return new Response(generatedText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Chat API error:', error.message, error.stack);
    console.error('[chat] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err as object)));
    return new Response(
      JSON.stringify({
        error: 'Something went wrong. Please try again.',
        reply:
          'I apologize — I encountered an issue processing your request. Could you please try again?',
        // DIAGNOSTIC: Include error details temporarily
        _debug_message: error.message,
        _debug_name: error.name,
        _debug_stack: error.stack?.split('\n').slice(0, 5),
        _debug_openai_key_present: !!process.env.OPENAI_API_KEY,
        _debug_openai_key_length: process.env.OPENAI_API_KEY?.length ?? 0,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
