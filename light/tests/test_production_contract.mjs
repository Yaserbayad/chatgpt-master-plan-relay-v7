import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const prod = path.join(root, 'production');
const watcherPath = path.join(prod, 'LIGHT_PRODUCTION_WATCHER.js');
const bridgePath = path.join(prod, 'RelayCodexLightProduction.ps1');
const schemaPath = path.join(prod, 'LIGHT_PRODUCTION_ACTION.schema.json');
const runnerPath = path.join(prod, 'RUN_LIGHT_PRODUCTION_TARGET.ps1');

for (const p of [watcherPath, bridgePath, schemaPath, runnerPath]) {
  assert.ok(fs.existsSync(p), `missing production file: ${path.basename(p)}`);
}

const watcher = fs.readFileSync(watcherPath, 'utf8');
const bridge = fs.readFileSync(bridgePath, 'utf8');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const runner = fs.readFileSync(runnerPath, 'utf8');

assert.equal(schema.type, 'object');
assert.equal(schema.additionalProperties, false);
assert.deepEqual(schema.properties.action.enum, ['SEND_PROMPT','STOP','HUMAN']);
for (const key of ['protocol','nonce','conversation_id','assistant_message_id','action','prompt','reason']) {
  assert.ok(schema.required.includes(key), `schema missing ${key}`);
}

for (const required of [
  'stop-button','data-message-author-role','data-message-id','uiv.sleep','XRunAndWait',
  'LIGHT_PRODUCTION_STATE.csv','SENT_CONFIRMED','SEND_AMBIGUOUS','SEND_AMBIGUOUS_NO_RETRY',
  'uiv.browser.click','uiv.browser.type','${KEY_CTRL+KEY_V}','send-button','Send prompt','prompt-textarea',
  'assistant_message_id','conversation_id','nonce','LIGHT_MAX_SENDS = 1',
  'submission_confirmed','next_completion_observed','uiv.csv.write','uiv.csv.read','uiv.csv.exists'
]) assert.ok(watcher.includes(required), `watcher missing ${required}`);

assert.equal((watcher.match(/XRunAndWait/g) || []).length, 1, 'watcher must have one bridge call site');
assert.equal((watcher.match(/uiv\.browser\.type/g) || []).length, 1, 'watcher must have one trusted paste-key call site');
assert.ok(!watcher.includes('uiv.browser.type(prompt)'), 'untrusted Codex prompt must never enter the trusted-key parser');
assert.ok(watcher.includes('uiv.clipboard.write(prompt)'), 'prompt must stage through clipboard before trusted paste');
assert.equal((watcher.match(/uiv\.browser\.click/g) || []).length, 2, 'watcher must have exactly composer+Send trusted click call sites');
for (const forbidden of ['uiv.page.','uiv.eval(','uiv.ocr.','uiv.ai.','uiv.shot.','uiv.desktop.','uiv.open(','XClick','XType','FRESH_CHAT']) {
  assert.ok(!watcher.includes(forbidden), `watcher contains forbidden automation token ${forbidden}`);
}

for (const required of [
  "'exec'","'--ephemeral'","'--ignore-user-config'","'--sandbox'","'read-only'",
  "'--output-schema'","'--output-last-message'",'model_reasoning_effort="medium"',
  'Do not use tools','qualification_mode','LIGHT_PRODUCTION_TARGET_PROMPT',
  'SEND_PROMPT','STOP','HUMAN','Get-Sha256Hex','120000-character production bound','30000-character production bound','assistant_text_sha256','Set-Clipboard'
]) assert.ok(bridge.includes(required), `bridge missing ${required}`);
for (const forbidden of ['-WindowStyle Hidden','--dangerously-bypass-approvals-and-sandbox','--full-auto','Invoke-WebRequest']) {
  assert.ok(!bridge.includes(forbidden), `bridge contains forbidden token ${forbidden}`);
}

for (const required of [
  'LIGHT_PRODUCTION_WATCHER.js','RelayCodexLightProduction.ps1','LIGHT_PRODUCTION_ACTION.schema.json',
  'production_config.json','qualification_mode','Reply exactly LIGHT_PRODUCTION_TARGET_OK.',
  'LIGHT_PRODUCTION_evidence_','SHA256.txt','RESULT.txt','PASS','FAIL'
]) assert.ok(runner.includes(required), `runner missing ${required}`);

console.log('LIGHT PRODUCTION CONTRACT TESTS: PASS');
