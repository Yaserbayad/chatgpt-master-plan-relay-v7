// Light Version Q15-B: read-only ChatGPT -> UI.Vision -> Codex -> UI.Vision bridge qualification.
// No ChatGPT click, typing, Send, navigation, refresh, OCR, image, or Ui.Vision AI call.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const BRIDGE_PATH = 'C:\\Users\\usr\\Documents\\CodexLight\\RelayCodexLightBridge.ps1';
const SCHEMA_PATH = 'C:\\Users\\usr\\Documents\\CodexLight\\Q15B_LIGHT_OUTPUT.schema.json';
const INPUT_PROTOCOL = 'relay-light-probe-v1';
const OUTPUT_PROTOCOL = 'relay-light-probe-response-v1';
const MESSAGE = 'css=[data-message-author-role]';
const STOP = 'css=[data-testid="stop-button"]';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function raw(v) { return v == null ? '' : String(v); }
function attr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { return m && m.attributes && m.attributes[n] != null ? String(m.attributes[n]) : ''; }
}
function all(locator, timeout = 2, includeHidden = false) {
  const opts = {required:false, timeout};
  if (includeHidden) opts.includeHidden = true;
  const r = uiv.findElements(locator, opts);
  return Array.isArray(r) ? r : [];
}
function conversationId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function normalizeProbe(text) {
  const normalized = raw(text).replace(/\s+/g, ' ').trim();
  return normalized.length <= 96 ? normalized : normalized.slice(0,96);
}
function makeNonce() {
  return `LIGHT_${new Date().toISOString().replace(/[^0-9A-Za-z]/g,'')}_${Math.random().toString(36).slice(2,14)}`;
}
function classifyFailure(reason, response) {
  const signal = `${clean(reason)} ${clean(response && response.note)}`.toLowerCase();
  if (/workspace is out of credits|out of credits|usage limit reached|reached your usage limit|add credits to continue|increase your limits to continue/.test(signal)) return 'CODEX_CREDITS_REQUIRED';
  return 'OTHER';
}
function snapshot(boundIndex) {
  const selected = uiv.tabs.select(boundIndex);
  const url = clean(selected && selected.url);
  const cid = conversationId(url);
  if (!url.includes(TARGET_PROJECT_TOKEN) || !cid) throw new Error(`wrong/missing configured Project conversation: ${url || '(unknown)'}`);
  if (all(STOP, 1).length !== 0) throw new Error('ChatGPT is still generating; wait for completion and rerun');

  const seen = new Set();
  const messages = [];
  for (const m of all(MESSAGE, 2, true)) {
    const author = clean(attr(m, 'data-message-author-role'));
    const id = clean(attr(m, 'data-message-id'));
    if ((author !== 'user' && author !== 'assistant') || !id || seen.has(id)) continue;
    seen.add(id);
    messages.push({author, id, text: raw(m.text)});
  }

  let userIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].author === 'user') { userIndex = i; break; }
  }
  if (userIndex < 0) throw new Error('no stable user message found');
  const user = messages[userIndex];
  const assistants = messages.slice(userIndex + 1).filter(x => x.author === 'assistant');
  const assistant = assistants.length ? assistants[assistants.length - 1] : null;
  if (!assistant || !assistant.id || !raw(assistant.text).trim()) throw new Error('no completed non-empty assistant response follows latest user turn');

  return {
    url,
    conversationId: cid,
    userId: user.id,
    assistantId: assistant.id,
    assistantText: raw(assistant.text)
  };
}

uiv.setVar('!TIMEOUT_MACRO', 900);
const tabs = uiv.tabs.list();
const candidates = tabs.filter(t => t && clean(t.url).includes(TARGET_PROJECT_TOKEN) && conversationId(clean(t.url)));
if (candidates.length !== 1) throw new Error(`Light probe requires exactly one configured-Project conversation tab; found ${candidates.length}`);
const boundIndex = Number(candidates[0].index);
if (!Number.isFinite(boundIndex) || boundIndex < 1) throw new Error(`invalid ChatGPT tab index: ${candidates[0].index}`);

const originalClipboard = raw(uiv.clipboard.read());
const startedAt = Date.now();
let before = null;
let after = null;
let nonce = '';
let response = null;
let expectedProbe = '';
let xrunExit = '';
let result = 'FAIL';
let failureReason = '';

