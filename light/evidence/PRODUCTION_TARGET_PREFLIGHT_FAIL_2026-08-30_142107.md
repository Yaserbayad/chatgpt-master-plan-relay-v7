# Light Production Target Preflight Failure — 2026-08-30 14:21:07Z

Status: **FAIL — runner preflight only; watcher not executed**.

This evidence applies only to `light-version`. It does not alter or imply main-project state.

## Uploaded target bundle

Uploaded ZIP SHA-256:

`f42e3aa1055449d6fe75f0726c2c67a36ef4698be22ba6e7dcadc779738942b9`

Internal `SHA256.txt` verification: all four bundled files PASS.

```text
b368b9dff2fd8c5ac8ed6c611e3f7561181b432a79dce9ea51d9da1ae4368f4c  LIGHT_PRODUCTION_ACTION.schema.json
16bcb6fbc5596fd2f5a8e6783665858c42887cd1f969e8eb048eba45d6b53e15  LIGHT_PRODUCTION_WATCHER.js
071cf5e7071e242e76476ba0e740c190482c75e4577c712cd4dbad39a2c00619  RelayCodexLightProduction.ps1
c7ae2a0dd21aecef22e884acd3b09d43a37fc03dff26d95564c20fac8068b27d  RESULT.txt
```

Bundled runtime source binding:

```text
eb8ff2a0367732f66207b4611cfe7336b9da0d16  LIGHT_PRODUCTION_WATCHER.js
d06dbdcfb341e443663736fcdc14274c0560b3c3  LIGHT_PRODUCTION_ACTION.schema.json
3fb41fe1ef6f4ac6f0ade600858d700c49d19aaf  RelayCodexLightProduction.ps1
```

## Result

```text
LIGHT_PRODUCTION_TARGET=FAIL
REASON=required path missing: C:\Users\usr\Desktop\uivision\macros
```

No target CSV and no Ui.Vision target log were produced because the PowerShell runner failed before launching the macro. Therefore this run provides **no new evidence about the Q08 sentinel watcher, staging, Send discovery, or Send behavior**.

## Diagnosis

The runner treated `C:\Users\usr\Desktop\uivision\macros` as an externally required pre-existing path even though it is a controlled staging directory used only to copy `LIGHT_PRODUCTION_WATCHER.js` for `storage=xfile` launch.

The same path had worked in earlier target attempts, so the observed missing directory is an environment/staging-state loss rather than evidence that the watcher architecture changed.

## Correction

The runner now:

1. validates only genuine external prerequisites (Chrome, Ui.Vision launcher, packaged watcher/bridge/schema);
2. creates the macro staging directory recursively with `[IO.Directory]::CreateDirectory($MacroDir)`;
3. verifies the resulting path is a directory;
4. then continues the unchanged target launch.

Corrected persisted runner blob:

`15bc7662948976fe06cbdd010566453049e69879`

Permanent contract-test blob:

`8002197f4d5d504702fbe747f48fb7502abf2eca`

Commits:

```text
7946a0cc9c5fc6c2a78a09ec88ee23eccff1b088  fix: self-heal Ui.Vision macro staging directory
7720b69b934ab4e7dba087e5f34c4e49ae694ab7  test: guard Ui.Vision macro staging self-heal
```

Local verification:

```text
LIGHT RUNNER MACRODIR SELF-HEAL CONTRACT: PASS
LIGHT PRODUCTION CONTRACT TESTS: PASS
node --check LIGHT_PRODUCTION_WATCHER.js: PASS
```

## Remaining boundary

The Q08 sentinel / visible submit-surface watcher remains **locally verified but not target-PASS**. The next target run must exercise that unchanged watcher; do not interpret this preflight-only failure as a watcher failure.
