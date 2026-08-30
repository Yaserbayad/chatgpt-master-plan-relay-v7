Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$MacroDir = 'C:\Users\usr\Desktop\uivision\macros'
$LightDir = 'C:\Users\usr\Documents\CodexLight'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MacroName = 'Q15B_LIGHT_PROBE.js'
$MacroSource = Join-Path $SourceDir $MacroName
$BridgeSource = Join-Path $SourceDir 'RelayCodexLightBridge.ps1'
$SchemaSource = Join-Path $SourceDir 'Q15B_LIGHT_OUTPUT.schema.json'
$LogPath = Join-Path $Downloads 'Q15B_light.log'
$Started = Get-Date
$Evidence = $null
$Status = 'FAIL'
$Reason = ''

function New-EvidenceBundle {
  param([string]$Result, [string]$Failure, $EvidenceFile)
  $Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $Dir = Join-Path $Desktop ("Q15B_LIGHT_evidence_${Stamp}")
  New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  foreach ($p in @($MacroSource,$BridgeSource,$SchemaSource)) {
    if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $Dir -Force }
  }
  if ($null -ne $EvidenceFile -and (Test-Path -LiteralPath $EvidenceFile.FullName)) { Copy-Item -LiteralPath $EvidenceFile.FullName -Destination $Dir -Force }
  if (Test-Path -LiteralPath $LogPath) { Copy-Item -LiteralPath $LogPath -Destination $Dir -Force }
  ("Q15B_LIGHT={0}`r`nREASON={1}" -f $Result,$Failure) | Set-Content -LiteralPath (Join-Path $Dir 'RESULT.txt') -Encoding UTF8
  Get-ChildItem -LiteralPath $Dir -File | ForEach-Object {
    $h = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    "{0}  {1}" -f $h.Hash.ToLowerInvariant(), $_.Name
  } | Set-Content -LiteralPath (Join-Path $Dir 'SHA256.txt') -Encoding ASCII
  $Zip = "${Dir}.zip"
  Compress-Archive -Path (Join-Path $Dir '*') -DestinationPath $Zip -Force
  return $Zip
}

try {
  foreach ($p in @($Chrome,$Launcher,$MacroDir,$MacroSource,$BridgeSource,$SchemaSource)) {
    if (-not (Test-Path -LiteralPath $p)) { throw "required path missing: ${p}" }
  }
  $Codex = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$Codex.Source)) { [string]$Codex.Source } else { [string]$Codex.Definition }
  $Version = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($Version)) { throw 'Codex CLI is not available/authenticated enough to report a version.' }
  Write-Host "Codex CLI: ${Version}"

  New-Item -ItemType Directory -Force -Path $LightDir | Out-Null
  Copy-Item -LiteralPath $MacroSource -Destination (Join-Path $MacroDir $MacroName) -Force
  Copy-Item -LiteralPath $BridgeSource -Destination (Join-Path $LightDir 'RelayCodexLightBridge.ps1') -Force
  Copy-Item -LiteralPath $SchemaSource -Destination (Join-Path $LightDir 'Q15B_LIGHT_OUTPUT.schema.json') -Force
  Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue

  $LauncherUri = 'file:///' + ($Launcher -replace '\\','/')
  $LogUrl = $LogPath -replace '\\','/'
  $LaunchUrl = "${LauncherUri}?direct=1&macro=${MacroName}&storage=xfile&savelog=${LogUrl}"

  Write-Host 'Starting Light Version Q15-B bridge test.'
  Write-Host 'Requirement: exactly one completed ChatGPT conversation tab inside the configured Project must be open.'
  Write-Host 'This test does not send, click, navigate, refresh, or wait 10 minutes. It invokes Codex once and observes only.'
  Start-Process -FilePath $Chrome -ArgumentList $LaunchUrl

  $Deadline = (Get-Date).AddMinutes(12)
  while ((Get-Date) -lt $Deadline) {
    $Evidence = Get-ChildItem -LiteralPath $Downloads -Filter 'Q15B_light_*.csv' -File -ErrorAction SilentlyContinue |
      Where-Object { $_.LastWriteTime -ge $Started } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    if ($null -ne $Evidence) { break }
    Start-Sleep -Seconds 2
  }
  if ($null -eq $Evidence) { throw 'Light Q15-B evidence CSV not produced within 12 minutes.' }

  $Row = Import-Csv -LiteralPath $Evidence.FullName | Select-Object -First 1
  if ($null -eq $Row) { throw 'Light Q15-B evidence CSV is empty.' }
  if ($Row.result -ne 'PASS') {
    if (($Row.PSObject.Properties.Name -contains 'failure_class') -and $Row.failure_class -eq 'CODEX_CREDITS_REQUIRED') {
      throw 'CODEX_CREDITS_REQUIRED: Codex workspace credits are unavailable. Run TEST_CODEX_DIRECT.ps1 after credits are restored, then rerun Q15-B.'
    }
    throw ("Light Q15-B macro failed: {0}" -f $Row.failure_reason)
  }
  if ($Row.bridge_action -ne 'LIGHT_PROBE_OK') { throw 'LIGHT_PROBE_OK missing from evidence.' }
  if ($Row.xrun_exit_code -ne '0' -or $Row.codex_exit_code -ne '0') { throw 'bridge/Codex exit code was nonzero.' }
  if ($Row.browser_identity_revalidated -ne 'true') { throw 'post-Codex browser identity revalidation missing.' }
  $Status = 'PASS'
} catch {
  $Reason = [string]$_.Exception.Message
}

$Bundle = New-EvidenceBundle -Result $Status -Failure $Reason -EvidenceFile $Evidence
if ($Status -ne 'PASS') {
  Write-Host "LIGHT Q15-B FAIL: ${Reason}"
  Write-Host "Upload this diagnostic bundle: ${Bundle}"
  exit 1
}
Write-Host 'LIGHT Q15-B PASS.'
Write-Host "Upload this evidence bundle: ${Bundle}"
exit 0
