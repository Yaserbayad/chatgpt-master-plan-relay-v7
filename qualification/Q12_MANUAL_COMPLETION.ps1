$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$Store = 'C:\Users\usr\Desktop\uivision'
$MacroDir = Join-Path $Store 'macros'
$DataDir = Join-Path $Store 'datasources'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$RawBase = 'https://raw.githubusercontent.com/Yaserbayad/chatgpt-master-plan-relay-v7/main/qualification'
$OutDir = Join-Path $env:USERPROFILE ("Desktop\Q12_completion_evidence_" + (Get-Date -Format 'yyyyMMdd_HHmmss'))
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Start-Transcript -Path (Join-Path $OutDir 'Q12_completion_transcript.txt') -Force | Out-Null

$Macros = @{
  'Q12_CASE_B_AFTER_APPEND_BEFORE_REREAD.js' = '362af6cc86a69318be2919fda272b57fcc74af9c84622ac2d9d145e157438357'
  'Q12_CASE_B_RESTART_VERIFY.js' = '15e2f38a61b6059fa21f19b9fad351f2d999189081e185473ef4b7a03b9aa6d8'
  'Q12_CASE_D_AFTER_REREAD_BEFORE_COMPLETION.js' = '207115b9ee09ad0f618c55c854f77d51b8ab69f20f31768f046b47d4c0003a18'
  'Q12_CASE_D_RESTART_VERIFY.js' = 'dbfe3956b1a2a20b850560ef4de591d5d78c698910e629755c81b6daba290938'
}

function Wait-Until([scriptblock]$Condition, [int]$TimeoutSeconds, [string]$Description) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    if (& $Condition) { return }
    Start-Sleep -Milliseconds 250
  } while ((Get-Date) -lt $deadline)
  throw "Timeout waiting for $Description"
}

function Stop-ChromeAbruptly {
  Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Seconds 2
}

function Start-Uivision([string]$Macro, [string]$LogName) {
  $launcherUri = 'file:///' + ($Launcher -replace '\\','/')
  $logPath = (Join-Path $Downloads $LogName) -replace '\\','/'
  $url = "$launcherUri?direct=1&macro=$Macro&storage=xfile&savelog=$logPath"
  Start-Process -FilePath $Chrome -ArgumentList $url
}

function Journal-Contains([string]$Tx) {
  $journal = Join-Path $DataDir 'Q12_durable_fence.csv'
  if (-not (Test-Path $journal)) { return $false }
  return [bool](Select-String -LiteralPath $journal -SimpleMatch $Tx -Quiet -ErrorAction SilentlyContinue)
}

if (-not (Test-Path $Chrome)) { throw "Chrome not found: $Chrome" }
if (-not (Test-Path $Launcher)) { throw "UI.Vision CLI launcher not found: $Launcher" }
New-Item -ItemType Directory -Force -Path $MacroDir | Out-Null

foreach ($name in $Macros.Keys) {
  $dest = Join-Path $MacroDir $name
  Invoke-WebRequest -UseBasicParsing -Uri "$RawBase/$name" -OutFile $dest
  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $dest).Hash.ToLowerInvariant()
  if ($actual -ne $Macros[$name]) { throw "SHA256 mismatch for $name: $actual" }
  Copy-Item -LiteralPath $dest -Destination $OutDir -Force
}

# Case B — append, then terminate before any post-append reread.
Remove-Item (Join-Path $Downloads 'Q12_case_b_expected.csv'),(Join-Path $Downloads 'Q12_case_b_restart_evidence.csv') -Force -ErrorAction SilentlyContinue
Start-Uivision 'Q12_CASE_B_AFTER_APPEND_BEFORE_REREAD.js' 'Q12_case_b_writer.log'
Wait-Until { (Test-Path (Join-Path $Downloads 'Q12_case_b_expected.csv')) -and (Journal-Contains 'Q12-CASE-B-AFTER-APPEND-BEFORE-REREAD') } 45 'Q12 Case B append'
Stop-ChromeAbruptly
Start-Uivision 'Q12_CASE_B_RESTART_VERIFY.js' 'Q12_case_b_restart.log'
Wait-Until { Test-Path (Join-Path $Downloads 'Q12_case_b_restart_evidence.csv') } 45 'Q12 Case B restart evidence'
$b = Import-Csv (Join-Path $Downloads 'Q12_case_b_restart_evidence.csv') | Select-Object -Last 1
if ($b.exact_count -ne '1' -or $b.partial_or_corrupt_count -ne '0' -or $b.ordered -ne 'true') { throw 'Q12 Case B verification failed' }
Copy-Item (Join-Path $Downloads 'Q12_case_b_expected.csv'),(Join-Path $Downloads 'Q12_case_b_restart_evidence.csv') -Destination $OutDir -Force
foreach ($n in 'Q12_case_b_writer.log','Q12_case_b_restart.log') { $p = Join-Path $Downloads $n; if (Test-Path $p) { Copy-Item $p $OutDir -Force } }

# Case D — append + exact reread, then terminate before normal macro completion.
Remove-Item (Join-Path $Downloads 'Q12_case_d_expected.csv'),(Join-Path $Downloads 'Q12_case_d_restart_evidence.csv') -Force -ErrorAction SilentlyContinue
Start-Uivision 'Q12_CASE_D_AFTER_REREAD_BEFORE_COMPLETION.js' 'Q12_case_d_writer.log'
Wait-Until { Test-Path (Join-Path $Downloads 'Q12_case_d_expected.csv') } 45 'Q12 Case D exact reread evidence'
Stop-ChromeAbruptly
Start-Uivision 'Q12_CASE_D_RESTART_VERIFY.js' 'Q12_case_d_restart.log'
Wait-Until { Test-Path (Join-Path $Downloads 'Q12_case_d_restart_evidence.csv') } 45 'Q12 Case D restart evidence'
$d = Import-Csv (Join-Path $Downloads 'Q12_case_d_restart_evidence.csv') | Select-Object -Last 1
if ($d.exact_count -ne '1' -or $d.partial_or_corrupt_count -ne '0' -or $d.ordered -ne 'true') { throw 'Q12 Case D verification failed' }
Copy-Item (Join-Path $Downloads 'Q12_case_d_expected.csv'),(Join-Path $Downloads 'Q12_case_d_restart_evidence.csv') -Destination $OutDir -Force
foreach ($n in 'Q12_case_d_writer.log','Q12_case_d_restart.log') { $p = Join-Path $Downloads $n; if (Test-Path $p) { Copy-Item $p $OutDir -Force } }

Get-FileHash -Algorithm SHA256 -Path (Join-Path $OutDir '*') | Sort-Object Path | Format-Table -AutoSize | Out-String | Set-Content (Join-Path $OutDir 'SHA256.txt')
'Q12_CASE_B=PASS' | Set-Content (Join-Path $OutDir 'RESULT.txt')
'Q12_CASE_D=PASS' | Add-Content (Join-Path $OutDir 'RESULT.txt')
Stop-Transcript | Out-Null
$Zip = "$OutDir.zip"
Compress-Archive -Path (Join-Path $OutDir '*') -DestinationPath $Zip -Force
Write-Host "Q12 remaining interruption cases PASS"
Write-Host "Upload this file to ChatGPT: $Zip"
