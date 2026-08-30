import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../production/LIGHT_PRODUCTION_WATCHER.js', import.meta.url), 'utf8');
const projectUrl = 'https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/convo-1';
const targetPrompt = 'Reply exactly LIGHT_PRODUCTION_TARGET_OK.';

function message(author,id,text) {
  return { text, getAttribute(name) { if (name === 'data-message-author-role') return author; if (name === 'data-message-id') return id; return ''; } };
}

function runCase(mode) {
  let clipboard = 'ORIGINAL_CLIPBOARD';
  let xrunExit = '0';
  let generating = mode === 'generating';
  let focused = false;
  let composerText = '';
  let sendClicks = 0;
  let typeCalls = 0;
  let bridgeCalls = 0;
  let sleepCalls = 0;
  let postSendSleeps = 0;
  let newUserAdded = false;
  let nextAssistantAdded = false;
  let runCalledWhileGenerating = false;
  const csv = new Map();
  const logs = [];
  const messages = [message('user','user-1','Initial test prompt'), message('assistant','assistant-1','Initial completed assistant response')];

  if (mode === 'duplicate') {
    csv.set('LIGHT_PRODUCTION_STATE.csv', [['assistant_message_id','status','updated_at'],['assistant-1','SENT_CONFIRMED','2026-08-30T00:00:00Z']]);
  }

  function currentMessages() { return messages.map(x => x); }
  function addSubmittedUser() {
    if (newUserAdded) return;
    messages.push(message('user','user-2',targetPrompt));
    newUserAdded = true;
    generating = true;
    composerText = '';
  }
  function addNextAssistant() {
    if (nextAssistantAdded) return;
    messages.push(message('assistant','assistant-2','LIGHT_PRODUCTION_TARGET_OK'));
    nextAssistantAdded = true;
    generating = false;
  }

  const uiv = {
    tabs: {
      list: () => [{index:1,title:'t - Fresh Chat Probe',url:projectUrl}],
      select: () => ({index:1,title:'t - Fresh Chat Probe',url:projectUrl})
    },
    findElements(locator) {
      if (locator.includes('stop-button')) return generating ? [{kind:'stop'}] : [];
      if (locator.includes('data-message-author-role')) return currentMessages();
      if (locator.includes('prompt-textarea') || locator.includes('contenteditable')) return [{kind:'composer',text:composerText,value:composerText}];
      if (locator.includes('send-button') || locator.includes('Send prompt')) return composerText ? [{kind:'send'}] : [];
      return [];
    },
    setVar() {},
    getVar(name) { return name === '!xrun_exitcode' ? xrunExit : ''; },
    sleep() {
      sleepCalls += 1;
      if (mode === 'generating' && generating && sendClicks === 0) generating = false;
      if (sendClicks > 0) {
        postSendSleeps += 1;
        if (mode !== 'ambiguous' && !newUserAdded && postSendSleeps >= 1) addSubmittedUser();
        if (newUserAdded && !nextAssistantAdded && postSendSleeps >= 3) addNextAssistant();
      }
    },
    clipboard: { read: () => clipboard, write: v => { clipboard = String(v); } },
    run(command) {
      assert.equal(command,'XRunAndWait');
      bridgeCalls += 1;
      if (generating) runCalledWhileGenerating = true;
      const event = JSON.parse(clipboard);
      const action = mode === 'stop' ? 'STOP' : mode === 'human' ? 'HUMAN' : 'SEND_PROMPT';
      clipboard = JSON.stringify({
        protocol:'relay-light-production-action-v1',
        nonce: mode === 'stale' ? `${event.nonce}_STALE` : event.nonce,
        conversation_id:event.conversation_id,
        assistant_message_id:event.assistant_message_id,
        assistant_text_length:event.assistant_text_length,
        assistant_text_sha256:'a'.repeat(64),
        action,
        prompt: action === 'SEND_PROMPT' ? targetPrompt : '',
        prompt_sha256: action === 'SEND_PROMPT' ? 'b'.repeat(64) : '',
        reason:'simulated',
        codex_version:'codex-cli-test', codex_exit_code:0, codex_duration_ms:100
      });
    },
    browser: {
      click(match) {
        if (match.kind === 'composer') { focused = true; return; }
        if (match.kind === 'send') { if (mode === 'send_click_fail') throw new Error('simulated trusted Send click failure'); sendClicks += 1; return; }
        throw new Error('unexpected click target');
      },
      type(text) {
        assert.equal(focused,true,'typing must follow trusted composer focus');
        assert.equal(String(text),'${KEY_CTRL+KEY_V}','trusted type must carry only the constant paste chord');
        typeCalls += 1;
        composerText = clipboard;
      }
    },
    csv: {
      exists: name => csv.has(name),
      read: name => csv.get(name),
      write: (name,rows) => csv.set(name,rows)
    },
    files: { exportToDownloads() {} },
    log: (...args) => logs.push(args)
  };

  let error = null;
  try { vm.runInNewContext(source,{uiv,console,Date,Math,JSON,Number,Set,Array,String,Error,RegExp},{timeout:3000}); }
  catch (e) { error = e; }
  const evidence = [...csv.entries()].find(([name]) => name.startsWith('LIGHT_PRODUCTION_target_'))?.[1] || null;
  return {error,clipboard,csv,logs,evidence,sendClicks,typeCalls,bridgeCalls,sleepCalls,runCalledWhileGenerating};
}

