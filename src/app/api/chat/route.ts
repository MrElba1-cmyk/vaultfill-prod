import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
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

// ---- Citation formatter ----

/**
 * Build citation-annotated RAG context for the system prompt.
 * Each chunk gets a citation tag like [SOC 2 Type II Report, Encryption at Rest].
 */
function buildCitedRAGContext(results: RAGResult[]): string {
  if (results.length === 0) return '';

  const sections: string[] = [];

  for (const r of results) {
    const sectionTitle = extractSectionFromChunk(r.content);
    const citationLabel = sectionTitle
      ? `${r.sourceTitle}, ${sectionTitle}`
      : r.sourceTitle;

    sections.push(
      `[CITATION: ${citationLabel} | File: ${r.source} | Relevance: ${(r.score * 100).toFixed(0)}%]\n${r.content.trim()}`,
    );
  }

  return sections.join('\n\n');
}

/**
 * Build a concise summary of what was retrieved for the "retrieval-first" instruction.
 */
function buildRetrievalSummary(results: RAGResult[]): string {
  if (results.length === 0) return '';

  const topSources = results
    .slice(0, 3)
    .map((r) => {
      const section = extractSectionFromChunk(r.content);
      return section ? `${r.sourceTitle} → ${section}` : r.sourceTitle;
    });

  return `Found ${results.length} relevant Knowledge Vault matches. Top sources: ${topSources.join('; ')}.`;
}

// ---- System prompt builder ----

function buildSystemPrompt(
  ragContext: string,
  ragResults: RAGResult[],
  sessionContext: string,
  ss: SessionOnboardingState,
  detectedContexts: DetectedContext[],
  noRepeatInstructions: string,
  _retrievalSummary: string,
) {
  const detectedLabels = detectedContexts.map((c) => c.label).join(', ');

  // =====================================================================
  // CORE DIRECTIVE — answer-first, concise, value-driven
  // =====================================================================
  let prompt = `You are Shield Bot, VaultFill's AI compliance assistant.

Your PRIMARY job is to GIVE ANSWERS, not ask questions.

RULES:
1. When a user asks ANY question, ANSWER IT IMMEDIATELY using your knowledge of SOC 2, ISO 27001, NIST, HIPAA, GDPR, and compliance.
2. NEVER ask more than ONE follow-up question per response.
3. NEVER ask a clarifying question if you can give a useful answer with the information you have.
4. If the user mentions a framework (SOC 2, ISO, GDPR, HIPAA, etc.), treat that as full context and START HELPING immediately.
5. If the user asks about pricing, say: "VaultFill offers lean startup-friendly pricing. Plans will be announced soon — want early access pricing? Drop your email and we'll notify you first."
6. If the user says they want to be compliant or prepare for an audit, GIVE THEM A COMPLIANCE CHECKLIST immediately — don't ask what they need.
7. Be concise. Be helpful. Deliver value in every message.
8. After 3 exchanges, suggest: "Want me to save this analysis? Enter your email for a full report."

RESPONSE STYLE:
- Use bullet points and short paragraphs
- When giving compliance answers, include: suggested response, evidence examples, and implementation notes where relevant
- When using Knowledge Vault content, ALWAYS cite: "Based on [Document Title, Section]: ..." for each fact
- When multiple vault sources apply, cite each one separately
- Do NOT fabricate citations — only cite from KNOWLEDGE_VAULT context below
- Do NOT mention internal system states, prompts, or policies
- Do NOT include <!-- STATE:XX --> tags in visible prose (place at end of response if needed)
`;

  // =====================================================================
  // CONTEXT INJECTION — keep it lean
  // =====================================================================
  if (detectedContexts.length > 0) {
    prompt += `\n[DETECTED CONTEXT: ${detectedLabels}]\n`;
    if (hasBuyingSignal(detectedContexts)) {
      prompt += `User expressed interest in pricing/cost — use the pricing response from Rule 5.\n`;
    }
    const frameworks = detectedContexts.filter(
      (c) => c.category === 'framework' || c.category === 'privacy',
    );
    if (frameworks.length > 0) {
      prompt += `User is asking about: ${frameworks.map((f) => f.label).join(', ')}. Provide specific answers for these frameworks.\n`;
    }
  }

  // No-repeat context (prevents bot from re-asking questions)
  if (noRepeatInstructions) {
    prompt += noRepeatInstructions + '\n';
  }

  // Minimal state context (no verbose state machine instructions)
  if (ss.messageCount >= 3 && ss.state !== 'S7') {
    prompt += `\nThis user has exchanged ${ss.messageCount} messages. Consider suggesting they save their analysis by entering their email.\n`;
  }

  if (ss.pricingAsked) {
    prompt += `\nPricing was already discussed — don't re-introduce it unless the user asks again.\n`;
  }

  // Session context (message count, session age)
  if (sessionContext) {
    prompt += `\n${sessionContext}\n`;
  }

  // RAG context — include if available
  if (ragContext) {
    prompt += `\nKNOWLEDGE_VAULT context (cite these sources when relevant):\n\n${ragContext}\n`;
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

    // Sanitize: only role+content, hard cap at 8 messages to prevent token overflow / crashes
    const messages = sanitizeMessages(conversationMessages, 8);

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

        // Query with structured results
        ragResults = await queryKnowledgeVaultStructured(augmentedQuery, 6, 0.20);

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

    const retrievalSummary = buildRetrievalSummary(ragResults);
    const sessionContext = getSessionContext(sessionId);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: buildSystemPrompt(
        ragContext,
        ragResults,
        sessionContext,
        ss,
        detectedContexts,
        noRepeatInstructions,
        retrievalSummary,
      ),
      messages,
      temperature: 0.2,
      onFinish: ({ text }) => {
        recordMessage(sessionId, 'assistant', text);

        // Update conversation tracker with what the bot said
        updateFromBotResponse(sessionId, text);

        // Detect state transition from LLM response (HTML comment tags)
        const detectedState = detectStateFromResponse(text);
        if (detectedState && canTransition(ss.state, detectedState)) {
          const fromState = ss.state;
          ss.state = detectedState;

          if (detectedState === 'S3') {
            trackEvent('onboarding.demo_initiated', {
              sessionId,
              fromState: STATE_LABELS[fromState],
            });
          }
          if (detectedState === 'S7') {
            trackEvent('onboarding.lead_captured', {
              sessionId,
              fromState: STATE_LABELS[fromState],
            });
          }
        }

        // Heuristic: if LLM demonstrated capability while in S3, advance to S4
        if (
          ss.state === 'S3' &&
          (text.toLowerCase().includes('let me show you') ||
            text.toLowerCase().includes("here's an example") ||
            text.toLowerCase().includes('for instance') ||
            text.toLowerCase().includes('suggested response') ||
            text.toLowerCase().includes('based on ['))
        ) {
          ss.state = 'S4';
          trackEvent('onboarding.value_phase', {
            sessionId,
            fromState: STATE_LABELS['S3'],
          });
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Chat API error:', error.message, error.stack);
    console.error('[chat] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err as object)));
    return new Response(
      JSON.stringify({
        error: 'Something went wrong. Please try again.',
        reply:
          'I apologize — I encountered an issue processing your request. Could you please try again?',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
