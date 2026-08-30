# Q10 diagnosis — fresh-chat Project-home selector drift

**Candidate classification:** `INCONCLUSIVE`  
**Most recent failed attempt classification:** `PROVEN_PRE_SEND_FAILURE`

## Direct evidence

The two preserved failed-run CSVs in `raw/` report `FAIL`, `send_action_count=0`, `home_click_count=0`, `sidebar_click_count=1`, and `active Project rows=0`. `raw/Q10_TARGET_DOM_OBSERVATION.json` records that the live Project conversation contained zero user turns marked `Q10_FRESH_CHAT_SPA_PROBE`. Thus neither failed attempt performed a material Send.

At `2026-08-29T23:22:04.587Z` and `2026-08-29T23:22:48.327Z`, the current target URL was:

```text
https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/6a932926-c750-83ed-9e99-d3addc14f456
```

The legacy active-row selector

```css
[data-sidebar-item][data-sidebar-keep-open="true"][data-active][role="button"]
```

had count `0`. The active node was instead an `A` with `data-sidebar-item`, `data-active`, and the target conversation `href`, without `data-sidebar-keep-open` or an explicit `role`. Four parent hops above it, the containing Project-group `LI` had exactly one visible `button[aria-label="Open project home"]`.

The target-proven replacement selector had count `1` and was visible:

```css
li:has(a[data-sidebar-item][data-active][href*="g-p-6a9323b61110819182dba0224678aa8b"][href*="/c/"]) button[aria-label="Open project home"]
```

## Finding

The evidence supports selector drift as the root cause, not target failure. The controller corrected the canonical probe to use the unique ancestor relationship, mark the Send boundary ambiguous before invoking the click, and require exactly one newly observed stable user-message ID whose text exactly matches the marker before PASS. Its regression test covers successful correlation, dispatch-then-throw, URL-only transition, absent marker, duplicate markers, and pre-Send failure; `node --check` also passed. A material corrected run was **not** executed: the permitted Codex Chrome surface blocks browser-extension URLs and therefore cannot control the UI.Vision IDE page. No substitute controller was used.

## Safety

One corrected rerun is safe **exactly once** through UI.Vision, because all prior attempts are proven pre-Send. Until that run completes, the candidate remains `INCONCLUSIVE` and no corrected-selector execution may be claimed.
