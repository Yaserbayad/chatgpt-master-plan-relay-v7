# Light Version Verification

## Q15-B bridge qualification

Status: **VERIFIED TARGET PASS**.

Durable evidence: `light/evidence/Q15B_2026-08-30.md`

Accepted Q15-B source revision: `3562b6090c3ad1c8663d4f1fcc6cb506269051d1`

Q15-B proves the target Codex execution primitive used by Light: one locally authenticated `codex-cli 0.151.0` console-backed, ephemeral, no-tool, read-only, structured, nonce-bound turn with exit 0 and post-Codex browser identity revalidation. It does not by itself prove repeated normal-production semantic decisions.

## Production watcher history

Production is **not yet target-PASS**.

Durable evidence includes:

- `light/evidence/PRODUCTION_LOCAL_2026-08-30.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`
- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_140440.md`
- `light/evidence/PRODUCTION_TARGET_PREFLIGHT_FAIL_2026-08-30_142107.md`
- `light/evidence/MASTER_QUALIFICATION_TARGET_FAIL_2026-08-30_150220.md`

The target attempts established these reusable corrections:

1. finder snapshots are not authoritative staged-text proof;
2. the Q09 selector-only diagnosis was falsified by target evidence;
3. the target-proven Q08 staging contract is required: `Start Voice -> Send prompt`, unique copy sentinel before Ctrl+C, sentinel replacement, exact copied text with only terminal-NBSP normalization;
4. material composer focus must use the exact Q08 target-qualified locator string directly with `uiv.browser.click`; finder snapshot objects are not valid composer focus targets for trusted key input;
5. the target runner must create its own macro staging directory rather than require it to pre-exist;
6. no failed/ambiguous material Send is automatically retried.

The current production watcher preserves the Q08 locator-focus + sentinel/submit-surface contract, strict identity/nonce binding, one-Send maximum, pre-click `SEND_AMBIGUOUS`, exact submission confirmation, and following stable-completion requirement.

## Master qualification / same-chat soak

Status: **LOCALLY VERIFIED MASTER CANDIDATE AFTER LOCATOR-FOCUS CORRECTION — REAL TARGET PASS REQUIRED**.

Preferred qualification path:

`light/production/RUN_LIGHT_MASTER_QUALIFICATION.ps1`

Contract:

`light/MASTER_QUALIFICATION_CONTRACT.md`

Local evidence:

`light/evidence/MASTER_QUALIFICATION_LOCAL_2026-08-30.md`

### First master target run — cycle 0 failure

Uploaded evidence: `LIGHT_MASTER_QUALIFICATION_evidence_20260830_150220.zip`

Outer ZIP SHA-256:

`099cd0dd8f753289ecd75aba58340da7b95d69d267bdf0ca91415dadd197b065`

The bundle was independently hash-verified and byte-bound to the first master candidate. Cycle 0 proved:

```text
bridge_action=SEND_PROMPT
expected_prompt_sha256=c19dc42abcc044e25ef1982d35da9c0e7101406ff5495c78f4a05e500cf00999
actual_prompt_sha256=c19dc42abcc044e25ef1982d35da9c0e7101406ff5495c78f4a05e500cf00999
xrun_exit_code=0
codex_exit_code=0
browser_identity_revalidated=true
baseline_submit_aria=Start Voice
pasted_submit_aria=Start Voice
send_click_count=0
```

The exact failure was:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

The Ui.Vision log shows the failing watcher resolved the composer to a finder snapshot, passed that snapshot to `uiv.browser.click`, and Ui.Vision converted it into a coordinate click on a `div` immediately before `${KEY_CTRL+KEY_V}`. No material Send occurred.

The previously target-PASS Q08 input diagnostic uses the same exact composer locator string directly with `uiv.browser.click(COMPOSER)` and proved the required `Start Voice -> Send prompt` transition plus sentinel-protected copy-back on the target generation.

Root-cause hypothesis: snapshot-object composer clicks can fail to retain the rich-editor focus required by trusted key input, while direct locator-string clicks focus the intended editor correctly.

Status: **SUPPORTED, NOT TARGET-CONFIRMED** until a corrected target run passes this boundary.

### Current correction

The watcher now:

- defines only the exact Q08 target-qualified composer locator:
  `css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]`;
- requires exactly one matching composer before paste and before copy-back;
- calls `uiv.browser.click(COMPOSER)` directly for both material focus operations;
- never passes a finder snapshot object as the composer focus target;
- retains all existing sentinel, identity, Codex, one-Send, ambiguity, submission-confirmation, and master-harness semantics.

The regression simulation now models the real target distinction: snapshot-object clicks lose editor focus; direct locator-string clicks establish focus. The exact pre-correction watcher fails that simulation with the target signature `Start Voice -> Start Voice`; the corrected watcher passes.

## Seven-cycle master design

The master harness still performs one bounded seven-cycle run:

- cycle 0: deterministic forced seed `SEND_PROMPT` to prove the complete target mechanical path and establish a controlled handshake;
- cycles 1-5: normal production mode; Codex must independently choose `SEND_PROMPT` and return exactly `LIGHT_SOAK_01` through `LIGHT_SOAK_05` from the preceding ChatGPT assistant state;
- cycle 6: normal production mode; Codex must choose `STOP` when the assistant explicitly declares the objective complete.

Total successful run:

- 7 Codex turns;
- 6 bounded safe material Sends;
- 5 normal-production semantic SEND decisions;
- 1 normal-production terminal STOP decision.

PowerShell remains a deterministic supervisor/test oracle only. It does not decide semantics and does not perform ChatGPT browser actions.

Every SEND cycle requires the exact source chain, unique nonce, expected assistant SHA-256, exact Codex action/prompt hash, browser identity revalidation, Q08 locator-based focus, `Start Voice -> Send prompt`, sentinel replacement, exact staged copy, exactly one Send, exact user-message confirmation, and following stable assistant completion.

The terminal cycle requires `STOP`, empty prompt hash, zero Send clicks, no submission and no next-completion wait.

Qualification-only bridge guards validate expected source identity/hash before Codex and expected action/prompt hash after Codex but before returning an actionable result to Ui.Vision. Therefore a wrong semantic Codex output fails before staging or Send. These guards are inactive in normal production unless `master_qualification_mode=true`.

The master harness stops at the first failure and never retries a failed or ambiguous material action. Partial evidence is preserved.

## Current master source binding

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
```

## Fresh local verification

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

The local execution environment has no Windows PowerShell/real Chrome+Ui.Vision target, so no target PASS is claimed from these local results.

## Remaining acceptance boundary

Run the corrected packaged master qualification once against exactly one completed configured-Project ChatGPT conversation with an empty composer showing `Start Voice`. Do not interact with ChatGPT during the run.

A genuine master PASS requires all seven target cycles and the returned evidence ZIP to verify independently. If cycle 0 now passes, the same run automatically proceeds through the semantic soak and terminal STOP. Any failure stops without retry and must be diagnosed from its evidence.

After independently verified master PASS, the current same-chat production path **and bounded reliability soak** are qualified. Fresh-chat/recovery remains the next separate major stage.

The older one-off production target runner remains available only as a focused diagnostic fallback; the master harness is the preferred qualification path.
