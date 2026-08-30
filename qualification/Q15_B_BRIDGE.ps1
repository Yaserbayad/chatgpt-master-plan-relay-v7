# Codex non-interactive sources: https://developers.openai.com/codex/noninteractive/ and https://developers.openai.com/codex/cli/reference/
$ErrorActionPreference = 'Stop'

$Store = 'C:\Users\usr\Desktop\uivision'
$DataDir = Join-Path $Store 'datasources'
$EventPath = Join-Path $DataDir 'Q15_B_event.txt'
$ResultPath = Join-Path $DataDir 'Q15_B_result.txt'
$SchemaPath = Join-Path $Store 'Q15_B_SCHEMA.json'
$TempRoot = Join-Path $env:TEMP ('Q15B_' + [Guid]::NewGuid().ToString('N'))

$event = $null
$codexVersion = ''
$exitCode = 1
$promptPath = $null
$rawResultPath = $null
$cmdPath = $null

function Write-SafeResult($Data) {
    if (-not (Test-Path -LiteralPath $DataDir)) {
        New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
    }
    $json = $Data | ConvertTo-Json -Compress -Depth 5
    [System.IO.File]::WriteAllText($ResultPath, $json, (New-Object System.Text.UTF8Encoding($false)))
}

function Get-Sha256([string]$Text) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

try {
    if (-not (Test-Path -LiteralPath $EventPath)) { throw 'EVENT_MISSING' }
    if (-not (Test-Path -LiteralPath $SchemaPath)) { throw 'SCHEMA_MISSING' }

    $event = Get-Content -Raw -LiteralPath $EventPath | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace([string]$event.nonce)) { throw 'NONCE_MISSING' }
    if ([string]::IsNullOrWhiteSpace([string]$event.assistant_message_id)) { throw 'ASSISTANT_ID_MISSING' }
    if ([string]::IsNullOrWhiteSpace([string]$event.assistant_text)) { throw 'ASSISTANT_TEXT_MISSING' }

    $assistantText = [string]$event.assistant_text
    $assistantHash = Get-Sha256 $assistantText
    $assistantLength = $assistantText.Length

    $codexCommand = Get-Command codex.cmd,codex.exe,codex -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $codexCommand) { throw 'CODEX_NOT_FOUND' }
    $codexPath = $codexCommand.Source
    try {
        $codexVersion = (& $codexPath --version 2>$null | Select-Object -First 1).ToString().Trim()
    }
    catch {
        $codexVersion = 'unknown'
    }

    New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null
    $promptPath = Join-Path $TempRoot 'prompt.txt'
    $rawResultPath = Join-Path $TempRoot 'result.json'
    $cmdPath = Join-Path $TempRoot 'run_codex.cmd'

    $codexEvent = [ordered]@{
        nonce = [string]$event.nonce
        assistant_message_id = [string]$event.assistant_message_id
        assistant_text_sha256 = $assistantHash
        assistant_text = $assistantText
    }
    $eventJson = $codexEvent | ConvertTo-Json -Compress -Depth 5
    $prompt = @"
You are the read-only endpoint in an IPC qualification probe.
Return only the JSON object required by the supplied output schema.
Copy EVENT.nonce exactly to nonce.
Copy EVENT.assistant_message_id exactly to assistant_message_id.
Copy EVENT.assistant_text_sha256 exactly to assistant_text_sha256.
Set action exactly to PROBE_OK.
Do not modify files, do not use browser actions, and do not add commentary.
EVENT=$eventJson
"@
    [System.IO.File]::WriteAllText($promptPath, $prompt, (New-Object System.Text.UTF8Encoding($false)))

    $cmd = @"
@echo off
"$codexPath" exec --ephemeral --sandbox read-only --skip-git-repo-check --ignore-user-config --cd "$TempRoot" --output-schema "$SchemaPath" -o "$rawResultPath" - < "$promptPath"
exit /b %ERRORLEVEL%
"@
    $cmd | Set-Content -LiteralPath $cmdPath -Encoding ASCII

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $env:ComSpec
    $psi.Arguments = '/d /c "' + $cmdPath + '"'
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    [void]$proc.Start()
    $stdoutTask = $proc.StandardOutput.ReadToEndAsync()
    $stderrTask = $proc.StandardError.ReadToEndAsync()

    if (-not $proc.WaitForExit(180000)) {
        try { $proc.Kill() } catch {}
        throw 'CODEX_TIMEOUT'
    }
    $stdout = $stdoutTask.Result
    $stderr = $stderrTask.Result
    $codexExit = $proc.ExitCode
    if ($codexExit -ne 0) { throw ('CODEX_EXIT_' + $codexExit) }
    if (-not (Test-Path -LiteralPath $rawResultPath)) { throw 'CODEX_RESULT_MISSING' }

    $rawResult = Get-Content -Raw -LiteralPath $rawResultPath | ConvertFrom-Json
    if ([string]$rawResult.nonce -ne [string]$event.nonce) { throw 'CODEX_NONCE_MISMATCH' }
    if ([string]$rawResult.assistant_message_id -ne [string]$event.assistant_message_id) { throw 'CODEX_ASSISTANT_ID_MISMATCH' }
    if ([string]$rawResult.assistant_text_sha256 -ne $assistantHash) { throw 'CODEX_HASH_MISMATCH' }
    if ([string]$rawResult.action -ne 'PROBE_OK') { throw 'CODEX_ACTION_MISMATCH' }

    Write-SafeResult ([ordered]@{
        schema_version = 'q15b-result-1'
        status = 'PASS'
        nonce = [string]$event.nonce
        assistant_message_id = [string]$event.assistant_message_id
        assistant_text_length = $assistantLength
        assistant_text_sha256 = $assistantHash
        action = 'PROBE_OK'
        codex_invocation_success = $true
        codex_version = $codexVersion
        bridge_utc = [DateTime]::UtcNow.ToString('o')
    })
    $exitCode = 0
}
catch {
    $safeCode = [string]$_.Exception.Message
    if ($safeCode.Length -gt 160) { $safeCode = $safeCode.Substring(0,160) }
    $nonce = ''
    $assistantId = ''
    if ($null -ne $event) {
        $nonce = [string]$event.nonce
        $assistantId = [string]$event.assistant_message_id
    }
    Write-SafeResult ([ordered]@{
        schema_version = 'q15b-result-1'
        status = 'FAIL'
        nonce = $nonce
        assistant_message_id = $assistantId
        action = ''
        codex_invocation_success = $false
        codex_version = $codexVersion
        error_code = $safeCode
        bridge_utc = [DateTime]::UtcNow.ToString('o')
    })
    $exitCode = 1
}
finally {
    if (Test-Path -LiteralPath $EventPath) { Remove-Item -LiteralPath $EventPath -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $TempRoot) { Remove-Item -LiteralPath $TempRoot -Recurse -Force -ErrorAction SilentlyContinue }
}
exit $exitCode
