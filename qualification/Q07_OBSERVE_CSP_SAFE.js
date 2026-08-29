// Q07 target-observation probe for ChatGPT Master Plan Relay v7.
// CSP-safe revision: uses finder snapshots and tab metadata only.
// Qualification-only: reads DOM snapshots + current tab metadata and exports CSV.
// No click, typing, navigation, refresh, or Submit.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';

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

function findAll(locator) {
  const result = uiv.findElements(locator, {required: false, timeout: 2});
  return Array.isArray(result) ? result : [];
}

function snapshotMatch(category, index, match) {
  return {
    category,
    index,
    tag: clean(match.tag || match.tagName),
    text: clean(match.text).slice(0, 180),
    value: clean(match.value).slice(0, 180),
    author: getAttr(match, 'data-message-author-role'),
    messageId: getAttr(match, 'data-message-id'),
    testId: getAttr(match, 'data-testid'),
    role: getAttr(match, 'role'),
    aria: getAttr(match, 'aria-label'),
    title: getAttr(match, 'title'),
    contenteditable: getAttr(match, 'contenteditable'),
    disabled: getAttr(match, 'disabled'),
    ariaDisabled: getAttr(match, 'aria-disabled')
  };
}

const tabs = uiv.tabs.list();
const currentTab = tabs.find(tab => tab && tab.current) || tabs.find(tab => tab && tab.active);
if (!currentTab || !currentTab.url) {
  throw new Error('Q07 cannot determine the current browser tab URL');
}

const currentUrl = clean(currentTab.url);
if (!currentUrl.includes(TARGET_PROJECT_TOKEN)) {
  throw new Error(`Q07 wrong Project: ${currentUrl}`);
}

const conversationMatch = currentUrl.match(/\/c\/([^/?#]+)/);
const conversationId = conversationMatch ? conversationMatch[1] : '';

const messageMatches = findAll('css=[data-message-author-role]');
const controlMatches = findAll('css=button,[role="button"]');
const composerMatches = findAll('css=[contenteditable="true"],textarea');

const messages = messageMatches.map((match, i) => snapshotMatch('message', i + 1, match));
const controls = controlMatches.map((match, i) => snapshotMatch('control', i + 1, match));
const composers = composerMatches.map((match, i) => snapshotMatch('composer', i + 1, match));

const authorSequence = messages.map(row => row.author).filter(Boolean);
const userCount = authorSequence.filter(author => author === 'user').length;
const assistantCount = authorSequence.filter(author => author === 'assistant').length;

const generationSignals = controls.filter(row => {
  const haystack = [row.testId, row.aria, row.title, row.text].join(' ').toLowerCase();
  return /stop|stream|generat|cancel/.test(haystack);
});

const rows = [[
  'category','index','tag','author','message_id','data_testid','role','aria_label','title_attr','text','value','contenteditable','disabled_attr','aria_disabled',
  'url','tab_title','conversation_id','user_count','assistant_count','author_sequence','composer_count','control_count','generation_signal_count','expected_uivision'
]];

rows.push([
  'meta','','','','','','','','','','','','','',
  currentUrl,clean(currentTab.title),conversationId,userCount,assistantCount,authorSequence.join('>'),composers.length,controls.length,generationSignals.length,EXPECTED_UIVISION
]);

for (const item of [...messages, ...controls, ...composers]) {
  rows.push([
    item.category,item.index,item.tag,item.author,item.messageId,item.testId,item.role,item.aria,item.title,item.text,item.value,item.contenteditable,item.disabled,item.ariaDisabled,
    '','','','','','','','','',''
  ]);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q07_observation_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(
  `Q07 exported ${file}; user=${userCount}; assistant=${assistantCount}; composers=${composers.length}; controls=${controls.length}; generationSignals=${generationSignals.length}`,
  'green'
);
