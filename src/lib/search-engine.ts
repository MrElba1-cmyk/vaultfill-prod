import { prisma } from './prisma';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

export async function searchVault(query: string, userId: string, limit = 5) {
  // 1. Embed query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // 2. Search via pgvector
  // Filter by metadata -> userId using jsonb containment or equality
  const results = await prisma.$queryRaw`
    SELECT id, content, source, (embedding <=> ${embedding}::vector) as distance
    FROM "DocumentSection"
    WHERE metadata->>'userId' = ${userId}
    ORDER BY distance ASC
    LIMIT ${limit}
  `;

  return results;
}
