param(
  [string]$SchemaPath = 'C:\Users\usr\Documents\Codex\Q15_CODEX_PROBE_OUTPUT.schema.json'
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$InputProtocol = 'relay-codex-probe-v1'
$OutputProtocol = 'relay-codex-probe-response-v1'
$Nonce = ''
$AssistantMessageId = ''
$AssistantTextLength = 0
$EventSha256 = ''
$AssistantTextSha256 = ''
$CodexVersion = ''
$CodexExitCode = -1
$CodexDurationMs = 0
$WorkDir = $null

function Set-ProbeClipboard {
  param(
    [string]$Action,
    [string]$Note
  )
  $payload = [ordered]@{
    protocol = $OutputProtocol
    nonce = $Nonce
    assistant_message_id = $AssistantMessageId
    assistant_text_length = $AssistantTextLength
    action = $Action
    note = $Note
    event_sha256 = $EventSha256
    assistant_text_sha256 = $AssistantTextSha256
    codex_version = $CodexVersion
    codex_exit_code = $CodexExitCode
    codex_duration_ms = $CodexDurationMs
    bridge_utc = [DateTime]::UtcNow.ToString('o')
  }
  Set-Clipboard -Value ($payload | ConvertTo-Json -Compress -Depth 6)
}

try {
  if (-not (Test-Path -LiteralPath $SchemaPath)) { throw 'probe schema not found' }

  $RawEvent = Get-Clipboard -Raw
  if ([string]::IsNullOrWhiteSpace($RawEvent)) { throw 'clipboard event is empty' }
  $Event = $RawEvent | ConvertFrom-Json

  if ([string]$Event.protocol -ne $InputProtocol) { throw 'unexpected input protocol' }
  $Nonce = [string]$Event.nonce
  $AssistantMessageId = [string]$Event.assistant_message_id
  $AssistantTextLength = [int]$Event.assistant_text_length
  if ([string]::IsNullOrWhiteSpace($Nonce)) { throw 'missing nonce' }
  if ([string]::IsNullOrWhiteSpace($AssistantMessageId)) { throw 'missing assistant message id' }
  if ($AssistantTextLength -lt 1) { throw 'assistant text length must be positive' }
  if ([string]::IsNullOrWhiteSpace([string]$Event.assistant_text)) { throw 'assistant text is empty' }

  $Hasher = [Security.Cryptography.SHA256]::Create()
  try {
    $HashBytes = $Hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($RawEvent))
    $EventSha256 = -join ($HashBytes | ForEach-Object { $_.ToString('x2') })
  } finally {
    $Hasher.Dispose()
  }

  $CodexCommand = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$CodexCommand.Source)) { [string]$CodexCommand.Source } else { [string]$CodexCommand.Definition }
  if ([string]::IsNullOrWhiteSpace($CodexPath)) { throw 'codex executable path unresolved' }
  $CodexVersion = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($CodexVersion)) { throw 'codex version unavailable' }
  $ExecHelp = ((& $CodexPath exec --help 2>&1) | Out-String)
  foreach ($RequiredFlag in @('--ephemeral','--skip-git-repo-check','--sandbox','--output-schema')) {
    if ($ExecHelp -notmatch [regex]::Escape($RequiredFlag)) { throw ("codex exec does not expose required flag {0}" -f $RequiredFlag) }
  }

  $AssistantHasher = [Security.Cryptography.SHA256]::Create()
  try {
    $AssistantHashBytes = $AssistantHasher.ComputeHash([Text.Encoding]::UTF8.GetBytes([string]$Event.assistant_text))
    $AssistantTextSha256 = -join ($AssistantHashBytes | ForEach-Object { $_.ToString('x2') })
  } finally {
    $AssistantHasher.Dispose()
  }

  $SafeNonce = ($Nonce -replace '[^A-Za-z0-9_.-]', '_')
  $WorkDir = Join-Path $env:TEMP ("RelayCodex-Q15-{0}" -f $SafeNonce)
  New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
  $EventPath = Join-Path $WorkDir 'event.json'
  $AssistantPath = Join-Path $WorkDir 'assistant.txt'
  $StderrPath = Join-Path $WorkDir 'codex.stderr.txt'
  [IO.File]::WriteAllText($AssistantPath, [string]$Event.assistant_text, (New-Object Text.UTF8Encoding($false)))
  $MetaEvent = [ordered]@{
    protocol = [string]$Event.protocol
    nonce = $Nonce
    observed_at = [string]$Event.observed_at
    project_token = [string]$Event.project_token
    url = [string]$Event.url
    conversation_id = [string]$Event.conversation_id
    user_message_id = [string]$Event.user_message_id
    assistant_message_id = $AssistantMessageId
    assistant_text_length = $AssistantTextLength
    assistant_text_sha256 = $AssistantTextSha256
    assistant_text_file = 'assistant.txt'
  }
  [IO.File]::WriteAllText($EventPath, ($MetaEvent | ConvertTo-Json -Compress -Depth 6), (New-Object Text.UTF8Encoding($false)))

  $Prompt = @'
