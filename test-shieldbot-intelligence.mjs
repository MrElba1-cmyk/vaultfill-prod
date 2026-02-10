/**
 * Shield Bot Intelligence Test — Phase 1
 *
 * Tests:
 * 1. Retrieval-first behavior (answers from Knowledge Vault with citations)
 * 2. Framework detection (SOC 2, ISO, GDPR, encryption, MFA, pricing)
 * 3. No repeated questions (conversation tracker)
 * 4. Citation format (clear source attribution)
 */

import 'dotenv/config';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SESSION_ID = `test-intelligence-${Date.now()}`;

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

async function sendMessage(messages, currentMessage) {
  const allMessages = [
    ...messages,
    { role: 'user', content: currentMessage },
  ];

  const resp = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vaultfill-session-id': SESSION_ID,
    },
    body: JSON.stringify({
      messages: allMessages,
      message: currentMessage,
    }),
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  }

  // Read streaming response
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  return fullText;
}

function checkCitations(response) {
  const citationPatterns = [
    /Based on \[.+?\]/i,
    /\[SOC 2 Type II Report.*?\]/i,
    /\[ISO 27001.*?\]/i,
    /\[Global Privacy Policy.*?\]/i,
  ];

  const found = citationPatterns.filter((p) => p.test(response));
  return found.length > 0;
}

function checkNoDuplicateQuestions(prevResponse, currentResponse) {
  // Extract questions from both responses
  const extractQuestions = (text) => {
    return text
      .split(/[.!?]\s/)
      .filter((s) => s.includes('?'))
      .map((s) => s.trim().toLowerCase());
  };

  const prevQs = extractQuestions(prevResponse);
  const currQs = extractQuestions(currentResponse);

  // Check for semantic overlap
  for (const pq of prevQs) {
    for (const cq of currQs) {
      // Simple word overlap check
      const pWords = new Set(pq.split(/\s+/));
      const cWords = new Set(cq.split(/\s+/));
      const intersection = [...pWords].filter((w) => cWords.has(w));
      if (intersection.length > 4) {
        return { hasDuplicate: true, prev: pq, curr: cq };
      }
    }
  }
  return { hasDuplicate: false };
}

