$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$MacroDir = 'C:\Users\usr\Desktop\uivision\macros'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
$MacroName = 'Q15_LOW_RESOURCE_OBSERVE.js'
$ExpectedHash = '83aeda74f09084ac06ff096753ff258d9513becd9542cfcc921a479399ce2f53'
$RawUrl = 'https://raw.githubusercontent.com/Yaserbayad/chatgpt-master-plan-relay-v7/main/qualification/Q15_LOW_RESOURCE_OBSERVE.js'

if (-not (Test-Path -LiteralPath $Chrome)) { throw 'Chrome executable not found.' }
if (-not (Test-Path -LiteralPath $Launcher)) { throw 'UI.Vision CLI launcher not found.' }
New-Item -ItemType Directory -Force -Path $MacroDir | Out-Null

$MacroPath = Join-Path $MacroDir $MacroName
Invoke-WebRequest -UseBasicParsing -Uri $RawUrl -OutFile $MacroPath
$ActualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $MacroPath).Hash.ToLowerInvariant()
if ($ActualHash -ne $ExpectedHash) { throw "Q15 macro SHA256 mismatch. Expected ${ExpectedHash}; actual ${ActualHash}." }

$Started = Get-Date
$LogName = 'Q15_low_resource.log'
$LogPath = Join-Path $Downloads $LogName
Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue

$LauncherUri = 'file:///' + ($Launcher -replace '\\','/')
$LogUrl = $LogPath -replace '\\','/'
$LaunchUrl = "${LauncherUri}?direct=1&macro=${MacroName}&storage=xfile&savelog=${LogUrl}"

Write-Host 'Q15 started. Leave the configured ChatGPT Project conversation unchanged for about 10 minutes.'
Write-Host 'Do not refresh, send messages, or switch that conversation to another chat during the test.'
Start-Process -FilePath $Chrome -ArgumentList $LaunchUrl

$Deadline = (Get-Date).AddMinutes(13)
$Evidence = $null
while ((Get-Date) -lt $Deadline) {
  $Evidence = Get-ChildItem -LiteralPath $Downloads -Filter 'Q15_low_resource_*.csv' -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -ge $Started } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($null -ne $Evidence) { break }
  Start-Sleep -Seconds 2
}
if ($null -eq $Evidence) { throw 'Q15 evidence CSV was not produced within 13 minutes.' }

$Rows = Import-Csv -LiteralPath $Evidence.FullName
if ($Rows.Count -lt 2) { throw 'Q15 evidence CSV is incomplete.' }
if (($Rows | Select-Object -First 1).result -ne 'PASS') { throw 'Q15 macro reported FAIL. Upload the CSV and log for diagnosis.' }

$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$OutDir = Join-Path $Desktop ("Q15_completion_evidence_${Stamp}")
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Copy-Item -LiteralPath $MacroPath -Destination $OutDir -Force
Copy-Item -LiteralPath $Evidence.FullName -Destination $OutDir -Force
if (Test-Path -LiteralPath $LogPath) { Copy-Item -LiteralPath $LogPath -Destination $OutDir -Force }

$HashLines = Get-ChildItem -LiteralPath $OutDir -File | ForEach-Object {
  $h = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
  "{0}  {1}" -f $h.Hash.ToLowerInvariant(), $_.Name
}
$HashLines | Set-Content -LiteralPath (Join-Path $OutDir 'SHA256.txt')
'Q15=PASS' | Set-Content -LiteralPath (Join-Path $OutDir 'RESULT.txt')

$Zip = "${OutDir}.zip"
Compress-Archive -Path (Join-Path $OutDir '*') -DestinationPath $Zip -Force
Write-Host 'Q15 PASS.'
Write-Host "Upload this file to ChatGPT: ${Zip}"
