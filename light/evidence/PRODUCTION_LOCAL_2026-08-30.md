# Light Production Watcher — Local Verification 2026-08-30

Status: **locally verified Q08-sentinel / submit-surface corrected target candidate; real-browser production target PASS required**.

This record applies only to `light-version`. It does not alter or imply main-project state.

## Target evidence history

- Q15-B target qualification: independently verified PASS.
- Production attempt 1: safe pre-Send staging snapshot false negative.
- Production attempt 2: safe pre-Send `SEND_CONTROL_MISSING`; led to a Q09 selector correction.
- Production attempt 3: independently verified the Q09 selector correction was actually executed and still failed pre-Send with `SEND_CONTROL_MISSING`; this falsified the selector-only diagnosis.
- Production attempt 4: runner preflight failed before Ui.Vision launch because the controlled macro staging directory was missing. No watcher evidence was produced.

Target evidence records:

- `light/evidence/PRODUCTION_TARGET_FAIL_2026-08-30_140440.md`
- `light/evidence/PRODUCTION_TARGET_PREFLIGHT_FAIL_2026-08-30_142107.md`

## Recovered target-qualified contract

Main Relay Q08 had already proven that comparing Ctrl+C output to the same payload left on the clipboard before Ctrl+V is an invalid oracle: paste/copy can silently no-op while the unchanged clipboard still equals the expected payload.

Q08 final target PASS required both:

- visible submit-surface state transition `Start Voice -> Send prompt` after trusted paste;
- a unique clipboard sentinel written before Ctrl+C, which Ctrl+C must replace with the editor contents.

It also established that only terminal U+00A0 markers may be normalized from rich-editor clipboard serialization.

The previous Light watcher omitted those requirements. The current candidate restores them before any material Send.

## Runner preflight repair

The target package runner previously required `C:\Users\usr\Desktop\uivision\macros` to exist before execution. That directory is a controlled staging location, not an external service dependency. The runner now creates it recursively with `[IO.Directory]::CreateDirectory($MacroDir)` and verifies it is a directory before copying the macro.

The watcher, bridge and action schema are unchanged by this repair.

## Current source binding

```text
d06dbdcfb341e443663736fcdc14274c0560b3c3  light/production/LIGHT_PRODUCTION_ACTION.schema.json
eb8ff2a0367732f66207b4611cfe7336b9da0d16  light/production/LIGHT_PRODUCTION_WATCHER.js
15bc7662948976fe06cbdd010566453049e69879  light/production/RUN_LIGHT_PRODUCTION_TARGET.ps1
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  light/production/RelayCodexLightProduction.ps1
8002197f4d5d504702fbe747f48fb7502abf2eca  light/tests/test_production_contract.mjs
9864c04ee91e140637871811ded502c27ecc2639  light/tests/simulate_production_watcher.mjs
```

Local SHA-256 values for the runner/test repair:

```text
93c6ec7739deec6ca196d264339d247bbba87622472b8f9e07e4309e6df3df7b  RUN_LIGHT_PRODUCTION_TARGET.ps1
5517cf670a37e9e5f07c5763c5f8388f0c1ebe20b4a688b6b0a387321df63bc9  test_production_contract.mjs
```

The runner/test Git blob SHAs exactly match `git hash-object` on the locally tested files.

## Verification performed

TDD first reproduced the runner bug: the current runner failed the self-heal contract because it treated `$MacroDir` as a hard pre-existing-path prerequisite.

After the repair:

```text
LIGHT RUNNER MACRODIR SELF-HEAL CONTRACT: PASS
LIGHT PRODUCTION CONTRACT TESTS: PASS
node --check light/production/LIGHT_PRODUCTION_WATCHER.js: PASS
```

The previously persisted sentinel watcher simulation remains unchanged and GREEN:

```text
LIGHT PRODUCTION SENTINEL/SUBMIT-SURFACE SIMULATION: PASS
```

## Current staging and Send proof

For `SEND_PROMPT` the watcher requires, in order:

1. source identity still current and ChatGPT not generating;
2. exactly one visible `composer-submit-button-color` surface with `aria-label="Start Voice"`;
3. clipboard prompt round-trip;
4. trusted click + constant Ctrl+V;
5. the visible submit surface transitions to enabled `aria-label="Send prompt"`;
6. a unique nonce-bound copy sentinel is written to the clipboard;
7. constant Ctrl+A + Ctrl+C replaces that sentinel;
8. copied editor text equals the prompt after CR normalization and terminal-NBSP-only normalization;
9. original clipboard is restored;
10. source identity is revalidated again;
11. the same visible submit surface is reacquired as enabled `Send prompt`;
12. `SEND_AMBIGUOUS` is persisted before the one allowed Send click;
13. exact new-user-message confirmation is required;
14. following stable completed assistant turn is required.

The model-generated prompt never enters `uiv.browser.type`; only constant trusted key chords do.

## Behavior proven by simulation/static tests

- no dispatch while generating;
- stable completed source-turn gating;
- one bridge event per source turn;
- strict nonce/conversation/assistant binding;
- STOP/HUMAN perform no material action;
- paste no-op fails before Send;
- copy no-op fails because the sentinel remains unchanged;
- copied-content mismatch fails before Send;
- terminal NBSP clipboard serialization is accepted narrowly;
- stale identity fails before material action;
- one Send maximum;
- `SEND_AMBIGUOUS` is persisted before the click;
- click failure / ambiguous confirmation do not retry;
- duplicate handled source turns are rejected before Codex;
- runner self-heals its Ui.Vision macro staging directory;
- no OCR, screenshots, Ui.Vision AI, page-world eval, generic coordinates, fresh-chat, or Chrome-restart behavior.

## Remaining acceptance boundary

The current production watcher is **not target-PASS**. Run the replacement bounded Windows/Chrome package once. PASS requires target evidence for the state transition, sentinel replacement, exact staged copy, one Send, exact user-message confirmation, and following stable assistant completion.

Do not repeat a failed target run before its evidence is diagnosed.
