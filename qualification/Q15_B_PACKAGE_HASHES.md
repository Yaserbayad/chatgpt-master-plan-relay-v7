# Q15-B package hashes

- `Q15_B_CODEX_BRIDGE_PROBE.js`: `f3ef1e077cae5fa63831473a6c9f390723b24009925bc35280e84f31d626b282`
- `Q15_B_BRIDGE.ps1`: `a8cf351d71322b17358a49174c4684158893907b3aaaf552388181bd66550715`
- `Q15_B_SCHEMA.json`: `c060c05e4e5a063da56229f2be10361cc057af83d8d1b153b29160368f6eb5a6`
- `Q15_B_INSTALL_AND_RUN.ps1`: `d28c42584fce5b9d7a9c5f7433eaf789ab61b31adb0828766080c5cc9f200152`

Verification performed before publication:
- JavaScript syntax passed `node --check`.
- JSON schema parsed successfully.
- exactly one `codex exec` invocation site exists.
- no ChatGPT browser mutation API (`uiv.browser.click`, `uiv.browser.type`, `uiv.open`, `uiv.tabs.open`) exists in the probe.
- no OpenAI/Codex API-key variable or key-shaped secret is embedded.
