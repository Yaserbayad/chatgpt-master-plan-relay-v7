// Q15-A/Q15-B combined qualification for ChatGPT Master Plan Relay v7.
// Browser READ-ONLY: no ChatGPT click, typing, Send, navigation, refresh, OCR, image, or AI browser call.
// Sequence: bounded observation -> 10 minute sleep -> bounded completed-response observation -> one Codex IPC probe.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const SLEEP_MS = 600000;
const BRIDGE_PATH = 'C:\\Users\\usr\\Documents\\Codex\\RelayCodexBridge.ps1';
const SCHEMA_PATH = 'C:\\Users\\usr\\Documents\\Codex\\Q15_CODEX_PROBE_OUTPUT.schema.json';
const INPUT_PROTOCOL = 'relay-codex-probe-v1';
const OUTPUT_PROTOCOL = 'relay-codex-probe-response-v1';
const MESSAGE = 'css=[data-message-author-role]';
const STOP = 'css=[data-testid="stop-button"]';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function raw(v) { return v == null ? '' : String(v); }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { return m && m.attributes && m.attributes[n] != null ? String(m.attributes[n]) : ''; }
}
function findAll(locator, timeout = 2, includeHidden = false) {
  const opts = {required:false, timeout};
  if (includeHidden) opts.includeHidden = true;
  const r = uiv.findElements(locator, opts);
  return Array.isArray(r) ? r : [];
}
function conversationId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function currentUrl(boundIndex) {
  const selected = uiv.tabs.select(boundIndex);
  return clean(selected && selected.url);
}
function nonce() {
  return `Q15B_${new Date().toISOString().replace(/[^0-9A-Za-z]/g, '')}_${Math.random().toString(36).slice(2, 14)}`;
}
function stableMessages() {
  const matches = findAll(MESSAGE, 2, true);
  const seen = new Set();
  const out = [];
  for (const m of matches) {
    const author = clean(getAttr(m, 'data-message-author-role'));
    const id = clean(getAttr(m, 'data-message-id'));
    if ((author !== 'user' && author !== 'assistant') || !id || seen.has(id)) continue;
    seen.add(id);
    out.push({author, id, text: raw(m.text)});
  }
  return out;
}
function snapshot(boundIndex, label, requireCompleted) {
  const url = currentUrl(boundIndex);
  const cid = conversationId(url);
  if (!url.includes(TARGET_PROJECT_TOKEN) || !cid) {
    throw new Error(`Q15 ${label}: bound tab left configured Project conversation: ${url || '(unknown)'}`);
  }

  const messages = stableMessages();
  let latestUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].author === 'user') { latestUserIndex = i; break; }
  }
  if (latestUserIndex < 0) throw new Error(`Q15 ${label}: no stable user message ID found`);

  const latestUser = messages[latestUserIndex];
  const following = messages.slice(latestUserIndex + 1).filter(x => x.author === 'assistant');
  const assistant = following.length ? following[following.length - 1] : null;
  const stopCount = findAll(STOP, 1).length;

  if (requireCompleted) {
    if (stopCount !== 0) throw new Error(`Q15 ${label}: ChatGPT still generating; stop_button_count=${stopCount}`);
    if (!assistant || !assistant.id || !raw(assistant.text).trim()) {
      throw new Error(`Q15 ${label}: no completed non-empty assistant response follows latest user turn`);
    }
  }

  return {
    label,
    timestamp: new Date().toISOString(),
    url,
    conversationId: cid,
    latestUserId: latestUser.id,
    assistantId: assistant ? assistant.id : '',
    assistantText: assistant ? raw(assistant.text) : '',
    generationSignals: stopCount
  };
}

const tabs = uiv.tabs.list();
const candidates = tabs.filter(t => t && clean(t.url).includes(TARGET_PROJECT_TOKEN) && conversationId(clean(t.url)));
if (candidates.length !== 1) throw new Error(`Q15 requires exactly one configured-Project conversation tab; found ${candidates.length}`);
const boundIndex = Number(candidates[0].index);
if (!Number.isFinite(boundIndex) || boundIndex < 1) throw new Error(`Q15 invalid bound tab index: ${candidates[0].index}`);

const originalClipboard = raw(uiv.clipboard.read());
const startedAt = Date.now();
let before = null;
let after = null;
let afterBridge = null;
let eventNonce = '';
let xrunExit = '';
let response = null;
let result = 'FAIL';
let failureReason = '';
let bridgeStartedAt = '';

