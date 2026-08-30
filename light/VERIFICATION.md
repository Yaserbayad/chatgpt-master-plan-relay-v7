# Light Version Q15-B — Candidate Verification

Status: **locally verified candidate; target Windows runtime evidence required**.

## Final package/source hashes

```text
51980761e743684e5e6b39afaef5148b581c8ad963c7ef2d3ebc5c56545d5406  ChatGPT_Relay_Light_Q15B.zip
9a7a4bb476999c138ddf1c2838747ee5db078ab204bd9ef3eea89186aa251245  Q15B_LIGHT_PROBE.js
f81520414154db6e82df57c8f91e6c0afd209383a93ef16f772e06836a7fdb9f  RelayCodexLightBridge.ps1
d8aae726a7995f24f5b4c60ce3fd1871452b3d308eb78398677b3d8b4309a08b  Q15B_LIGHT_OUTPUT.schema.json
b66207f293c3ff6b3e3cac4021e117d771b16fc04bffc844dba63483901b9030  RUN_Q15B_LIGHT.ps1
5513f8e222e472bf954858bb4c24cafa879a84c8c86043a53eaef405b75fe059  README.md
d238a539867fa66e4f02c47e62b063bf2ade5a6f069f1d57b8f46ef6ca3142a8  DESIGN.md
```

## Verification performed

- ZIP integrity: PASS
- `node --check Q15B_LIGHT_PROBE.js`: PASS
- static Light contract tests: PASS
- simulated successful Ui.Vision bridge response: PASS
- simulated stale-nonce response: correctly rejected
- strict JSON schema parse: PASS
- no full assistant response persisted to disk by the bridge: enforced by test
- no response-derived sample persisted in evidence CSV: enforced by test
- no ChatGPT Send/click/navigation/refresh/OCR/Ui.Vision-AI path in the qualification macro: enforced by test
- exactly one `XRunAndWait` bridge invocation: enforced by test
- Codex candidate flags required at runtime: `--ephemeral`, `--skip-git-repo-check`, `--sandbox read-only`, `--output-schema`
- Codex child process hard timeout: 600 seconds; process tree terminated on timeout; no automatic retry

## Remaining acceptance boundary

This environment cannot execute the user's Windows PowerShell + Ui.Vision + locally authenticated Codex CLI stack. Therefore the candidate is not claimed to pass target qualification until `RUN_Q15B_LIGHT.ps1` produces a PASS evidence ZIP on that machine.
