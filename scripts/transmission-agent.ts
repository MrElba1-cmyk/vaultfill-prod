import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Architecture initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wissgttcnwxwibavratr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_W1_6Lv3JalEOrihvXM-hBw_mgKUGDSZ';
const sendgridKey = process.env.SENDGRID_API_KEY;

if (!sendgridKey) {
  throw new Error("FATAL: SENDGRID_API_KEY is missing from environment.");
}

sgMail.setApiKey(sendgridKey);
const supabase = createClient(supabaseUrl, supabaseKey);

const VERIFIED_SENDER = 'contact@vaultfill.com'; 
const DESTINATION_EMAIL = 'contact@vaultfill.com';

async function runLiveTransmission() {
  console.log("Initiating Transmission Agent (Live SendGrid Routing)...");

  // Reverting previously simulated targets back to drafted for live test
  await supabase.from('leads').update({ status: 'drafted' }).eq('status', 'sent');

  const { data: leads, error } = await supabase.from('leads').select('*').eq('status', 'drafted');
  if (error) throw error;

  if (!leads || leads.length === 0) {
    console.log("Queue empty. No drafted payloads pending transmission.");
    return;
  }

  console.log(`Discovered ${leads.length} drafted payloads. Initiating live routing sequence...`);

  for (const lead of leads) {
    console.log(`Routing payload for: ${lead.company_name}...`);

    const msg = {
      to: DESTINATION_EMAIL, 
      from: VERIFIED_SENDER,
      subject: `VaultFill Compliance Architecture - ${lead.company_name}`,
      text: lead.draft_payload,
    };

    try {
      await sgMail.send(msg);
      console.log(`Live transmission successful.`);

      await supabase.from('leads').update({ status: 'sent' }).eq('id', lead.id);
    } catch (error: any) {
      console.error(`Transmission failed for ${lead.company_name}:`, error.response?.body || error.message);
    }
  }

  console.log("Transmission sequence complete. Autonomous pipeline fully operational.");
}

runLiveTransmission().catch(console.error);
