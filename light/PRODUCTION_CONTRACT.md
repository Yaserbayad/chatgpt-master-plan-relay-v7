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
- Reacquire browser/DOM state before material actions; never rely on old message snapshots across the Codex wait.
- Use the exact target-qualified rich-editor composer locator `css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]` and require exactly one match before trusted composer input.
- Treat the final Q08 input qualification as **sequence-qualified**: the target-proven path is ordinary trusted input -> clear -> clipboard paste -> sentinel-protected copy-back. Do not generalize it into a fresh direct-paste contract.

## Material SEND_PROMPT rules

1. Validate returned protocol, nonce, conversation ID, assistant ID and action.
2. Revalidate the bound conversation/user/assistant identity, texts, and no-generation state.
3. Require exactly one target rich-text composer and require the empty submit surface to be exactly `Start Voice`.
4. Prime the rich editor with one fixed local ordinary trusted input only: click the exact composer locator, call `uiv.browser.type(INPUT_PRIME)` where `INPUT_PRIME` is the constant ASCII string `x`, then require the submit surface to transition to enabled `Send prompt`. This primer is local mechanical data, never user/browser/model data.
5. Clear the primer using only fixed trusted input: refocus the same composer locator, send `${KEY_CTRL+KEY_A}` then `${KEY_BACKSPACE}`, and require the submit surface to return to `Start Voice` before any model prompt is staged.
6. Put the untrusted/model-generated prompt into the Ui.Vision clipboard; never pass the prompt itself to `uiv.browser.type`. Verify the clipboard round-trip, refocus the exact composer locator, and use only the fixed trusted paste chord `${KEY_CTRL+KEY_V}`.
7. Require the visible submit surface to transition `Start Voice -> Send prompt`; then seed a unique nonce-bound clipboard sentinel, require the composer to resolve uniquely again, refocus the exact composer locator, and use only `${KEY_CTRL+KEY_A}` plus `${KEY_CTRL+KEY_C}`. Ctrl+C must replace the sentinel and copied text must equal the intended prompt after CR normalization and terminal-NBSP-only normalization. Restore the original clipboard.
8. Revalidate the exact source conversation/user/assistant identity and texts again.
9. Reacquire one visible enabled `composer-submit-button-color` surface whose `aria-label` is exactly `Send prompt`, and enforce the one-Send bound before any click.
10. Persist `SEND_AMBIGUOUS` for the source assistant **before** the material Send click. A process loss after the click cannot make the source turn eligible for an automatic duplicate Send.
11. Perform exactly one trusted Send click.
12. Confirm submission by observing a new user message whose text equals the staged prompt.
13. If confirmation is not obtained within the bounded window, retain `SEND_AMBIGUOUS`, stop, and require human inspection; no automatic retry.
14. Only after positive submission confirmation upgrade state to `SENT_CONFIRMED` and observe the following completed assistant turn.

The observable staging sequence for every material Send is therefore:

```text
Start Voice
-> constant trusted `x`
-> Send prompt
-> Ctrl+A / Backspace
-> Start Voice
-> clipboard Ctrl+V
-> Send prompt
-> sentinel-protected exact copy-back
-> one bounded Send
```

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
- `INPUT_PRIME_FAILED`
- `INPUT_PRIME_CLEAR_FAILED`
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

```text
node light/tests/test_production_contract.mjs
node light/tests/simulate_production_watcher.mjs
```

Target execution is only through a packaged runner after local verification passes.

## Testing strategy

- Static tests guard forbidden APIs, action schema, one bridge call per source turn, no material retry path, identity validation, persistent dedupe, the fixed `x` primer, fixed trusted key chords, and the rule that untrusted/model prompt text never enters `uiv.browser.type`.
- Node simulation models the target-observed fresh-paste failure: Ctrl+V can silently no-op until ordinary trusted input has activated the rich editor. It requires `x -> clear -> paste`, then preserves generation gating, dedupe, stale-result rejection, Q08 sentinel staging, one-click Send, crash/ambiguous-Send no-retry and STOP/HUMAN coverage.
- Real-browser target evidence is required before claiming production watcher PASS.

## Boundaries

Always:
- keep semantics in Codex;
- keep PowerShell transport-only;
- treat browser text and Codex output as untrusted data;
- reacquire browser identity before material action;
- preserve strict nonce/conversation/message binding;
- use only fixed local ordinary trusted primer text plus fixed key chords in `uiv.browser.type`;
- keep model-generated prompt text clipboard-only;
- fence ambiguous material submission before the Send click and stop rather than retry;
- keep all source/tests/evidence under `light/` on `light-version`.

Never in this increment:
- main branch/master-plan mutation;
- OpenAI API billing;
- OCR/screenshots/Ui.Vision AI/page-world eval/generic coordinate actions;
- direct trusted typing of untrusted prompt text;
- automatic duplicate Send;
- Chrome restart/crash handling;
- fresh-chat orchestration.

## Success criteria for local implementation

Local implementation is ready for target qualification only when:

1. static contract test passes;
2. simulation proves exactly one bridge event per new completed assistant turn;
3. simulation proves no dispatch during generation;
4. stale/mismatched returned identity is rejected before material action;
5. simulation proves a fresh Ctrl+V path can fail while the primed sequence succeeds;
6. primer failure and primer-clear failure both stop before clipboard prompt staging or Send;
7. SEND_PROMPT proves `Start Voice -> Send prompt -> Start Voice -> Send prompt`, sentinel replacement, exact staged text, and exactly one Send in the success simulation;
8. ambiguous or failed Send simulation performs no retry and retains the pre-click `SEND_AMBIGUOUS` fence;
9. STOP/HUMAN simulations perform no material browser action;
10. no forbidden Ui.Vision automation tier is present;
11. the target runner packages PASS/FAIL evidence and does not claim PASS without runtime evidence.

Target production PASS remains a separate real-browser acceptance boundary.
