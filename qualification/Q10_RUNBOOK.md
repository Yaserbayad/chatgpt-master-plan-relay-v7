# Q10 — Same-Project Fresh-Chat / SPA Qualification Runbook

Status: TARGET EVIDENCE PARTIAL — CORRECTED MATERIAL PROBE READY
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`
Qualification probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`
Root discovery probe: `qualification/Q10_PROJECT_ROOT_DISCOVERY.js`
Depends on: Q09 PASS

Evidence history:
- `qualification/Q10_ATTEMPT1_PROJECT_ROOT_READINESS_FAILURE.md`
- `qualification/Q10_ATTEMPT2_ROOT_NO_COMPOSER.md`
- `qualification/Q10_PROJECT_ROOT_DISCOVERY_EVIDENCE.md`

## Objective

Prove:
- fresh entry stays in the configured Project;
- the fresh-chat entry path is deterministic;
- exactly one trusted qualification Send occurs;
- a new conversation ID appears and differs from the previous conversation ID;
- transitional SPA URL states do not cause false wrong-Project classification;
- no resend occurs after the single Send.

## Prior target evidence

### Attempts 1–2

Attempt 1 safely failed before Send after reaching the previously assumed Project root but finding no immediately mounted composer.

Attempt 2 added a bounded readiness wait. Its CSV is `Q10_fresh_chat_spa_2026-08-29T22-38-49-879Z.csv`, SHA-256 `5080d3e06e88ee59ae75b19bcc784f5b93e1a75aa6ded1c9c48599f58429ef40`.

Attempt 2 proves:
- `send_action_count = 0`;
- `fresh_root_observed = 1`;
- the URL remained `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project`;
- all 12 observations classified the page as `SAME_PROJECT_TRANSITIONAL`;
- no conversation ID appeared;
- the old qualified composer selector never mounted.

No qualification message was sent and no resend ambiguity exists.

### Read-only Project-root discovery

`Q10_PROJECT_ROOT_DISCOVERY.js` was then run once. The resulting CSV is `Q10_project_root_discovery_2026-08-29T22-44-07-113Z.csv`, SHA-256 `5b4f838f44b66d9ab3e521d60cbec8a5bd881044f3f6df40da4c3078fd12f683`.

Durable analysis: `qualification/Q10_PROJECT_ROOT_DISCOVERY_EVIDENCE.md`.

The target discovery proves:
- actual Project-home URL in that run: `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project`;
- exactly one visible active Project sidebar row (`data-active`, `data-sidebar-item`, `data-sidebar-keep-open`, `role=button`);
- 10 visible `Open project home` buttons overall, but exactly one geometrically associated with that active Project row;
- exactly one visible Project-home editor `#prompt-textarea[role="textbox"][contenteditable="true"]`;
- its target accessible label is Project-scoped (`New chat in t`), not `Chat with ChatGPT`;
- the discovery itself performed no click, typing, clipboard mutation, navigation, refresh or Send.

Therefore the prior direct-root URL and title-independent old composer label were incorrect target assumptions. Increasing the previous wait would remain a materially equivalent retry and is not authorized.

## Corrected target-proven route

The corrected qualification probe now:
1. requires an existing completed conversation in the configured Project and captures its conversation ID;
2. locates exactly one active configured-Project conversation anchor by Project token and `/c/` route;
3. locates exactly one visible `Open project home` control in that anchor's nearest Project-group ancestor;
4. trusted-clicks that control once;
5. accepts generic ChatGPT SPA states as `UNKNOWN_TRANSITIONAL`, but positively classifies another explicit Project route as different;
6. waits for a same-Project `/project` surface with no conversation ID;
7. requires exactly one visible `#prompt-textarea[role="textbox"][contenteditable="true"]` composer;
8. stages `Q10_FRESH_CHAT_SPA_PROBE`;
9. reacquires exactly one enabled Send;
10. marks the transaction `DISPATCH_POSSIBLE` before invoking exactly one trusted Send, so a dispatched-but-throwing click is never classified pre-Send;
11. observes only until a different same-Project conversation ID and stable user-turn evidence appear or the run ends without resend;
12. passes only when exactly one newly observed stable user-message ID has text exactly equal to `Q10_FRESH_CHAT_SPA_PROBE`.

The Project title and target-route suffix are not hard-coded.

## Corrected probe verification

`qualification/Q10_FRESH_CHAT_SPA_PROBE.js`:
- JavaScript syntax check: PASS (`node --check`);
- exactly one material Send click site: PASS;
- no `uiv.open` direct navigation;
- no `uiv.eval`;
- no clipboard path;
- Git blob SHA: `d925e14b0c0ec609a8bcc12d23d991c0fcc12986`;
- SHA-256: `7684f33d8dc86309c8e71554212de8c064ab50ad8cfb6bdbb1cd087f49223d92`;
- local regression SHA-256: `72845de24cba99e05f5bf71872277fa49895f5cc7e6dfb6dd6e0079a0df08d3c`;
- regression cases: successful exact-marker correlation, dispatched-then-throw ambiguity, URL-only transition, absent marker, duplicate markers, and pre-Send failure.

Discovery evidence GitHub blob SHA: `9bb9c1443e00d2fbf5f90f881fc80a1891e6ed2f`.

## Exact next action — one material target run

1. In the target Chrome/UI.Vision environment, open any completed existing conversation inside the configured Project; do not start from Project home because Q10 must capture a previous conversation ID.
2. Confirm ChatGPT is idle/completed.
3. Run the current canonical `qualification/Q10_FRESH_CHAT_SPA_PROBE.js` exactly once.
4. Do not manually click/type during the run.
5. After execution, supply the exported `Q10_fresh_chat_spa_*.csv`.
6. If the probe reports `AMBIGUOUS_AFTER_POSSIBLE_SEND`, do not rerun it. Preserve the CSV for reconciliation.
7. If it reports `PRE_SEND_FAILURE`, do not repeat materially equivalent execution; analyze the evidence first.

## Q10 acceptance remains unchanged

Q10 can PASS only after target evidence proves all six conditions:
1. fresh entry remains in the configured Project;
2. the fresh-chat entry path is deterministic;
3. exactly one trusted qualification Send occurs;
4. a new conversation ID appears and differs from the previous conversation ID;
5. exactly one newly observed stable user-message ID contains the exact qualification marker;
6. no false wrong-Project classification occurs during transitional SPA states;
7. no resend is performed after the single Send.

Q10 remains TODO until those conditions are proven.
