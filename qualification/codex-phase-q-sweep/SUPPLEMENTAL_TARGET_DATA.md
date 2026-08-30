# Supplemental target data

This file includes only selector, URL grammar, and runtime facts relevant to Q10–Q15. It intentionally excludes unrelated personal content.

## URL grammar and identifiers

- Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`.
- Observed conversation URL: `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`.
- Observed Project-home link: `/g/g-p-6a9323b61110819182dba0224678aa8b-t/project`, visible label `Open t project`.

## Q10 selector/runtime facts

- Legacy selector `[data-sidebar-item][data-sidebar-keep-open="true"][data-active][role="button"]`: count `0`.
- Current active node: `A[data-sidebar-item][data-active]` with target conversation `href`; it has neither `data-sidebar-keep-open` nor explicit `role`.
- Nearest Project-group `LI`, four parent hops above active anchor: exactly one visible `button[aria-label="Open project home"]`.
- Target-proven strong selector: `li:has(a[data-sidebar-item][data-active][href*="g-p-6a9323b61110819182dba0224678aa8b"][href*="/c/"]) button[aria-label="Open project home"]`; count `1`, visible `true`.
- Current composer count `1`; label `Chat with ChatGPT`; with empty idle draft no visible Send or Stop control.
- Current visible stable user IDs: `be8d5f4e-d9b8-4cff-b7a8-c69474814783`, `38eb6d48-0578-4f73-8ade-33055a2bf1a6`.
- Current visible stable assistant IDs: `d185f1ae-c05f-4b8a-8875-19f25091e2a9`, `ce63490d-2ff6-46d6-ac98-962a153294ee`.
- Relevant target console error/warning set: empty.

## Q10 corrected CLI run facts

- UI.Vision version: `10.0.178`; storage mode: hard-drive (`xfile`).
- Canonical macro SHA-256: `7684f33d8dc86309c8e71554212de8c064ab50ad8cfb6bdbb1cd087f49223d92`.
- One macro start was recorded at `2026-08-30T05:56:38.705Z`.
- UI.Vision run-local selector counts: active configured-Project conversation links `0`; Open-sidebar controls `0`.
- Send boundary: `send_action_count=0`, `send_dispatch_state=NOT_ATTEMPTED`.
- Post-run target: same Project token and old conversation ID, idle, marker absent, no new conversation.

These are time- and state-specific observations, not eternal selector guarantees. Material actions must reacquire and enforce strict uniqueness.