function rowMap(rows) {
  assert.ok(rows,'evidence rows missing');
  return Object.fromEntries(rows[0].map((k,i)=>[k,String(rows[1][i])]));
}

const success = runCase('success');
assert.equal(success.error,null,'success simulation must not throw');
assert.equal(success.clipboard,'ORIGINAL_CLIPBOARD','clipboard must be restored');
assert.equal(success.bridgeCalls,1,'one completed source turn must invoke bridge once');
assert.equal(success.typeCalls,1,'prompt must be typed once');
assert.equal(success.sendClicks,1,'Send must be clicked exactly once');
let row = rowMap(success.evidence);
assert.equal(row.result,'PASS');
assert.equal(row.bridge_action,'SEND_PROMPT');
assert.equal(row.submission_confirmed,'true');
assert.equal(row.next_completion_observed,'true');
assert.equal(row.send_click_count,'1');
assert.equal(success.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SENT_CONFIRMED');

const generating = runCase('generating');
assert.equal(generating.error,null,'generation should be waited out, not dispatched through');
assert.equal(generating.runCalledWhileGenerating,false,'bridge must never run while stop-button is present');
assert.equal(generating.bridgeCalls,1);
assert.equal(generating.sendClicks,1);

const stale = runCase('stale');
assert.ok(stale.error,'stale bridge result must fail');
assert.match(String(stale.error.message),/STALE_IDENTITY/);
assert.equal(stale.sendClicks,0,'stale identity must fail before material action');
assert.equal(stale.typeCalls,0,'stale identity must fail before staging');

const ambiguous = runCase('ambiguous');
assert.ok(ambiguous.error,'ambiguous submission must fail loudly');
assert.match(String(ambiguous.error.message),/SEND_AMBIGUOUS_NO_RETRY/);
assert.equal(ambiguous.sendClicks,1,'ambiguous submission must never retry Send');
assert.equal(ambiguous.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS');
row = rowMap(ambiguous.evidence);
assert.equal(row.send_click_count,'1');
assert.equal(row.submission_confirmed,'false');

const clickFail = runCase('send_click_fail');
assert.ok(clickFail.error,'a Send-click exception must fail conservatively');
assert.equal(clickFail.sendClicks,0,'failed Send click must not be retried');
assert.equal(clickFail.csv.get('LIGHT_PRODUCTION_STATE.csv')[1][1],'SEND_AMBIGUOUS','ambiguous state must be persisted before the material click');

for (const mode of ['stop','human']) {
  const controlled = runCase(mode);
  assert.equal(controlled.error,null,`${mode} should be a controlled non-material stop`);
  assert.equal(controlled.bridgeCalls,1);
  assert.equal(controlled.sendClicks,0);
  assert.equal(controlled.typeCalls,0);
  row = rowMap(controlled.evidence);
  assert.equal(row.result,'PASS');
  assert.equal(row.bridge_action,mode === 'stop' ? 'STOP' : 'HUMAN');
}

const duplicate = runCase('duplicate');
assert.ok(duplicate.error,'persisted handled source turn must not be dispatched again');
assert.match(String(duplicate.error.message),/DUPLICATE_SOURCE_TURN/);
assert.equal(duplicate.bridgeCalls,0,'duplicate source turn must be rejected before Codex');
assert.equal(duplicate.sendClicks,0);

console.log('LIGHT PRODUCTION WATCHER SIMULATION: PASS');
