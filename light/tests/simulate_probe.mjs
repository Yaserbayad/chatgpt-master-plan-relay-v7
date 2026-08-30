import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../probe/Q15B_LIGHT_PROBE.js', import.meta.url), 'utf8');

function message(author,id,text) {
  return { text, getAttribute(name) { if (name === 'data-message-author-role') return author; if (name === 'data-message-id') return id; return ''; } };
}

function runCase(mode) {
  let clipboard = 'ORIGINAL_CLIPBOARD';
  const csv = new Map();
  const logs = [];
  const messages = [
    message('user','user-1','Test prompt'),
    message('assistant','assistant-1','Light bridge response: café Ελληνικά 日本語 🙂\nSecond line.')
  ];
  const uiv = {
    tabs: {
      list: () => [{index:1,url:'https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/convo-1'}],
      select: () => ({index:1,url:'https://chatgpt.com/g/g-p-6a9323b61110819182dba0224678aa8b/c/convo-1'})
    },
    findElements(locator) {
      if (locator.includes('stop-button')) return [];
      if (locator.includes('data-message-author-role')) return messages;
      return [];
    },
    setVar() {},
    getVar(name) { return name === '!xrun_exitcode' ? '0' : ''; },
    clipboard: {
      read: () => clipboard,
      write: v => { clipboard = String(v); }
    },
    run(command) {
      assert.equal(command,'XRunAndWait');
      const event = JSON.parse(clipboard);
      const probe = event.assistant_text.replace(/\s+/g,' ').trim().slice(0,96);
      clipboard = JSON.stringify({
        protocol:'relay-light-probe-response-v1',
        nonce: mode === 'stale' ? `${event.nonce}_STALE` : event.nonce,
        assistant_message_id:event.assistant_message_id,
        assistant_text_length:event.assistant_text_length,
        assistant_text_sha256:'a'.repeat(64),
        assistant_probe:probe,
        action:'LIGHT_PROBE_OK',
        note:'ok',
        codex_version:'codex-cli-test',
        codex_exit_code:0,
        codex_duration_ms:123
      });
    },
    csv: { write: (name,rows) => csv.set(name,rows) },
    exportToDownloads() {},
    log: (...args) => logs.push(args)
  };
  let error = null;
  try { vm.runInNewContext(source,{uiv,console,Date,Math,JSON,Number,Set,Array,String,Error,RegExp},{timeout:2000}); }
  catch (e) { error = e; }
  return {error,clipboard,csv,logs};
}

const success = runCase('success');
assert.equal(success.error,null,'success simulation must not throw');
assert.equal(success.clipboard,'ORIGINAL_CLIPBOARD','original clipboard must be restored');
assert.equal(success.csv.size,1,'success must emit one evidence CSV');
const successRows = [...success.csv.values()][0];
assert.equal(successRows[1][0],'PASS');
assert.equal(successRows[1][15],'true');

const stale = runCase('stale');
assert.ok(stale.error,'stale nonce simulation must throw');
assert.match(String(stale.error.message),/stale\/mismatched nonce/);
assert.equal(stale.clipboard,'ORIGINAL_CLIPBOARD','clipboard must be restored on failure');
assert.equal(stale.csv.size,1,'failure must still emit evidence CSV');
const staleRows = [...stale.csv.values()][0];
assert.equal(staleRows[1][0],'FAIL');

console.log('LIGHT PROBE SIMULATION: PASS');
