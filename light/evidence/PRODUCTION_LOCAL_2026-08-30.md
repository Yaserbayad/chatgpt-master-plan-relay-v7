# Light Production Watcher — Local Verification 2026-08-30

Status: **locally verified corrected target candidate; real-browser production target PASS required**.

This record applies only to `light-version`. It does not alter or imply main-project state.

## Preconditions

- Q15-B target qualification is independently verified PASS in `light/evidence/Q15B_2026-08-30.md`.
- Production contract is frozen in `light/PRODUCTION_CONTRACT.md`.
- First target increment is same-chat only and permits at most one material Send.
- The first production target attempt failed pre-Send at staging verification; see `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_122613.md`.

## Current corrected source binding

The locally tested bytes are bound to these Git blobs on `light-version`:

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
dc934f5a39ecf2c877c47e9936aeb13a7b8cc620  light/production/LIGHT_PRODUCTION_WATCHER.js
ea7878a8b9849d9aa2f1fbd822004d0bfb6fafb4  light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  light/production/RelayCodexLightProduction.ps1
147274e28a75c3ad585dbc2e410e8c6b338b8573  light/tests/test_production_contract.mjs
de8c1f3d3218c0f3da6df060fdde3fd0b65e2d95  light/tests/simulate_production_watcher.mjs
```

Current local SHA-256 values:

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
594c64e8093bbd33b77bd80f967fb41a5fb3a62ec51edca193c5c98ce759a977  LIGHT_PRODUCTION_WATCHER.js
26814afa20b19849aed404cf9d3cd836ccc57a2c1c49d16aad3c16f8aa7d43c9  RUN_LIGHT_PRODUCTION_TARGET.ps1
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
b281d85b128e4d3c33a3defa2fd3ad12cb5c848d3dc68fd2af4c5c225b981cc2  test_production_contract.mjs
c78d38d7920a20ceb9a5ff5a2a81be5edb7baa3e2e7d9e1921d60a9a94c679eb  simulate_production_watcher.mjs
```

## Verification performed after the target failure correction

```text
node --check light/production/LIGHT_PRODUCTION_WATCHER.js
PASS (exit 0)

node light/tests/test_production_contract.mjs
LIGHT PRODUCTION CONTRACT TESTS: PASS

node light/tests/simulate_production_watcher.mjs
LIGHT PRODUCTION STAGE COPY-BACK SIMULATION: PASS
```

The local Linux execution environment does not contain `pwsh`, so PowerShell runtime execution is not claimed from local evidence. The unchanged PowerShell bridge/runner remain target-bound to Windows.

## Corrected staging-verification behavior

The failed target revision treated a Ui.Vision rich contenteditable finder snapshot's `.text/.value` as authoritative after clipboard paste. Ui.Vision v10 finder results are snapshots, so that check was removed from the material-send gate.

Current staging proof is:

1. prompt enters the clipboard;
2. trusted browser input sends only constant `${KEY_CTRL+KEY_V}`;
3. the composer is reacquired and refocused;
4. trusted input sends only constant `${KEY_CTRL+KEY_A}` and `${KEY_CTRL+KEY_C}`;
5. the copied composer text must exactly match the intended prompt, with CR normalization only;
6. original clipboard is restored;
7. source conversation/user/assistant identity is revalidated again before Send.

The model-generated prompt itself never enters the trusted-key parser.

## Behavior proven by static/simulation tests

- no dispatch while ChatGPT is generating;
- stable completed source-turn gating;
- one bridge event per source turn;
- handled/ambiguous source-turn dedupe before Codex;
- strict nonce/conversation/assistant binding before material action;
- `SEND_PROMPT | STOP | HUMAN` allowlist;
- STOP/HUMAN perform no material browser action;
- stale/empty rich-editor finder snapshot after successful paste no longer causes a false failure;
- corrupted copy-back fails before Send;
- exact trusted key sequence is Paste -> Select All -> Copy;
- source identity is revalidated after staging and before Send;
- at most one Send click;
- `SEND_AMBIGUOUS` is persisted before the material Send click;
- ambiguous confirmation and Send-click exception never retry;
- successful submission requires an exact new user message;
- success requires the following stable completed assistant turn;
- no OCR/screenshots/Ui.Vision AI/page-world eval/generic coordinates/fresh-chat/Chrome-restart logic.

## Remaining acceptance boundary

The corrected production watcher is **not target-PASS yet**. Run the replacement bounded Windows/Chrome package once. It may send exactly one fixed safe prompt, `Reply exactly LIGHT_PRODUCTION_TARGET_OK.`, and accepts PASS only when target evidence proves bridge/Codex exit 0, pre-action identity revalidation, exactly one Send click, exact submission confirmation, following stable completion, and a valid evidence ZIP.

Do not blindly repeat a failure; diagnose returned evidence first.
