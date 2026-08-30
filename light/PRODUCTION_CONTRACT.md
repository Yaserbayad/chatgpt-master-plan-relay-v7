# Light Production Watcher/Actuator Contract

Status: **frozen first production increment after verified Q15-B PASS**.

This contract applies only to `light-version`. It does not modify main Relay authority or qualification state.

## Objective

Implement the smallest same-chat production loop consistent with the frozen Light architecture:

```text
observe one newly completed assistant turn
-> transport one nonce-bound event to PowerShell
-> one bounded Codex semantic decision
-> validate one allowlisted action
-> revalidate exact browser identity
-> if authorized, stage/send exactly one prompt
-> observe the next completed turn
```

The first increment intentionally excludes fresh-chat creation, Chrome restart/crash recovery, OCR, screenshots, Ui.Vision AI, page-world eval, generic coordinates, and broad workflow logic.

## Runtime stack

- Chrome only.
- Ui.Vision 10.0.178 JavaScript macro API.
- PowerShell 5.1 transport.
- locally authenticated `codex-cli 0.151.0` / ChatGPT-account path; no OpenAI API billing.
- Codex invocation remains ephemeral, no-tool, console-backed, `--sandbox read-only`, isolated with `--ignore-user-config`.

## Production event

Ui.Vision sends exactly one event for each newly completed assistant message:

- protocol
- nonce
- project token / bound conversation URL
- conversation ID
- latest user message ID + text
- completed assistant message ID + full text + declared length

PowerShell validates required identity/length fields, hashes the full assistant text locally, and supplies the bounded event as untrusted prompt data to Codex. PowerShell does not decide project meaning.

## Allowlisted Codex actions

First-increment action enum:

1. `SEND_PROMPT` — one non-empty same-chat prompt.
2. `STOP` — terminate the watcher without browser material action.
3. `HUMAN` — terminate and surface that human input/authority is required.

`FRESH_CHAT` and other recovery actions are explicitly deferred until the same-chat production path is target-qualified and soak-tested.

Codex owns the semantic choice among the allowlisted actions. PowerShell only schema-validates and identity-binds the result.

## Ui.Vision watcher rules

- Bind exactly one configured-Project conversation tab.
- Poll at low frequency; do not dispatch while `stop-button` exists.
- Require a completed assistant following the latest user turn and require two stable identical completed snapshots before dispatch.
- Persist only minimal mechanical dedupe state in Ui.Vision CSV storage: source assistant ID plus `SENT_CONFIRMED` or `SEND_AMBIGUOUS` status.
- Never dispatch the same completed assistant ID twice after confirmed or ambiguous material submission.
- Reacquire DOM snapshots immediately before every material action; never reuse stale finder snapshots across the Codex wait.

## Material SEND_PROMPT rules

1. Validate returned protocol, nonce, conversation ID, assistant ID and action.
2. Revalidate the bound conversation/user/assistant identity and no-generation state.
3. Require an empty ChatGPT composer.
4. Focus the rich-text composer with trusted `uiv.browser.click` and type with trusted `uiv.browser.type`.
5. Reacquire and verify that the staged prompt text is present before Send.
6. Revalidate source identity again.
7. Locate a semantic Send button and perform exactly one trusted click.
8. Never click Send again automatically for the same source turn.
9. Confirm submission by observing a new user message whose text equals the staged prompt.
10. If confirmation is not obtained within the bounded window, persist `SEND_AMBIGUOUS`, stop, and require human inspection; no automatic retry.

## Failure classes

At minimum:

- `WRONG_TAB_BINDING`
- `GENERATING`
- `NO_COMPLETED_ASSISTANT`
- `UNSTABLE_COMPLETION`
- `DUPLICATE_SOURCE_TURN`
- `BRIDGE_FAILURE`
- `INVALID_ACTION`
- `STALE_IDENTITY`
- `COMPOSER_NOT_EMPTY`
- `STAGE_VERIFY_FAILED`
- `SEND_CONTROL_MISSING`
- `SEND_AMBIGUOUS_NO_RETRY`
- `CODEX_CREDITS_REQUIRED`
- `HUMAN_REQUIRED`
- `STOP_REQUESTED`

Failures after a Send click are never automatically retried.

## Project structure

```text
light/PRODUCTION_CONTRACT.md
light/production/LIGHT_PRODUCTION_WATCHER.js
light/production/RelayCodexLightProduction.ps1
light/production/LIGHT_PRODUCTION_ACTION.schema.json
light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
light/tests/test_production_contract.mjs
light/tests/simulate_production_watcher.mjs
```

## Commands

Static contract verification:

```text
node light/tests/test_production_contract.mjs
```

Watcher simulation:

```text
node light/tests/simulate_production_watcher.mjs
```

Target execution is only through the packaged `RUN_LIGHT_PRODUCTION_TARGET.ps1` after local verification passes.

## Testing strategy

- Static tests guard forbidden APIs, action schema, one bridge call per source turn, no hidden Codex launch, no material retry path, identity validation, persistent dedupe and exact trusted-input tiers.
- Node simulation fakes Ui.Vision snapshots/clipboard/bridge responses to prove dedupe, stale-result rejection, one-click send, ambiguous-send no-retry and STOP/HUMAN behavior without touching a real browser.
- Real-browser target evidence is required before claiming production watcher PASS.

## Boundaries

Always:
- keep semantics in Codex;
- keep PowerShell transport-only;
- reacquire browser identity before material action;
- preserve strict nonce/conversation/message binding;
- stop on ambiguous material effects;
- keep all source/tests/evidence under `light/` on `light-version`.

Never in this increment:
- main branch/master-plan mutation;
- OpenAI API billing;
- OCR/screenshots/Ui.Vision AI/page-world eval/generic coordinate actions;
- automatic duplicate Send;
- Chrome restart/crash handling;
- fresh-chat orchestration.

## Success criteria for local implementation

Local implementation is ready for target qualification only when:

1. static contract test passes;
2. simulation proves exactly one bridge event per new completed assistant turn;
3. simulation proves no dispatch during generation;
4. stale/mismatched returned identity is rejected before material action;
5. SEND_PROMPT stages/verifies and clicks Send exactly once in the success simulation;
6. ambiguous submission simulation performs no retry and records the ambiguous state;
7. STOP/HUMAN simulations perform no material browser action;
8. no forbidden Ui.Vision automation tier is present;
9. the target runner packages PASS/FAIL evidence and does not claim PASS without runtime evidence.

Target production PASS remains a separate real-browser acceptance boundary.
