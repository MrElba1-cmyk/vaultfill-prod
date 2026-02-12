import { prisma } from './src/lib/prisma';
import { ingestDocument } from './src/lib/ingest-engine';
import { searchVault } from './src/lib/search-engine';
import fs from 'node:fs/promises';
import path from 'node:path';

async function smokeTest() {
  const testUserId = 'zeus-smoke-test-user';
  const filePath = path.join(process.cwd(), 'public', 'security-policy.pdf');
  
  console.log('--- Mission 12 Smoke Test ---');
  
  try {
    const buffer = await fs.readFile(filePath);
    console.log('1. Uploading/Ingesting sample security policy...');
    const ingestResult = await ingestDocument(buffer, 'application/pdf', 'security-policy.pdf', testUserId);
    console.log('✅ Ingested:', ingestResult);

    console.log('2. Performing semantic search...');
    const searchResult = await searchVault('What is the RTO?', testUserId);
    console.log('✅ Search Results:', searchResult);

    if (Array.isArray(searchResult) && searchResult.length > 0) {
      console.log('🚀 SMOKE TEST SUCCESSFUL');
    } else {
      console.log('❌ SMOKE TEST FAILED: No search results returned');
    }
  } catch (error) {
    console.error('❌ SMOKE TEST ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

smokeTest();
