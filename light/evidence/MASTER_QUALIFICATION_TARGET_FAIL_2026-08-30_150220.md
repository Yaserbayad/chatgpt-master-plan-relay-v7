# Light Master Qualification Target Failure — 2026-08-30 15:02:20Z

Status: **PRESERVED TARGET FAILURE — CYCLE 0 STOPPED SAFELY BEFORE SEND**.

This evidence applies only to the independent `light-version` project. It does not alter or imply main Relay/master-plan state.

## Evidence bundle

Uploaded bundle: `LIGHT_MASTER_QUALIFICATION_evidence_20260830_150220.zip`

Outer ZIP SHA-256:

`099cd0dd8f753289ecd75aba58340da7b95d69d267bdf0ca91415dadd197b065`

The internal `SHA256.txt` was independently verified successfully for all eleven bundled files.

Bundled runtime Git blobs:

```text
8328f06495b83c2f263b26e6e9f335d8df426aa5  LIGHT_PRODUCTION_WATCHER.js
2490165233cc5904e3731fc6ac4279e7ef29f2ef  RelayCodexLightProduction.ps1
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
09f513ce062387669c21c09d9f02dab6bb4009be  RUN_LIGHT_MASTER_QUALIFICATION.ps1
dc45da6fc711e4d429f31d92041bb8fb766a124d  MASTER_QUALIFICATION_CONTRACT.md
```

The bundled source therefore exactly matches the first master-harness candidate packaged from branch head `914f4bc98e93fdcc3abee1168e066d855eeb939b`.

## Target result

The harness stopped at cycle `00_SEED`, as required by its first-failure policy.

`MASTER_SUMMARY.csv` and the cycle CSV prove:

```text
actual_action=SEND_PROMPT
expected_prompt_sha256=c19dc42abcc044e25ef1982d35da9c0e7101406ff5495c78f4a05e500cf00999
actual_prompt_sha256=c19dc42abcc044e25ef1982d35da9c0e7101406ff5495c78f4a05e500cf00999
xrun_exit_code=0
codex_version=codex-cli 0.151.0
codex_exit_code=0
codex_duration_ms=10857
browser_identity_revalidated=true
baseline_submit_aria=Start Voice
pasted_submit_aria=Start Voice
copy_sentinel_replaced=false
staged_copy_exact=false
send_click_count=0
submission_confirmed=false
next_completion_observed=false
```

The exact watcher failure was:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

No Send click occurred and no ChatGPT user message was submitted.

## Minimum failing trace

Goal: stage the deterministic cycle-0 seed prompt in the empty ChatGPT composer.

Starting state:

- correct configured-Project conversation bound;
- stable completed assistant turn;
- Codex returned the exact expected `SEND_PROMPT` seed;
- browser identity revalidated;
- submit surface exactly `Start Voice`.

Action recorded by the Ui.Vision log:

```text
uiv.$ exact rich-text composer locator
uiv.browser.click x=641,y=741,tag=div
uiv.browser.type ${KEY_CTRL+KEY_V}
uiv.$ composer-submit-button-color
```

Expected observable result: submit surface transitions to `Send prompt`.

Actual observable result: submit surface remains `Start Voice`.

Smallest proven delta: trusted paste did not visibly stage text in the intended composer.

## Working/failing comparison

The already target-PASS Q08 input-path diagnostic on the same Ui.Vision/Chrome generation uses the exact composer locator string directly for material focus:

```text
const COMPOSER = css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]
uiv.browser.click(COMPOSER)
uiv.browser.type(${KEY_CTRL+KEY_V})
```

Q08 target evidence proves that this locator-based click path produced `Start Voice -> Send prompt`, then sentinel-protected copy-back.

The failed Light watcher instead first resolved the composer to a finder snapshot and then passed that snapshot to `uiv.browser.click`. The target log shows that path becoming a coordinate click on a `div` immediately before the failed paste.

This is a material implementation delta at the first unproven boundary.

## Diagnosis and correction

Hypothesis: snapshot-object composer clicks can fail to retain the rich editor focus required by trusted key input, while the Q08 target-qualified locator-string click focuses the intended editor correctly.

Status: **SUPPORTED, NOT YET TARGET-CONFIRMED**.

The hypothesis is supported by:

1. the exact target failure signature `Start Voice -> Start Voice` after snapshot-based click + Ctrl+V;
2. the target log showing the snapshot click resolved to coordinates on a `div`;
3. the Q08 target-PASS source/evidence using the exact locator string directly for the same trusted input sequence;
4. a new simulation regression that reproduces the target failure when snapshot clicks lose focus and passes only when locator-string clicks establish focus.

The production watcher correction is deliberately narrow:

- use the exact Q08 target-qualified composer locator as the single material input locator;
- require exactly one match before paste and copy-back;
- call `uiv.browser.click(COMPOSER)` directly for both focus operations;
- do not pass finder snapshot objects to `uiv.browser.click` for composer input;
- retain all existing Q08 sentinel, identity, one-Send, ambiguity, confirmation, Codex, and master-harness semantics unchanged.

Root cause is not marked CONFIRMED until the corrected path succeeds on the real target.

## Required next target evidence

Rerun the master harness only from the corrected package. Cycle 0 must first prove:

```text
baseline_submit_aria=Start Voice
pasted_submit_aria=Send prompt
copy_sentinel_replaced=true
staged_copy_exact=true
send_click_count=1
submission_confirmed=true
next_completion_observed=true
```

If cycle 0 passes, the same run continues automatically through the remaining production-semantic soak and terminal STOP cycles. Any new failure stops without retry and must be diagnosed from its evidence bundle.
