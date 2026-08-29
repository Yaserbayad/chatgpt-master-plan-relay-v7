// Q07 turn-enumeration diagnostic for ChatGPT Master Plan Relay v7.
// Qualification-only. No typing into the composer, Submit, navigation, or refresh.
// It reads message DOM snapshots, performs Home/End page navigation, and exports evidence.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';
const MESSAGE_LOCATOR = 'css=[data-message-author-role]';

function clean(value) {
  return value == null ? '' : String(value).replace(/\s+/g, ' ').trim();
}

function getAttr(match, name) {
  try {
    return clean(match.getAttribute(name));
  } catch (_) {
    return clean(match.attributes && match.attributes[name]);
  }
}

function findMessages(includeHidden = false) {
  const opts = {required: false, timeout: 2};
  if (includeHidden) opts.includeHidden = true;
  const result = uiv.findElements(MESSAGE_LOCATOR, opts);
  return Array.isArray(result) ? result : [];
}

function snapshot(stage, matches) {
  return matches.map((match, i) => ({
    stage,
    index: i + 1,
    author: getAttr(match, 'data-message-author-role'),
    messageId: getAttr(match, 'data-message-id'),
    text: clean(match.text).slice(0, 180)
  }));
}

function addUnique(map, rows) {
  for (const row of rows) {
    if (row.messageId && !map.has(row.messageId)) map.set(row.messageId, row);
  }
}

const tabs = uiv.tabs.list();
const currentTab = tabs.find(tab => tab && tab.current) || tabs.find(tab => tab && tab.active);
if (!currentTab || !currentTab.url) throw new Error('Q07 scan cannot determine current tab URL');
const currentUrl = clean(currentTab.url);
if (!currentUrl.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q07 scan wrong Project: ${currentUrl}`);
const conversationMatch = currentUrl.match(/\/c\/([^/?#]+)/);
const conversationId = conversationMatch ? conversationMatch[1] : '';
if (!conversationId) throw new Error(`Q07 scan cannot parse conversation ID: ${currentUrl}`);

const stopBefore = uiv.findElements('css=[data-testid="stop-button"]', {required: false, timeout: 1});
if (Array.isArray(stopBefore) && stopBefore.length) {
  throw new Error('Q07 scan must run only after the response is completed; live stop-button is present');
}

const beforeMatches = findMessages(false);
if (!beforeMatches.length) throw new Error('Q07 scan found no message nodes before scan');
const beforeVisible = snapshot('before-visible', beforeMatches);
const beforeAll = snapshot('before-all', findMessages(true));

// Click the last rendered message (non-composer) only to move keyboard focus away from the editor.
// Home/End are browser navigation keys; this diagnostic never enters prompt text or submits anything.
uiv.browser.click(beforeMatches[beforeMatches.length - 1]);
uiv.browser.type('${KEY_HOME}');
uiv.sleep(900);

const topVisible = snapshot('after-home-visible', findMessages(false));
const topAll = snapshot('after-home-all', findMessages(true));

uiv.browser.type('${KEY_END}');
uiv.sleep(900);

const restoredVisible = snapshot('after-end-visible', findMessages(false));
const restoredAll = snapshot('after-end-all', findMessages(true));

const unique = new Map();
for (const rows of [beforeVisible, beforeAll, topVisible, topAll, restoredVisible, restoredAll]) addUnique(unique, rows);
const uniqueRows = Array.from(unique.values());
const uniqueUserCount = uniqueRows.filter(row => row.author === 'user').length;
const uniqueAssistantCount = uniqueRows.filter(row => row.author === 'assistant').length;

const rows = [[
  'stage','index','author','message_id','text','url','conversation_id','before_visible_count','before_all_count',
  'top_visible_count','top_all_count','restored_visible_count','restored_all_count','unique_user_count','unique_assistant_count','expected_uivision'
]];

rows.push([
  'meta','','','','',currentUrl,conversationId,beforeVisible.length,beforeAll.length,
  topVisible.length,topAll.length,restoredVisible.length,restoredAll.length,uniqueUserCount,uniqueAssistantCount,EXPECTED_UIVISION
]);

for (const row of [...beforeVisible, ...beforeAll, ...topVisible, ...topAll, ...restoredVisible, ...restoredAll]) {
  rows.push([row.stage,row.index,row.author,row.messageId,row.text,'','','','','','','','','','','']);
}
for (const row of uniqueRows) {
  rows.push(['unique','',''+row.author,row.messageId,row.text,'','','','','','','','','','','']);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q07_turn_scan_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(
  `Q07 turn scan exported ${file}; before=${beforeVisible.length}/${beforeAll.length}; top=${topVisible.length}/${topAll.length}; restored=${restoredVisible.length}/${restoredAll.length}; uniqueUser=${uniqueUserCount}; uniqueAssistant=${uniqueAssistantCount}`,
  'green'
);
