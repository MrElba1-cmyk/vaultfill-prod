import { createOpenAI } from '@ai-sdk/openai';

/**
 * Hybrid Intelligence Core
 *
 * Switch between a local OpenAI-compatible provider (e.g., Ollama) and OpenAI cloud.
 *
 * ENV:
 * - USE_LOCAL_LLM="true" | "false"
 * - LOCAL_LLM_BASE_URL="http://localhost:11434/v1"
 * - LOCAL_LLM_MODEL="qwen3-coder:480b"
 * - LOCAL_LLM_API_KEY="ollama"
 * - OPENAI_API_KEY
 */

function boolEnv(v: string | undefined): boolean {
  return (v ?? '').toLowerCase() === 'true';
}

const useLocal = boolEnv(process.env.USE_LOCAL_LLM);

const localProvider = createOpenAI({
  baseURL: process.env.LOCAL_LLM_BASE_URL,
  apiKey: process.env.LOCAL_LLM_API_KEY || 'ollama',
});

const cloudProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Active model for chat completions.
 *
 * Notes:
 * - In production (Vercel), you typically want USE_LOCAL_LLM=false.
 * - If local env vars are missing, we fall back to cloud.
 */
export const activeModel = (() => {
  if (useLocal && process.env.LOCAL_LLM_BASE_URL && process.env.LOCAL_LLM_MODEL) {
    return localProvider(process.env.LOCAL_LLM_MODEL);
  }
  // Default cloud model
  return cloudProvider('gpt-4o-mini');
})();
