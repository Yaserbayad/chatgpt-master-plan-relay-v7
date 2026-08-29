# Q06 — Exact UI.Vision V10 Candidate

Status: PASS
Date: 2026-08-29

## Selected candidate

- UI.Vision browser extension: 10.0.178
- Browser: Google Chrome 152.0.7977.65
- Windows: Windows 11 24H2 build 26100.9168
- Desktop Automation / XModules v2: V2.0.12

## Decision

Production qualification will target exactly UI.Vision 10.0.178. The relay will not target an unspecified `latest` release.

Official UI.Vision V10 documentation identifies JavaScript `uiv.*` macros and Browser Vision as V10 beta capabilities, and states the new Desktop Automation/XModules v2 package is required for desktop-scope features and hard-drive storage. V2.0.12 requires UI.Vision V10.0.153 or higher; the selected 10.0.178 candidate satisfies that minimum relationship.

Sources:
- https://ui.vision/rpa/home/whatsnew
- https://forum.ui.vision/t/ui-vision-10-beta-ai-javascript-uiv-macros-and-new-real-user-browser-clicks-that-need-no-focus/29839
- https://forum.ui.vision/t/download-the-desktop-automation-module-xmodules-version-2/29893

Acceptance conclusion: PASS — exact candidate build recorded; no `latest` target is used. Behavioral acceptance remains subject to Q07–Q15 target qualification.
