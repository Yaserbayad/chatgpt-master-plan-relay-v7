# Q10 — Project-root Control Discovery Evidence

Status: TARGET DISCOVERY PASS — Q10 remains TODO
Date: 2026-08-29
Candidate: UI.Vision 10.0.178 / Chrome 152.0.7977.65
Probe: `qualification/Q10_PROJECT_ROOT_DISCOVERY.js`
Target CSV: `Q10_project_root_discovery_2026-08-29T22-44-07-113Z.csv`
CSV SHA-256: `5b4f838f44b66d9ab3e521d60cbec8a5bd881044f3f6df40da4c3078fd12f683`

## Target facts

The read-only discovery exported 195 data rows:
- 180 controls;
- 6 input/contenteditable surfaces;
- 6 headings;
- 1 form;
- 1 main-page snapshot;
- 1 meta row.

The meta row reports the actual Project-home URL:

`https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b-t/project`

This differs from the previously assumed direct root `https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/project` while retaining the configured Project token.

### Deterministic Project-home control

The discovery contains exactly one visible active Project sidebar row matching the Project-row semantics:
- category/index: `controls/55`;
- text: `t`;
- role: `button`;
- `data-sidebar-item="true"`;
- `data-sidebar-keep-open="true"`;
- `data-active=""`;
- geometry: `x=122, y=838, width=233, height=36`.

There are 10 visible `button[aria-label="Open project home"]` controls across the sidebar. Exactly one overlaps the active Project row and falls within its horizontal span:
- category/index: `controls/56`;
- `aria-label="Open project home"`;
- geometry: `x=194, y=838, width=34, height=52`.

Therefore the target-proven Project-home entry mechanism is not a guessed direct URL. It is the unique `Open project home` control geometrically associated with the unique active Project row.

### Project-home composer

The Project home contains exactly one visible fresh-chat editor matching:
- category/index: `inputs/3`;
- tag: `div`;
- id: `prompt-textarea`;
- role: `textbox`;
- `contenteditable="true"`;
- `aria-label="New chat in t"`;
- geometry: `x=641, y=209, width=537, height=42`.

A separate hidden textarea with the same accessible label exists, so the material probe must resolve the visible `#prompt-textarea[role="textbox"][contenteditable="true"]` editor rather than depend on the title-specific accessible label.

## Diagnosis of Attempts 1–2

Attempts 1–2 failed before Send because the qualification probe:
1. navigated directly to the older unsuffixed Project-root URL; and
2. looked for a composer whose exact accessible label was `Chat with ChatGPT`.

The target discovery proves the current Project home instead uses a title-suffixed Project route and a Project-scoped `New chat in <title>` composer.

Increasing the old readiness timeout would therefore be a materially equivalent retry and remains unauthorized.

## Corrective direction

The corrected Q10 probe must:
1. begin in an existing completed conversation in the configured Project so the previous conversation ID is known;
2. locate the unique visible active Project sidebar row;
3. locate its unique associated visible `Open project home` control;
4. trusted-click that control once;
5. wait for a same-Project `/project` surface with no conversation ID;
6. require exactly one visible `#prompt-textarea[role="textbox"][contenteditable="true"]` composer;
7. stage the qualification marker;
8. reacquire exactly one enabled Send;
9. perform exactly one trusted Send;
10. observe only until a new same-Project conversation ID is proven or the run ends ambiguous/failing without resend.

The Project title/suffix must not be hard-coded.

## Safety

The discovery run itself was read-only:
- no click;
- no typing;
- no clipboard mutation;
- no navigation;
- no refresh;
- no Send/Submit.

No material side effect occurred. Q10 remains TODO until the unchanged Q10 acceptance criteria are target-proven by the corrected single-Send qualification run.
