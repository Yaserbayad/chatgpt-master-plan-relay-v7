# Q08 — Attempt 4 Live Send Discovery Evidence

Status: TARGET EVIDENCE — Q08 remains TODO
Date: 2026-08-29
Source CSV: `Q08_send_discovery_2026-08-29T21-46-32-659Z.csv`
Source CSV SHA-256: `937d3aabf9f2b5e0a96a894565e76df5e52777e1911990dd2b87499694581004`
Target: UI.Vision 10.0.178 / Chrome 152.0.7977.65

## Target identity

The CSV reports:
- URL: `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456`
- conversation ID: `6a932926-c750-83ed-9e99-d3addc14f456`
- total current `button` / `role=button` snapshots: 207

## Composer form controls observed

The specific `form button` probe returned four controls:

1. `id="composer-plus-btn"`, `data-testid="composer-plus-btn"`, `aria-label="Add files and more"`, `type="button"`.
2. model pill text `High`, `type="button"`.
3. `aria-label="Start dictation"`, `type="button"`.
4. `aria-label="Start Voice"`, `type="button"`, class beginning `composer-submit-button-color text-submit-btn-text ...`, geometry `x=999,y=733,width=36,height=36`.

The explicit discovery probes returned zero matches for:
- `button[type="submit"]`;
- `[data-testid*="send"]`;
- `button[aria-label*="Send"]`;
- `button[aria-label*="Submit"]`.

Therefore the live target did not expose an enabled Send control in this state. The composer submit-surface position instead exposed `Start Voice`.

## Important correction to Attempt 2 inference

Attempt 2 had been treated as proving trusted paste because the probe:
1. put the qualification payload onto the OS clipboard;
2. issued trusted Ctrl+V;
3. later issued Ctrl+A / Ctrl+C;
4. compared the clipboard to the same payload.

That oracle is insufficient. If trusted paste and/or copy failed, the clipboard could remain unchanged from step 1 and still equal the expected payload. The live discovery state — no Send control and `Start Voice` still occupying the composer submit surface — exposed this false-positive possibility.

Accordingly, the prior claim that exact copy-back alone had target-proven the paste is withdrawn. Q08 remains TODO. The valid target evidence retained from earlier attempts is limited to the observations that actually occurred; paste success must be re-proven with a non-replayable clipboard oracle.

## Required corrective oracle

Before Ctrl+C, seed the OS clipboard with a unique sentinel that is different from the payload. Then:
- trusted Ctrl+A / Ctrl+C must overwrite that sentinel;
- the resulting clipboard must exactly equal the multiline/Unicode payload after line-ending normalization;
- the composer submit surface must transition away from the baseline `Start Voice` state to exactly one enabled Send/submit state;
- no Submit action is performed.

This correction changes no Q08 acceptance criterion and adds no helper/orchestrator. It only fixes the qualification evidence oracle.
