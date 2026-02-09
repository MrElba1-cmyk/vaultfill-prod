/**
 * API routes for the Error Buffer dashboard.
 * Provides endpoints to list, acknowledge, retry, and dismiss errors.
 * 
 * Mount at: /api/error-buffer/*
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorBuffer } from '../core/ErrorBuffer';
import { ErrorSeverity, ErrorStatus } from '../core/types';

/** GET /api/error-buffer — List errors with optional filters */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const buffer = getErrorBuffer();
  const url = new URL(req.url);
  
  const filter = {
    status: url.searchParams.get('status') as ErrorStatus | undefined,
    source: url.searchParams.get('source') || undefined,
    severity: url.searchParams.get('severity') as ErrorSeverity | undefined,
  };

  const errors = buffer.list(filter);
  const stats = buffer.stats();

  return NextResponse.json({ errors, stats, total: errors.length });
}

/** POST /api/error-buffer/:id/acknowledge */
export async function acknowledgeError(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const buffer = getErrorBuffer();
  const body = await req.json().catch(() => ({}));
  
  try {
    buffer.acknowledge(params.id, body.notes);
    return NextResponse.json({ success: true, error: buffer.get(params.id) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

/** POST /api/error-buffer/:id/retry */
export async function retryError(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const buffer = getErrorBuffer();
  const body = await req.json().catch(() => ({}));

  try {
    const result = await buffer.retry(params.id, body.correctedInput);
    return NextResponse.json({ success: result.success, result: result.result, error: buffer.get(params.id) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** POST /api/error-buffer/:id/dismiss */
export async function dismissError(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const buffer = getErrorBuffer();
  const body = await req.json().catch(() => ({}));

  try {
    buffer.dismiss(params.id, body.resolvedBy);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
