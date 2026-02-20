import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Architecture initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wissgttcnwxwibavratr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_W1_6Lv3JalEOrihvXM-hBw_mgKUGDSZ';
const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  throw new Error("FATAL: OPENAI_API_KEY is missing from environment.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function ingest() {
  console.log('Starting autonomous ingestion pipeline...');
  const targetDir = path.join(process.cwd(), 'data/sample-vault');
  
  if (!fs.existsSync(targetDir)) {
      console.log(`Directory ${targetDir} not found. Ensure documents exist.`);
      return;
  }

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    console.log(`Processing document: ${file}`);
    const text = fs.readFileSync(path.join(targetDir, file), 'utf-8');
    
    // Cognitive economy: basic paragraph chunking
    const chunks = text.split('\n\n').filter(c => c.trim().length > 20);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate mathematical vector
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });
      const embedding = embeddingResponse.data[0].embedding;

      // Write to Vault
      const { error } = await supabase.from('documents').insert({
        content: chunk,
        metadata: { source: file, chunk_index: i },
        embedding: embedding,
      });

      if (error) {
          console.error(`Failed to insert chunk ${i} of ${file}:`, error.message);
      }
    }
    console.log(`Successfully ingested ${chunks.length} chunks for ${file}`);
  }
  console.log('Ingestion sequence complete. Vector brain is active.');
}

ingest().catch(console.error);
