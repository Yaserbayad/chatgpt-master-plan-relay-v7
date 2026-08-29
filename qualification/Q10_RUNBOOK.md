# Q10 — Same-Project Fresh-Chat / SPA Qualification Runbook

Status: TARGET EVIDENCE PARTIAL — PROJECT-ROOT CONTROL DISCOVERY REQUIRED
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Qualification probe: `qualification/Q10_FRESH_CHAT_SPA_PROBE.js`
Root discovery probe: `qualification/Q10_PROJECT_ROOT_DISCOVERY.js`
Depends on: Q09 PASS

Evidence history:
- `qualification/Q10_ATTEMPT1_PROJECT_ROOT_READINESS_FAILURE.md`
- `qualification/Q10_ATTEMPT2_ROOT_NO_COMPOSER.md`

## Objective

Prove:
- fresh entry stays in the configured Project;
- a new conversation ID appears after the one trusted qualification Send;
- transitional SPA URL states are handled without false wrong-Project classification;
- no resend occurs after the single Send.

## Current target evidence

Attempt 1 safely failed before Send after reaching the configured Project root but finding no immediately mounted composer.

Attempt 2 added a bounded readiness wait. Its CSV is `Q10_fresh_chat_spa_2026-08-29T22-38-49-879Z.csv`, SHA-256 `5080d3e06e88ee59ae75b19bcc784f5b93e1a75aa6ded1c9c48599f58429ef40`.

Attempt 2 proves:
- `send_action_count = 0`;
- `fresh_root_observed = 1`;
- the URL remained `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project`;
- all 12 observations from `2026-08-29T22:38:20.842Z` through `2026-08-29T22:38:47.516Z` classified the page as `SAME_PROJECT_TRANSITIONAL`;
- no conversation ID appeared;
- the qualified chat composer never mounted.

Therefore the Project root is not merely a delayed version of the conversation composer surface in this target UI. Increasing the wait again would be a materially equivalent retry and is not authorized.

## Exact next action — read-only discovery

Run `Q10_PROJECT_ROOT_DISCOVERY.js` once while the browser is still on the configured Project root.

The diagnostic is read-only. It performs no:
- click;
- typing;
- clipboard mutation;
- navigation;
- refresh;
- Send/Submit.

It exports `Q10_project_root_discovery_*.csv` containing:
- every `button`, link, `role=button`, and `role=link` snapshot;
- all input/textarea/contenteditable surfaces;
- headings;
- forms;
- main-page text snapshot;
- href, id, name, type, role, data-testid, aria-label, title, disabled state, class, geometry, and captured attributes.

The purpose is to identify the actual target-proven control/surface that starts a new chat inside this Project. The production Q10 route must be based on that evidence rather than guessed selectors or longer waits.

## Discovery verification

`Q10_PROJECT_ROOT_DISCOVERY.js`:
- JavaScript syntax check: PASS (`node --check`);
- read-only static guard: PASS;
- no `uiv.browser.click`;
- no `uiv.browser.type`;
- no clipboard write;
- no `uiv.open` navigation;
- no Send action;
- GitHub blob SHA: `f44957d2b7b249ba92c943046a017a421e0ad14c`;
- SHA-256: `5508c3788719d718db6a8032ea96e51dfe8d3c051b205a3100dedb5e019da1ff`.

## Q10 acceptance remains unchanged

Q10 can PASS only after target evidence proves:
1. fresh entry remains in the configured Project;
2. the fresh-chat entry path is deterministic;
3. exactly one trusted qualification Send occurs;
4. a new conversation ID appears and differs from the previous conversation ID;
5. no false wrong-Project classification occurs during transitional SPA states;
6. no resend is performed after the single Send.

Q10 remains TODO until those conditions are proven.
