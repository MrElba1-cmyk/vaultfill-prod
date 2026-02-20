import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Architecture initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wissgttcnwxwibavratr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_W1_6Lv3JalEOrihvXM-hBw_mgKUGDSZ';
const geminiKey = process.env.GEMINI_API_KEY;

if (!geminiKey) {
  throw new Error("FATAL: GEMINI_API_KEY is missing from environment.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function runOutreach() {
  console.log("Initiating Closer Agent (Payload Persistence Patch)...");
  
  // Revert simulation targets to allow re-processing
  await supabase.from('leads').update({ status: 'new' }).eq('status', 'drafted');
  
  const { data: leads, error } = await supabase.from('leads').select('*').eq('status', 'new');
  if (error) throw error;
  
  if (!leads || leads.length === 0) {
    console.log("Queue empty. No new leads pending outreach.");
    return;
  }

  console.log(`Discovered ${leads.length} pending targets. Commencing generation and storage sequence...`);

  for (const lead of leads) {
    const targetName = lead.metadata?.name || 'Compliance Director';
    const targetTitle = lead.metadata?.title || 'Leadership';
    
    console.log(`Analyzing vector parameters for: ${lead.company_name}...`);
    
    const prompt = `You are an AI sales architect for VaultFill, an automated compliance engine. 
    Draft a concise, high-conversion cold email to ${targetName}, the ${targetTitle} at ${lead.company_name} located in ${lead.region}. 
    Focus on eliminating the manual overhead of SOC2 and Data Privacy compliance. 
    Maintain a highly professional, precision-driven tone. 
    The call to action must direct them to the live production environment for a real-time capability demonstration: https://vaultfill-v1-518054285285.us-central1.run.app`;

    try {
        const result = await model.generateContent(prompt);
        const draft = result.response.text();
        
        console.log(`Payload generated. Writing to Vault...`);

        // Structural Patch: Injecting payload into the new column
        await supabase.from('leads').update({ 
          status: 'drafted',
          draft_payload: draft 
        }).eq('id', lead.id);
        
    } catch (err) {
        console.error(`Generation failed for ${lead.company_name}:`, err);
    }
  }
  
  console.log("Outreach storage complete. Payloads are secured in the database.");
}

runOutreach().catch(console.error);
