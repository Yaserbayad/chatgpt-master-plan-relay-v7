# Q08 — V10 Trusted Composer/Input Qualification Runbook

Status: PASS — TARGET QUALIFICATION COMPLETE
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project: https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project
Canonical qualification probe: `qualification/Q08_INPUT_PROBE.js`
Input-path diagnostic: `qualification/Q08_INPUT_PATH_DIAGNOSTIC.js`
Final evidence: `qualification/Q08_EVIDENCE.md`

Evidence history:
- `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`
- `qualification/Q08_ATTEMPT2_SEND_DISCOVERY_FAILURE.md`
- `qualification/Q08_ATTEMPT3_DISCOVERY_RUNTIME_FAILURE.md`
- `qualification/Q08_ATTEMPT4_SEND_DISCOVERY_EVIDENCE.md`
- `qualification/Q08_ATTEMPT5_SENTINEL_FAILURE.md`

## Objective

Target-prove the Q08 WBS requirements without Submit:
- exactly one eligible composer;
- trusted `uiv.browser.click`;
- clipboard-backed multiline/Unicode prompt paste via trusted browser input;
- exactly one enabled Send control after staging;
- correct draft created with browser background allowed.

## Final target result

Final CSV:
`Q08_input_path_2026-08-29T22-06-26-226Z.csv`

SHA-256:
`2e6bafe998f12bc547adb2b0a4ed958555e0741818b544e9ab16c071e85a3ec5`

Observed target transition sequence:

`Start Voice → Send prompt → Start Voice → Send prompt`

Result fields:
- `direct_type_success = 1`
- `combo_clear_success = 1`
- `paste_state_success = 1`
- `copy_changed_sentinel = 1`

This proves trusted direct typing, trusted Ctrl+A/Backspace, clipboard-backed trusted Ctrl+V, and trusted Ctrl+C copy-back all operated on the ChatGPT composer.

The copied-back value equals the expected multiline/Unicode payload plus exactly two terminal `U+00A0` non-breaking spaces. All internal line breaks, the intentional blank line, and every Unicode character match exactly.

Verification therefore normalizes only terminal `U+00A0` clipboard serialization markers after CRLF/CR→LF normalization. It does not trim or normalize internal whitespace.

The operator visually confirmed the full qualification payload remained in the composer as an unsent draft.

## PASS criteria

PASS is satisfied because target evidence establishes:
1. correct Project/conversation identity;
2. exactly one composer;
3. trusted `uiv.browser.click` / trusted typing operation;
4. clipboard-backed multiline/Unicode trusted paste;
5. sentinel-protected copy-back proving the clipboard result came from the editor;
6. deterministic enabled `Send prompt` state after staging;
7. correct unsent draft;
8. official UI.Vision V10 background-capable `uiv.browser.*` input tier.

No Submit is part of Q08.

## Verifier safeguards retained

Production/qualification logic must retain:
- a unique copy-back sentinel so an unchanged clipboard cannot false-pass;
- target-proven composer/submit-surface state checks;
- terminal-NBSP-only clipboard canonicalization;
- no broad `.trim()` or whitespace collapse for payload equality;
- no Submit during Q08.

## Official UI.Vision basis

- https://ui.vision/rpa/docs/uiv
- https://ui.vision/ai/ai-system-prompt
- https://ui.vision/rpa/home/whatsnew?b=chrome

Current UI.Vision V10 documentation identifies `uiv.browser.*` as trusted Chrome/Edge debugger input and states the browser window may remain in the background. It also documents the real OS clipboard API used by the qualification flow.
