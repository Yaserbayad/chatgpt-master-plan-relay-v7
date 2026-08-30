// Q15 low-resource observation qualification for ChatGPT Master Plan Relay v7.
// READ-ONLY: no click, typing, Send, navigation, refresh, OCR, image, or AI calls.
// Target behavior: one bounded observation -> 10 minute sleep -> one bounded observation.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const SLEEP_MS = 600000;
const MESSAGE = 'css=[data-message-author-role]';
const CONTROLS = 'css=button,[role="button"]';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { return m && m.attributes && m.attributes[n] != null ? String(m.attributes[n]) : ''; }
}
function findAll(locator, timeout = 2) {
  const r = uiv.findElements(locator, {required:false, timeout});
  return Array.isArray(r) ? r : [];
}
function conversationId(url) {
  const m = String(url || '').match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function generationSignalCount() {
  return findAll(CONTROLS, 2).filter(m => {
    const h = [getAttr(m,'data-testid'), getAttr(m,'aria-label'), getAttr(m,'title'), clean(m.text)].join(' ').toLowerCase();
    return /stop|stream|generat|cancel/.test(h);
  }).length;
}
function snapshot(boundIndex, label) {
  const selected = uiv.tabs.select(boundIndex);
  const url = clean(selected && selected.url);
  if (!url.includes(TARGET_PROJECT_TOKEN) || !conversationId(url)) {
    throw new Error(`Q15 ${label}: bound tab left configured Project conversation: ${url || '(unknown)'}`);
  }

  const messages = findAll(MESSAGE, 2).map((m, i) => ({
    index: i + 1,
    author: clean(getAttr(m, 'data-message-author-role')),
    id: clean(getAttr(m, 'data-message-id')),
    textLength: clean(m.text).length
  })).filter(r => r.author === 'user' || r.author === 'assistant');

  let latestUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].author === 'user' && messages[i].id) { latestUserIndex = i; break; }
  }
  if (latestUserIndex < 0) throw new Error(`Q15 ${label}: no stable user message ID found`);

  const latestUser = messages[latestUserIndex];
  const followingAssistants = messages.slice(latestUserIndex + 1).filter(r => r.author === 'assistant' && r.id);
  const latestAssistant = followingAssistants.length ? followingAssistants[followingAssistants.length - 1] : null;

  return {
    timestamp: new Date().toISOString(),
    label,
    url,
    conversationId: conversationId(url),
    userCount: messages.filter(r => r.author === 'user').length,
    assistantCount: messages.filter(r => r.author === 'assistant').length,
    latestUserId: latestUser.id,
    followingAssistantId: latestAssistant ? latestAssistant.id : '',
    followingAssistantTextLength: latestAssistant ? latestAssistant.textLength : 0,
    generationSignals: generationSignalCount()
  };
}

const tabs = uiv.tabs.list();
const candidates = tabs.filter(t => t && clean(t.url).includes(TARGET_PROJECT_TOKEN) && conversationId(clean(t.url)));
if (candidates.length !== 1) throw new Error(`Q15 requires exactly one configured-Project conversation tab; found ${candidates.length}`);
const boundIndex = candidates[0].index;
if (!Number.isFinite(Number(boundIndex)) || Number(boundIndex) < 1) throw new Error(`Q15 invalid bound tab index: ${boundIndex}`);

const startedAt = Date.now();
const before = snapshot(boundIndex, 'before-sleep');

// The qualification's only long wait. There are no page actions, refreshes, OCR/image/AI calls, or polling loops here.
uiv.sleep(SLEEP_MS);

const after = snapshot(boundIndex, 'after-sleep');
const elapsedMs = Date.now() - startedAt;

let result = 'PASS';
let failureReason = '';
if (after.conversationId !== before.conversationId) {
  result = 'FAIL'; failureReason = `conversation changed during sleep: ${before.conversationId} -> ${after.conversationId}`;
} else if (after.latestUserId !== before.latestUserId) {
  result = 'FAIL'; failureReason = `latest user turn changed during sleep: ${before.latestUserId} -> ${after.latestUserId}`;
} else if (after.generationSignals !== 0) {
  result = 'FAIL'; failureReason = `response still appears to be generating at next check; signals=${after.generationSignals}`;
} else if (!after.followingAssistantId || after.followingAssistantTextLength <= 0) {
  result = 'FAIL'; failureReason = 'no completed assistant response with stable ID and non-empty text followed the latest user turn at next check';
} else if (elapsedMs < 570000) {
  result = 'FAIL'; failureReason = `sleep/check cycle too short: elapsed_ms=${elapsedMs}`;
}

const rows = [[
  'result','failure_reason','expected_uivision','sleep_ms','elapsed_ms','bound_tab_index',
  'stage','timestamp','url','conversation_id','user_count','assistant_count','latest_user_id',
  'following_assistant_id','following_assistant_text_length','generation_signal_count'
]];
for (const s of [before, after]) {
  rows.push([
    result,failureReason,EXPECTED_UIVISION,SLEEP_MS,elapsedMs,boundIndex,
    s.label,s.timestamp,s.url,s.conversationId,s.userCount,s.assistantCount,s.latestUserId,
    s.followingAssistantId,s.followingAssistantTextLength,s.generationSignals
  ]);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q15_low_resource_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') throw new Error(`Q15 FAIL: ${failureReason}; evidence=${file}`);
uiv.log(`Q15 PASS: elapsed=${elapsedMs}ms; one observation before and one after 10-minute sleep; completed assistant=${after.followingAssistantId}; ${file}`, 'green');
