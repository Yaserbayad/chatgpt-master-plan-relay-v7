# Light Master Qualification Target Failure — 2026-08-30 15:17:04Z

Status: **PRESERVED SAFE CYCLE-0 FAILURE — ZERO SENDS**

This record applies only to the independent `light-version` experiment. It does not change main Relay/master-plan authority.

## Evidence bundle

- Uploaded: `LIGHT_MASTER_QUALIFICATION_evidence_20260830_151704.zip`
- Outer ZIP SHA-256: `d5bf07a9b1164d618f5f757555008b5c1dbfda592d0faf633523d3006cfc9d53`
- Internal `SHA256.txt`: verified against every bundled file.
- Packaged branch head: `d8e088112a0d362ad5223bd5a6395984369ddbc0`
- Failed watcher Git blob: `58be604c2b7423437524f3f1e8bdb5ac333c62f8`
- Failed watcher SHA-256: `25fe4e3b519fefe792806210a3e5d8bed5d8d2b1b722d3e2a1f5daed44b20e45`

Target environment recorded by the bundle:

```text
powershell=5.1.26100.9168
codex=codex-cli 0.151.0
chrome=152.0.7977.65
```

## Exact failure boundary

Cycle `00_SEED` stopped with:

```text
STAGE_VERIFY_FAILED: submit surface did not transition to Send prompt; found count=1, aria=Start Voice
```

`MASTER_SUMMARY.csv` proves:

```text
actual_action=SEND_PROMPT
expected_prompt_sha256 == actual_prompt_sha256
codex_version=codex-cli 0.151.0
browser_identity_revalidated=true
baseline_submit_aria=Start Voice
pasted_submit_aria=Start Voice
copy_sentinel_replaced=false
staged_copy_exact=false
send_click_count=0
submission_confirmed=false
next_completion_observed=false
```

The Ui.Vision log proves the macro selected the correct Project conversation, completed `XRunAndWait` with exit 0, queried the exact composer locator, invoked trusted browser click, invoked `${KEY_CTRL+KEY_V}`, then still observed `Start Voice`. No Send click occurred.

## What this falsifies

The preceding locator-focus hypothesis is **FALSIFIED as the sufficient explanation**. Even when the production watcher passes the exact Q08 composer locator string to `uiv.browser.click`, Ui.Vision internally resolves the locator through `uiv.$` and logs the resulting trusted browser click as coordinates on the composer `div`; the target still fails with the same `Start Voice -> Start Voice` signature.

Therefore another locator/snapshot rewrite is not justified by this evidence.

## Recovered Q08 sequence boundary

Reinspection of preserved main-branch Q08 evidence exposes the hidden variable:

- `qualification/Q08_ATTEMPT5_SENTINEL_FAILURE.md` already records a fresh empty-composer attempt where trusted paste/copy was not proven, the observed draft stayed empty, the copy sentinel remained unchanged, and no post-paste Send surface appeared.
- `qualification/Q08_INPUT_PATH_DIAGNOSTIC.js`, which later produced the final Q08 target PASS, did **not** test clipboard paste from a pristine empty composer. It first performed ordinary trusted typing, verified `Start Voice -> Send prompt`, cleared via Ctrl+A/Backspace and verified `Send prompt -> Start Voice`, and only then performed Ctrl+V and observed `Start Voice -> Send prompt`.

Thus the final Q08 evidence target-qualified the **sequence**:

```text
ordinary trusted input -> clear -> clipboard paste -> sentinel-protected copy-back
```

It did not prove that fresh direct Ctrl+V from the initial `Start Voice` state works independently.

The Light production watcher incorrectly generalized the sequence-qualified Q08 result into a fresh-paste contract. The current target failure and Q08 Attempt 5 both contradict that generalization.

## Current correction rationale

Implementation may resume only for one narrow causal correction: restore the exact sequence-qualified precondition before model-prompt paste.

For every material SEND cycle the watcher must now require:

```text
Start Voice
-> trusted click + constant local ordinary input `x`
-> Send prompt
-> trusted Ctrl+A + Backspace
-> Start Voice
-> clipboard prompt + trusted Ctrl+V
-> Send prompt
-> unique sentinel + Ctrl+A/Ctrl+C
-> exact staged copy
-> one bounded Send
```

The constant `x` is local trusted test/mechanical data, not model/browser/user data. Model-generated prompt text remains clipboard-only and never enters `uiv.browser.type`.

New evidence fields distinguish the first failing input sub-boundary:

- `primer_submit_aria`
- `primer_cleared_aria`
- `pasted_submit_aria`

The deterministic master supervisor independently validates all three state transitions before accepting any SEND cycle.

## Root-cause status

**SUPPORTED, not yet target-CONFIRMED:** the missing ordinary-trusted-input priming/clear sequence is the material difference between the fresh-paste failures and the final Q08 target PASS.

Target confirmation requires the corrected master candidate to prove the primer transition, primer clear, clipboard paste, sentinel copy-back, and subsequent bounded flow. No further target retry should use the old fresh-paste sequence.
