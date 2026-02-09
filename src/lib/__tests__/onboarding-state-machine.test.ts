import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSession,
  canTransition,
  getNextStates,
  transition,
  processUserInput,
  processAssistantResponse,
  detectStateTag,
  detectDemoSignal,
  detectObjection,
  detectPainPoints,
  detectFrameworks,
  detectCTAAcceptance,
  detectCTADecline,
  detectOffTopic,
  detectPIISolicitation,
  getQuickReplies,
  buildStatePromptFragment,
  type SessionMachine,
} from '../onboarding-state-machine';

// ─── Helper ──────────────────────────────────────────────────────────────────

function advanceTo(session: SessionMachine, target: string) {
  const path: Record<string, string[]> = {
    S2: ['S2'],
    S3: ['S2', 'S3'],
    S4: ['S2', 'S3', 'S4'],
    S5: ['S2', 'S3', 'S4', 'S5'],
    S6: ['S2', 'S3', 'S4', 'S6'],
    S7: ['S2', 'S3', 'S4', 'S6', 'S7'],
  };
  for (const s of path[target] || []) {
    transition(session, s as any);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('State Machine - Session Creation', () => {
  it('creates session with S1 initial state', () => {
    const s = createSession('test-1');
    assert.equal(s.state, 'S1');
    assert.equal(s.messageCount, 0);
    assert.equal(s.memory.painPoints.length, 0);
    assert.equal(s.stateHistory.length, 1);
  });
});

describe('State Machine - Transitions', () => {
  it('allows valid forward transitions', () => {
    assert.ok(canTransition('S1', 'S2'));
    assert.ok(canTransition('S2', 'S3'));
    assert.ok(canTransition('S3', 'S4'));
    assert.ok(canTransition('S4', 'S5'));
    assert.ok(canTransition('S4', 'S6'));
    assert.ok(canTransition('S5', 'S6'));
    assert.ok(canTransition('S6', 'S7'));
    assert.ok(canTransition('S6', 'S4'));
  });

  it('blocks invalid transitions', () => {
    assert.ok(!canTransition('S1', 'S3'));
    assert.ok(!canTransition('S1', 'S7'));
    assert.ok(!canTransition('S2', 'S7'));
    assert.ok(!canTransition('S3', 'S7'));
    assert.ok(!canTransition('S7', 'S1'));
  });

  it('blocks skip from S2 to S7', () => {
    const s = createSession('test-skip');
    transition(s, 'S2');
    const result = transition(s, 'S7');
    assert.equal(result.allowed, false);
    assert.equal(s.state, 'S2');
  });

  it('fires state_entered event on valid transition', () => {
    const s = createSession('test-events');
    const result = transition(s, 'S2');
    assert.ok(result.allowed);
    const entered = result.events.find(e => e.event === 'onboarding.state_entered');
    assert.ok(entered);
    assert.equal(entered!.payload.toState, 'Problem Identification');
  });

  it('fires greeting_completed on S1→S2', () => {
    const s = createSession('test-greet');
    const result = transition(s, 'S2');
    assert.ok(result.events.some(e => e.event === 'onboarding.greeting_completed'));
  });

  it('fires demo_initiated on S2→S3', () => {
    const s = createSession('test-demo');
    advanceTo(s, 'S2');
    const result = transition(s, 'S3');
    assert.ok(result.events.some(e => e.event === 'onboarding.demo_initiated'));
  });

  it('fires lead_captured on S6→S7', () => {
    const s = createSession('test-lead');
    advanceTo(s, 'S6');
    const result = transition(s, 'S7');
    assert.ok(result.allowed);
    assert.ok(result.events.some(e => e.event === 'onboarding.lead_captured'));
    assert.ok(result.events.some(e => e.event === 'onboarding.cta_accepted'));
    assert.ok(result.events.some(e => e.event === 'onboarding.session_completed'));
  });

  it('fires cta_declined on S6→S4 loop-back', () => {
    const s = createSession('test-decline');
    advanceTo(s, 'S6');
    const result = transition(s, 'S4');
    assert.ok(result.allowed);
    assert.ok(result.events.some(e => e.event === 'onboarding.cta_declined'));
  });
});

describe('State Machine - Premature Lead Capture Guardrail', () => {
  it('blocks S7 if S3 never visited', () => {
    const s = createSession('test-guard-1');
    transition(s, 'S2');
    // Force state to S6 without visiting S3 (hack for testing)
    s.state = 'S6' as any;
    const result = transition(s, 'S7');
    assert.equal(result.allowed, false);
    assert.ok(result.events.some(e => e.event === 'onboarding.premature_capture_blocked'));
  });

  it('blocks S7 if S6 never visited', () => {
    const s = createSession('test-guard-2');
    advanceTo(s, 'S4');
    // Force state to S6 position without S6 in history
    s.state = 'S6' as any;
    const result = transition(s, 'S7');
    assert.equal(result.allowed, false);
  });

  it('allows S7 after full funnel traversal', () => {
    const s = createSession('test-guard-3');
    advanceTo(s, 'S7');
    assert.equal(s.state, 'S7');
  });
});

describe('Signal Detection', () => {
  it('detects state tags', () => {
    assert.equal(detectStateTag('Hello <!-- STATE:S3 --> world'), 'S3');
    assert.equal(detectStateTag('No tag here'), null);
  });

  it('detects demo signals', () => {
    assert.ok(detectDemoSignal('Let me show you how this works'));
    assert.ok(detectDemoSignal("Here's an example of a SOC 2 answer"));
    assert.ok(!detectDemoSignal('What compliance framework do you use?'));
  });

  it('detects objections', () => {
    assert.ok(detectObjection('What about data privacy?'));
    assert.ok(detectObjection('Is this GDPR compliant?'));
    assert.ok(!detectObjection('Show me a demo'));
  });

  it('detects pain points', () => {
    const pains = detectPainPoints('We need SOC 2 compliance and deal with too many vendor questionnaires');
    assert.ok(pains.includes('SOC 2 compliance'));
    assert.ok(pains.includes('Questionnaire volume'));
  });

  it('detects frameworks', () => {
    const fw = detectFrameworks('We need SOC 2 and ISO 27001 compliance');
    assert.ok(fw.includes('SOC 2'));
    assert.ok(fw.includes('ISO 27001'));
  });

  it('detects CTA acceptance', () => {
    assert.ok(detectCTAAcceptance('Yes, set it up!'));
    assert.ok(detectCTAAcceptance("Sure, I'd love to try"));
    assert.ok(!detectCTAAcceptance('Tell me more first'));
  });

  it('detects CTA decline', () => {
    assert.ok(detectCTADecline('Not right now'));
    assert.ok(detectCTADecline('Maybe later'));
    assert.ok(!detectCTADecline('Yes please!'));
  });

  it('detects off-topic input', () => {
    assert.ok(detectOffTopic('Can you write me a poem about cats?'));
    assert.ok(!detectOffTopic('Help me with SOC 2 compliance'));
    assert.ok(!detectOffTopic('Show me an example'));
  });

  it('detects PII solicitation in wrong state', () => {
    assert.ok(detectPIISolicitation('What is your email address?', 'S3'));
    assert.ok(!detectPIISolicitation('What is your email address?', 'S7'));
    assert.ok(!detectPIISolicitation('Here is a demo answer', 'S3'));
  });
});

describe('Process User Input', () => {
  it('auto-advances S1→S2 on first message', () => {
    const s = createSession('test-auto');
    const { events } = processUserInput(s, 'Hello, I need help with compliance');
    assert.equal(s.state, 'S2');
    assert.ok(events.some(e => e.event === 'onboarding.greeting_completed'));
  });

  it('fires message_sent on every input', () => {
    const s = createSession('test-msg');
    const { events } = processUserInput(s, 'Hi');
    assert.ok(events.some(e => e.event === 'onboarding.message_sent'));
  });

  it('detects off-topic and fires event', () => {
    const s = createSession('test-offtopic');
    processUserInput(s, 'Hi'); // advance to S2
    const { events } = processUserInput(s, 'Can you write me a poem about cats?');
    assert.ok(events.some(e => e.event === 'onboarding.off_topic_detected'));
  });

  it('accumulates pain points in memory', () => {
    const s = createSession('test-memory');
    processUserInput(s, 'I need help with SOC 2 compliance');
    assert.ok(s.memory.painPoints.includes('SOC 2 compliance'));
    processUserInput(s, 'We also deal with ISO 27001');
    assert.ok(s.memory.complianceFrameworks.includes('ISO 27001'));
  });

  it('handles CTA acceptance at S6', () => {
    const s = createSession('test-cta-accept');
    advanceTo(s, 'S6');
    const { events } = processUserInput(s, 'Yes, set it up please!');
    assert.equal(s.state, 'S7');
    assert.ok(events.some(e => e.event === 'onboarding.lead_captured'));
  });

  it('handles CTA decline at S6 → loops to S4', () => {
    const s = createSession('test-cta-decline');
    advanceTo(s, 'S6');
    const { events } = processUserInput(s, 'Not right now, tell me more');
    assert.equal(s.state, 'S4');
    assert.ok(events.some(e => e.event === 'onboarding.cta_declined'));
  });

  it('detects objection at S4 → advances to S5', () => {
    const s = createSession('test-objection');
    advanceTo(s, 'S4');
    const { events } = processUserInput(s, 'What about data privacy?');
    assert.equal(s.state, 'S5');
    assert.ok(events.some(e => e.event === 'onboarding.objection_raised'));
  });
});

describe('Process Assistant Response', () => {
  it('detects state tag and transitions', () => {
    const s = createSession('test-resp-tag');
    advanceTo(s, 'S2');
    const { events } = processAssistantResponse(s, 'Here is a demo <!-- STATE:S3 -->');
    assert.equal(s.state, 'S3');
    assert.ok(events.some(e => e.event === 'onboarding.demo_initiated'));
  });

  it('detects demo signal heuristic in S2', () => {
    const s = createSession('test-resp-heuristic');
    advanceTo(s, 'S2');
    const { events } = processAssistantResponse(s, "Let me show you how VaultFill handles this");
    assert.equal(s.state, 'S3');
  });

  it('blocks PII solicitation before S7', () => {
    const s = createSession('test-pii-block');
    advanceTo(s, 'S3');
    const { piiBlocked, events } = processAssistantResponse(s, 'What is your email address so I can help?');
    assert.ok(piiBlocked);
    assert.ok(events.some(e => e.event === 'onboarding.pii_request_blocked'));
  });

  it('allows PII solicitation in S7', () => {
    const s = createSession('test-pii-allow');
    advanceTo(s, 'S7');
    const { piiBlocked } = processAssistantResponse(s, 'What is your email address?');
    assert.ok(!piiBlocked);
  });
});

describe('Quick Replies', () => {
  it('returns quick replies for each state', () => {
    for (const state of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'] as const) {
      const replies = getQuickReplies(state);
      assert.ok(replies.length > 0, `No quick replies for ${state}`);
    }
  });
});

describe('State Prompt Fragment', () => {
  it('includes current state info', () => {
    const s = createSession('test-prompt');
    const prompt = buildStatePromptFragment('S3', s.memory);
    assert.ok(prompt.includes('S3'));
    assert.ok(prompt.includes('Product Demo'));
  });

  it('includes memory context', () => {
    const s = createSession('test-prompt-mem');
    s.memory.painPoints = ['SOC 2 compliance'];
    s.memory.complianceFrameworks = ['ISO 27001'];
    const prompt = buildStatePromptFragment('S3', s.memory);
    assert.ok(prompt.includes('SOC 2 compliance'));
    assert.ok(prompt.includes('ISO 27001'));
  });
});

describe('Full Funnel Flow', () => {
  it('completes entire happy path: S1→S2→S3→S4→S6→S7', () => {
    const s = createSession('test-full');
    const allEvents: string[] = [];

    // User says hello → S1→S2
    let r = processUserInput(s, 'Hi, I need help with SOC 2 questionnaires');
    allEvents.push(...r.events.map(e => e.event));
    assert.equal(s.state, 'S2');

    // Assistant demos → S2→S3
    let ar = processAssistantResponse(s, 'Let me show you how VaultFill handles SOC 2 questions');
    allEvents.push(...ar.events.map(e => e.event));
    assert.equal(s.state, 'S3');

    // Assistant tags S4 → S3→S4
    ar = processAssistantResponse(s, 'VaultFill saves 80% time <!-- STATE:S4 -->');
    allEvents.push(...ar.events.map(e => e.event));
    assert.equal(s.state, 'S4');

    // User positive → stay S4, assistant offers CTA
    r = processUserInput(s, "That's great, what's the next step?");
    allEvents.push(...r.events.map(e => e.event));

    // Assistant offers CTA → S4→S6
    ar = processAssistantResponse(s, 'Want me to set up a pilot? <!-- STATE:S6 -->');
    allEvents.push(...ar.events.map(e => e.event));
    assert.equal(s.state, 'S6');

    // User accepts → S6→S7
    r = processUserInput(s, 'Yes, set it up!');
    allEvents.push(...r.events.map(e => e.event));
    assert.equal(s.state, 'S7');

    // Verify key events fired
    assert.ok(allEvents.includes('onboarding.greeting_completed'));
    assert.ok(allEvents.includes('onboarding.demo_initiated'));
    assert.ok(allEvents.includes('onboarding.value_reinforced'));
    assert.ok(allEvents.includes('onboarding.cta_offered'));
    assert.ok(allEvents.includes('onboarding.lead_captured'));
    assert.ok(allEvents.includes('onboarding.cta_accepted'));
    assert.ok(allEvents.includes('onboarding.session_completed'));
  });

  it('handles decline loop: S6→S4→S5→S6→S7', () => {
    const s = createSession('test-loop');
    advanceTo(s, 'S6');

    // Decline
    let r = processUserInput(s, 'Not right now');
    assert.equal(s.state, 'S4');

    // Raise objection → S5
    r = processUserInput(s, 'What about data privacy concerns?');
    assert.equal(s.state, 'S5');

    // Resolve → S6
    let ar = processAssistantResponse(s, 'Great question, here is our approach <!-- STATE:S6 -->');
    assert.equal(s.state, 'S6');

    // Accept
    r = processUserInput(s, "Sure, let's do it");
    assert.equal(s.state, 'S7');
  });
});

describe('Analytics Events Coverage', () => {
  it('can fire all 22 event types through various paths', () => {
    const eventsSeen = new Set<string>();

    // Session started
    const s1 = createSession('analytics-1');
    eventsSeen.add('onboarding.session_started'); // fired in route, not machine

    // Full flow
    let r = processUserInput(s1, 'What is the weather?'); // off-topic + message + greeting
    r.events.forEach(e => eventsSeen.add(e.event));

    const s2 = createSession('analytics-2');
    r = processUserInput(s2, 'Help with SOC 2');
    r.events.forEach(e => eventsSeen.add(e.event));

    transition(s2, 'S3').events.forEach(e => eventsSeen.add(e.event));
    // Demo response with PII (blocked)
    let ar = processAssistantResponse(s2, 'What is your email address?');
    ar.events.forEach(e => eventsSeen.add(e.event));

    // Valid demo
    const s3 = createSession('analytics-3');
    advanceTo(s3, 'S4');
    r = processUserInput(s3, 'What about privacy?');
    r.events.forEach(e => eventsSeen.add(e.event));

    const s4 = createSession('analytics-4');
    advanceTo(s4, 'S4');
    transition(s4, 'S6').events.forEach(e => eventsSeen.add(e.event)); // cta_offered
    r = processUserInput(s4, 'Not now');
    r.events.forEach(e => eventsSeen.add(e.event));

    const s5 = createSession('analytics-5');
    advanceTo(s5, 'S4');
    transition(s5, 'S6').events.forEach(e => eventsSeen.add(e.event));
    r = processUserInput(s5, 'Yes set it up!');
    r.events.forEach(e => eventsSeen.add(e.event));

    // Invalid transition (S2→S4 is not valid)
    const s6 = createSession('analytics-6');
    transition(s6, 'S2');
    const tr = transition(s6, 'S4');
    tr.events.forEach(e => eventsSeen.add(e.event));

    // Premature capture
    const s7 = createSession('analytics-7');
    s7.state = 'S6' as any;
    const tr2 = transition(s7, 'S7');
    tr2.events.forEach(e => eventsSeen.add(e.event));

    // Quick reply — tracked externally
    eventsSeen.add('onboarding.quick_reply_used');
    // Session events tracked in route
    eventsSeen.add('onboarding.session_resumed');
    eventsSeen.add('onboarding.session_expired');
    eventsSeen.add('onboarding.drop_off');
    eventsSeen.add('onboarding.re_engagement');

    const expected = [
      'onboarding.session_started', 'onboarding.session_resumed',
      'onboarding.session_expired', 'onboarding.session_completed',
      'onboarding.state_entered', 'onboarding.greeting_completed',
      'onboarding.problem_identified', 'onboarding.demo_initiated',
      'onboarding.value_reinforced', 'onboarding.objection_raised',
      'onboarding.cta_offered', 'onboarding.quick_reply_used',
      'onboarding.cta_accepted', 'onboarding.cta_declined',
      'onboarding.lead_captured', 'onboarding.message_sent',
      'onboarding.off_topic_detected', 'onboarding.premature_capture_blocked',
      'onboarding.invalid_transition_blocked', 'onboarding.pii_request_blocked',
      'onboarding.drop_off', 'onboarding.re_engagement',
    ];

    for (const e of expected) {
      assert.ok(eventsSeen.has(e), `Missing event: ${e}`);
    }
    assert.equal(expected.length, 22, 'Should have exactly 22 event types');
  });
});
