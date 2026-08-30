$ErrorActionPreference = 'Stop'

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$Store = 'C:\Users\usr\Desktop\uivision'
$MacroDir = Join-Path $Store 'macros'
$DataDir = Join-Path $Store 'datasources'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'

$Files = [ordered]@{
    'Q15_B_CODEX_BRIDGE_PROBE.js' = 'f3ef1e077cae5fa63831473a6c9f390723b24009925bc35280e84f31d626b282'
    'Q15_B_BRIDGE.ps1' = 'a8cf351d71322b17358a49174c4684158893907b3aaaf552388181bd66550715'
    'Q15_B_SCHEMA.json' = 'c060c05e4e5a063da56229f2be10361cc057af83d8d1b153b29160368f6eb5a6'
}

if (-not (Test-Path -LiteralPath $Chrome)) { throw "Chrome not found: $Chrome" }
if (-not (Test-Path -LiteralPath $Launcher)) { throw "UI.Vision launcher not found: $Launcher" }
$codexCommand = Get-Command codex.cmd,codex.exe,codex -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $codexCommand) { throw 'Codex CLI was not found in PATH.' }

New-Item -ItemType Directory -Force -Path $MacroDir,$DataDir | Out-Null

foreach ($name in $Files.Keys) {
    $src = Join-Path $Here $name
    if (-not (Test-Path -LiteralPath $src)) { throw "Package file missing: ${name}" }
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $src).Hash.ToLowerInvariant()
    if ($actual -ne $Files[$name]) { throw "SHA256 mismatch for ${name}: $actual" }
}

Copy-Item -LiteralPath (Join-Path $Here 'Q15_B_CODEX_BRIDGE_PROBE.js') -Destination (Join-Path $MacroDir 'Q15_B_CODEX_BRIDGE_PROBE.js') -Force
Copy-Item -LiteralPath (Join-Path $Here 'Q15_B_BRIDGE.ps1') -Destination (Join-Path $Store 'Q15_B_BRIDGE.ps1') -Force
Copy-Item -LiteralPath (Join-Path $Here 'Q15_B_SCHEMA.json') -Destination (Join-Path $Store 'Q15_B_SCHEMA.json') -Force

$evidence = Join-Path $Downloads 'Q15_B_evidence.csv'
$log = Join-Path $Downloads 'Q15_B_uivision.log'
Remove-Item -LiteralPath $evidence,$log -Force -ErrorAction SilentlyContinue

$launcherUri = 'file:///' + ($Launcher -replace '\\','/')
$logUri = $log -replace '\\','/'
$url = "$launcherUri?direct=1&macro=Q15_B_CODEX_BRIDGE_PROBE.js&storage=xfile&closeRPA=1&closeBrowser=0&savelog=$logUri"

Write-Host 'Q15-B starting. Keep exactly one configured Project conversation tab open and idle.'
Write-Host 'This probe is read-only: no ChatGPT Send, typing, refresh, or navigation.'
Start-Process -FilePath $Chrome -ArgumentList $url

$deadline = (Get-Date).AddMinutes(4)
do {
    if (Test-Path -LiteralPath $evidence) { break }
    if (Test-Path -LiteralPath $log) {
        Start-Sleep -Seconds 2
        break
    }
    Start-Sleep -Milliseconds 500
} while ((Get-Date) -lt $deadline)

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$outDir = Join-Path $Desktop ("Q15_B_evidence_$stamp")
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

foreach ($name in $Files.Keys) {
    Copy-Item -LiteralPath (Join-Path $Here $name) -Destination $outDir -Force
}
if (Test-Path -LiteralPath $evidence) { Copy-Item -LiteralPath $evidence -Destination $outDir -Force }
if (Test-Path -LiteralPath $log) { Copy-Item -LiteralPath $log -Destination $outDir -Force }
$result = Join-Path $DataDir 'Q15_B_result.txt'
if (Test-Path -LiteralPath $result) { Copy-Item -LiteralPath $result -Destination $outDir -Force }

Get-FileHash -Algorithm SHA256 -Path (Join-Path $outDir '*') | Sort-Object Path | Format-Table -AutoSize | Out-String | Set-Content -LiteralPath (Join-Path $outDir 'SHA256.txt')
$zip = "$outDir.zip"
Compress-Archive -Path (Join-Path $outDir '*') -DestinationPath $zip -Force

if (Test-Path -LiteralPath $evidence) {
    Write-Host 'Q15-B produced PASS-candidate evidence.'
    Write-Host "Upload this ZIP to ChatGPT: $zip"
    exit 0
}

Write-Host 'Q15-B did not produce PASS evidence. The failure bundle was still collected.'
Write-Host "Upload this ZIP to ChatGPT: $zip"
exit 1