async function runTest() {
  console.log(`\n${BOLD}${'═'.repeat(70)}${RESET}`);
  console.log(
    `${BOLD}${CYAN}  🛡️  Shield Bot Intelligence Test — Phase 1${RESET}`,
  );
  console.log(`${BOLD}${'═'.repeat(70)}${RESET}\n`);
  console.log(`${DIM}Session: ${SESSION_ID}${RESET}`);
  console.log(`${DIM}Target: ${BASE_URL}${RESET}\n`);

  const conversationHistory = [];
  const results = { pass: 0, fail: 0, tests: [] };

  // ─────────────────────────────────────────────────────────
  // TEST 1: SOC 2 Framework Detection + Retrieval-First + Citations
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 1: SOC 2 Framework Detection + Retrieval-First ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "We need help with SOC 2 Type II — specifically around logical access controls"\n`);

  const msg1 = 'We need help with SOC 2 Type II — specifically around logical access controls';
  const resp1 = await sendMessage(conversationHistory, msg1);
  conversationHistory.push({ role: 'user', content: msg1 });
  conversationHistory.push({ role: 'assistant', content: resp1 });

  console.log(`${CYAN}Bot:${RESET} ${resp1}\n`);

  // Checks
  const t1_hasCitations = checkCitations(resp1);
  const t1_mentionsAccess = /access|provisioning|least privilege|rbac/i.test(resp1);
  const t1_doesNotAskFramework = !/what (framework|standard|compliance).*(looking|working|need)/i.test(resp1);
  const t1_answersFirst =
    resp1.indexOf('?') === -1 || resp1.indexOf('?') > resp1.length * 0.5; // Questions should come after substance

  console.log(`  ${t1_hasCitations ? '✅' : '❌'} Has citations from Knowledge Vault`);
  console.log(`  ${t1_mentionsAccess ? '✅' : '❌'} Mentions access control content`);
  console.log(`  ${t1_doesNotAskFramework ? '✅' : '❌'} Does NOT ask "what framework?" (already provided)`);
  console.log(`  ${t1_answersFirst ? '✅' : '❌'} Provides substantive answer before asking questions`);

  [t1_hasCitations, t1_mentionsAccess, t1_doesNotAskFramework, t1_answersFirst].forEach((r) =>
    r ? results.pass++ : results.fail++,
  );
  console.log();

  // ─────────────────────────────────────────────────────────
  // TEST 2: Encryption Topic Detection + No Repeat
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 2: Encryption Topic Detection + No Repeat ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "What about encryption at rest? Do you cover that in your controls?"\n`);

  const msg2 = 'What about encryption at rest? Do you cover that in your controls?';
  const resp2 = await sendMessage(conversationHistory, msg2);
  conversationHistory.push({ role: 'user', content: msg2 });
  conversationHistory.push({ role: 'assistant', content: resp2 });

  console.log(`${CYAN}Bot:${RESET} ${resp2}\n`);

  const t2_mentionsEncryption = /encryption|AES|KMS|key management/i.test(resp2);
  const t2_hasCitations = checkCitations(resp2);
  const t2_noRepeatFramework = !/what (framework|standard|compliance).*(looking|working|need)/i.test(resp2);
  const t2_noRepeat = !checkNoDuplicateQuestions(resp1, resp2).hasDuplicate;

  console.log(`  ${t2_mentionsEncryption ? '✅' : '❌'} Covers encryption at rest`);
  console.log(`  ${t2_hasCitations ? '✅' : '❌'} Has citations`);
  console.log(`  ${t2_noRepeatFramework ? '✅' : '❌'} Does NOT re-ask framework question`);
  console.log(`  ${t2_noRepeat ? '✅' : '❌'} No duplicate questions from previous response`);

  [t2_mentionsEncryption, t2_hasCitations, t2_noRepeatFramework, t2_noRepeat].forEach((r) =>
    r ? results.pass++ : results.fail++,
  );
  console.log();

  // ─────────────────────────────────────────────────────────
  // TEST 3: MFA Topic Detection
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 3: MFA Topic Detection ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "How do you handle MFA requirements?"\n`);

  const msg3 = 'How do you handle MFA requirements?';
  const resp3 = await sendMessage(conversationHistory, msg3);
  conversationHistory.push({ role: 'user', content: msg3 });
  conversationHistory.push({ role: 'assistant', content: resp3 });

  console.log(`${CYAN}Bot:${RESET} ${resp3}\n`);

  const t3_mentionsMFA = /MFA|multi-factor|authenticator|security key/i.test(resp3);
  const t3_hasCitations = checkCitations(resp3);
  const t3_noRepeat = !checkNoDuplicateQuestions(resp2, resp3).hasDuplicate;

  console.log(`  ${t3_mentionsMFA ? '✅' : '❌'} Covers MFA requirements`);
  console.log(`  ${t3_hasCitations ? '✅' : '❌'} Has citations`);
  console.log(`  ${t3_noRepeat ? '✅' : '❌'} No duplicate questions`);

  [t3_mentionsMFA, t3_hasCitations, t3_noRepeat].forEach((r) =>
    r ? results.pass++ : results.fail++,
  );
  console.log();

  // ─────────────────────────────────────────────────────────
  // TEST 4: GDPR/Privacy Detection
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 4: GDPR / Privacy Detection ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "We also need to address GDPR data protection requirements"\n`);

  const msg4 = 'We also need to address GDPR data protection requirements';
  const resp4 = await sendMessage(conversationHistory, msg4);
  conversationHistory.push({ role: 'user', content: msg4 });
  conversationHistory.push({ role: 'assistant', content: resp4 });

  console.log(`${CYAN}Bot:${RESET} ${resp4}\n`);

  const t4_mentionsGDPR = /GDPR|data (protection|subject|retention)|privacy|lawful basis|consent/i.test(resp4);
  const t4_hasCitations = checkCitations(resp4);
  const t4_buildsOnContext = !/tell me (more|about).*what.*framework/i.test(resp4);

  console.log(`  ${t4_mentionsGDPR ? '✅' : '❌'} Covers GDPR/privacy content`);
  console.log(`  ${t4_hasCitations ? '✅' : '❌'} Has citations`);
  console.log(`  ${t4_buildsOnContext ? '✅' : '❌'} Builds on existing conversation (doesn't reset)`);

  [t4_mentionsGDPR, t4_hasCitations, t4_buildsOnContext].forEach((r) =>
    r ? results.pass++ : results.fail++,
  );
  console.log();

  // ─────────────────────────────────────────────────────────
  // TEST 5: Pricing / Buying Signal
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 5: Pricing / Buying Signal ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "How much does VaultFill cost?"\n`);

  const msg5 = 'How much does VaultFill cost?';
  const resp5 = await sendMessage(conversationHistory, msg5);
  conversationHistory.push({ role: 'user', content: msg5 });
  conversationHistory.push({ role: 'assistant', content: resp5 });

  console.log(`${CYAN}Bot:${RESET} ${resp5}\n`);

  const t5_addressesPricing = /pricing|price|cost|plan|early access|startup|lean/i.test(resp5);
  const t5_noReAskFramework = !/what (framework|standard)/i.test(resp5);

  console.log(`  ${t5_addressesPricing ? '✅' : '❌'} Addresses pricing question`);
  console.log(`  ${t5_noReAskFramework ? '✅' : '❌'} Does NOT re-ask framework question`);

  [t5_addressesPricing, t5_noReAskFramework].forEach((r) =>
    r ? results.pass++ : results.fail++,
  );
  console.log();

  // ─────────────────────────────────────────────────────────
  // TEST 6: ISO 27001 Detection (new framework mid-conversation)
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Test 6: ISO 27001 Detection (mid-conversation) ──${RESET}`);
  console.log(`${GREEN}User:${RESET} "What about ISO 27001 asset management requirements?"\n`);

  const msg6 = 'What about ISO 27001 asset management requirements?';
  const resp6 = await sendMessage(conversationHistory, msg6);
  conversationHistory.push({ role: 'user', content: msg6 });
  conversationHistory.push({ role: 'assistant', content: resp6 });

  console.log(`${CYAN}Bot:${RESET} ${resp6}\n`);

  const t6_mentionsISO = /ISO 27001|asset (management|inventory)|data classification|ISMS/i.test(resp6);
  const t6_hasCitations = checkCitations(resp6);

  console.log(`  ${t6_mentionsISO ? '✅' : '❌'} Covers ISO 27001 asset management`);
  console.log(`  ${t6_hasCitations ? '✅' : '❌'} Has citations`);

  [t6_mentionsISO, t6_hasCitations].forEach((r) => (r ? results.pass++ : results.fail++));
  console.log();

  // ─────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────
  console.log(`${BOLD}${'═'.repeat(70)}${RESET}`);
  console.log(
    `${BOLD}  Results: ${GREEN}${results.pass} passed${RESET}${BOLD}, ${results.fail > 0 ? RED : GREEN}${results.fail} failed${RESET}`,
  );
  console.log(
    `${BOLD}  Score: ${((results.pass / (results.pass + results.fail)) * 100).toFixed(0)}%${RESET}`,
  );
  console.log(`${BOLD}${'═'.repeat(70)}${RESET}\n`);

  if (results.fail > 0) {
    console.log(
      `${YELLOW}⚠ Some tests failed. This may be due to LLM non-determinism. Re-run if borderline.${RESET}\n`,
    );
  } else {
    console.log(`${GREEN}🎉 All intelligence tests passed!${RESET}\n`);
  }
}

runTest().catch((err) => {
  console.error(`${RED}Test failed:${RESET}`, err);
  process.exit(1);
});
