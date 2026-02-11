# Onboarding State Machine

## States

| State | Name | Description |
|-------|------|-------------|
| S1 | **Greeting** | Initial welcome. Introduce VaultFill, establish trust. |
| S2 | **Problem Identification** | Discover the user's pain point (compliance type, questionnaire scope). |
| S3 | **Product Demo** | Show capability: answer a sample question, walk through features. |
| S4 | **Value Reinforcement** | Highlight time savings, accuracy, SOC 2/ISO coverage. |
| S5 | **Objection Handling** | Address concerns (privacy, accuracy, integrations). |
| S6 | **Soft CTA** | Offer next step without pressure ("Want to see more?" / "I can set up a pilot"). |
| S7 | **Convert / Lead Capture** | User opts in → collect email/name. |
| S8 | **Payment Gate** | Show "Unlock Full Report" CTA → Stripe Checkout. |

## Transitions

```
S1 ──(user sends first message)──► S2
S2 ──(pain point identified)──────► S3
S3 ──(demo question answered)──────► S4
S4 ──(user engaged positively)────► S5 or S6
S5 ──(objection resolved)─────────► S6
S6 ──(user says yes to CTA)───────► S7
S6 ──(user declines CTA)──────────► S4 (loop back, no pressure)
S7 ──(lead captured)──────────────► S8 (auto-advance)
S8 ──(user clicks Unlock)─────────► Stripe Checkout redirect
S8 ──(user declines)──────────────► S4 (loop back to value)
```

## Constraints

1. **No skipping**: The bot MUST NOT jump to S7 (lead capture) before completing S3–S6. S8 (payment gate) only activates after S7.
2. **No unsolicited PII requests**: Never ask for name/email until S7 and only after explicit user opt-in at S6.
3. **Graceful exits**: If a user disengages at any point, do not chase. Return to the last comfortable state.
4. **Re-entry**: Returning users resume from their last state (persisted in session).

## Analytics Events

| Event | Fires At | Properties |
|-------|----------|------------|
| `onboarding.demo_initiated` | Enter S3 | `sessionId`, `fromState` |
| `onboarding.lead_captured` | Enter S7 | `sessionId`, `fromState` |
| `onboarding.payment_gate_shown` | Enter S8 | `sessionId`, `fromState`, `trigger` |
| `onboarding.checkout_clicked` | User clicks Unlock Full Report | `sessionId`, `fromState`, `messageCount` |
| `onboarding.drop_off` | User exits between S3–S8 | `sessionId`, `lastState`, `messageCount` |

All events are PII-free. Session IDs are anonymous random tokens.
