# Post-Q16 Runtime Baseline Re-freeze Preparation — Codex Watcher Candidate

**Status:** PREPARATORY ONLY — NOT CURRENT IMPLEMENTATION AUTHORITY  
**Trigger for use:** only after Q15 PASS and Q16 PASS.  
**Authority basis:** `master-plan/Q15_CODEX_WATCHER_AMENDMENT_2026-08-30.md` requires the implementation runtime baseline to be re-frozen after Q16 if the Codex-watcher path qualifies.

## Candidate architecture to freeze if Q15-B passes

```text
ChatGPT Web
  ↕
UI.Vision watcher + constrained browser actuator
  ↕ deterministic validated local IPC
narrow local bridge
  ↕ one bounded invocation when needed
Codex CLI semantic/orchestration layer
```

Authority boundary remains unchanged:

- GitHub/Project checkpoint remains durable project authority.
- Codex interprets completed output and chooses structured next actions within frozen policy; it does not own or rewrite Governor authority independently.
- UI.Vision owns browser sensing and the small qualified material-action surface.
- The local bridge transports, invokes, validates and returns structured messages; it is not a workflow engine.

## Downstream WBS impact map

This map identifies clauses that must be reviewed during the post-Q16 re-freeze. It does **not** mutate the WBS now.

### A. Must be materially re-frozen

| WBS | Current wording/role | Required candidate change |
|---|---|---|
| C02 | Project Instructions v7 | Add the UI.Vision/Codex/bridge responsibility split, Codex non-authority rule, command validation boundary and Codex usage-limit handling. |
| C04 | Relay wire protocol | Extend/freeze a machine-readable event/command envelope between UI.Vision, bridge and Codex with nonce + browser/message identity binding. Preserve `[RELAY:id]`/ORCH only where still needed for ChatGPT/Governor protocol. |
| C05 | Fixed relay prompts | Separate ChatGPT-facing relay prompts from Codex-side decision instructions. Codex output must be structured and mechanically validated before UI.Vision acts. |
| C08 | Failure taxonomy | Add/clarify bridge failure, Codex CLI unavailable, Codex usage exhausted, malformed/stale command and IPC identity mismatch; each must fail closed. |
| C09 | Architecture contract gate | Gate the three-component runtime explicitly instead of assuming UI.Vision alone owns semantic orchestration. |
| I01 | `UI.Vision Relay Implementation` skeleton | Replace UI.Vision-only semantic architecture with UI.Vision watcher/actuator modules + narrow bridge + Codex decision contract. Keep browser actuation small and explicit. |
| I06 | Low-frequency completion detector | UI.Vision performs native sleep/check; only a completed-output event starts Codex. Codex must not remain active during the long wait. |
| I07 | Strict ORCH parser | Reassign semantic interpretation to Codex where applicable; retain only deterministic mechanical validation in UI.Vision/bridge. |
| I08 | Conversation rollover | Codex decides when rollover is required; UI.Vision executes only the qualified same-Project navigation command. |
| I18 | Startup reconciliation | UI.Vision gathers observation only; Codex owns semantic recovery decision within durable project policy. |
| I19 | RETRY convergence | Move retry/fresh-context decision logic to Codex; UI.Vision executes bounded commands only. |
| I20 | Protocol repair | Move semantic repair choice to Codex; bridge/UI.Vision validate and execute only approved mechanical actions. |
| I21 | Auth/rate/service error handling | UI.Vision detects browser-visible state; Codex classifies/selects the bounded response. Include Codex own usage/auth unavailability separately. |
| I24 | Compact diagnostics | Correlate browser observation, event nonce, assistant message ID/hash, bridge exit, Codex invocation/result class and actuator outcome without storing full responses/secrets by default. |
| I25 | Relay implementation gate | Permit only the explicitly qualified bridge/Codex architecture; prove one Submit actuator site, validated command boundary and no second project-authority engine. |
| T03 | ORCH/parser adversarial tests | Test the actual Codex/bridge structured-result parser/validator in addition to any ChatGPT ORCH syntax that remains. |
| T05 | IPC/liveness regression | Expand to the qualified UI.Vision → bridge → Codex → bridge → UI.Vision path; make stale nonce/message identity a hard fail. |
| T12 | Duplicate Submit regression | Exercise duplicate suppression across the Codex-command/UI.Vision-actuator boundary. |
| T17 | Replay policy tests | Test Codex decisions against frozen SAFE / RECONCILE_FIRST / HUMAN_ON_AMBIGUITY policy; no independent authority inference. |
| T20 | Auth/rate/usage tests | Cover both ChatGPT browser limits and Codex CLI usage-limit/unavailable conditions. |
| E02 | Normal autonomous multi-task run | End-to-end path must include the watcher event and Codex decision round trip rather than implying ChatGPT/UI.Vision alone orchestrates progression. |
| E03 | Multi-chat continuity | Codex decides rollover; UI.Vision performs same-Project navigation and confirms identity. |
| E07 | RETRY/reconciliation sequence | Exercise Codex-owned semantic convergence with durable Governor constraints. |
| R05 | 24-hour acceptance | Add no stale IPC command, no malformed Codex command execution, bounded Codex invocation behavior, and acceptable idle resource use. |

