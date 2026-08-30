# Light Version Q15-B — Candidate Verification

Status: **locally verified source candidate; target Windows runtime evidence required**.

## Current source hashes

```text
88d3b91439b8e90b5db5f72dab2f900fc3b6ac1ba54996342ab36bc3ba72a386  Q15B_LIGHT_PROBE.js
f81520414154db6e82df57c8f91e6c0afd209383a93ef16f772e06836a7fdb9f  RelayCodexLightBridge.ps1
d8aae726a7995f24f5b4c60ce3fd1871452b3d308eb78398677b3d8b4309a08b  Q15B_LIGHT_OUTPUT.schema.json
236154a40fc1b0634487a5fb13c2abf351108c38af5f44c4a374781a098f74dc  RUN_Q15B_LIGHT.ps1
d344456cd053be37a2d2fdb59ab1295d47310ecd67a4af6889e9d05a4fc1c919  TEST_CODEX_DIRECT.ps1
5f000fa4b86505feb450f51e71437eec1bd2576d82de97452e0601343b9634ec  README.md
d238a539867fa66e4f02c47e62b063bf2ade5a6f069f1d57b8f46ef6ca3142a8  DESIGN.md
ca003962c08e9815d7a9e55defba2ebc4a55f966df4ef693e2ffaaafe1dec79c  test_contract.mjs
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
- direct preflight failure diagnostics now capture Codex version plus both stdout and stderr and write `CODEX_DIRECT_DIAGNOSTIC_*.txt` for unclassified nonzero exits
- credit/usage-limit classification now evaluates the combined stdout/stderr diagnostic rather than stderr alone
- strict JSON schema parse: PASS
- no full assistant response persisted to disk by the bridge: enforced by test
- no response-derived sample persisted in evidence CSV: enforced by test
- no ChatGPT Send/click/navigation/refresh/OCR/Ui.Vision-AI path in the qualification macro: enforced by test
- exactly one `XRunAndWait` bridge invocation: enforced by test
- Codex qualification flags required at runtime: `--ephemeral`, `--skip-git-repo-check`, `--sandbox read-only`, `--output-schema`
- Q15-B Codex child process hard timeout: 600 seconds; process tree terminated on timeout; no automatic retry
- direct Codex preflight timeout: 120 seconds; process tree terminated on timeout

## Latest target boundary

On 2026-08-30 the Windows direct Codex preflight reached `codex exec` and returned exit code 1 before Q15-B/Ui.Vision started. The then-current preflight exposed only stderr on nonzero exit; stderr was empty, so the durable evidence is insufficient to classify the failure as credits, authentication, configuration, sandbox/runtime, network, or another Codex-side cause.

This target result does **not** establish a Ui.Vision, PowerShell bridge, or Light architecture failure. Q15-B remains **not PASS** and was not executed in that attempt.

## Remaining acceptance boundary

1. Rerun the corrected `TEST_CODEX_DIRECT.ps1` and use its combined stdout/stderr diagnostic.
2. If it reports `CODEX_CREDITS_REQUIRED`, stop until Codex entitlement is available.
3. If it reports another `CODEX_DIRECT_FAIL`, preserve `CODEX_DIRECT_DIAGNOSTIC_*.txt` and diagnose that exact Codex boundary before any browser qualification.
4. Continue only after `CODEX_DIRECT_PASS` with exit code 0.
5. Then run `RUN_Q15B_LIGHT.ps1` against exactly one completed configured-Project ChatGPT conversation tab.
6. Q15-B passes only when the runner produces a PASS evidence ZIP from that target machine.

Production watcher/actuator implementation remains gated on target Q15-B PASS.
