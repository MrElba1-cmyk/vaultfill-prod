'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getAuditHistory() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const records = await prisma.auditRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    // Only retrieve the data needed for display to minimize payload size
    select: {
      id: true,
      score: true,
      createdAt: true,
      findings: true, // Full findings needed for contradiction count
    },
  });

  // Process findings to count contradictions for display
  return records.map((record) => ({
    id: record.id,
    date: record.createdAt.toISOString(),
    score: record.score,
    // Assuming findings.rows exists and has a status property
    contradictions: (record.findings as any)?.rows?.filter((f: any) => f.status === 'REMEDIATION REQUIRED').length || 0,
  }));
}

export async function deleteAuditRecord(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await prisma.auditRecord.delete({
    where: { id, userId }, // Ensure user can only delete their own records
  });

  // Revalidate path for immediate UI update if this was a full page refresh.
  // This would typically be 'revalidatePath('/demo')' but we're making this a pure API server action.
  // A client-side fetch will re-trigger the data fetch after delete.
}
