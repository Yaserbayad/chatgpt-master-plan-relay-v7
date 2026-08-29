# Q08 — Attempt 2 Send-Discovery Failure Evidence

Status: TODO — trusted input path partially target-proven; Send discovery unresolved
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe: `qualification/Q08_INPUT_PROBE.js`

## Target error

The corrected target run failed with:

```text
Q08 requires exactly one enabled Send control after paste; found 0 enabled of 0 candidates
```

## What this run proves

Under the current probe source order, the Send-discovery block is reached only after all of the following have already succeeded without throwing:

1. correct Project/conversation checks;
2. idle-state check;
3. exactly one empty composer before staging;
4. OS clipboard write/read round-trip for the multiline/Unicode payload;
5. trusted `uiv.browser.click` on the composer;
6. trusted Ctrl+V staging;
7. exactly one composer after staging;
8. trusted Ctrl+A / Ctrl+C copy-back;
9. exact payload equality after line-ending normalization.

Therefore this attempt is target evidence that the trusted browser input and exact multiline/Unicode copy-back path works in the target environment. The unresolved boundary is only identification of the enabled Send control after the draft is staged.

## Failure localization

The current generic discovery strategy searched all `button,[role="button"]` snapshots and treated a control as a Send candidate when its captured `data-testid`, `aria-label`, `title`, or text matched `send`/`submit`.

The target returned zero candidates under those metadata rules. This does not prove that no enabled Send control exists; it proves that the current metadata-based candidate rule does not identify the target control.

## Corrective action

Do not guess or broaden the production selector blindly. Run the separate read-only diagnostic:

`qualification/Q08_SEND_DISCOVERY.js`

while the staged Q08 draft is still present and ChatGPT is idle. It records:
- all current `button` / `role=button` snapshots;
- complete captured attribute maps;
- geometry relative to the composer;
- focused candidate locators such as `button[type=submit]`, send-related `data-testid` / `aria-label`, and form buttons.

No click, typing, clipboard change, Submit, navigation, or refresh is performed by that diagnostic.

## Qualification conclusion

Q08 remains `TODO`, not PASS.

Already target-proven by Attempt 2:
- unique composer before/after staging;
- trusted browser click/input path;
- clipboard-backed multiline/Unicode paste;
- exact copy-back of the staged payload while Chrome is background-qualified by the operator procedure.

Still required:
- deterministic identification of exactly one enabled Send control on the actual target UI.
