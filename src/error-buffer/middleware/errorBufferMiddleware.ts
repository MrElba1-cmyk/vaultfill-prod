/**
 * Express/Next.js API middleware for automatic error capture.
 * Wraps route handlers to catch errors and buffer them for HITL review.
 * 
 * Integration points:
 *   - /api/leads  → source: 'api/leads'
 *   - /api/knowledge → source: 'api/knowledge'
 */

import { NextRequest, NextResponse } from 'next/server';
import { getErrorBuffer } from '../core/ErrorBuffer';
import { ErrorContext, ErrorSeverity, ErrorSource } from '../core/types';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Wraps a Next.js API route handler with error buffer capture.
 */
export function withErrorBuffer(
  handler: RouteHandler,
  source: ErrorSource,
  severity: ErrorSeverity = 'medium'
): RouteHandler {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Extract context from request
      let inputData: Record<string, unknown> = {};
      try {
        const cloned = req.clone();
        inputData = await cloned.json();
      } catch {
        // Body may not be JSON
        inputData = { url: req.url, method: req.method };
      }

      const context: ErrorContext = {
        source,
        inputData,
        userId: req.headers.get('x-user-id') || undefined,
        metadata: {
          url: req.url,
          method: req.method,
          userAgent: req.headers.get('user-agent'),
        },
      };

      const buffer = getErrorBuffer();
      const buffered = await buffer.capture(err, context, severity);

      return NextResponse.json(
        {
          error: 'Processing failed — captured for review',
          errorId: buffered.id,
          status: 'buffered',
        },
        { status: 503 }
      );
    }
  };
}

/**
 * Express-style middleware (if using Express instead of Next.js).
 */
export function expressErrorBuffer(source: ErrorSource, severity: ErrorSeverity = 'medium') {
  return (err: Error, req: any, res: any, next: any) => {
    const buffer = getErrorBuffer();
    const context: ErrorContext = {
      source,
      inputData: req.body,
      userId: req.headers?.['x-user-id'] || req.user?.id,
      metadata: { url: req.originalUrl, method: req.method },
    };

    buffer.capture(err, context, severity).then(buffered => {
      res.status(503).json({
        error: 'Processing failed — captured for review',
        errorId: buffered.id,
        status: 'buffered',
      });
    }).catch(() => {
      res.status(500).json({ error: 'Internal error' });
    });
  };
}
