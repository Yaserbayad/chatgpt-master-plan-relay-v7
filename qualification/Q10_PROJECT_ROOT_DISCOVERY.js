// Q10 Project-root UI discovery for ChatGPT Master Plan Relay v7.
// Read-only: no click, typing, clipboard mutation, navigation, refresh, or Submit.

const TARGET_PROJECT_TOKEN = 'g-p-6a9323b61110819182dba0224678aa8b';
const EXPECTED_UIVISION = '10.0.178';

function clean(v) { return v == null ? '' : String(v).replace(/\s+/g, ' ').trim(); }
function attrsOf(m) { return m && m.attributes && typeof m.attributes === 'object' ? m.attributes : {}; }
function getAttr(m, n) {
  try { const v = m.getAttribute(n); return v == null ? '' : String(v); }
  catch (_) { const a = attrsOf(m); return Object.prototype.hasOwnProperty.call(a, n) ? String(a[n] == null ? '' : a[n]) : ''; }
}
function rectOf(m) {
  const r = m && m.rect && typeof m.rect === 'object' ? m.rect : {};
  return {
    x: Number(r.x) || Number(m && m.x) || 0,
    y: Number(r.y) || Number(m && m.y) || 0,
    width: Number(r.width) || 0,
    height: Number(r.height) || 0
  };
}
function findAll(locator, timeout) {
  const r = uiv.findElements(locator, {required:false, timeout: timeout == null ? 2 : timeout, includeHidden:true});
  return Array.isArray(r) ? r : [];
}
function currentUrl() {
  const tabs = uiv.tabs.list();
  const tab = tabs.find(t => t && t.current) || tabs.find(t => t && t.active);
  return tab && tab.url ? clean(tab.url) : '';
}

const url = currentUrl();
if (!url.includes(TARGET_PROJECT_TOKEN)) throw new Error(`Q10 root discovery wrong Project: ${url || '(unknown URL)'}`);
if (/\/c\/[^/?#]+/.test(url)) throw new Error(`Q10 root discovery requires Project root without conversation ID: ${url}`);
if (findAll('css=[data-testid="stop-button"]', 1).length) throw new Error('Q10 root discovery requires idle Project root');

const rows = [[
  'category','probe','index','tag','text','value','href','id','name','type','role','data_testid','aria_label','title','disabled','aria_disabled','class',
  'x','y','width','height','attributes_json','url','expected_uivision'
]];
rows.push(['meta','','','','','','','','','','','','','','','','','','','','','',url,EXPECTED_UIVISION]);

function add(category, probe, i, m) {
  const r = rectOf(m);
  rows.push([
    category,probe,i,clean(m.tag || m.tagName),clean(m.text).slice(0,500),clean(m.value).slice(0,250),clean(getAttr(m,'href')),
    clean(getAttr(m,'id')),clean(getAttr(m,'name')),clean(getAttr(m,'type')),clean(getAttr(m,'role')),clean(getAttr(m,'data-testid')),
    clean(getAttr(m,'aria-label')),clean(getAttr(m,'title')),clean(getAttr(m,'disabled')),clean(getAttr(m,'aria-disabled')),
    clean(getAttr(m,'class')).slice(0,500),r.x,r.y,r.width,r.height,JSON.stringify(attrsOf(m)),'',''
  ]);
}

const probes = [
  ['controls','button,a,[role="button"],[role="link"]'],
  ['inputs','input,textarea,[contenteditable="true"]'],
  ['headings','h1,h2,h3,[role="heading"]'],
  ['forms','form'],
  ['main','main']
];
for (const p of probes) {
  const matches = findAll('css=' + p[1], 2);
  for (let i = 0; i < matches.length; i += 1) add(p[0], p[1], i + 1, matches[i]);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = `Q10_project_root_discovery_${stamp}.csv`;
uiv.csv.write(file, rows);
uiv.files.exportToDownloads(file);
uiv.log(`Q10 Project-root discovery exported ${file}; read-only`, 'green');
