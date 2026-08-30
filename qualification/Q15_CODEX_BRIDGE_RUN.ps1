Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$MacroDir = 'C:\Users\usr\Desktop\uivision\macros'
$CodexDir = 'C:\Users\usr\Documents\Codex'
$BridgeTarget = 'C:\Users\usr\Documents\Codex\RelayCodexBridge.ps1'
$SchemaTarget = 'C:\Users\usr\Documents\Codex\Q15_CODEX_PROBE_OUTPUT.schema.json'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
$MacroName = 'Q15_CODEX_BRIDGE_PROBE.js'
$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MacroSource = Join-Path $SourceDir $MacroName
$BridgeSource = Join-Path $SourceDir 'RelayCodexBridge.ps1'
$SchemaSource = Join-Path $SourceDir 'Q15_CODEX_PROBE_OUTPUT.schema.json'
$LogPath = Join-Path $Downloads 'Q15_codex_bridge.log'
$Started = Get-Date
$Evidence = $null
$Status = 'FAIL'
$Failure = ''
$BundleZip = ''

function New-Q15Bundle {
  param([string]$Result, [string]$Reason, $EvidenceFile)
  $Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $OutDir = Join-Path $Desktop ("Q15_codex_bridge_evidence_${Stamp}")
  New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
  foreach ($p in @($MacroSource,$BridgeSource,$SchemaSource)) {
    if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $OutDir -Force }
  }
  if ($null -ne $EvidenceFile -and (Test-Path -LiteralPath $EvidenceFile.FullName)) {
    Copy-Item -LiteralPath $EvidenceFile.FullName -Destination $OutDir -Force
  }
  if (Test-Path -LiteralPath $LogPath) { Copy-Item -LiteralPath $LogPath -Destination $OutDir -Force }
  ("Q15={0}`r`nREASON={1}" -f $Result,$Reason) | Set-Content -LiteralPath (Join-Path $OutDir 'RESULT.txt') -Encoding UTF8
  Get-ChildItem -LiteralPath $OutDir -File | ForEach-Object {
    $h = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    "{0}  {1}" -f $h.Hash.ToLowerInvariant(), $_.Name
  } | Set-Content -LiteralPath (Join-Path $OutDir 'SHA256.txt') -Encoding ASCII
  $zip = "${OutDir}.zip"
  Compress-Archive -Path (Join-Path $OutDir '*') -DestinationPath $zip -Force
  return $zip
}

try {
  foreach ($p in @($Chrome,$Launcher,$MacroSource,$BridgeSource,$SchemaSource)) {
    if (-not (Test-Path -LiteralPath $p)) { throw "Required file missing: ${p}" }
  }
  if (-not (Test-Path -LiteralPath $MacroDir)) { throw "UI.Vision macro directory missing: ${MacroDir}" }
  if (-not (Test-Path -LiteralPath $CodexDir)) { throw "Codex directory missing: ${CodexDir}" }

  $Codex = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$Codex.Source)) { [string]$Codex.Source } else { [string]$Codex.Definition }
  $CodexVersion = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($CodexVersion)) { throw 'Codex CLI version could not be read.' }
  Write-Host "Codex CLI: ${CodexVersion}"

  Copy-Item -LiteralPath $MacroSource -Destination (Join-Path $MacroDir $MacroName) -Force
  Copy-Item -LiteralPath $BridgeSource -Destination $BridgeTarget -Force
  Copy-Item -LiteralPath $SchemaSource -Destination $SchemaTarget -Force

  Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue
  $LauncherUri = 'file:///' + ($Launcher -replace '\\','/')
  $LogUrl = $LogPath -replace '\\','/'
  $LaunchUrl = "${LauncherUri}?direct=1&macro=${MacroName}&storage=xfile&savelog=${LogUrl}"

  Write-Host 'Q15 Codex watcher qualification started.'
  Write-Host 'Leave exactly one configured ChatGPT Project conversation tab open and unchanged.'
  Write-Host 'The macro will sleep for about 10 minutes, then invoke Codex exactly once. It will not Send, click, refresh, or navigate ChatGPT.'
  Start-Process -FilePath $Chrome -ArgumentList $LaunchUrl

  $Deadline = (Get-Date).AddMinutes(20)
  while ((Get-Date) -lt $Deadline) {
    $Evidence = Get-ChildItem -LiteralPath $Downloads -Filter 'Q15_codex_bridge_*.csv' -File -ErrorAction SilentlyContinue |
      Where-Object { $_.LastWriteTime -ge $Started } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    if ($null -ne $Evidence) { break }
    Start-Sleep -Seconds 2
  }
  if ($null -eq $Evidence) { throw 'Q15 evidence CSV was not produced within 20 minutes.' }

  $Rows = Import-Csv -LiteralPath $Evidence.FullName
  if ($Rows.Count -lt 1) { throw 'Q15 evidence CSV is incomplete.' }
  $Meta = $Rows | Select-Object -First 1
  if ($Meta.result -ne 'PASS') { throw ("Q15 macro reported FAIL: {0}" -f $Meta.failure_reason) }
  if ($Meta.bridge_action -ne 'PROBE_OK') { throw 'Q15 evidence lacks PROBE_OK.' }
  if ($Meta.xrun_exit_code -ne '0' -or $Meta.codex_exit_code -ne '0') { throw 'Q15 evidence contains nonzero bridge/Codex exit code.' }
  if ($Meta.browser_revalidated_after_bridge -ne 'true') { throw 'Q15 browser revalidation proof missing.' }

  $Status = 'PASS'
}
catch {
  $Failure = [string]$_.Exception.Message
}
finally {
  $BundleZip = New-Q15Bundle -Result $Status -Reason $Failure -EvidenceFile $Evidence
}

if ($Status -ne 'PASS') {
  Write-Host "Q15 FAIL: ${Failure}"
  Write-Host "Upload this diagnostic bundle: ${BundleZip}"
  exit 1
}

Write-Host 'Q15 PASS: low-resource wait and real Codex IPC round trip are proven by the target run.'
Write-Host "Upload this evidence bundle: ${BundleZip}"
exit 0
