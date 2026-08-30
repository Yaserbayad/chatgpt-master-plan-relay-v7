Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$WorkDir = $null
$Protocol = 'relay-light-direct-v1'
$Nonce = 'DIRECT_' + [Guid]::NewGuid().ToString('N')
$DiagnosticPath = $null

function PsLiteral([string]$Value) { return "'" + $Value.Replace("'", "''") + "'" }
function Is-CreditFailure([string]$Text) {
  return $Text -match '(?i)workspace is out of credits|out of credits|usage limit reached|reached your usage limit|add credits to continue|increase your limits to continue'
}
function Read-Text([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return '' }
  return ((Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue) | Out-String).Trim()
}
function Write-Diagnostic([string]$Version, [int]$ExitCode, [string]$ResultText) {
  $Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
  $Base = Split-Path -Parent $MyInvocation.ScriptName
  if ([string]::IsNullOrWhiteSpace($Base)) { $Base = (Get-Location).Path }
  $Path = Join-Path $Base ("CODEX_DIRECT_DIAGNOSTIC_{0}.txt" -f $Stamp)
  $Body = @(
    "utc=$([DateTime]::UtcNow.ToString('o'))",
    "codex_version=$Version",
    "exit_code=$ExitCode",
    'launch=console-backed child PowerShell; no hidden window; Codex stdout/stderr inherited by that console',
    'flags=exec --ephemeral --skip-git-repo-check --ignore-user-config --sandbox read-only -C <temp> -c model_reasoning_effort="low" --output-schema <schema> --output-last-message <result> - [prompt via stdin]',
    '--- last-message-file ---',
    $ResultText
  ) -join "`r`n"
  [IO.File]::WriteAllText($Path, $Body, (New-Object Text.UTF8Encoding($false)))
  return $Path
}

try {
  $CodexCommand = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$CodexCommand.Source)) { [string]$CodexCommand.Source } else { [string]$CodexCommand.Definition }
  if ([string]::IsNullOrWhiteSpace($CodexPath)) { throw 'codex command path unresolved' }
  $CodexVersion = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($CodexVersion)) { throw 'codex version unavailable' }
  Write-Host ("Codex CLI: {0}" -f $CodexVersion)

  $ExecHelp = ((& $CodexPath exec --help 2>&1) | Out-String)
  foreach ($RequiredFlag in @('--ephemeral','--skip-git-repo-check','--ignore-user-config','--sandbox','--output-schema','--output-last-message')) {
    if ($ExecHelp -notmatch [regex]::Escape($RequiredFlag)) { throw ("codex exec missing required flag {0}" -f $RequiredFlag) }
  }

  $WorkDir = Join-Path $env:TEMP ("RelayLightDirect-{0}" -f $Nonce)
  New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
  $SchemaPath = Join-Path $WorkDir 'schema.json'
  $PromptPath = Join-Path $WorkDir 'prompt.txt'
  $ResultPath = Join-Path $WorkDir 'codex.last.json'
  $InvokePath = Join-Path $WorkDir 'invoke-codex.ps1'

  $Schema = [ordered]@{
    type = 'object'
    properties = [ordered]@{
      protocol = @{ type = 'string'; enum = @($Protocol) }
      nonce = @{ type = 'string'; minLength = 1; maxLength = 128 }
      status = @{ type = 'string'; enum = @('CODEX_DIRECT_PASS') }
    }
    required = @('protocol','nonce','status')
    additionalProperties = $false
  }
  [IO.File]::WriteAllText($SchemaPath, ($Schema | ConvertTo-Json -Depth 8), (New-Object Text.UTF8Encoding($false)))

  $Prompt = @"
This is a minimal no-tool Codex availability test for ChatGPT Relay Light. It is not project work.
Return exactly one JSON object matching the provided output schema.
Set protocol to $Protocol.
Set nonce to $Nonce.
Set status to CODEX_DIRECT_PASS.
Do not use tools, read files, modify files, browse, send messages, or perform any side effect.
"@
  [IO.File]::WriteAllText($PromptPath, $Prompt, (New-Object Text.UTF8Encoding($false)))

  $Wrapper = @'
$ErrorActionPreference = 'Stop'
$CodexPath = __CODEX__
$WorkDir = __WORKDIR__
$SchemaPath = __SCHEMA__
$PromptPath = __PROMPT__
$ResultPath = __RESULT__
$Prompt = Get-Content -LiteralPath $PromptPath -Raw
$Args = @('exec','--ephemeral','--skip-git-repo-check','--ignore-user-config','--sandbox','read-only','-C',$WorkDir,'-c','model_reasoning_effort="low"','--output-schema',$SchemaPath,'--output-last-message',$ResultPath,'-')
$Prompt | & $CodexPath @Args
$Code = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
exit $Code
'@
  $Wrapper = $Wrapper.Replace('__CODEX__', (PsLiteral $CodexPath))
  $Wrapper = $Wrapper.Replace('__WORKDIR__', (PsLiteral $WorkDir))
  $Wrapper = $Wrapper.Replace('__SCHEMA__', (PsLiteral $SchemaPath))
  $Wrapper = $Wrapper.Replace('__PROMPT__', (PsLiteral $PromptPath))
  $Wrapper = $Wrapper.Replace('__RESULT__', (PsLiteral $ResultPath))
  [IO.File]::WriteAllText($InvokePath, $Wrapper, (New-Object Text.UTF8Encoding($false)))

  Write-Host 'Launching one console-backed Codex preflight window; no interaction is required.'
  $Process = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$InvokePath) -PassThru
  if (-not $Process.WaitForExit(120000)) {
    try { & taskkill.exe /PID $Process.Id /T /F 2>$null | Out-Null } catch {}
    throw 'codex direct test exceeded 120 seconds'
  }

  $ExitCode = [int]$Process.ExitCode
  $Raw = Read-Text $ResultPath
  if ($ExitCode -ne 0) {
    $DiagnosticPath = Write-Diagnostic -Version $CodexVersion -ExitCode $ExitCode -ResultText $Raw
    if (Is-CreditFailure $Raw) {
      Write-Host 'CODEX_CREDITS_REQUIRED'
      Write-Host ("Diagnostic: {0}" -f $DiagnosticPath)
      exit 3
    }
    throw ("codex exec failed with exit code {0}; diagnostic={1}" -f $ExitCode,$DiagnosticPath)
  }

  if ([string]::IsNullOrWhiteSpace($Raw)) { throw 'codex last-message file missing or empty' }
  $Result = $Raw | ConvertFrom-Json
  if ([string]$Result.protocol -ne $Protocol) { throw 'direct test protocol mismatch' }
  if ([string]$Result.nonce -ne $Nonce) { throw 'direct test nonce mismatch' }
  if ([string]$Result.status -ne 'CODEX_DIRECT_PASS') { throw 'direct test status mismatch' }

  Write-Host ("CODEX_DIRECT_PASS ({0})" -f $CodexVersion)
  exit 0
}
catch {
  $Message = [string]$_.Exception.Message
  if (Is-CreditFailure $Message) {
    Write-Host 'CODEX_CREDITS_REQUIRED'
    if ($null -ne $DiagnosticPath) { Write-Host ("Diagnostic: {0}" -f $DiagnosticPath) }
    exit 3
  }
  Write-Host ("CODEX_DIRECT_FAIL: {0}" -f $Message)
  exit 1
}
finally {
  if ($null -ne $WorkDir -and (Test-Path -LiteralPath $WorkDir)) {
    Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
