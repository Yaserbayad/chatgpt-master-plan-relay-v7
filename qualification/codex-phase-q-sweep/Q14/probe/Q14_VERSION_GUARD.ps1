param(
    [string]$ExpectedWindowsBuild = '26100.9168',
    [string]$ExpectedChrome = '152.0.7977.65',
    [string]$ExpectedUiVision = '10.0.178',
    [string]$ExpectedDesktopAutomation = '2.0.12',
    [string]$ExpectedChromeProfileDirectory = 'Default'
)

$ErrorActionPreference = 'Stop'

$currentVersion = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
$windowsBuild = '{0}.{1}' -f $currentVersion.CurrentBuildNumber, $currentVersion.UBR

$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$chromeVersion = if (Test-Path -LiteralPath $chromePath) {
    (Get-Item -LiteralPath $chromePath).VersionInfo.ProductVersion
} else {
    ''
}
$runningChromeVersions = @(Get-Process -Name chrome -ErrorAction SilentlyContinue | ForEach-Object {
    try { $_.MainModule.FileVersionInfo.ProductVersion } catch { }
} | Where-Object { $_ } | Sort-Object -Unique)
$runningChromeVersion = if ($runningChromeVersions.Count -eq 1) {
    $runningChromeVersions[0]
} else {
    $runningChromeVersions -join ','
}

$chromeUserDataRoot = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
$chromeLocalStatePath = Join-Path $chromeUserDataRoot 'Local State'
$profileDirectory = if (Test-Path -LiteralPath $chromeLocalStatePath) {
    (Get-Content -LiteralPath $chromeLocalStatePath -Raw | ConvertFrom-Json).profile.last_used
} else {
    ''
}
$uiVisionExtensionId = 'gcbalfbdmfieckjlnblleoemohcganoc'
$securePreferencesPath = Join-Path $chromeUserDataRoot "$profileDirectory\Secure Preferences"
$extensionEntry = $null
if (Test-Path -LiteralPath $securePreferencesPath) {
    $securePreferences = Get-Content -LiteralPath $securePreferencesPath -Raw | ConvertFrom-Json
    $extensionProperty = $securePreferences.extensions.settings.PSObject.Properties[$uiVisionExtensionId]
    if ($extensionProperty) { $extensionEntry = $extensionProperty.Value }
}
$registeredExtensionPath = if ($extensionEntry -and $extensionEntry.path) { [string]$extensionEntry.path } else { '' }
$uiVisionManifestPath = if ($registeredExtensionPath) {
    Join-Path (Join-Path $chromeUserDataRoot "$profileDirectory\Extensions") (Join-Path $registeredExtensionPath 'manifest.json')
} else {
    ''
}
$uiVisionVersion = if ($uiVisionManifestPath -and (Test-Path -LiteralPath $uiVisionManifestPath)) {
    (Get-Content -LiteralPath $uiVisionManifestPath -Raw | ConvertFrom-Json).version
} else {
    ''
}
$uiVisionDisableReasonCount = if ($extensionEntry) { @($extensionEntry.disable_reasons).Count } else { -1 }

$desktopAutomationPath = Join-Path $env:LOCALAPPDATA 'UI.Vision\DesktopAutomation\uivision-desktop-automation.exe'
$desktopAutomationVersion = if (Test-Path -LiteralPath $desktopAutomationPath) {
    (Get-Item -LiteralPath $desktopAutomationPath).VersionInfo.ProductVersion
} else {
    ''
}

$checks = @(
    [ordered]@{ field = 'windows_build'; expected = $ExpectedWindowsBuild; actual = $windowsBuild },
    [ordered]@{ field = 'chrome_running'; expected = $ExpectedChrome; actual = $runningChromeVersion },
    [ordered]@{ field = 'chrome_on_disk'; expected = $ExpectedChrome; actual = $chromeVersion },
    [ordered]@{ field = 'uivision_registered_version'; expected = $ExpectedUiVision; actual = $uiVisionVersion },
    [ordered]@{ field = 'uivision_disable_reason_count'; expected = '0'; actual = [string]$uiVisionDisableReasonCount },
    [ordered]@{ field = 'desktop_automation'; expected = $ExpectedDesktopAutomation; actual = $desktopAutomationVersion },
    [ordered]@{ field = 'chrome_profile_directory'; expected = $ExpectedChromeProfileDirectory; actual = $profileDirectory }
)
$mismatches = @($checks | Where-Object { $_.expected -ne $_.actual })

$result = [ordered]@{
    schema_version = 'q14-version-guard-1'
    timestamp_utc = [DateTime]::UtcNow.ToString('o')
    result = if ($mismatches.Count -eq 0) { 'MATCH' } else { 'MISMATCH' }
    designed_for_pre_material_execution = $true
    material_action_allowed = $mismatches.Count -eq 0
    enforcement = 'nonzero process exit on any missing or mismatched field'
    checks = $checks
    mismatches = $mismatches
    evidence_paths = [ordered]@{
        chrome = $chromePath
        chrome_local_state = $chromeLocalStatePath
        chrome_secure_preferences = $securePreferencesPath
        uivision_registered_manifest = $uiVisionManifestPath
        desktop_automation = $desktopAutomationPath
    }
    limitations = @(
        'Qualification-only external preflight; it is not a production browser supervisor.',
        'Running Chrome is read from process module metadata; the target tab-to-process association is not independently exposed.',
        'The Chrome profile directory is read from Local State profile.last_used and the UI.Vision path from that profile''s Secure Preferences registration; the friendly profile name friendsenc remains user-reported.',
        'An empty disable_reasons list is checked, but the guard was not demonstrated gating a UI.Vision macro because the permitted actuator surface is unavailable.',
        'RealUser V2026 is not exposed by these file/version boundaries and remains user-reported.',
        'The separately installed legacy XModules 3.2.3 package is inventoried outside this guard because the frozen v2 Desktop Automation dependency is 2.0.12.'
    )
}

$result | ConvertTo-Json -Depth 8
if ($mismatches.Count -ne 0) {
    exit 1
}
exit 0
