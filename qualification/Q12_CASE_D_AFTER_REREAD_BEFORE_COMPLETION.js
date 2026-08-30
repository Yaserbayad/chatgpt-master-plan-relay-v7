// Q12 Case D: append + exact reread, then interrupt before normal macro completion.
const file = 'Q12_durable_fence.csv';
const tx = 'Q12-CASE-D-AFTER-REREAD-BEFORE-COMPLETION';
const utc = new Date().toISOString();
const checksum = 'Q12D-c3041da724474402a2d556b0c19547d9';
const row = ['Q12', tx, utc, '1', checksum, 'FENCE'];

const before = uiv.csv.exists(file) ? uiv.csv.read(file) : [];
const beforeMatches = before.filter(r => String(r[1] || '') === tx);
if (beforeMatches.length !== 0) throw new Error(`Q12 Case D transaction already exists before append: ${beforeMatches.length}`);

uiv.csv.append(file, row);
const reread = uiv.csv.read(file);
const matches = reread.filter(r => JSON.stringify(r) === JSON.stringify(row));
if (matches.length !== 1) throw new Error(`Q12 Case D append/reread cardinality=${matches.length}`);

uiv.csv.write('Q12_case_d_expected.csv', [
  ['test_id','case','transaction_id','utc','sequence','checksum','record_type','before_count','exact_reread_count'],
  ['Q12','D_AFTER_REREAD_BEFORE_COMPLETION',...row.slice(1),String(beforeMatches.length),String(matches.length)]
]);
uiv.files.exportToDownloads('Q12_case_d_expected.csv');
uiv.log(`Q12_CASE_D_REREAD_DONE tx=${tx} — TERMINATE CHROME/UI.VISION NOW`, 'green');

uiv.sleep(120000);
throw new Error('Q12 Case D interruption did not occur inside the authorized window');
