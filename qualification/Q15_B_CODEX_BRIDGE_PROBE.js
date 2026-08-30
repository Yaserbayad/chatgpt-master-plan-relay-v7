// Q15-B read-only UI.Vision -> local bridge -> Codex -> UI.Vision qualification.
// No ChatGPT click, typing, Submit, refresh, or navigation.
// Ui.Vision sources: https://ui.vision/rpa/docs/xrun and https://ui.vision/ai/ai-system-prompt

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const BRIDGE_PS = 'C:\\Users\\usr\\Desktop\\uivision\\Q15_B_BRIDGE.ps1';
const EVENT_FILE = 'Q15_B_event.txt';
const RESULT_FILE = 'Q15_B_result.txt';
const EVIDENCE_FILE = 'Q15_B_evidence.csv';

function clean(value) {
  return value == null ? '' : String(value).trim();
}

function getAttr(match, name) {
  try {
    return clean(match.getAttribute(name));
  } catch (_) {
    return clean(match.attributes && match.attributes[name]);
  }
}

function findAll(locator) {
  const found = uiv.findElements(locator, {required: false, timeout: 2});
  return Array.isArray(found) ? found : [];
}

function readMessages() {
  return findAll('css=[data-message-author-role]').map((m, index) => ({
    index,
    role: getAttr(m, 'data-message-author-role'),
    id: getAttr(m, 'data-message-id'),
    text: m && m.text != null ? String(m.text).trim() : ''
  })).filter(m => m.role === 'user' || m.role === 'assistant');
}

function generationSignalCount() {
  return findAll('css=button,[role="button"]').filter(m => {
    const haystack = [
      getAttr(m, 'data-testid'),
      getAttr(m, 'aria-label'),
      getAttr(m, 'title'),
      clean(m.text)
    ].join(' ').toLowerCase();
    return /stop|stream|generat|cancel/.test(haystack);
  }).length;
}

function messageSignature(messages) {
  return messages.map(m => `${m.role}:${m.id}`).join('|');
}

const tabs = uiv.tabs.list();
const candidates = tabs.filter(t => t && t.url && t.url.includes(TARGET_PROJECT_TOKEN) && /\/c\/[^/?#]+/.test(t.url));
if (candidates.length !== 1) {
  throw new Error(`Q15-B requires exactly one configured-Project conversation tab; found ${candidates.length}`);
}

const target = candidates[0];
uiv.tabs.select(target.index);

const selected = uiv.tabs.list().find(t => t && t.current);
if (!selected || !selected.url || !selected.url.includes(TARGET_PROJECT_TOKEN)) {
  throw new Error('Q15-B target-tab binding failed');
}

const beforeUrl = clean(selected.url);
const conversationMatch = beforeUrl.match(/\/c\/([^/?#]+)/);
if (!conversationMatch) {
  throw new Error(`Q15-B conversation ID missing from ${beforeUrl}`);
}
const conversationId = conversationMatch[1];

if (generationSignalCount() !== 0) {
  throw new Error('Q15-B target is still generating; probe requires completed/idle ChatGPT');
}

const beforeMessages = readMessages();
const lastUserIndex = beforeMessages.map(m => m.role).lastIndexOf('user');
if (lastUserIndex < 0) {
  throw new Error('Q15-B found no stable user turn');
}

let assistant = null;
for (let i = lastUserIndex + 1; i < beforeMessages.length; i += 1) {
  if (beforeMessages[i].role === 'assistant') {
    assistant = beforeMessages[i];
    break;
  }
}
if (!assistant || !assistant.id || !assistant.text) {
  throw new Error('Q15-B found no stable assistant message after the latest user turn');
}

const latestUser = beforeMessages[lastUserIndex];
const beforeSignature = messageSignature(beforeMessages);
const nonce = `Q15B-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 14)}`;
const observedUtc = new Date().toISOString();

const event = {
  schema_version: 'q15b-event-1',
  observed_utc: observedUtc,
  project_token: TARGET_PROJECT_TOKEN,
  conversation_id: conversationId,
  user_message_id: latestUser.id,
  assistant_message_id: assistant.id,
  nonce,
  assistant_text: assistant.text
};

uiv.text.write(EVENT_FILE, JSON.stringify(event));
uiv.log(`Q15-B event staged nonce=${nonce} assistant=${assistant.id}`, 'blue');

uiv.run(
  'XRunAndWait',
  'powershell.exe',
  `-NoProfile -ExecutionPolicy Bypass -File "${BRIDGE_PS}"`
);
const bridgeExitCode = clean(uiv.getVar('!XRUN_EXITCODE', ''));

const resultRaw = uiv.text.read(RESULT_FILE);
let result;
try {
  result = JSON.parse(resultRaw);
} catch (_) {
  throw new Error(`Q15-B bridge result is not valid JSON; exit=${bridgeExitCode}`);
}

if (bridgeExitCode !== '0') {
  throw new Error(`Q15-B bridge failed; exit=${bridgeExitCode}; status=${clean(result.status)}`);
}
if (result.status !== 'PASS') {
  throw new Error(`Q15-B bridge did not PASS; status=${clean(result.status)}`);
}
if (result.nonce !== nonce) {
  throw new Error('Q15-B rejected stale/mismatched nonce');
}
if (result.assistant_message_id !== assistant.id) {
  throw new Error('Q15-B rejected mismatched assistant-message identity');
}
if (result.action !== 'PROBE_OK') {
  throw new Error(`Q15-B unexpected Codex action: ${clean(result.action)}`);
}
if (result.codex_invocation_success !== true) {
  throw new Error('Q15-B Codex invocation was not validated as successful');
}

uiv.tabs.select(target.index);
const afterSelected = uiv.tabs.list().find(t => t && t.current);
const afterUrl = afterSelected && afterSelected.url ? clean(afterSelected.url) : '';
const afterMessages = readMessages();
const afterSignature = messageSignature(afterMessages);
const browserUnchanged = afterUrl === beforeUrl && afterSignature === beforeSignature && generationSignalCount() === 0;
if (!browserUnchanged) {
  throw new Error('Q15-B browser-state mutation detected during read-only bridge probe');
}

const rows = [[
  'test_id','status','observed_utc','project_token','conversation_id','user_message_id','assistant_message_id',
  'assistant_text_length','assistant_text_sha256','nonce','bridge_exit_code','codex_invocation_success','codex_version',
  'action','before_url','after_url','before_message_signature','after_message_signature','browser_mutation','send_count',
  'refresh_count','navigation_count','retry_count'
], [
  'Q15-B','PASS',observedUtc,TARGET_PROJECT_TOKEN,conversationId,latestUser.id,assistant.id,
  result.assistant_text_length,result.assistant_text_sha256,nonce,bridgeExitCode,String(result.codex_invocation_success),
  clean(result.codex_version),'PROBE_OK',beforeUrl,afterUrl,beforeSignature,afterSignature,'false','0','0','0','0'
]];

uiv.csv.write(EVIDENCE_FILE, rows);
uiv.files.exportToDownloads(EVIDENCE_FILE);
uiv.log(`Q15-B PASS nonce=${nonce} assistant=${assistant.id} codex=${clean(result.codex_version)}`, 'green');
