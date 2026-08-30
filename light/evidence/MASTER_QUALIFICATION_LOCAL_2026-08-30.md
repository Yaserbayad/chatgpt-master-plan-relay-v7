# Light Master Qualification / Same-Chat Soak — Local Verification 2026-08-30

Status: **LOCALLY VERIFIED MASTER CANDIDATE AFTER Q08 LOCATOR-FOCUS CORRECTION — REAL WINDOWS/CHROME TARGET PASS REQUIRED**.

This evidence applies only to the independent `light-version` project. It does not modify or imply main Relay/master-plan state.

## Codex prerequisite

The prerequisite Codex execution primitive remains target-proven by `light/evidence/Q15B_2026-08-30.md`.

Q15-B independently verified on the real Windows/Chrome/Ui.Vision target that `codex-cli 0.151.0` can execute one console-backed, ephemeral, no-tool, read-only, structured, nonce-bound turn with exit 0, strict returned identity validation, and post-Codex browser identity revalidation.

That proof is intentionally narrower than the master qualification. It does not prove repeated normal-production semantic decisions; the seven-cycle harness is designed to prove those decisions rather than assume them.

## Master qualification design

Contract: `light/MASTER_QUALIFICATION_CONTRACT.md`

One PowerShell launch executes seven serial cycles in one configured-Project ChatGPT conversation:

1. cycle 0: forced deterministic seed `SEND_PROMPT` to establish the controlled handshake and prove the complete browser material path;
2. cycles 1-5: normal production mode; Codex must independently choose `SEND_PROMPT` and return exactly `LIGHT_SOAK_01` through `LIGHT_SOAK_05` according to the preceding ChatGPT assistant instruction;
3. cycle 6: normal production mode; Codex must independently choose `STOP` when the assistant declares the objective complete.

Total target behavior if all cycles pass:

- 7 Codex turns;
- 6 material Sends;
- 5 normal-production semantic SEND decisions;
- 1 normal-production terminal STOP decision.

The deterministic PowerShell supervisor is the test oracle. It never decides project semantics and never performs ChatGPT browser actions directly.

## Qualification-only semantic safety guards

`RelayCodexLightProduction.ps1` accepts opt-in `master_qualification_mode` expectations for conversation ID, source user ID, source assistant ID, source assistant SHA-256, Codex action, and Codex prompt SHA-256.

During master qualification, source expectations are checked before Codex execution. Codex action and prompt hash are checked after Codex execution but before an actionable bridge result is returned to Ui.Vision. A wrong semantic answer therefore fails before prompt staging or Send.

When `master_qualification_mode` is absent/false, normal production behavior is unchanged.

## First master target run

Durable evidence: `light/evidence/MASTER_QUALIFICATION_TARGET_FAIL_2026-08-30_150220.md`

Uploaded bundle SHA-256:

`099cd0dd8f753289ecd75aba58340da7b95d69d267bdf0ca91415dadd197b065`

All internal manifest hashes verified successfully.

Cycle 0 stopped safely with:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

Target evidence proves:

```text
bridge_action=SEND_PROMPT
expected_prompt_sha256 == actual_prompt_sha256
xrun_exit_code=0
codex_exit_code=0
browser_identity_revalidated=true
baseline_submit_aria=Start Voice
pasted_submit_aria=Start Voice
send_click_count=0
```

Therefore Codex, master sequencing, expected prompt hashing, and pre-action browser identity all passed cycle 0. The first unproven boundary was material composer focus / trusted paste.

## Working/failing contract comparison

Failed master candidate:

- resolved the rich-text composer through `uiv.findElements`;
- passed the resulting finder snapshot object to `uiv.browser.click`;
- target log shows Ui.Vision converting that snapshot click to coordinates on a `div`;
- trusted Ctrl+V then produced no visible state change: `Start Voice -> Start Voice`.

Already target-PASS Q08 path:

- uses exact locator `css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]`;
- calls `uiv.browser.click(COMPOSER)` directly with the locator string;
- target evidence proves trusted paste transitions `Start Voice -> Send prompt` and sentinel-protected Ctrl+C copies the editor contents.

