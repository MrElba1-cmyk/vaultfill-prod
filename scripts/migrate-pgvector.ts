#!/usr/bin/env npx tsx
/**
 * pgvector schema migration script
 * 
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/migrate-pgvector.ts
 * 
 * Creates:
 *   - vector extension
 *   - vault_embeddings table (id, source, content, embedding vector(1536))
 *   - IVFFlat index for cosine similarity
 */

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

async function migrate() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 2 });

  console.log('[migrate] Connecting to database...');

  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  console.log('[migrate] ✓ vector extension enabled');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vault_embeddings (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding vector(1536) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('[migrate] ✓ vault_embeddings table created');

  // Check row count before creating IVFFlat index (needs rows for training)
  const { rows } = await pool.query('SELECT COUNT(*) AS cnt FROM vault_embeddings');
  const count = parseInt(rows[0].cnt, 10);

  if (count >= 10) {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS vault_embeddings_cosine_idx
      ON vault_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)
    `);
    console.log('[migrate] ✓ IVFFlat cosine index created');
  } else {
    // Use HNSW index instead - doesn't require training data
    await pool.query(`
      CREATE INDEX IF NOT EXISTS vault_embeddings_hnsw_idx
      ON vault_embeddings USING hnsw (embedding vector_cosine_ops)
    `);
    console.log('[migrate] ✓ HNSW cosine index created (table has <10 rows, IVFFlat deferred)');
  }

  await pool.end();
  console.log('[migrate] Done ✓');
}

migrate().catch((err) => {
  console.error('[migrate] FAILED:', err.message);
  process.exit(1);
});
