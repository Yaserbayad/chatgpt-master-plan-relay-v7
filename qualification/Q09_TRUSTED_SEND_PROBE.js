// Q09 trusted Submit qualification for ChatGPT Master Plan Relay v7.
// MATERIAL TEST: performs exactly ONE trusted Send click. Never retries or resends after that click.
// Uses Q07-qualified pre-send turn enumeration and post-send message-ID delta proof.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const MESSAGE = 'css=[data-message-author-role]';
const COMPOSER = 'css=[role="textbox"][contenteditable="true"][aria-label="Chat with ChatGPT"]';
const SEND = 'css=button[class*="composer-submit-button-color"][aria-label="Send prompt"]';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = m && m.attributes ? m.attributes : {}; return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function hasAttr(m, n) {
  const a = m && m.attributes ? m.attributes : {};
  if (Object.prototype.hasOwnProperty.call(a, n)) return true;
  try { return m.getAttribute(n) !== null; } catch (_) { return false; }
}
function findAll(locator, timeout = 2, includeHidden = false) {
  const opts = {required: false, timeout};
  if (includeHidden) opts.includeHidden = true;
  const r = uiv.findElements(locator, opts);
  return Array.isArray(r) ? r : [];
}
function messageRows(stage, matches) {
  return matches.map((m, i) => ({
    stage,
    index: i + 1,
    author: clean(getAttr(m, 'data-message-author-role')),
    id: clean(getAttr(m, 'data-message-id')),
    text: clean(m.text).slice(0, 220)
  }));
}
function addById(map, rows) {
  for (const row of rows) if (row.id && !map.has(row.id)) map.set(row.id, row);
}
function currentUrl() {
  const tabs = uiv.tabs.list();
  const tab = tabs.find(t => t && t.current) || tabs.find(t => t && t.active);
  return tab && tab.url ? clean(tab.url) : '';
}
function parseConversation(url) {
  const m = url.match(/\/c\/([^/?#]+)/);
  return m ? m[1] : '';
}
function enabled(m) {
  return m && !hasAttr(m, 'disabled') && clean(getAttr(m, 'aria-disabled')).toLowerCase() !== 'true';
}

const urlBefore = currentUrl();
if (!urlBefore || !urlBefore.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q09 wrong Project: ${urlBefore || '(unknown URL)'}`);
const conversationBefore = parseConversation(urlBefore);
if (!conversationBefore) throw new Error(`Q09 cannot parse conversation ID: ${urlBefore}`);
if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q09 requires ChatGPT idle/completed before Send');
if (findAll(COMPOSER).length !== 1) throw new Error('Q09 requires exactly one target composer');

// Q07-qualified complete pre-send enumeration: bottom/current + includeHidden + Home + End, deduped by stable message ID.
const beforeInitial = findAll(MESSAGE);
if (!beforeInitial.length) throw new Error('Q09 found no messages before Send');
const before = new Map();
addById(before, messageRows('before-visible', beforeInitial));
addById(before, messageRows('before-all', findAll(MESSAGE, 2, true)));
uiv.browser.click(beforeInitial[beforeInitial.length - 1]); // move focus away from composer only
uiv.browser.type('${KEY_HOME}');
uiv.sleep(800);
addById(before, messageRows('before-home-visible', findAll(MESSAGE)));
addById(before, messageRows('before-home-all', findAll(MESSAGE, 2, true)));
uiv.browser.type('${KEY_END}');
uiv.sleep(800);
addById(before, messageRows('before-end-visible', findAll(MESSAGE)));
addById(before, messageRows('before-end-all', findAll(MESSAGE, 2, true)));

const beforeRows = Array.from(before.values());
const beforeUserIds = new Set(beforeRows.filter(r => r.author === 'user').map(r => r.id));
if (!beforeUserIds.size) throw new Error('Q09 found no pre-send user turns');

// Reacquire the live Send surface after restoring the bottom view.
const sendCandidates = findAll(SEND, 2, true).filter(enabled);
if (sendCandidates.length !== 1) throw new Error(`Q09 requires exactly one enabled Send prompt control; found ${sendCandidates.length}`);

let sendActionCount = 0;
let sendPerformed = false;
let result = 'AMBIGUOUS';
let failureReason = '';
let afterRows = [];
let newUsers = [];
let generationObserved = false;
let urlAfter = '';
let conversationAfter = '';

try {
  // THE ONLY SEND ACTION IN THIS MACRO. Never retry this click.
  uiv.browser.click(sendCandidates[0]);
  sendActionCount += 1;
  sendPerformed = true;

  const after = new Map();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    uiv.sleep(500);
    addById(after, messageRows(`after-${attempt + 1}-visible`, findAll(MESSAGE)));
    addById(after, messageRows(`after-${attempt + 1}-all`, findAll(MESSAGE, 2, true)));
    generationObserved = generationObserved || findAll('css=[data-testid="stop-button"]', 1).length > 0;
    afterRows = Array.from(after.values());
    newUsers = afterRows.filter(r => r.author === 'user' && !beforeUserIds.has(r.id));
    if (newUsers.length !== 0) break;
  }

  urlAfter = currentUrl();
  conversationAfter = parseConversation(urlAfter);
  if (!urlAfter.includes(TARGET_PROJECT_TOKEN)) failureReason = `wrong Project after single Send: ${urlAfter}`;
  else if (conversationAfter !== conversationBefore) failureReason = `conversation changed after single Send: ${conversationBefore} -> ${conversationAfter}`;
  else if (sendActionCount !== 1) failureReason = `internal Send action count is ${sendActionCount}, expected 1`;
  else if (newUsers.length !== 1) failureReason = `single Send produced ${newUsers.length} newly observed user message IDs`;
  else result = 'PASS';
} catch (error) {
  failureReason = clean(error && error.message ? error.message : error);
}

const rows = [[
  'category','result','failure_reason','send_performed','send_action_count','url_before','url_after','conversation_before','conversation_after',
  'before_unique_user_count','new_user_count','new_user_id','new_user_text','generation_observed','expected_uivision',
  'stage','author','message_id','text'
]];
rows.push([
  'meta',result,failureReason,sendPerformed,sendActionCount,urlBefore,urlAfter,conversationBefore,conversationAfter,
  beforeUserIds.size,newUsers.length,newUsers.length === 1 ? newUsers[0].id : '',newUsers.length === 1 ? newUsers[0].text : '',generationObserved,EXPECTED_UIVISION,
  '','','',''
]);
for (const r of beforeRows) rows.push(['before','','','','','','','','','','','','','','',r.stage,r.author,r.id,r.text]);
for (const r of afterRows) rows.push(['after','','','','','','','','','','','','','','',r.stage,r.author,r.id,r.text]);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q09_trusted_send_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);

if (result !== 'PASS') {
  throw new Error(`Q09 ${sendPerformed ? 'AMBIGUOUS_AFTER_SINGLE_SEND' : 'PRE_SEND_FAILURE'}: ${failureReason || 'new user turn not proven'}; NO RESEND; evidence=${file}`);
}
uiv.log(`Q09 PASS: exactly one trusted Send created exactly one new user turn ${newUsers[0].id}; ${file}`, 'green');
