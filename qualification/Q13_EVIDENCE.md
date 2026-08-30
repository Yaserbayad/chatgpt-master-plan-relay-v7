# Q13 — Telegram qualification evidence

**Status:** PASS
**Date:** 2026-08-30

## Acceptance

Q13 requires one secure UI.Vision-controlled Telegram notification route, with successful delivery and no Telegram secret present in GitHub, macro source, or normal logs.

## Target delivery evidence

On 2026-08-30 the human operator explicitly confirmed that the already-configured relay Telegram notifications are working and are being received. This current target observation is accepted as the delivery proof; no duplicate qualification message is sent merely to reproduce an already-confirmed side effect.

Preserved target evidence from the qualified legacy route also records successful Telegram authentication and delivery on the same Windows target and the retained `RelayLocal.ps1` notification helper boundary.

## Secret-handling evidence

Preserved verified relay evidence establishes that:

- Telegram credentials are not embedded in UI.Vision macro JSON;
- Telegram configuration is stored in Windows user-scoped encrypted SecureString/DPAPI material;
- package verification rejects raw Telegram token URLs / token-shaped literals;
- runtime alert messages are fixed-content and the credential remains outside macro source.

The preserved v6 verification records the retained target-proven `RelayLocal.ps1` SHA-256 as:

`66e538e6033aadba3a1d56366bd9a3e1188a455e422a442fa3b787d6702db843`

and reports no concrete Telegram token candidate in the release tree.

The current Phase-Q repository scan at:

`qualification/codex-phase-q-sweep/Q13/raw-redacted/Q13_REPOSITORY_SECRET_HEURISTIC_SCAN.json`

found zero matches for Telegram bot-token-shaped values, token-bearing Telegram API URLs, JWTs, API-key-shaped values, cookie/session/access/refresh token assignments, bearer tokens, and PEM private-key headers in the changed qualification artifacts. The scan deliberately did not read the configured secret value.

No evidence artifact created for Q13 contains the Telegram token or chat credential.

## Acceptance mapping

- secure UI.Vision-controlled notification route: PASS — existing configured relay route is in active use and delivery is human-confirmed;
- message arrives: PASS — current target operator confirmation;
- secret absent from GitHub/repository artifacts: PASS — current heuristic scan plus preserved package invariant scans;
- secret absent from macro source: PASS — preserved verified architecture externalizes credentials from macros and rejects raw token literals;
- secret absent from normal evidence/logging path: PASS — preserved notification design uses fixed-content alerts with credentials externalized; current Q13 evidence contains no credential material.

No additional Telegram send is required for Q13 acceptance.