try {
  before = snapshot(boundIndex);
  nonce = makeNonce();
  expectedProbe = normalizeProbe(before.assistantText);
  if (!expectedProbe) throw new Error('assistant probe is empty');

  const event = {
    protocol: INPUT_PROTOCOL,
    nonce,
    observed_at: new Date().toISOString(),
    project_token: TARGET_PROJECT_TOKEN,
    url: before.url,
    conversation_id: before.conversationId,
    user_message_id: before.userId,
    assistant_message_id: before.assistantId,
    assistant_text_length: before.assistantText.length,
    assistant_text: before.assistantText
  };
  const eventJson = JSON.stringify(event);
  uiv.clipboard.write(eventJson);
  if (uiv.clipboard.read() !== eventJson) throw new Error('event clipboard round-trip mismatch before bridge');

  const args = `-NoProfile -ExecutionPolicy Bypass -File "${BRIDGE_PATH}" -SchemaPath "${SCHEMA_PATH}"`;
  let xrunError = '';
  try { uiv.run('XRunAndWait', 'powershell.exe', args); }
  catch (e) { xrunError = clean(e && e.message ? e.message : e); }
  xrunExit = clean(uiv.getVar('!xrun_exitcode'));

  const returned = raw(uiv.clipboard.read());
  try { response = JSON.parse(returned); }
  catch (_) { throw new Error(`bridge returned non-JSON; exit=${xrunExit || '(empty)'}; ${xrunError}`); }

  if (xrunError || xrunExit !== '0') throw new Error(`bridge/Codex failure; exit=${xrunExit || '(empty)'}; action=${clean(response.action)}; note=${clean(response.note)}; ${xrunError}`);
  if (response.protocol !== OUTPUT_PROTOCOL) throw new Error('bridge protocol mismatch');
  if (response.nonce !== nonce) throw new Error('stale/mismatched nonce');
  if (response.assistant_message_id !== before.assistantId) throw new Error('assistant message identity mismatch');
  if (Number(response.assistant_text_length) !== before.assistantText.length) throw new Error('assistant text length mismatch');
  if (!/^[0-9a-f]{64}$/.test(clean(response.assistant_text_sha256))) throw new Error('assistant SHA-256 missing/invalid');
  if (response.assistant_probe !== expectedProbe) throw new Error('Codex assistant probe reproduction mismatch');
  if (response.action !== 'LIGHT_PROBE_OK') throw new Error(`unexpected bridge action: ${clean(response.action)}`);
  if (!clean(response.codex_version)) throw new Error('Codex version missing');
  if (Number(response.codex_exit_code) !== 0) throw new Error(`Codex exit code nonzero: ${response.codex_exit_code}`);

  after = snapshot(boundIndex);
  if (after.conversationId !== before.conversationId || after.userId !== before.userId || after.assistantId !== before.assistantId) {
    throw new Error('ChatGPT identity changed while Codex bridge was active; result is stale');
  }
  result = 'PASS';
} catch (e) {
  failureReason = clean(e && e.message ? e.message : e);
} finally {
  uiv.clipboard.write(originalClipboard);
}

const rows = [[
  'result','failure_reason','elapsed_ms','conversation_id','user_message_id','assistant_message_id',
  'assistant_text_length','nonce','xrun_exit_code','bridge_action','failure_class','assistant_text_sha256','assistant_probe_match',
  'codex_version','codex_exit_code','codex_duration_ms','browser_identity_revalidated'
], [
  result,failureReason,Date.now()-startedAt,
  before ? before.conversationId : '', before ? before.userId : '', before ? before.assistantId : '',
  before ? before.assistantText.length : 0, nonce, xrunExit,
  response ? clean(response.action) : '', result === 'PASS' ? 'NONE' : classifyFailure(failureReason,response), response ? clean(response.assistant_text_sha256) : '',
  response && expectedProbe && response.assistant_probe === expectedProbe ? 'true' : 'false', response ? clean(response.codex_version) : '',
  response && response.codex_exit_code != null ? response.codex_exit_code : '',
  response && response.codex_duration_ms != null ? response.codex_duration_ms : '',
  after ? 'true' : 'false'
]];
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const file = `Q15B_light_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') throw new Error(`LIGHT Q15-B FAIL: ${failureReason}; evidence=${file}`);
uiv.log(`LIGHT Q15-B PASS: UI.Vision -> Codex -> UI.Vision round trip proven; assistant=${before.assistantId}; ${file}`, 'green');
