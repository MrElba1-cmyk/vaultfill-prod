import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Burn & Switch Protocol (Hybrid Intelligence Core)
 *
 * Routing rules:
 * - Chat / audit logic → Anthropic (quality)
 * - Vision/OCR → OpenAI (burn vision credits)
 * - Background ingestion / long-context → Google (burn long-context credits)
 *
 * IMPORTANT: We fail-safe.
 * If a provider API key is missing at runtime, we fall back to OpenAI.
 */

const openaiProvider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropicProvider = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const googleProvider = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

function hasKey(v?: string) {
  return !!v && v.trim().length > 10;
}

/** Primary model for /api/chat */
export const chatModel = (() => {
  if (hasKey(process.env.ANTHROPIC_API_KEY)) {
    // Claude Sonnet (quality)
    return anthropicProvider('claude-3-5-sonnet-latest');
  }
  // Fail-safe fallback
  return openaiProvider('gpt-4o-mini');
})();

/** Vision/OCR model (used by evidence pipeline where applicable) */
export const visionModel = openaiProvider('gpt-4o');

/** Background ingestion / long-context model (not yet wired into embeddings) */
export const ingestionModel = (() => {
  if (hasKey(process.env.GOOGLE_API_KEY)) {
    return googleProvider('gemini-1.5-pro');
  }
  return openaiProvider('gpt-4o-mini');
})();
