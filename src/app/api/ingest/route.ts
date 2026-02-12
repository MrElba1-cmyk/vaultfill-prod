import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ingestDocument } from '@/lib/ingest-engine';

export async function POST(req: NextRequest) {
  // 1. Auth check (Mission 7 - Clerk)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 2. Ingest: Chunking -> Embedding -> pgvector Storage (Mission 12)
    const ingestResult = await ingestDocument(buffer, file.type, file.name, userId);

    // 3. Persistent Record (Mission 11 - AuditRecord)
    const record = await prisma.auditRecord.create({
      data: {
        userId,
        score: 0, // Initial score, to be updated by background analysis
        findings: {
          filename: file.name,
          chunksStored: ingestResult.chunks,
          status: 'ingested',
          firstChunkPreview: ingestResult.firstChunk
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      status: 'queued',
      auditId: record.id,
      message: 'Artifact ingested and queued for deep analysis.'
    });
  } catch (error: any) {
    console.error('[API/Ingest] Error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
