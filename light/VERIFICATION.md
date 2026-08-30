# Light Version Q15-B — Candidate Verification

Status: **locally verified source candidate; target Windows runtime evidence required**.

## Current source hashes

```text
88d3b91439b8e90b5db5f72dab2f900fc3b6ac1ba54996342ab36bc3ba72a386  Q15B_LIGHT_PROBE.js
6163e0a2b87e0797bc23ddf372ba977c5c867bc85ed9cdd885bb214cba5515df  RelayCodexLightBridge.ps1
d8aae726a7995f24f5b4c60ce3fd1871452b3d308eb78398677b3d8b4309a08b  Q15B_LIGHT_OUTPUT.schema.json
236154a40fc1b0634487a5fb13c2abf351108c38af5f44c4a374781a098f74dc  RUN_Q15B_LIGHT.ps1
03c40c7189abd4c013edf6c800c491b393cbb839da78cda445dcc504e2790eb2  TEST_CODEX_DIRECT.ps1
b5c2d722464b1b7c244203fcc189e2b13630605687c69ae700b31b4a20dde394  README.md
d238a539867fa66e4f02c47e62b063bf2ade5a6f069f1d57b8f46ef6ca3142a8  DESIGN.md
b83c657818075b8121d7846129b7c8a2e2cbe14319fff7b3151fa73c47c5b562  test_contract.mjs
b7cdd33add064e56d89b57671d298d6ba3fc42d0bcdd819be719899175fbf748  simulate_probe.mjs
```

The previous Q15-B ZIP hash is not asserted for this source revision because the source set changed. Target evidence must be produced from the current files.

## Verification performed in this development environment

- `node --check Q15B_LIGHT_PROBE.js`: PASS
- static Light contract tests: PASS
- simulated successful Ui.Vision bridge response: PASS
- simulated stale-nonce response: correctly rejected
- simulated Codex credit exhaustion, including the alternate `reached your usage limit / increase your limits` wording: remains Q15-B FAIL and is recorded as `failure_class=CODEX_CREDITS_REQUIRED`
- Ui.Vision 10.0.178 evidence-export regression: the old `uiv.exportToDownloads(file)` path fails against the qualified v10 API shape; corrected `uiv.files.exportToDownloads(file)` passes
- direct Codex preflight diagnostics capture Codex version plus both stdout and stderr and write `CODEX_DIRECT_DIAGNOSTIC_*.txt` for unclassified nonzero exits
- credit/usage-limit classification evaluates combined stdout/stderr rather than stderr alone
- explicit-stdin regression: both Codex call sites require `codex exec ... -` plus finite prompt stdin and forbid the previous positional-prompt invocation
- explicit-stdin regression: PASS after correction in both `TEST_CODEX_DIRECT.ps1` and `RelayCodexLightBridge.ps1`
- strict JSON schema parse: PASS
- no full assistant response persisted to disk by the bridge: enforced by test
- no response-derived sample persisted in evidence CSV: enforced by test
- no ChatGPT Send/click/navigation/refresh/OCR/Ui.Vision-AI path in the qualification macro: enforced by test
- exactly one `XRunAndWait` bridge invocation: enforced by test
- Codex qualification flags retained: `--ephemeral`, `--skip-git-repo-check`, `--sandbox read-only`, `--output-schema`
- Q15-B Codex child process hard timeout: 600 seconds; process tree terminated on timeout; no automatic retry
- direct Codex preflight timeout: 120 seconds; process tree terminated on timeout

## Latest target boundary

On 2026-08-30 the corrected diagnostic preflight was run on the Windows target and reported:

- `codex_version=codex-cli 0.151.0`
- `exit_code=1`
- stdout empty
- stderr empty
- Q15-B/Ui.Vision not started

Therefore the failure is localized before the Ui.Vision/browser qualification. The result does not prove a credit limit, authentication failure, Windows sandbox failure, or Light architecture defect because Codex emitted no diagnostic payload.

A concrete transport defect was then identified in the Light source: both Codex call sites supplied a positional prompt while leaving inherited non-TTY stdin implicit. Current source changes only that boundary by using the explicit stdin sentinel (`codex exec ... -`) and piping a finite prompt to stdin. The read-only sandbox and all Q15-B acceptance semantics are unchanged.

The explicit-stdin defect is proven in the previous Light source. **It is not yet proven to be the cause of the target exit-code-1 result.** Target rerun is required before accepting that diagnosis.

## Remaining acceptance boundary

1. Rerun the current `TEST_CODEX_DIRECT.ps1` (or the supplied launcher package) on the same Windows target.
2. If it reports `CODEX_CREDITS_REQUIRED`, stop until Codex entitlement is available.
3. If it reports another `CODEX_DIRECT_FAIL`, preserve the new `CODEX_DIRECT_DIAGNOSTIC_*.txt`; do not blindly repeat the same run and do not start Q15-B.
4. If the explicit-stdin run still returns silent exit code 1, isolate the native Windows Codex boundary next (foreground control, then sandbox/version/config as evidence dictates) before changing architecture or weakening the sandbox.
5. Continue only after `CODEX_DIRECT_PASS` with exit code 0.
6. Then run `RUN_Q15B_LIGHT.ps1` against exactly one completed configured-Project ChatGPT conversation tab.
7. Q15-B passes only when the runner produces a PASS evidence ZIP from that target machine.

Production watcher/actuator implementation remains gated on target Q15-B PASS.
