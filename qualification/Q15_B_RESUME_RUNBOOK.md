# Q15-B Resume Runbook

Use only when Codex CLI allowance is available again.

## Preconditions

- Authoritative checkpoint still identifies this project and Q15 is `WAITING` on Codex usage availability.
- Existing Q15-B probe/package remains current; do not rebuild merely because time passed.
- Exactly one configured-Project ChatGPT conversation is open and completed/idle.

## Deterministic availability check

Run a harmless read-only Codex CLI invocation. If it still returns the usage-limit condition, remain `WAITING` and do not start Q15-B.

If Codex is available, run the already-published Q15-B package once:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Q15_B_INSTALL_AND_RUN.ps1
```

## Required result

The one qualification cycle must prove:

```text
completed ChatGPT response
→ UI.Vision event
→ local bridge
→ one Codex invocation
→ strict nonce/message-bound PROBE_OK
→ bridge validation
→ UI.Vision acceptance
```

with no ChatGPT Send, refresh, fresh-chat navigation, or other material browser mutation.

## Outcome handling

- PASS only after raw evidence independently proves every current Q15-B criterion; then reconcile Q15 PASS, reread/confirm checkpoint, and evaluate Q16 using `qualification/Q16_CANDIDATE_REPORT.md`.
- If Codex usage is still exhausted, keep Q15 WAITING; do not retry repeatedly.
- If the bridge materially fails after Codex actually runs, preserve the exact failure and diagnose that boundary; do not auto-retry or silently change architecture.

## Next artifact after PASS

Use `master-plan/POST_Q16_CODEX_WATCHER_REFREEZE_PREP.md` only if Q16 subsequently PASSes; it is preparation, not present implementation authority.
