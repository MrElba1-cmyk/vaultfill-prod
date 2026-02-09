import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Search for similar document sections using cosine distance.
 */
export async function searchSimilarSections(
  embedding: number[],
  limit = 5
): Promise<{ id: string; content: string; source: string; metadata: any; similarity: number }[]> {
  const vectorStr = `[${embedding.join(",")}]`;
  const results = await prisma.$queryRawUnsafe<
    { id: string; content: string; source: string; metadata: any; similarity: number }[]
  >(
    `SELECT id, content, source, metadata,
            1 - (embedding <=> $1::vector) as similarity
     FROM "DocumentSection"
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    vectorStr,
    limit
  );
  return results;
}
