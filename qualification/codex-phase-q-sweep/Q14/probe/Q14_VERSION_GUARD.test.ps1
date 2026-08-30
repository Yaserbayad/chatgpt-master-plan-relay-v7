$ErrorActionPreference = 'Stop'

$guard = Join-Path $PSScriptRoot 'Q14_VERSION_GUARD.ps1'
if (-not (Test-Path -LiteralPath $guard)) {
    throw 'Q14 version guard is not implemented'
}

$positiveText = (& $guard 2>$null | Out-String)
$positiveExit = $LASTEXITCODE
if ($positiveExit -ne 0) {
    throw "Expected the qualified runtime tuple to pass, exit=$positiveExit output=$positiveText"
}
$positive = $positiveText | ConvertFrom-Json
if ($positive.result -ne 'MATCH' -or -not $positive.designed_for_pre_material_execution -or -not $positive.material_action_allowed) {
    throw "Qualified tuple did not produce a blocking-capable MATCH: $positiveText"
}
if ($positive.checks.field -notcontains 'chrome_running' -or $positive.checks.field -notcontains 'uivision_registered_version') {
    throw "Guard did not bind its checks to the running Chrome process and registered UI.Vision path: $positiveText"
}

$mismatchText = (& $guard -ExpectedChrome '0.0.0.0' 2>$null | Out-String)
$mismatchExit = $LASTEXITCODE
if ($mismatchExit -eq 0) {
    throw "Intentional Chrome mismatch silently passed: $mismatchText"
}
$mismatch = $mismatchText | ConvertFrom-Json
if ($mismatch.result -ne 'MISMATCH' -or $mismatch.mismatches.field -notcontains 'chrome_running' -or $mismatch.mismatches.field -notcontains 'chrome_on_disk') {
    throw "Intentional Chrome mismatch was not identified: $mismatchText"
}
if ($mismatch.material_action_allowed) {
    throw "Intentional Chrome mismatch still allowed material action: $mismatchText"
}

Write-Output 'PASS: actual tuple matched and an intentional Chrome mismatch failed closed'
