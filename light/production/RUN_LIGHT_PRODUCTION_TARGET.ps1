Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$MacroDir = 'C:\Users\usr\Desktop\uivision\macros'
$LightDir = 'C:\Users\usr\Documents\CodexLight'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WatcherSource = Join-Path $SourceDir 'LIGHT_PRODUCTION_WATCHER.js'
$BridgeSource = Join-Path $SourceDir 'RelayCodexLightProduction.ps1'
$SchemaSource = Join-Path $SourceDir 'LIGHT_PRODUCTION_ACTION.schema.json'
$MacroName = 'LIGHT_PRODUCTION_WATCHER.js'
$MacroTarget = Join-Path $MacroDir $MacroName
$BridgeTarget = Join-Path $LightDir 'RelayCodexLightProduction.ps1'
$SchemaTarget = Join-Path $LightDir 'LIGHT_PRODUCTION_ACTION.schema.json'
$ConfigTarget = Join-Path $LightDir 'production_config.json'
$LogPath = Join-Path $Downloads 'LIGHT_PRODUCTION_target.log'
$Started = Get-Date
$Evidence = $null
$Status = 'FAIL'
$Reason = ''
$TargetPrompt = 'Reply exactly LIGHT_PRODUCTION_TARGET_OK.'

function New-EvidenceBundle([string]$Result,[string]$Failure,$EvidenceFile) {
  $Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $Dir = Join-Path $Desktop ("LIGHT_PRODUCTION_evidence_${Stamp}")
  New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  foreach($p in @($WatcherSource,$BridgeSource,$SchemaSource)) { if(Test-Path -LiteralPath $p){ Copy-Item -LiteralPath $p -Destination $Dir -Force } }
  if($null -ne $EvidenceFile -and (Test-Path -LiteralPath $EvidenceFile.FullName)){ Copy-Item -LiteralPath $EvidenceFile.FullName -Destination $Dir -Force }
  if(Test-Path -LiteralPath $LogPath){ Copy-Item -LiteralPath $LogPath -Destination $Dir -Force }
  ("LIGHT_PRODUCTION_TARGET={0}`r`nREASON={1}" -f $Result,$Failure) | Set-Content -LiteralPath (Join-Path $Dir 'RESULT.txt') -Encoding UTF8
  Get-ChildItem -LiteralPath $Dir -File | ForEach-Object { $h=Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName; "{0}  {1}" -f $h.Hash.ToLowerInvariant(),$_.Name } | Set-Content -LiteralPath (Join-Path $Dir 'SHA256.txt') -Encoding ASCII
  $Zip="${Dir}.zip"; Compress-Archive -Path (Join-Path $Dir '*') -DestinationPath $Zip -Force; return $Zip
}

try {
  foreach($p in @($Chrome,$Launcher,$MacroDir,$WatcherSource,$BridgeSource,$SchemaSource)){ if(-not(Test-Path -LiteralPath $p)){ throw "required path missing: ${p}" } }
  $Codex=Get-Command codex -ErrorAction Stop; $CodexPath=if(-not[string]::IsNullOrWhiteSpace([string]$Codex.Source)){[string]$Codex.Source}else{[string]$Codex.Definition}
  $Version=((& $CodexPath --version 2>$null)|Out-String).Trim(); if([string]::IsNullOrWhiteSpace($Version)){throw 'Codex CLI version unavailable'}
  Write-Host "Codex CLI: ${Version}"
  New-Item -ItemType Directory -Force -Path $LightDir | Out-Null
  Copy-Item -LiteralPath $WatcherSource -Destination $MacroTarget -Force
  Copy-Item -LiteralPath $BridgeSource -Destination $BridgeTarget -Force
  Copy-Item -LiteralPath $SchemaSource -Destination $SchemaTarget -Force
  $Config=[ordered]@{ qualification_mode=$true; target_prompt=$TargetPrompt }
  [IO.File]::WriteAllText($ConfigTarget,($Config|ConvertTo-Json -Compress),(New-Object Text.UTF8Encoding($false)))
  Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue

  $LauncherUri='file:///'+($Launcher -replace '\','/'); $LogUrl=$LogPath -replace '\','/'
  $LaunchUrl="${LauncherUri}?direct=1&macro=${MacroName}&storage=xfile&savelog=${LogUrl}"
  Write-Host 'Starting bounded Light production target qualification.'
  Write-Host "Exactly one configured-Project ChatGPT conversation tab must be open. This run may send exactly one safe prompt: ${TargetPrompt}"
  Write-Host 'Do not interact with the ChatGPT tab while the qualification is running.'
  Start-Process -FilePath $Chrome -ArgumentList $LaunchUrl

  $Deadline=(Get-Date).AddMinutes(12)
  while((Get-Date)-lt $Deadline){
    $Evidence=Get-ChildItem -LiteralPath $Downloads -Filter 'LIGHT_PRODUCTION_target_*.csv' -File -ErrorAction SilentlyContinue | Where-Object{$_.LastWriteTime -ge $Started} | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if($null-ne $Evidence){break}; Start-Sleep -Seconds 2
  }
  if($null-eq $Evidence){throw 'production target evidence CSV not produced within 12 minutes'}
  $Row=Import-Csv -LiteralPath $Evidence.FullName | Select-Object -First 1; if($null-eq $Row){throw 'production target evidence CSV is empty'}
  if($Row.result-ne'PASS'){throw("production watcher failed: {0}" -f $Row.failure_reason)}
  if($Row.bridge_action-ne'SEND_PROMPT'){throw 'qualification did not exercise SEND_PROMPT'}
  if($Row.xrun_exit_code-ne'0' -or $Row.codex_exit_code-ne'0'){throw 'bridge/Codex exit code was nonzero'}
  if($Row.browser_identity_revalidated-ne'true'){throw 'pre-action browser identity revalidation missing'}
  if($Row.send_click_count-ne'1'){throw 'qualification must click Send exactly once'}
  if($Row.submission_confirmed-ne'true'){throw 'sent prompt was not confirmed as a new user message'}
  if($Row.next_completion_observed-ne'true'){throw 'following completed assistant turn was not observed'}
  $Status='PASS'
} catch { $Reason=[string]$_.Exception.Message }
finally {
  Remove-Item -LiteralPath $ConfigTarget -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $MacroTarget -Force -ErrorAction SilentlyContinue
}
$Bundle=New-EvidenceBundle -Result $Status -Failure $Reason -EvidenceFile $Evidence
if($Status-ne'PASS'){ Write-Host "LIGHT PRODUCTION TARGET FAIL: ${Reason}"; Write-Host "Upload this evidence bundle: ${Bundle}"; exit 1 }
Write-Host 'LIGHT PRODUCTION TARGET PASS.'
Write-Host "Upload this evidence bundle: ${Bundle}"
exit 0
