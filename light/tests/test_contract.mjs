import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const probePath = path.join(root, 'probe', 'Q15B_LIGHT_PROBE.js');
const bridgePath = path.join(root, 'probe', 'RelayCodexLightBridge.ps1');
const schemaPath = path.join(root, 'probe', 'Q15B_LIGHT_OUTPUT.schema.json');
const runnerPath = path.join(root, 'probe', 'RUN_Q15B_LIGHT.ps1');
const directPath = path.join(root, 'probe', 'TEST_CODEX_DIRECT.ps1');

for (const p of [probePath, bridgePath, schemaPath, runnerPath, directPath]) {
  assert.ok(fs.existsSync(p), `missing required file: ${path.basename(p)}`);
}

const probe = fs.readFileSync(probePath, 'utf8');
const bridge = fs.readFileSync(bridgePath, 'utf8');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const runner = fs.readFileSync(runnerPath, 'utf8');
const direct = fs.readFileSync(directPath, 'utf8');

for (const forbidden of [
  'uiv.browser.click(', 'uiv.browser.type(', 'uiv.page.click(', 'uiv.page.type(',
  'uiv.open(', 'Send prompt', 'NEW_CHAT', 'uiv.sleep(600000', 'uiv.ai.'
]) {
  assert.ok(!probe.includes(forbidden), `probe contains forbidden browser/action token: ${forbidden}`);
}
assert.equal((probe.match(/XRunAndWait/g) || []).length, 1, 'probe must invoke XRunAndWait exactly once');
for (const required of [
  'stop-button', 'data-message-author-role', 'data-message-id', 'assistant_text',
  'nonce', 'assistant_message_id', 'assistant_probe', 'uiv.clipboard.write',
  'uiv.clipboard.read', '!xrun_exitcode', 'LIGHT_PROBE_OK', 'failure_class',
  'CODEX_CREDITS_REQUIRED'
]) {
  assert.ok(probe.includes(required), `probe missing required contract token: ${required}`);
}

assert.ok(!probe.includes("'assistant_text_sha256','assistant_probe'"), 'evidence must not persist the response-derived probe text');
assert.ok(!bridge.includes('assistant.txt'), 'bridge must not persist the full assistant response');
assert.ok(!bridge.includes('assistant_probe.txt'), 'Codex must not need a response-derived probe file');
assert.ok(!bridge.includes('event.json'), 'Codex must not need a local event file');

for (const required of [
  "'exec'", "'--ephemeral'", "'--skip-git-repo-check'", "'--ignore-user-config'",
  "'--sandbox'", "'read-only'", "'--output-schema'", "'--output-last-message'",
  'model_reasoning_effort="low"', 'DATA_JSON_BEGIN', 'DATA_JSON_END',
  'Do not use tools', "'--output-last-message',$ResultPath,'-'", '$Prompt | & $CodexPath @Args',
  "Start-Process -FilePath 'powershell.exe'", '-PassThru',
  'WaitForExit(600000)', 'taskkill.exe', 'assistant_probe', 'assistant_text_sha256',
  'LIGHT_PROBE_OK', 'PROBE_ERROR'
]) {
  assert.ok(bridge.includes(required), `bridge missing required safety/contract token: ${required}`);
}
for (const forbidden of [
  '--dangerously-bypass-approvals-and-sandbox', '--full-auto', 'Invoke-WebRequest',
  'Start-Sleep -Seconds', '-WindowStyle Hidden',
  '2> $StderrPath', '$Output = $Prompt | & $CodexPath', 'Read only event.json'
]) {
  assert.ok(!bridge.includes(forbidden), `bridge contains forbidden token: ${forbidden}`);
}

assert.equal(schema.type, 'object');
assert.equal(schema.additionalProperties, false);
for (const key of ['protocol','nonce','assistant_message_id','assistant_text_length','assistant_text_sha256','assistant_probe','action','note']) {
  assert.ok(schema.required.includes(key), `schema missing required key: ${key}`);
}
assert.deepEqual(schema.properties.action.enum, ['LIGHT_PROBE_OK']);

for (const required of ['Q15B_LIGHT_PROBE.js','RelayCodexLightBridge.ps1','Q15B_LIGHT_OUTPUT.schema.json','storage=xfile','Q15B_light_*.csv','failure_class','CODEX_CREDITS_REQUIRED','TEST_CODEX_DIRECT.ps1']) {
  assert.ok(runner.includes(required), `runner missing required token: ${required}`);
}

for (const required of [
  "'exec'", "'--ephemeral'", "'--skip-git-repo-check'", "'--ignore-user-config'",
  "'--sandbox'", "'read-only'", "'--output-schema'", "'--output-last-message'",
  'model_reasoning_effort="low"', 'Do not use tools', "'--output-last-message',$ResultPath,'-'", '$Prompt | & $CodexPath @Args',
  "Start-Process -FilePath 'powershell.exe'", '-PassThru', 'WaitForExit(120000)',
  'CODEX_DIRECT_PASS', 'CODEX_CREDITS_REQUIRED', 'Codex CLI:', 'CODEX_DIRECT_DIAGNOSTIC_'
]) {
  assert.ok(direct.includes(required), `direct preflight missing required token: ${required}`);
}
for (const forbidden of [
  '--dangerously-bypass-approvals-and-sandbox','--full-auto','Invoke-WebRequest',
  'Start-Process chrome','XRunAndWait','-WindowStyle Hidden',
  '2> $StderrPath', '$Output = $Prompt | & $CodexPath'
]) {
  assert.ok(!direct.includes(forbidden), `direct preflight contains forbidden token: ${forbidden}`);
}

console.log('LIGHT CONTRACT TESTS: PASS');
