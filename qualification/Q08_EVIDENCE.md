# Q08 — V10 Trusted Composer/Input Qualification Evidence

Status: PASS
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Target Project token: `g-p-6a9323b61110819182dba0224678aa8b`
Conversation ID: `6a932926-c750-83ed-9e99-d3addc14f456`
Canonical probe: `qualification/Q08_INPUT_PROBE.js`
Input-path diagnostic: `qualification/Q08_INPUT_PATH_DIAGNOSTIC.js`

## Final target evidence

`Q08_input_path_2026-08-29T22-06-26-226Z.csv`

SHA-256:
`2e6bafe998f12bc547adb2b0a4ed958555e0741818b544e9ab16c071e85a3ec5`

The diagnostic was executed on the real logged-in ChatGPT Project target. It contains one result row with:

- `baseline_aria = Start Voice`
- `direct_aria = Send prompt`
- `cleared_aria = Start Voice`
- `pasted_aria = Send prompt`
- `direct_type_success = 1`
- `combo_clear_success = 1`
- `paste_state_success = 1`
- `copy_changed_sentinel = 1`

This proves the staged input path in four independently observable steps:

1. trusted `uiv.browser.click` + direct `uiv.browser.type(text)` activates the composer submit surface;
2. trusted Ctrl+A + Backspace clears the editor and returns the surface to `Start Voice`;
3. clipboard-backed trusted Ctrl+V stages the multiline/Unicode payload and transitions the surface to `Send prompt`;
4. trusted Ctrl+A + Ctrl+C overwrites a unique clipboard sentinel, proving the clipboard result came from the editor rather than from an unchanged pre-paste clipboard.

## Clipboard comparison and terminal NBSP normalization

Expected payload:

```text
Q08_CLIPBOARD_PASTE_PROBE
ASCII: clipboard via trusted browser input
Unicode: café naïve Ελληνικά 日本語 🙂

BLANK-LINE-BEFORE-THIS
```

The copied-back value is identical to that payload in every substantive character, including:

- every line break;
- the intentional blank line;
- ASCII text;
- `café naïve`;
- `Ελληνικά`;
- `日本語`;
- `🙂`.

The only byte-level difference is two terminal non-breaking spaces:

`U+00A0 U+00A0`

Thus:

`copied_back = expected_payload + U+00A0 + U+00A0`

No internal whitespace or payload character differs.

The qualification verifier therefore canonicalizes only terminal `U+00A0` clipboard serialization markers after normalizing CRLF/CR to LF. It does not trim or normalize internal spaces, blank lines, or Unicode content.

This is consistent with known Chrome/contenteditable clipboard behavior in rich editors, where browser clipboard handling can introduce non-breaking spaces. The target evidence itself is authoritative for this qualification boundary.

Reference background:
- https://discuss.prosemirror.net/t/non-breaking-spaces-being-added-to-pasted-html/3911
- https://discuss.prosemirror.net/t/space-added-on-paste/1274

## Unique composer — PASS

The Q08 probe/diagnostic requires exactly one target composer. The final diagnostic reached all input stages without a composer-uniqueness failure.

## Trusted browser click/input — PASS

The transition sequence `Start Voice → Send prompt → Start Voice → Send prompt` is target-observed state evidence that trusted click/type and key-combination input operated on the ChatGPT composer.

## Clipboard-based multiline/Unicode prompt paste — PASS

The final target run proves clipboard paste by both:

- the post-paste `Send prompt` state; and
- sentinel-protected copy-back of the complete multiline/Unicode payload, differing only by the two terminal NBSP serialization markers described above.

## Enabled Send — PASS

After both direct typing and clipboard paste, the composer submit surface transitioned from baseline `Start Voice` to `Send prompt`. The diagnostic treats a single non-disabled, non-`aria-disabled=true`, non-voice submit surface as the enabled send state.

## Browser-background capability — PASS

Current official UI.Vision V10 documentation states that `uiv.browser.*` uses trusted browser input via CDP and that Chrome/Edge browser windows may remain in the background. The target qualification uses exactly this input tier and includes a 3.5-second operator background-switch window before trusted input.

Official sources:
- https://ui.vision/rpa/docs/uiv
- https://ui.vision/rpa/home/whatsnew?b=chrome
- https://ui.vision/ai/ai-system-prompt

## No Submit / draft preserved — PASS

The Q08 diagnostic contains no Send/Submit action. After the run, the operator directly confirmed that the full Q08 clipboard payload remained visible in the composer as an unsent draft.

## Evidence history and corrections

Earlier Q08 attempts remain preserved because they exposed verifier defects rather than target failures:

- `qualification/Q08_ATTEMPT1_SNAPSHOT_FALSE_NEGATIVE.md`
- `qualification/Q08_ATTEMPT2_SEND_DISCOVERY_FAILURE.md`
- `qualification/Q08_ATTEMPT3_DISCOVERY_RUNTIME_FAILURE.md`
- `qualification/Q08_ATTEMPT4_SEND_DISCOVERY_EVIDENCE.md`
- `qualification/Q08_ATTEMPT5_SENTINEL_FAILURE.md`

The final evidence supersedes the earlier false-negative interpretations without deleting them.

## Qualification conclusion

PASS — Q08 now has target evidence for all current acceptance boundaries:

- unique composer;
- trusted `uiv.browser.click` / trusted typing path;
- clipboard-backed multiline/Unicode trusted paste;
- deterministic enabled Send state;
- correct unsent draft;
- browser-background-capable input tier.

Production/qualification verification must retain the sentinel guard so an unchanged clipboard cannot false-pass, and must tolerate only terminal `U+00A0` editor clipboard serialization markers rather than broadly trimming whitespace.
