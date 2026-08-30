import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const probePath = path.join(root, 'probe', 'Q15B_LIGHT_PROBE.js');
const bridgePath = path.join(root, 'probe', 'RelayCodexLightBridge.ps1');
const schemaPath = path.join(root, 'probe', 'Q15B_LIGHT_OUTPUT.schema.json');
const runnerPath = path.join(root, 'probe', 'RUN_Q15B_LIGHT.ps1');

for (const p of [probePath, bridgePath, schemaPath, runnerPath]) {
  assert.ok(fs.existsSync(p), `missing required file: ${path.basename(p)}`);
}

const probe = fs.readFileSync(probePath, 'utf8');
const bridge = fs.readFileSync(bridgePath, 'utf8');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const runner = fs.readFileSync(runnerPath, 'utf8');

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
  'uiv.clipboard.read', '!xrun_exitcode', 'LIGHT_PROBE_OK'
]) {
  assert.ok(probe.includes(required), `probe missing required contract token: ${required}`);
}

assert.ok(!probe.includes("'assistant_text_sha256','assistant_probe'"), 'evidence must not persist the response-derived probe text');
assert.ok(!bridge.includes('assistant.txt'), 'bridge must not persist the full assistant response');

assert.equal((bridge.match(/\bcodex\b/gi) || []).length >= 2, true, 'bridge must resolve/invoke Codex');
for (const required of [
  "'exec'", "'--ephemeral'", "'--sandbox'", "'read-only'", "'--output-schema'",
  'WaitForExit(600000)', 'taskkill.exe', 'assistant_probe.txt', 'assistant_probe',
  'assistant_text_sha256', 'LIGHT_PROBE_OK', 'PROBE_ERROR'
]) {
  assert.ok(bridge.includes(required), `bridge missing required safety/contract token: ${required}`);
}
for (const forbidden of ['--dangerously-bypass-approvals-and-sandbox', '--full-auto', 'Invoke-WebRequest', 'Start-Sleep -Seconds']) {
  assert.ok(!bridge.includes(forbidden), `bridge contains forbidden token: ${forbidden}`);
}

assert.equal(schema.type, 'object');
assert.equal(schema.additionalProperties, false);
for (const key of ['protocol','nonce','assistant_message_id','assistant_text_length','assistant_text_sha256','assistant_probe','action','note']) {
  assert.ok(schema.required.includes(key), `schema missing required key: ${key}`);
}
assert.deepEqual(schema.properties.action.enum, ['LIGHT_PROBE_OK']);

for (const required of ['Q15B_LIGHT_PROBE.js','RelayCodexLightBridge.ps1','Q15B_LIGHT_OUTPUT.schema.json','storage=xfile','Q15B_light_*.csv']) {
  assert.ok(runner.includes(required), `runner missing required token: ${required}`);
}

console.log('LIGHT CONTRACT TESTS: PASS');
