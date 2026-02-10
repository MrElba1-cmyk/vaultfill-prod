#!/usr/bin/env node
/**
 * Shield Bot Evaluation & Anti-Hallucination Test Harness
 *
 * Runs 45 test prompts against the /api/chat endpoint and validates:
 *   1. Expected behavior (citation, fallback, rejection)
 *   2. Required content signals (domain-specific keywords)
 *   3. Citation accuracy (source file actually exists + content match)
 *   4. Anti-hallucination (forbidden patterns must NOT appear)
 *
 * Usage:
 *   node scripts/test-shieldbot-eval.mjs                       # Full suite against localhost:3000
 *   node scripts/test-shieldbot-eval.mjs --url https://...     # Custom endpoint
 *   node scripts/test-shieldbot-eval.mjs --category soc2       # Filter by category
 *   node scripts/test-shieldbot-eval.mjs --id SOC2-001         # Run single test
 *   node scripts/test-shieldbot-eval.mjs --concurrency 3       # Parallel requests
 *   node scripts/test-shieldbot-eval.mjs --json                # JSON output (for CI)
 *   node scripts/test-shieldbot-eval.mjs --verbose             # Show full responses
 */

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI Args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
const hasFlag = (name) => args.includes(`--${name}`);

const BASE_URL   = getArg('url') || process.env.SHIELDBOT_URL || 'http://localhost:3000';
const CATEGORY   = getArg('category');
const SINGLE_ID  = getArg('id');
const CONCURRENCY = parseInt(getArg('concurrency') || '1', 10);
const JSON_OUT   = hasFlag('json');
const VERBOSE    = hasFlag('verbose');
const TIMEOUT_MS = parseInt(getArg('timeout') || '30000', 10);

// ── Colors ───────────────────────────────────────────────────────────────────

const C = JSON_OUT ? { R: '', G: '', Y: '', B: '', D: '', BD: '', RST: '' } : {
  R: '\x1b[31m', G: '\x1b[32m', Y: '\x1b[33m', B: '\x1b[36m',
  D: '\x1b[2m', BD: '\x1b[1m', RST: '\x1b[0m',
};

// ── Load Test Fixtures ───────────────────────────────────────────────────────

const fixtureRaw = await readFile(join(__dirname, '..', 'tests', 'eval-prompts.json'), 'utf8');
const fixture = JSON.parse(fixtureRaw);

let prompts = fixture.prompts;
if (SINGLE_ID) prompts = prompts.filter(p => p.id === SINGLE_ID);
else if (CATEGORY) prompts = prompts.filter(p => p.category === CATEGORY);

if (prompts.length === 0) {
  console.error(`No prompts matched filter (category=${CATEGORY}, id=${SINGLE_ID})`);
  process.exit(1);
}

// ── Load Vault Sources (for citation verification) ───────────────────────────

const VAULT_DIR = join(__dirname, '..', 'data', 'sample-vault');
const vaultFiles = {};

async function loadVault() {
  const { readdir } = await import('node:fs/promises');
  try {
    const entries = await readdir(VAULT_DIR);
    for (const entry of entries) {
      if (entry.endsWith('.md') || entry.endsWith('.txt')) {
        vaultFiles[entry] = await readFile(join(VAULT_DIR, entry), 'utf8');
      }
    }
  } catch (e) {
    console.warn(`${C.Y}⚠ Could not load vault files from ${VAULT_DIR}: ${e.message}${C.RST}`);
  }
}

await loadVault();

// ── API Caller ───────────────────────────────────────────────────────────────

