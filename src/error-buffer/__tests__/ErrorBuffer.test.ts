/**
 * Tests for the Error Buffer core engine.
 * Run with: npx tsx --test src/error-buffer/__tests__/ErrorBuffer.test.ts
 *   or: node --import tsx --test src/error-buffer/__tests__/ErrorBuffer.test.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorBuffer, resetErrorBuffer } from '../core/ErrorBuffer';

describe('ErrorBuffer', () => {
  let buffer: ErrorBuffer;

  beforeEach(() => {
    resetErrorBuffer();
    buffer = new ErrorBuffer({ notificationChannels: [] });
  });

  it('captures an error and returns a BufferedError', async () => {
    const err = new Error('Test failure');
    const result = await buffer.capture(err, { source: 'api/leads' }, 'medium');

    assert.ok(result.id);
    assert.equal(result.error.message, 'Test failure');
    assert.equal(result.context.source, 'api/leads');
    assert.equal(result.severity, 'medium');
    assert.equal(result.status, 'pending');
    assert.equal(result.retryCount, 0);
  });

  it('lists errors with filters', async () => {
    await buffer.capture(new Error('e1'), { source: 'api/leads' }, 'low');
    await buffer.capture(new Error('e2'), { source: 'api/knowledge' }, 'high');
    await buffer.capture(new Error('e3'), { source: 'api/leads' }, 'critical');

    const all = buffer.list();
    assert.equal(all.length, 3);

    const leadsOnly = buffer.list({ source: 'api/leads' });
    assert.equal(leadsOnly.length, 2);

    const highOnly = buffer.list({ severity: 'high' });
    assert.equal(highOnly.length, 1);
    assert.equal(highOnly[0].error.message, 'e2');
  });

  it('acknowledges an error', async () => {
    const entry = await buffer.capture(new Error('ack me'), { source: 'api/leads' });
    buffer.acknowledge(entry.id, 'Looking into it');

    const updated = buffer.get(entry.id);
    assert.equal(updated?.status, 'acknowledged');
    assert.equal(updated?.humanNotes, 'Looking into it');
  });

  it('dismisses an error', async () => {
    const entry = await buffer.capture(new Error('dismiss me'), { source: 'api/leads' });
    buffer.dismiss(entry.id, 'admin');

    const updated = buffer.get(entry.id);
    assert.equal(updated?.status, 'dismissed');
    assert.ok(updated?.resolvedAt);
    assert.equal(updated?.resolvedBy, 'admin');
  });

  it('retries with a registered handler', async () => {
    buffer.registerRetryHandler('api/leads', async (entry) => {
      if (entry.correctedInput?.name === 'fixed') {
        return { success: true, result: { id: 123 } };
      }
      return { success: false };
    });

    const entry = await buffer.capture(
      new Error('bad input'),
      { source: 'api/leads', inputData: { name: '' } }
    );

    // Retry without correction — fails
    const r1 = await buffer.retry(entry.id);
    assert.equal(r1.success, false);
    assert.equal(buffer.get(entry.id)?.retryCount, 1);

    // Retry with correction — succeeds
    const r2 = await buffer.retry(entry.id, { name: 'fixed' });
    assert.equal(r2.success, true);
    assert.equal(buffer.get(entry.id)?.status, 'resolved');
    assert.equal(buffer.get(entry.id)?.retryCount, 2);
  });

  it('returns correct stats', async () => {
    await buffer.capture(new Error('e1'), { source: 'api/leads' });
    const e2 = await buffer.capture(new Error('e2'), { source: 'api/leads' });
    buffer.dismiss(e2.id);

    const stats = buffer.stats();
    assert.equal(stats.pending, 1);
    assert.equal(stats.dismissed, 1);
  });

  it('evicts oldest when at capacity', async () => {
    const small = new ErrorBuffer({ maxBufferSize: 2, notificationChannels: [] });
    await small.capture(new Error('first'), { source: 'api/leads' });
    await small.capture(new Error('second'), { source: 'api/leads' });
    await small.capture(new Error('third'), { source: 'api/leads' });

    const all = small.list();
    assert.equal(all.length, 2);
    // 'first' should have been evicted
    assert.ok(all.every(e => e.error.message !== 'first'));
  });
});
