import { prisma } from '@/lib/prisma';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { parseFileToText } from './file-parser';
import fs from 'node:fs/promises';
import path from 'node:path';

// Re-use chunking logic from embeddings.ts but exported/standalone
export function splitIntoChunks(text: string, maxChars = 800, overlap = 150): string[] {
  const clean = text.trim();
  if (!clean) return [];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars);
    out.push(clean.slice(i, end));
    if (end === clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return out;
}

export async function ingestDocument(buffer: Buffer, mimeType: string, filename: string, userId: string) {
  console.log(`[Ingest] Starting ingestion for ${filename} (user: ${userId})`);
  
  // 1. Parse to text
  const text = await parseFileToText(buffer, mimeType);
  if (!text || text.length < 50) {
    throw new Error('Parsed text is too short or empty.');
  }

  // 2. Chunk
  const chunks = splitIntoChunks(text);
  console.log(`[Ingest] Created ${chunks.length} chunks`);

  // 3. Embed
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks,
  });

  // 4. Store in pgvector (Prisma DocumentSection model)
  const sourceId = `${userId}/${filename}/${Date.now()}`;
  
  // Batch insert via raw SQL because Prisma doesn't support vector type natively for creates yet
  // We use the 'vector' extension in Supabase
  for (let i = 0; i < chunks.length; i++) {
    const id = `${sourceId}-${i}`;
    const content = chunks[i];
    const embedding = embeddings[i];
    const metadata = JSON.stringify({ userId, filename, chunkIndex: i });

    await prisma.$executeRaw`
      INSERT INTO "DocumentSection" (id, content, embedding, metadata, source)
      VALUES (
        ${id}, 
        ${content}, 
        ${embedding}::vector, 
        ${metadata}::jsonb, 
        ${filename}
      )
      ON CONFLICT (id) DO UPDATE SET 
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata;
    `;
  }

  console.log(`[Ingest] Successfully stored ${chunks.length} embeddings for ${filename}`);
  return { chunks: chunks.length, firstChunk: chunks[0].slice(0, 100) };
}