async function sendPrompt(prompt) {
  const sessionId = `eval-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vaultfill-session-id': sessionId,
      },
      body: JSON.stringify({ message: prompt, messages: [] }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await resp.text();
    return { status: resp.status, text, error: null };
  } catch (e) {
    clearTimeout(timer);
    return { status: 0, text: '', error: e.message };
  }
}

// ── Assertion Engine ─────────────────────────────────────────────────────────

/**
 * Test whether a response matches a pipe-delimited signal pattern.
 * E.g., "SOC 2|SOC2" means either "SOC 2" or "SOC2" must appear.
 */
function matchesSignal(response, signalPattern) {
  const alternatives = signalPattern.split('|');
  const lower = response.toLowerCase();
  return alternatives.some(alt => lower.includes(alt.toLowerCase()));
}

/**
 * Extract citations from response text.
 * Looks for patterns like "Based on [SOC 2 Type II Report, Logical Access]:"
 * or inline "[SOC 2 Type II Report]" references.
 */
function extractCitations(response) {
  const citations = [];

  // Pattern 1: "Based on [Title, Section]: ..."
  const basedOnPattern = /Based on \[([^\]]+)\]/gi;
  let match;
  while ((match = basedOnPattern.exec(response)) !== null) {
    citations.push({ raw: match[0], content: match[1], type: 'based_on' });
  }

  // Pattern 2: Inline "[Title]" or "[Title, Section]"
  const inlinePattern = /\[([^\]]{5,})\]/g;
  while ((match = inlinePattern.exec(response)) !== null) {
    // Filter out markdown links like [text](url) and common false positives
    if (!match[0].includes('](') && !match[1].startsWith('http')) {
      // Avoid duplicates from Pattern 1
      if (!citations.some(c => c.content === match[1])) {
        citations.push({ raw: match[0], content: match[1], type: 'inline' });
      }
    }
  }

  return citations;
}

/**
 * Verify that a citation references a real vault source and that the vault
 * source actually contains content related to the citation claim.
 */
function verifyCitationAccuracy(citation, requiredSource, citationMustContain) {
  const result = { valid: true, issues: [] };

  // Map common citation labels back to vault filenames
  const LABEL_TO_FILE = {
    'SOC 2 Type II Report':           'SOC2_Type2_Report_v2.md',
    'SOC 2':                          'SOC2_Type2_Report_v2.md',
    'ISO 27001':                      'ISO27001_Policy.md',
    'ISO 27001 Information Security Policy': 'ISO27001_Policy.md',
    'Global Privacy Policy':          'Global_Privacy_Policy.md',
    'Privacy Policy':                 'Global_Privacy_Policy.md',
    'FAQ':                            'FAQ.md',
    'VaultFill FAQ':                  'FAQ.md',
  };

  const citationText = citation.content;

  // Step 1: Identify which vault file this citation refers to
  let matchedFile = null;
  for (const [label, file] of Object.entries(LABEL_TO_FILE)) {
    if (citationText.toLowerCase().includes(label.toLowerCase())) {
      matchedFile = file;
      break;
    }
  }

  if (!matchedFile) {
    // Citation doesn't map to any known vault file
    result.issues.push(`Citation "${citationText}" does not map to a known vault file`);
    result.valid = false;
    return result;
  }

  // Step 2: Check the vault file actually exists
  if (!vaultFiles[matchedFile]) {
    result.issues.push(`Cited file "${matchedFile}" not found in vault`);
    result.valid = false;
    return result;
  }

  // Step 3: If a specific source is required, verify it matches
  if (requiredSource && matchedFile !== requiredSource) {
    result.issues.push(
      `Citation references "${matchedFile}" but expected "${requiredSource}"`
    );
    result.valid = false;
  }

  // Step 4: Verify the cited section/topic actually exists in the vault file
  // Extract section name from citation (e.g., "SOC 2 Type II Report, Logical Access" → "Logical Access")
  const parts = citationText.split(',').map(s => s.trim());
  if (parts.length > 1) {
    const sectionHint = parts.slice(1).join(' ').toLowerCase();
    const vaultContent = vaultFiles[matchedFile].toLowerCase();

    // Check that the section or a close keyword actually appears in the vault
    const sectionWords = sectionHint.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = sectionWords.filter(w => vaultContent.includes(w));
    const matchRatio = sectionWords.length > 0 ? matchedWords.length / sectionWords.length : 1;

    if (matchRatio < 0.5) {
      result.issues.push(
        `Cited section "${parts.slice(1).join(', ')}" — only ${matchedWords.length}/${sectionWords.length} key words found in vault file`
      );
      result.valid = false;
    }
  }

  // Step 5: Check citationMustContain (label-level checks)
  for (const required of (citationMustContain || [])) {
    if (!citationText.toLowerCase().includes(required.toLowerCase())) {
      result.issues.push(`Citation missing required label: "${required}"`);
      result.valid = false;
    }
  }

  return result;
}

// ── Run Single Test ──────────────────────────────────────────────────────────

async function runTest(testCase) {
  const { id, category, prompt, expectedBehavior, requiredSignals,
          requiredCitationSource, citationMustContain, mustNotAppear } = testCase;

  const assertions = [];
  const addResult = (name, pass, detail) => assertions.push({ name, pass, detail });

  // Send the prompt
  const { status, text: response, error } = await sendPrompt(prompt);

  if (error) {
    addResult('API reachable', false, `Request failed: ${error}`);
    return { id, category, prompt, assertions, response: '', pass: false };
  }

  addResult('HTTP 200', status === 200, `Got HTTP ${status}`);

  if (status !== 200) {
    return { id, category, prompt, assertions, response, pass: false };
  }

  addResult('Non-empty response', response.length > 0, `${response.length} chars`);

  // ── Behavior-specific checks ───────────────────────────────────────────

  const lower = response.toLowerCase();
  const FALLBACK_PHRASE = 'security clearance';

  if (expectedBehavior === 'answer_with_citation') {
    // Should NOT trigger the security-clearance fallback
    const hasFallback = lower.includes(FALLBACK_PHRASE);
    addResult(
      'No fallback triggered',
      !hasFallback,
      hasFallback ? 'Unexpectedly got security-clearance fallback' : 'OK — bot answered substantively'
    );

    // Should have at least one citation
    const citations = extractCitations(response);
    addResult(
      'Has citation(s)',
      citations.length > 0,
      citations.length > 0
        ? `Found ${citations.length}: ${citations.map(c => c.raw).join('; ')}`
        : 'No citations found in response'
    );

    // Verify citation accuracy against vault
    if (citations.length > 0) {
      for (const cit of citations) {
        const accuracy = verifyCitationAccuracy(cit, requiredCitationSource, citationMustContain);
        addResult(
          `Citation accurate: "${cit.content.slice(0, 50)}..."`,
          accuracy.valid,
          accuracy.valid ? 'Vault verification passed' : accuracy.issues.join('; ')
        );
      }
    }
  }

  if (expectedBehavior === 'security_clearance_fallback') {
    const hasFallback = lower.includes(FALLBACK_PHRASE);
    addResult(
      'Security-clearance fallback triggered',
      hasFallback,
      hasFallback ? 'Correctly returned fallback' : `Missing fallback — got: "${response.slice(0, 120)}..."`
    );

    // Should NOT have fabricated citations
    const citations = extractCitations(response);
    addResult(
      'No fabricated citations',
      citations.length === 0,
      citations.length === 0 ? 'OK — no citations in fallback' : `Found ${citations.length} citations in what should be a fallback!`
    );
  }

  if (expectedBehavior === 'reject_or_deflect') {
    // For adversarial prompts: we just check the mustNotAppear list strictly
    // The bot can answer however it likes as long as it doesn't leak forbidden content
    addResult(
      'Did not crash',
      response.length > 0,
      `Response: ${response.length} chars`
    );
  }

  if (expectedBehavior === 'greeting_or_fallback') {
    // Simple greetings — should not produce citations or fallback
    const hasFallback = lower.includes(FALLBACK_PHRASE);
    const citations = extractCitations(response);
    addResult(
      'Natural response (no citation, no fallback)',
      !hasFallback || citations.length === 0,
      hasFallback ? 'Got fallback (acceptable)' : citations.length > 0 ? 'Got citation (unexpected)' : 'Natural response'
    );
  }

  // ── Required signals ───────────────────────────────────────────────────

  for (const signal of (requiredSignals || [])) {
    const matched = matchesSignal(response, signal);
    addResult(
      `Contains signal: ${signal}`,
      matched,
      matched ? 'Present' : 'Missing from response'
    );
  }

  // ── Anti-hallucination: must NOT appear ────────────────────────────────

  for (const forbidden of (mustNotAppear || [])) {
    const found = lower.includes(forbidden.toLowerCase());
    addResult(
      `Must NOT contain: "${forbidden}"`,
      !found,
      found ? `⚠ HALLUCINATION DETECTED: "${forbidden}" found in response` : 'OK — absent'
    );
  }

  // ── Overall pass/fail ──────────────────────────────────────────────────

  const pass = assertions.every(a => a.pass);
  return { id, category, prompt, assertions, response, pass };
}

// ── Concurrency Runner ───────────────────────────────────────────────────────

async function runBatch(tests, concurrency) {
  const results = [];
  const queue = [...tests];

  async function worker() {
    while (queue.length > 0) {
      const test = queue.shift();
      if (!test) break;
      const result = await runTest(test);
      results.push(result);

      // Progress indicator (non-JSON mode)
      if (!JSON_OUT) {
        const icon = result.pass ? `${C.G}✅` : `${C.R}❌`;
        const failCount = result.assertions.filter(a => !a.pass).length;
        const suffix = result.pass ? '' : ` (${failCount} assertion${failCount > 1 ? 's' : ''} failed)`;
        console.log(`${icon} ${C.BD}${result.id}${C.RST} ${C.D}${result.category}${C.RST}${suffix}`);

        if (VERBOSE || !result.pass) {
          console.log(`   ${C.D}Prompt: "${result.prompt.slice(0, 80)}${result.prompt.length > 80 ? '...' : ''}"${C.RST}`);
          for (const a of result.assertions) {
            if (!a.pass || VERBOSE) {
              const mark = a.pass ? `${C.G}✓` : `${C.R}✗`;
              console.log(`   ${mark} ${a.name}${C.RST} ${C.D}— ${a.detail}${C.RST}`);
            }
          }
          if (VERBOSE && result.response) {
            console.log(`   ${C.B}Response (first 200 chars):${C.RST} ${result.response.slice(0, 200)}${result.response.length > 200 ? '...' : ''}`);
          }
          console.log();
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tests.length) }, () => worker());
  await Promise.all(workers);

  // Sort results back into fixture order
  const idOrder = tests.map(t => t.id);
  results.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));

  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (!JSON_OUT) {
  console.log(`\n${C.BD}${'═'.repeat(70)}${C.RST}`);
  console.log(`${C.BD}${C.B}  🛡️  Shield Bot Evaluation & Anti-Hallucination Harness${C.RST}`);
  console.log(`${C.BD}${'═'.repeat(70)}${C.RST}`);
  console.log(`${C.D}Endpoint:    ${BASE_URL}${C.RST}`);
  console.log(`${C.D}Prompts:     ${prompts.length}${CATEGORY ? ` (category: ${CATEGORY})` : ''}${SINGLE_ID ? ` (id: ${SINGLE_ID})` : ''}${C.RST}`);
  console.log(`${C.D}Vault files: ${Object.keys(vaultFiles).length}${C.RST}`);
  console.log(`${C.D}Concurrency: ${CONCURRENCY}${C.RST}`);
  console.log(`${C.D}Timeout:     ${TIMEOUT_MS}ms${C.RST}`);
  console.log();
}

const results = await runBatch(prompts, CONCURRENCY);

// ── Summary ──────────────────────────────────────────────────────────────────

const passed = results.filter(r => r.pass);
const failed = results.filter(r => !r.pass);

// Count assertion categories
const totalAssertions = results.reduce((n, r) => n + r.assertions.length, 0);
const passedAssertions = results.reduce((n, r) => n + r.assertions.filter(a => a.pass).length, 0);
const failedAssertions = totalAssertions - passedAssertions;

// Hallucination-specific count
const hallucinationFailures = results.reduce((n, r) => {
  return n + r.assertions.filter(a => !a.pass && a.name.startsWith('Must NOT contain')).length;
}, 0);
const citationFailures = results.reduce((n, r) => {
  return n + r.assertions.filter(a => !a.pass && a.name.startsWith('Citation accurate')).length;
}, 0);
const fallbackFailures = results.reduce((n, r) => {
  return n + r.assertions.filter(a => !a.pass && (
    a.name.includes('fallback triggered') || a.name.includes('No fallback triggered')
  )).length;
}, 0);

// Category breakdown
const byCategory = {};
for (const r of results) {
  if (!byCategory[r.category]) byCategory[r.category] = { pass: 0, fail: 0 };
  byCategory[r.category][r.pass ? 'pass' : 'fail']++;
}

if (JSON_OUT) {
  // ── JSON output (for CI integration) ───────────────────────────────────
  const output = {
    summary: {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      passRate: `${((passed.length / results.length) * 100).toFixed(1)}%`,
      assertions: { total: totalAssertions, passed: passedAssertions, failed: failedAssertions },
      hallucinations: hallucinationFailures,
      citationErrors: citationFailures,
      fallbackErrors: fallbackFailures,
    },
    byCategory,
    failures: failed.map(r => ({
      id: r.id,
      category: r.category,
      prompt: r.prompt,
      failedAssertions: r.assertions.filter(a => !a.pass).map(a => ({
        name: a.name,
        detail: a.detail,
      })),
      responsePreview: r.response.slice(0, 300),
    })),
  };
  console.log(JSON.stringify(output, null, 2));
} else {
  // ── Human-readable summary ─────────────────────────────────────────────
  console.log(`\n${C.BD}${'═'.repeat(70)}${C.RST}`);
  console.log(`${C.BD}  RESULTS${C.RST}`);
  console.log(`${'═'.repeat(70)}`);
  console.log();
  console.log(`  ${C.BD}Tests:${C.RST}         ${C.G}${passed.length} passed${C.RST}, ${failed.length > 0 ? C.R : C.G}${failed.length} failed${C.RST} / ${results.length} total`);
  console.log(`  ${C.BD}Assertions:${C.RST}    ${C.G}${passedAssertions} passed${C.RST}, ${failedAssertions > 0 ? C.R : C.G}${failedAssertions} failed${C.RST} / ${totalAssertions} total`);
  console.log(`  ${C.BD}Pass rate:${C.RST}     ${((passed.length / results.length) * 100).toFixed(1)}%`);
  console.log();
  console.log(`  ${C.BD}Breakdown:${C.RST}`);
  console.log(`    Hallucinations detected:  ${hallucinationFailures > 0 ? C.R : C.G}${hallucinationFailures}${C.RST}`);
  console.log(`    Citation accuracy errors:  ${citationFailures > 0 ? C.R : C.G}${citationFailures}${C.RST}`);
  console.log(`    Fallback behavior errors:  ${fallbackFailures > 0 ? C.R : C.G}${fallbackFailures}${C.RST}`);
  console.log();

  console.log(`  ${C.BD}By Category:${C.RST}`);
  for (const [cat, counts] of Object.entries(byCategory)) {
    const pct = ((counts.pass / (counts.pass + counts.fail)) * 100).toFixed(0);
    const bar = counts.fail > 0 ? C.R : C.G;
    console.log(`    ${cat.padEnd(20)} ${bar}${counts.pass}/${counts.pass + counts.fail}${C.RST} (${pct}%)`);
  }

  if (failed.length > 0) {
    console.log(`\n${C.BD}  FAILURES:${C.RST}`);
    for (const r of failed) {
      console.log(`\n  ${C.R}❌ ${r.id}${C.RST} ${C.D}(${r.category})${C.RST}`);
      console.log(`     Prompt: "${r.prompt.slice(0, 80)}"`);
      for (const a of r.assertions.filter(a => !a.pass)) {
        console.log(`     ${C.R}✗${C.RST} ${a.name} — ${a.detail}`);
      }
    }
  }

  console.log(`\n${'═'.repeat(70)}`);

  if (failed.length === 0) {
    console.log(`${C.G}🎉 All ${results.length} tests passed!${C.RST}\n`);
  } else {
    console.log(`${C.Y}⚠ ${failed.length} test(s) failed. Review above for details.${C.RST}`);
    console.log(`${C.D}Note: LLM responses are non-deterministic. Re-run borderline tests with --id.${C.RST}\n`);
  }
}

process.exit(failed.length > 0 ? 1 : 0);