Root-cause hypothesis: finder-snapshot composer clicks can fail to retain the rich-editor focus required for trusted key input, while the direct locator-string click focuses the intended editor correctly.

Status: **SUPPORTED, NOT TARGET-CONFIRMED** until a corrected target run passes this boundary.

## TDD correction

A regression simulation was changed first to model the target distinction:

- locator-string composer click => focus retained;
- finder-snapshot composer click => focus not retained;
- trusted key input is a no-op when focus is not retained.

RED against the exact pre-correction watcher reproduced the real target failure signature:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

The smallest implementation change then restored the Q08 target-qualified contract:

- replace the composer locator fallback array with the single exact Q08 composer locator;
- require exactly one matching composer before paste and before copy-back;
- call `uiv.browser.click(COMPOSER)` directly for both material focus operations;
- remove snapshot-object composer focus;
- keep the sentinel, NBSP normalization, identity revalidation, Send ambiguity fence, one-Send bound, Codex bridge, and master supervisor unchanged.

GREEN after correction:

```text
node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS

node light/tests/test_master_qualification_harness.mjs
LIGHT MASTER QUALIFICATION STATIC CONTRACT: PASS

node light/tests/simulate_master_qualification.mjs
LIGHT MASTER QUALIFICATION ACCEPTANCE SIMULATION: PASS
```

The persisted simulation bytes were reconstructed from GitHub and rerun; the full suite remained green.

## Current source binding

```text
58be604c2b7423437524f3f1e8bdb5ac333c62f8  light/production/LIGHT_PRODUCTION_WATCHER.js
2490165233cc5904e3731fc6ac4279e7ef29f2ef  light/production/RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
09f513ce062387669c21c09d9f02dab6bb4009be  light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1
d3b5b9b7ca4eacd0e3540df8bd5ddd7a1dbe7c84  light/MASTER_QUALIFICATION_CONTRACT.md
f9a4f182062a2653b637ca443d6acf60526b89eb  light/PRODUCTION_CONTRACT.md
6c197f87e0c3ac9ab2fdb5e50e7b5b19fc277559  light/tests/test_production_contract.mjs
72f45a5fb129131c2c5ab8efd65247803ecceb98  light/tests/simulate_production_watcher.mjs
ea9d2c1b6d3c43f11c33607d6c3fd05f8038d544  light/tests/test_master_qualification_harness.mjs
767447fc550346fd9a1ef503d427c84ca50e6335  light/tests/simulate_master_qualification.mjs
b253cc94a20f3f124242ff8131c8486389e655d4  light/evidence/Q15B_2026-08-30.md
```

## Safety / separation review

- Codex output remains untrusted and schema/identity-bound.
- Wrong master-qualification semantic output is blocked before Ui.Vision can stage/click it.
- Model-generated prompt text never enters the trusted-key parser.
- The change replaces snapshot-object focus with the previously target-qualified locator focus; it does not add any new browser capability.
- PowerShell supervisor contains no Ui.Vision/browser click/type control.
- No OpenAI API path was added.
- No fresh-chat, Chrome restart, OCR, screenshot, Ui.Vision AI, page-world eval, or generic coordinate behavior was added.
- No main-branch or main-project authority is touched.

## Local execution limitation

The local verification environment has Node.js but no Windows PowerShell runtime and no real target Chrome/Ui.Vision session. Therefore this evidence does not claim the corrected locator-focus path is target-PASS.

## Remaining acceptance boundary

Run the corrected packaged master harness once on the target Windows/Chrome/Ui.Vision environment with exactly one completed configured-Project ChatGPT conversation and an empty composer.

A genuine master PASS requires all seven target cycles to satisfy the exact contract and the returned evidence bundle to verify independently. Any first failure stops without retry and preserves partial evidence.

If cycle 0 passes, the same run automatically continues through all five normal-production semantic Send cycles and the terminal STOP cycle. After independently verified master PASS, the current same-chat production path plus bounded reliability soak are qualified. Fresh-chat/recovery remains the next separate major stage.
