// Q08 Send-control discovery diagnostic for ChatGPT Master Plan Relay v7.
// Read-only: no click, typing, Submit, navigation, refresh, or clipboard mutation.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';

function clean(value) {
  return value == null ? '' : String(value).replace(/\s+/g, ' ').trim();
}

function attrsOf(match) {
  const attrs = match && match.attributes && typeof match.attributes === 'object' ? match.attributes : {};
  return attrs;
}

function getAttr(match, name) {
  try {
    const v = match.getAttribute(name);
    return v == null ? '' : String(v);
  } catch (_) {
    const attrs = attrsOf(match);
    return Object.prototype.hasOwnProperty.call(attrs, name) ? String(attrs[name] == null ? '' : attrs[name]) : '';
  }
}

function rectOf(match) {
  const r = match && match.rect && typeof match.rect === 'object' ? match.rect : {};
  return {
    x: Number.isFinite(Number(r.x)) ? Number(r.x) : Number(match && match.x) || 0,
    y: Number.isFinite(Number(r.y)) ? Number(r.y) : Number(match && match.y) || 0,
    width: Number(r.width) || 0,
    height: Number(r.height) || 0
  };
}

function findAll(locator, timeout = 2) {
  const result = uiv.findElements(locator, {required: false, timeout});
  return Array.isArray(result) ? result : [];
}

const tabs = uiv.tabs.list();
const currentTab = tabs.find(tab => tab && tab.current) || tabs.find(tab => tab && tab.active);
if (!currentTab || !currentTab.url) throw new Error('Q08 discovery cannot determine current tab URL');
const currentUrl = clean(currentTab.url);
if (!currentUrl.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q08 discovery wrong Project: ${currentUrl}`);
if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q08 discovery requires ChatGPT idle/completed');

const composers = findAll('css=[contenteditable="true"],textarea');
if (composers.length !== 1) throw new Error(`Q08 discovery requires exactly one composer; found ${composers.length}`);
const composer = composers[0];
const cr = rectOf(composer);
const cx = cr.x + cr.width / 2;
const cy = cr.y + cr.height / 2;

const controls = findAll('css=button,[role="button"]');
const probes = [
  ['button_type_submit','css=button[type="submit"]'],
  ['data_testid_send','css=[data-testid*="send"]'],
  ['aria_send','css=button[aria-label*="Send"]'],
  ['aria_submit','css=button[aria-label*="Submit"]'],
  ['form_buttons','css=form button']
];

const rows = [[
  'category','probe','index','tag','text','value','id','name','type','role','data_testid','aria_label','title','disabled','aria_disabled','class',
  'x','y','width','height','distance_to_composer_center','attributes_json','url','conversation_id','control_count','expected_uivision'
]];

const conversationMatch = currentUrl.match(/\/c\/([^/?#]+)/);
const conversationId = conversationMatch ? conversationMatch[1] : '';
rows.push(['meta','','','','','','','','','','','','','','','','','','','','','',currentUrl,conversationId,controls.length,EXPECTED_UIVISION]);

function addRow(category, probe, index, match) {
  const r = rectOf(match);
  const mx = r.x + r.width / 2;
  const my = r.y + r.height / 2;
  const dx = mx - cx;
  const dy = my - cy;
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
  const attrs = attrsOf(match);
  rows.push([
    category,probe,index,clean(match.tag || match.tagName),clean(match.text).slice(0,180),clean(match.value).slice(0,180),
    clean(getAttr(match,'id')),clean(getAttr(match,'name')),clean(getAttr(match,'type')),clean(getAttr(match,'role')),
    clean(getAttr(match,'data-testid')),clean(getAttr(match,'aria-label')),clean(getAttr(match,'title')),
    clean(getAttr(match,'disabled')),clean(getAttr(match,'aria-disabled')),clean(getAttr(match,'class')).slice(0,300),
    r.x,r.y,r.width,r.height,distance,JSON.stringify(attrs), '', '', '', ''
  ]);
}

controls.forEach((m,i) => addRow('all-control','button-or-role-button',i+1,m));
for (const [name, locator] of probes) {
  findAll(locator,1).forEach((m,i) => addRow('specific-probe',name,i+1,m));
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q08_send_discovery_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(`Q08 Send discovery exported ${file}; controls=${controls.length}; no action performed`, 'green');
