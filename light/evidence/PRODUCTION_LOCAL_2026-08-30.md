# Light Production Watcher — Local Verification 2026-08-30

Status: **locally verified Q09-Send-discovery corrected target candidate; real-browser production target PASS required**.

This record applies only to `light-version`. It does not alter or imply main-project state.

## Preconditions and target evidence

- Q15-B target qualification is independently verified PASS in `light/evidence/Q15B_2026-08-30.md`.
- Production contract is frozen in `light/PRODUCTION_CONTRACT.md`.
- First target increment is same-chat only and permits at most one material Send.
- Target attempt 1 failed safely pre-Send at staging snapshot verification: `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`.
- Target attempt 2 independently proved the staging copy-back correction, then failed safely pre-Send at Send-control discovery: `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_123922.md`.

## Current source binding

The locally tested bytes are bound to these Git blobs on `light-version`:

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
c8968386530efc4381411fed1aae90dda38c485f  light/production/LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  light/production/RelayCodexLightProduction.ps1
9406c92c762f285f25cab7a29346bb6bc70a1b56  light/tests/test_production_contract.mjs
393ce2046207e8dc2d9df44b2d810bd8842bce36  light/tests/simulate_production_watcher.mjs
```

The watcher and both production test files were reread from GitHub after persistence and their Git blob SHAs exactly match `git hash-object` on the locally tested files.

Current local SHA-256 values:

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
50c14b5674425067d163cc3ee8b9bbab3538fab346d4a3d960b0c505b732062f  LIGHT_PRODUCTION_WATCHER.js
26814afa20b19849aed404cf9d3cd836ccc57a2c1c49d16aad3c16f8aa7d43c9  RUN_LIGHT_PRODUCTION_TARGET.ps1
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
3abbc6cc33cf3c632fcc70ad15517140628dbb43218f36346b8fc475829dffc2  test_production_contract.mjs
3e29051beb09385db802cfc512a059d2c814a6842306d195d13cc74df2aa1eac  simulate_production_watcher.mjs
```

## Verification performed after the Q09 Send-discovery correction

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION STAGE COPY-BACK SIMULATION: PASS

focused Q09 Send-discovery regression
SEND DISCOVERY REGRESSION: PASS
```

The local Linux execution environment does not contain `pwsh`, so PowerShell runtime execution is not claimed from local evidence. The unchanged PowerShell bridge/runner remain target-bound to Windows.

## Staging-verification behavior retained from target attempt 1

The model-generated prompt never enters the trusted-key parser. Current staging proof is:

1. prompt enters the clipboard;
2. trusted browser input sends only `${KEY_CTRL+KEY_V}`;
3. composer is reacquired/refocused;
4. trusted input sends only `${KEY_CTRL+KEY_A}` then `${KEY_CTRL+KEY_C}`;
5. copied composer text must exactly match the intended prompt, with CR normalization only;
6. original clipboard is restored;
7. source conversation/user/assistant identity is revalidated before Send.

Target attempt 2 reached beyond this gate without a staging failure, so the trusted copy-back path now has direct target evidence.

## Send-discovery correction from target attempt 2

Target attempt 2 proved `SEND_CONTROL_MISSING` after successful staging and identity revalidation, with `send_click_count=0`. The failed Light watcher searched only visible generic selectors.

Existing target-qualified main Relay Q09 technical evidence had already proven:

```text
css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]
includeHidden: true
enabled-state filtering
```

The current Light watcher restores those mechanical invariants:

- Q09-qualified selector is first;
- all Send candidate searches use `includeHidden: true`;
- candidates with `disabled` or `aria-disabled=true` are rejected;
- multiple enabled candidates for one locator are treated as ambiguous failure;
- generic selectors remain secondary fallbacks.

No material-send semantics changed.

## Behavior proven by static/simulation tests

- no dispatch while ChatGPT is generating;
- stable completed source-turn gating;
- one bridge event per source turn;
- handled/ambiguous source-turn dedupe before Codex;
- strict nonce/conversation/assistant binding before material action;
- `SEND_PROMPT | STOP | HUMAN` allowlist;
- STOP/HUMAN perform no material browser action;
- stale/empty rich-editor finder snapshots do not cause false staging failure;
- corrupted copy-back fails before Send;
- exact trusted key sequence is Paste -> Select All -> Copy;
- source identity is revalidated after staging and before Send;
- Send discovery requires the Q09-qualified hidden semantic path in regression simulation;
- at most one Send click;
- `SEND_AMBIGUOUS` is persisted before the material Send click;
- ambiguous confirmation and Send-click exception never retry;
- successful submission requires an exact new user message;
- success requires the following stable completed assistant turn;
- no OCR/screenshots/Ui.Vision AI/page-world eval/generic coordinates/fresh-chat/Chrome-restart logic.

## Remaining acceptance boundary

The corrected production watcher is **not target-PASS yet**. Run the replacement bounded Windows/Chrome package once. It may send exactly one fixed safe prompt, `Reply exactly LIGHT_PRODUCTION_TARGET_OK.`, and accepts PASS only when target evidence proves bridge/Codex exit 0, staging copy-back, qualified Send discovery, exactly one Send click, exact submission confirmation, following stable completion, and a valid evidence ZIP.

Do not blindly repeat a failure; diagnose returned evidence first.
