# Q14 — Version/update control qualification

**Status:** PASS
**Date:** 2026-08-30

## Acceptance interpretation

Q14 requires proof that the exact qualified runtime version can be identified and that unexpected runtime drift can be detected or operationally prevented during a run. This is a qualification of the detection mechanism; wiring the qualified guard into the production relay is the later implementation responsibility of `I23 — Version drift guard`.

A separate material ChatGPT/UI.Vision browser action is not required to prove the detector itself.

## Target evidence

Existing target qualification evidence in:

- `qualification/codex-phase-q-sweep/Q14/VERSION_EVIDENCE.json`
- `qualification/codex-phase-q-sweep/Q14/raw/Q14_VERSION_GUARD_positive.json`
- `qualification/codex-phase-q-sweep/Q14/raw/Q14_VERSION_GUARD_chrome_mismatch.json`

proves:

1. Exact target tuple was identified on the live environment:
   - Windows `26100.9168`
   - running/on-disk Chrome `152.0.7977.65`
   - UI.Vision `10.0.178`
   - Desktop Automation `2.0.12`
   - Chrome profile directory `Default` from Local State
2. Correct tuple returned `MATCH` and exit code `0`.
3. An intentional expected-Chrome mismatch (`0.0.0.0`) returned `MISMATCH`, named both running and on-disk Chrome fields, set `material_action_allowed=false`, and exited `1`.
4. The guard rereads the live Chrome executable and UI.Vision extension manifest on every invocation, so drift is detected rather than assumed away.

## Boundary

The guard does not disable Chrome/UI.Vision updates and is not a browser supervisor. That is acceptable: Q14 permits **detection or operational prevention**. Production integration must call the qualified detector before material relay action; that implementation remains governed by I23 and its downstream tests.

## Acceptance mapping

- exact version can be identified: PASS
- unexpected drift can be detected: PASS
- fail-closed mismatch signal exists before material action (`material_action_allowed=false`, nonzero exit): PASS

Q14 is therefore accepted without an additional target browser action.
