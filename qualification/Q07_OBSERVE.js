// Q07 target-observation probe for ChatGPT Master Plan Relay v7.
// Qualification-only: observation and CSV export; no input, click, refresh, or navigation.
// Official API: https://ui.vision/rpa/docs/uiv

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';

const snapshot = uiv.eval(`
return (() => {
  const clean = v => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim());
  const attrs = el => ({
    tag: el.tagName || '',
    author: clean(el.getAttribute('data-message-author-role')),
    message_id: clean(el.getAttribute('data-message-id')),
    testid: clean(el.getAttribute('data-testid')),
    role: clean(el.getAttribute('role')),
    aria: clean(el.getAttribute('aria-label')),
    text: clean((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') ? el.textContent : '').slice(0, 120),
    contenteditable: clean(el.getAttribute('contenteditable')),
    disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true'
  });

  const messages = Array.from(document.querySelectorAll('[data-message-author-role]')).map((el, i) => ({
    category: 'message', index: i + 1, ...attrs(el)
  }));

  const controls = Array.from(document.querySelectorAll('button,[role="button"],[data-testid]'))
    .filter(el => {
      const s = [el.getAttribute('aria-label'), el.getAttribute('data-testid'), el.textContent].map(clean).join(' ').toLowerCase();
      return /send|stop|generat|submit|new chat|project|retry|regenerate/.test(s);
    })
    .map((el, i) => ({category: 'control', index: i + 1, ...attrs(el)}));

  const composers = Array.from(document.querySelectorAll('[contenteditable="true"],textarea')).map((el, i) => ({
    category: 'composer', index: i + 1, ...attrs(el)
  }));

  const authorSequence = messages.map(x => x.author).filter(Boolean);
  return {
    url: location.href,
    title: document.title,
    ready_state: document.readyState,
    messages,
    controls,
    composers,
    user_count: authorSequence.filter(x => x === 'user').length,
    assistant_count: authorSequence.filter(x => x === 'assistant').length,
    author_sequence: authorSequence.join('>')
  };
})()
`);

if (!snapshot.url.includes(TARGET_PROJECT_TOKEN)) {
  throw new Error(`Q07 wrong Project: ${snapshot.url}`);
}

const rows = [[
  'category','index','tag','author','message_id','data_testid','role','aria_label','text','contenteditable','disabled','url','title','ready_state','user_count','assistant_count','author_sequence','expected_uivision'
]];

rows.push(['meta','','','','','','','','','','',snapshot.url,snapshot.title,snapshot.ready_state,snapshot.user_count,snapshot.assistant_count,snapshot.author_sequence,EXPECTED_UIVISION]);
for (const item of [...snapshot.messages, ...snapshot.controls, ...snapshot.composers]) {
  rows.push([
    item.category,item.index,item.tag,item.author,item.message_id,item.testid,item.role,item.aria,item.text,item.contenteditable,item.disabled ? 'true' : 'false','','','','','','',''
  ]);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q07_observation_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.exportToDownloads(file);
uiv.log(`Q07 exported ${file}; user=${snapshot.user_count}; assistant=${snapshot.assistant_count}; composers=${snapshot.composers.length}`, 'green');
