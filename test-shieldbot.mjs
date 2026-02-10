/**
 * Shield Bot integration test — sends the 5-message conversation
 * and checks for all three bugs.
 */

const BASE_URL = 'http://localhost:3000';
const SESSION_ID = `test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const CONVERSATION = [
  'What are your MFA requirements?',
  'SOC 2',
  'How much does this cost?',
  'Can you help me with encryption at rest?',
  'Thanks',
];

const history = []; // {role, content}[]

async function sendMessage(text, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`MESSAGE ${index + 1}: "${text}"`);
  console.log('='.repeat(70));

  // Build messages array: history (last 9) + current
  const historyForApi = history.slice(-9).map(m => ({ role: m.role, content: m.content }));

  const body = {
    message: text,
    messages: historyForApi,
  };

  console.log(`[DEBUG] Sending ${historyForApi.length} history msgs + message field`);

  const start = Date.now();
  let response;
  try {
    response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vaultfill-session-id': SESSION_ID,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[CRASH] Fetch failed:`, err.message);
    return null;
  }

  const elapsed = Date.now() - start;
  console.log(`[DEBUG] Status: ${response.status} (${elapsed}ms)`);

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[ERROR] ${response.status}: ${errText}`);
    return null;
  }

  // Read the full response body (plain text stream from toTextStreamResponse)
  const fullText = await response.text();

  // Strip state machine tags for display
  const displayText = fullText.replace(/<!--\s*STATE:S\d\s*-->/g, '').trim();

  console.log(`\n[ASSISTANT RESPONSE]:`);
  console.log(displayText);
  console.log(`\n[DEBUG] Response length: ${fullText.length} chars`);

  // Record in history
  history.push({ role: 'user', content: text });
  history.push({ role: 'assistant', content: fullText });

  return { text: fullText, displayText, status: response.status };
}

async function runTest() {
  console.log('🛡️  SHIELD BOT INTEGRATION TEST');
  console.log(`Session: ${SESSION_ID}`);
  console.log(`Target: ${BASE_URL}`);
  console.log('');

  const results = [];
  for (let i = 0; i < CONVERSATION.length; i++) {
    const result = await sendMessage(CONVERSATION[i], i);
    results.push(result);

    if (!result) {
      console.error(`\n❌ FAILED: Bot crashed/errored on message ${i + 1}`);
    }
  }

  // ---- Assertions ----
  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }

  // No crashes
  check('No crashes (all 5 messages got responses)', results.every(r => r !== null));

  // Message 1 should answer MFA with substance
  const mfaResponse = results[0]?.displayText?.toLowerCase() || '';
  check(
    'MFA question answered with substance',
    mfaResponse.includes('mfa') || mfaResponse.includes('multi-factor') || mfaResponse.includes('authentication'),
  );

  // Message 2 (SOC 2) should NOT ask "what framework?" again
  const soc2Response = results[1]?.displayText?.toLowerCase() || '';
  check(
    'SOC 2 mention advances state (does not ask "what framework?")',
    !soc2Response.includes('what framework') && !soc2Response.includes('which framework'),
  );

  // SOC 2 response should contain substance about SOC 2
  check(
    'SOC 2 response contains substance',
    soc2Response.includes('soc') || soc2Response.includes('trust') || soc2Response.includes('compliance') || soc2Response.includes('audit'),
  );

  // Message 3 (pricing) should acknowledge pricing
  const pricingResponse = results[2]?.displayText?.toLowerCase() || '';
  check(
    'Pricing question addressed',
    pricingResponse.includes('pricing') || pricingResponse.includes('cost') || pricingResponse.includes('plan') || pricingResponse.includes('early access'),
  );

  // Message 4 (encryption) should give a real answer
  const encResponse = results[3]?.displayText?.toLowerCase() || '';
  check(
    'Encryption question answered with substance',
    encResponse.includes('encrypt') || encResponse.includes('aes') || encResponse.includes('at rest') || encResponse.includes('key management'),
  );

  // Message 5 (Thanks) should be graceful
  check('Thanks message handled gracefully', results[4] !== null && results[4].displayText.length > 5);

  // No duplicate questions across all responses
  const allResponses = results.map(r => r?.displayText?.toLowerCase() || '').join(' ');
  const frameworkAskCount = (allResponses.match(/what framework|which framework/g) || []).length;
  check('Never asks "what framework" more than once', frameworkAskCount <= 1);

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
