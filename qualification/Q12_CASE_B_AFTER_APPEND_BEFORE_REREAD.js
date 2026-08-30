// Q12 Case B: interrupt immediately after FENCE append, before any post-append reread.
const file = 'Q12_durable_fence.csv';
const tx = 'Q12-CASE-B-AFTER-APPEND-BEFORE-REREAD';
const utc = new Date().toISOString();
const checksum = 'Q12B-7f6f4c25aaf04f9cabd4f95be2c96d75';
const row = ['Q12', tx, utc, '1', checksum, 'FENCE'];

const before = uiv.csv.exists(file) ? uiv.csv.read(file) : [];
const beforeMatches = before.filter(r => String(r[1] || '') === tx);
if (beforeMatches.length !== 0) throw new Error(`Q12 Case B transaction already exists before append: ${beforeMatches.length}`);

uiv.csv.write('Q12_case_b_expected.csv', [
  ['test_id','case','transaction_id','utc','sequence','checksum','record_type','before_count'],
  ['Q12','B_AFTER_APPEND_BEFORE_REREAD',...row.slice(1),String(beforeMatches.length)]
]);
uiv.files.exportToDownloads('Q12_case_b_expected.csv');

uiv.csv.append(file, row);
uiv.log(`Q12_CASE_B_APPEND_DONE tx=${tx} — TERMINATE CHROME/UI.VISION NOW`, 'green');

// Intentional interruption window. No post-append uiv.csv.read occurs in this macro.
uiv.sleep(120000);
throw new Error('Q12 Case B interruption did not occur inside the authorized window');
