# Light Version Q15-B — Candidate Verification

Status: **locally verified source candidate; target Windows runtime evidence required**.

## Current source hashes

```text
88d3b91439b8e90b5db5f72dab2f900fc3b6ac1ba54996342ab36bc3ba72a386  Q15B_LIGHT_PROBE.js
f81520414154db6e82df57c8f91e6c0afd209383a93ef16f772e06836a7fdb9f  RelayCodexLightBridge.ps1
d8aae726a7995f24f5b4c60ce3fd1871452b3d308eb78398677b3d8b4309a08b  Q15B_LIGHT_OUTPUT.schema.json
236154a40fc1b0634487a5fb13c2abf351108c38af5f44c4a374781a098f74dc  RUN_Q15B_LIGHT.ps1
f2bad5ed5a3f308647ab051724f89f89f6f1340843505c79465aec17c5488db8  TEST_CODEX_DIRECT.ps1
47770c97f41170b92d9b4705b7a4278dcc46469cd1d8983d6bd23d41ae7c9a2e  README.md
d238a539867fa66e4f02c47e62b063bf2ade5a6f069f1d57b8f46ef6ca3142a8  DESIGN.md
b5f88ad6ec8920dbf486b0b23e48b4fbc8a5a3bc5ad3acda370f16907274a86d  test_contract.mjs
b7cdd33add064e56d89b57671d298d6ba3fc42d0bcdd819be719899175fbf748  simulate_probe.mjs
```

The previous Q15-B ZIP hash is not asserted for this source revision because the source set changed. Target evidence must be produced from the current files.

## Verification performed in this development environment

- `node --check Q15B_LIGHT_PROBE.js`: PASS
- static Light contract tests: PASS
- simulated successful Ui.Vision bridge response: PASS
- simulated stale-nonce response: correctly rejected
- simulated Codex credit exhaustion, including the alternate `reached your usage limit / increase your limits` wording: remains Q15-B FAIL and is recorded as `failure_class=CODEX_CREDITS_REQUIRED`
- Ui.Vision 10.0.178 evidence-export regression: the old `uiv.exportToDownloads(file)` path fails when tested against the qualified v10 API shape; corrected `uiv.files.exportToDownloads(file)` passes the same simulation
- direct Codex preflight static contract: PASS
- strict JSON schema parse: PASS
- no full assistant response persisted to disk by the bridge: enforced by test
- no response-derived sample persisted in evidence CSV: enforced by test
- no ChatGPT Send/click/navigation/refresh/OCR/Ui.Vision-AI path in the qualification macro: enforced by test
- exactly one `XRunAndWait` bridge invocation: enforced by test
- Codex qualification flags required at runtime: `--ephemeral`, `--skip-git-repo-check`, `--sandbox read-only`, `--output-schema`
- Q15-B Codex child process hard timeout: 600 seconds; process tree terminated on timeout; no automatic retry
- direct Codex preflight timeout: 120 seconds; process tree terminated on timeout

## Current external blocker

Successful Codex model execution is currently unavailable because the target workspace reports exhausted Codex credits. This is an external execution blocker, not evidence of a Light architecture or Ui.Vision/PowerShell bridge defect. Q15-B therefore remains **not PASS**.

## Remaining acceptance boundary

This environment cannot execute the user's Windows PowerShell + Ui.Vision + locally authenticated Codex CLI stack. When Codex credits are available:

1. Run `TEST_CODEX_DIRECT.ps1` and require `CODEX_DIRECT_PASS` with exit code 0.
2. Then run `RUN_Q15B_LIGHT.ps1` against exactly one completed configured-Project ChatGPT conversation tab.
3. Q15-B passes only when the runner produces a PASS evidence ZIP from that target machine.

Production watcher/actuator implementation remains gated on target Q15-B PASS.