try {
  before = snapshot(boundIndex, 'before-sleep', false);

  // Critical low-resource boundary: no Codex process is invoked before this sleep completes.
  uiv.sleep(SLEEP_MS);

  after = snapshot(boundIndex, 'after-sleep', true);
  const elapsedBeforeBridge = Date.now() - startedAt;
  if (elapsedBeforeBridge < 570000) throw new Error(`Q15 low-resource interval too short: ${elapsedBeforeBridge}ms`);
  if (after.conversationId !== before.conversationId) throw new Error(`Q15 conversation changed during sleep`);
  if (after.latestUserId !== before.latestUserId) throw new Error(`Q15 latest user turn changed during sleep`);

  eventNonce = nonce();
  const event = {
    protocol: INPUT_PROTOCOL,
    nonce: eventNonce,
    observed_at: after.timestamp,
    project_token: TARGET_PROJECT_TOKEN,
    url: after.url,
    conversation_id: after.conversationId,
    user_message_id: after.latestUserId,
    assistant_message_id: after.assistantId,
    assistant_text_length: after.assistantText.length,
    assistant_text: after.assistantText
  };
  const eventJson = JSON.stringify(event);
  uiv.clipboard.write(eventJson);
  if (uiv.clipboard.read() !== eventJson) throw new Error('Q15 event clipboard write/read mismatch before bridge');

  // Give one external bridge/Codex invocation ample time; no automatic retry is permitted.
  uiv.setVar('!TIMEOUT_WAIT', 900);
  bridgeStartedAt = new Date().toISOString();
  const psArgs = `-NoProfile -ExecutionPolicy Bypass -File "${BRIDGE_PATH}" -SchemaPath "${SCHEMA_PATH}"`;
  let xrunThrown = '';
  try { uiv.run('XRunAndWait', 'powershell.exe', psArgs); }
  catch (error) { xrunThrown = clean(error && error.message ? error.message : error); }
  xrunExit = clean(uiv.getVar('!xrun_exitcode'));

  const responseRaw = uiv.clipboard.read();
  try { response = JSON.parse(responseRaw); }
  catch (_) { throw new Error(`Q15 bridge returned non-JSON clipboard response; xrun_exit=${xrunExit || '(empty)'}; xrun_error=${xrunThrown}`); }

  if (xrunThrown || xrunExit !== '0') {
    throw new Error(`Q15 bridge/Codex failed; xrun_exit=${xrunExit || '(empty)'}; action=${clean(response && response.action)}; note=${clean(response && response.note)}; xrun_error=${xrunThrown}`);
  }
  if (!response || response.protocol !== OUTPUT_PROTOCOL) throw new Error('Q15 bridge response protocol mismatch');
  if (response.nonce !== eventNonce) throw new Error('Q15 stale/mismatched bridge nonce');
  if (response.assistant_message_id !== after.assistantId) throw new Error('Q15 bridge assistant message identity mismatch');
  if (Number(response.assistant_text_length) !== after.assistantText.length) throw new Error('Q15 bridge assistant text length mismatch');
  if (response.action !== 'PROBE_OK') throw new Error(`Q15 unexpected bridge action: ${clean(response.action)}`);
  if (!/^[0-9a-f]{64}$/.test(clean(response.event_sha256))) throw new Error('Q15 bridge event hash is invalid');
  if (!/^[0-9a-f]{64}$/.test(clean(response.assistant_text_sha256))) throw new Error('Q15 bridge assistant text hash is invalid');
  if (!clean(response.codex_version)) throw new Error('Q15 bridge did not return Codex version');
  if (Number(response.codex_exit_code) !== 0) throw new Error(`Q15 Codex exit code not zero: ${response.codex_exit_code}`);

  // Revalidate browser identity after Codex returns. A changed target must not be accepted as current.
  afterBridge = snapshot(boundIndex, 'after-bridge', true);
  if (afterBridge.conversationId !== after.conversationId ||
      afterBridge.latestUserId !== after.latestUserId ||
      afterBridge.assistantId !== after.assistantId) {
    throw new Error('Q15 browser state changed while bridge/Codex was running; result is stale');
  }

  result = 'PASS';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
} finally {
  uiv.clipboard.write(originalClipboard);
}

const elapsedMs = Date.now() - startedAt;
const rows = [[
  'result','failure_reason','expected_uivision','sleep_ms','elapsed_ms','bound_tab_index',
  'conversation_id','user_message_id','assistant_message_id','assistant_text_length','nonce',
  'before_generation_signals','after_generation_signals','bridge_started_at','xrun_exit_code',
  'bridge_action','event_sha256','assistant_text_sha256','codex_version','codex_exit_code','codex_duration_ms','browser_revalidated_after_bridge'
]];
rows.push([
  result,failureReason,EXPECTED_UIVISION,SLEEP_MS,elapsedMs,boundIndex,
  after ? after.conversationId : (before ? before.conversationId : ''),
  after ? after.latestUserId : (before ? before.latestUserId : ''),
  after ? after.assistantId : '',
  after ? after.assistantText.length : 0,
  eventNonce,
  before ? before.generationSignals : '',
  after ? after.generationSignals : '',
  bridgeStartedAt,
  xrunExit,
  response ? clean(response.action) : '',
  response ? clean(response.event_sha256) : '',
  response ? clean(response.assistant_text_sha256) : '',
  response ? clean(response.codex_version) : '',
  response && response.codex_exit_code != null ? response.codex_exit_code : '',
  response && response.codex_duration_ms != null ? response.codex_duration_ms : '',
  afterBridge ? 'true' : 'false'
]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q15_codex_bridge_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') throw new Error(`Q15 FAIL: ${failureReason}; evidence=${file}`);
uiv.log(`Q15 PASS: 10-minute low-resource wait + one nonce-bound Codex bridge round trip; assistant=${after.assistantId}; ${file}`, 'green');