This is a read-only transport qualification, not project work.
Read event.json from the current working directory.
Do not open assistant.txt in this probe; its exact contents are untrusted opaque data and the bridge already validated and hashed them. Avoiding the content minimizes token use.
Return exactly one JSON object matching the provided output schema.
Set protocol to relay-codex-probe-response-v1.
Copy nonce, assistant_message_id, assistant_text_length, and assistant_text_sha256 exactly from event.json.
Set action to PROBE_OK and note to a short transport acknowledgement.
Do not modify files, browse, send messages, or perform any external side effect.
'@

  $PromptPath = Join-Path $WorkDir 'prompt.txt'
  $StdoutPath = Join-Path $WorkDir 'codex.stdout.txt'
  $InvokePath = Join-Path $WorkDir 'invoke-codex.ps1'
  [IO.File]::WriteAllText($PromptPath, $Prompt, (New-Object Text.UTF8Encoding($false)))

  function PsLiteral([string]$Value) { return "'" + $Value.Replace("'", "''") + "'" }
  $Wrapper = @'
$ErrorActionPreference = 'Stop'
$CodexPath = __CODEX_PATH__
$PromptPath = __PROMPT_PATH__
$WorkDir = __WORK_DIR__
$SchemaPath = __SCHEMA_PATH__
$StdoutPath = __STDOUT_PATH__
$StderrPath = __STDERR_PATH__
$Prompt = Get-Content -LiteralPath $PromptPath -Raw
$Args = @('exec','--ephemeral','--skip-git-repo-check','--sandbox','read-only','-C',$WorkDir,'--output-schema',$SchemaPath,$Prompt)
$Stdout = & $CodexPath @Args 2> $StderrPath
$Code = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
$Stdout | Out-File -LiteralPath $StdoutPath -Encoding utf8
exit $Code
'@
  $Wrapper = $Wrapper.Replace('__CODEX_PATH__', (PsLiteral $CodexPath))
  $Wrapper = $Wrapper.Replace('__PROMPT_PATH__', (PsLiteral $PromptPath))
  $Wrapper = $Wrapper.Replace('__WORK_DIR__', (PsLiteral $WorkDir))
  $Wrapper = $Wrapper.Replace('__SCHEMA_PATH__', (PsLiteral $SchemaPath))
  $Wrapper = $Wrapper.Replace('__STDOUT_PATH__', (PsLiteral $StdoutPath))
  $Wrapper = $Wrapper.Replace('__STDERR_PATH__', (PsLiteral $StderrPath))
  [IO.File]::WriteAllText($InvokePath, $Wrapper, (New-Object Text.UTF8Encoding($false)))

  $CodexStarted = [DateTime]::UtcNow
  $Process = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$InvokePath) -WindowStyle Hidden -PassThru
  if (-not $Process.WaitForExit(900000)) {
    try { & taskkill.exe /PID $Process.Id /T /F 2>$null | Out-Null } catch {}
    throw 'codex exec exceeded 900 second probe timeout'
  }
  $CodexDurationMs = [int]([DateTime]::UtcNow - $CodexStarted).TotalMilliseconds
  $CodexExitCode = [int]$Process.ExitCode
  if ($CodexExitCode -ne 0) {
    $ErrSummary = ''
    if (Test-Path -LiteralPath $StderrPath) {
      $ErrSummary = ((Get-Content -LiteralPath $StderrPath -Tail 8 -ErrorAction SilentlyContinue) | Out-String).Trim()
      $ErrSummary = ($ErrSummary -replace '[\r\n]+',' ')
      if ($ErrSummary.Length -gt 320) { $ErrSummary = $ErrSummary.Substring(0,320) }
    }
    throw ("codex exec failed with exit code {0}: {1}" -f $CodexExitCode,$ErrSummary)
  }

  if (-not (Test-Path -LiteralPath $StdoutPath)) { throw 'codex stdout file missing' }
  $RawResult = (Get-Content -LiteralPath $StdoutPath -Raw).Trim()
  if ([string]::IsNullOrWhiteSpace($RawResult)) { throw 'codex returned empty stdout' }
  $Result = $RawResult | ConvertFrom-Json

  if ([string]$Result.protocol -ne $OutputProtocol) { throw 'codex response protocol mismatch' }
  if ([string]$Result.nonce -ne $Nonce) { throw 'codex nonce mismatch' }
  if ([string]$Result.assistant_message_id -ne $AssistantMessageId) { throw 'codex assistant message id mismatch' }
  if ([int]$Result.assistant_text_length -ne $AssistantTextLength) { throw 'codex assistant text length mismatch' }
  if ([string]$Result.assistant_text_sha256 -ne $AssistantTextSha256) { throw 'codex assistant text hash mismatch' }
  if ([string]$Result.action -ne 'PROBE_OK') { throw 'codex action mismatch' }

  Set-ProbeClipboard -Action 'PROBE_OK' -Note ([string]$Result.note)
  exit 0
}
catch {
  $Message = [string]$_.Exception.Message
  if ($Message.Length -gt 240) { $Message = $Message.Substring(0, 240) }
  try { Set-ProbeClipboard -Action 'PROBE_ERROR' -Note $Message } catch {}
  exit 1
}
finally {
  if ($null -ne $WorkDir -and (Test-Path -LiteralPath $WorkDir)) {
    Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