### B. Preserve core behavior but clarify ownership

| WBS | Preserve | Ownership clarification |
|---|---|---|
| C03 | replay/human-gate schema | Codex consumes it; Governor authority defines it. |
| C06 | browser identity contract | UI.Vision observes; bridge/Codex receive identity-bound events. |
| C07 | FENCE → exactly one Submit → COMMITTED/AMBIGUOUS | UI.Vision retains mechanical journal/Submit enforcement; Codex may request action but cannot bypass transaction rules. |
| I02–I05 | browser/page/turn/assistant correlation | UI.Vision remains the browser sensor; only compact event data crosses IPC. |
| I09–I12 | fresh-chat, composer, prompt input, unique Send | UI.Vision remains the constrained actuator using already-qualified V10 browser path. |
| I13–I17 | journal, FENCE, Submit, conversation ID, commit observation | Preserve exactly-once safety; Codex command cannot create an alternate Submit path. |
| I22 | Telegram | Existing secure route remains usable; notification decision may originate from Codex but secret handling remains outside model-visible payloads. |
| I23 | version drift guard | Preserve target-tuple guard; apply before relevant UI.Vision/bridge/Codex runtime activation as frozen later. |
| T01–T02, T04, T06–T11, T16, T19, T21–T22 | existing safety/behavior verification | Retain, updating fixtures only where the new IPC boundary changes interfaces. |

### C. Separate human scope decision still required later — do not silently delete

The human has explicitly made external Chrome crash/restart handling optional for current Q12 qualification. That **does not automatically rewrite** later dedicated lifecycle items. When these items become reachable, confirm whether they remain desired:

- T13 — Restart FENCE regression
- T18 — Crash-window fault injection
- E08 — Browser restart from safe state
- E09 — Restart after FENCE
- E10 — Restart immediately after Submit
- R03 — Browser lifecycle assessment
- R04 — Optional Task Scheduler lifecycle setup

Until a later explicit scope decision, keep them in the plan but do not use them to reinterpret the already-approved Q12 Phase-Q scope.

## Re-freeze invariants

If Q15-B passes and Q16 authorizes the re-freeze, the new baseline should preserve these non-negotiable invariants:

1. exactly one qualified UI.Vision Submit actuator path;
2. durable FENCE before any Submit and no automatic resend after material ambiguity;
3. same-Project identity checks before material browser action;
4. nonce/message/project-bound IPC commands; stale or malformed commands fail closed;
5. Codex semantic authority is bounded by durable Governor/project authority;
6. bridge contains transport/process/validation only, not autonomous workflow state;
7. no OpenAI API key requirement unless separately authorized;
8. Codex usage exhaustion is a normal bounded WAITING condition, not a retry loop;
9. UI.Vision sleeps natively between browser observations; Codex is invoked only after a completed-output event;
10. compact evidence/logging excludes full response text and secrets by default.

## Post-Q16 execution sequence

After Q16 PASS only:

1. freeze the qualified runtime boundary and exact component responsibilities;
2. reconcile `MASTER_PLAN.md` downstream clauses listed above;
3. preserve still-valid Q01–Q15 evidence and dependencies;
4. freeze C01 production `MASTER_PLAN.md`/`STATE.json` schema under the reconciled architecture;
5. continue normal SERIAL LIGHT governed execution.
