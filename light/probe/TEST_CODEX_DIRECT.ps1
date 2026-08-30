Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$WorkDir = $null
$Protocol = 'relay-light-direct-v1'
$Nonce = 'DIRECT_' + [Guid]::NewGuid().ToString('N')

function PsLiteral([string]$Value) { return "'" + $Value.Replace("'", "''") + "'" }
function Is-CreditFailure([string]$Text) {
  return $Text -match '(?i)workspace is out of credits|out of credits|usage limit reached|reached your usage limit|add credits to continue|increase your limits to continue'
}

try {
  $CodexCommand = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$CodexCommand.Source)) { [string]$CodexCommand.Source } else { [string]$CodexCommand.Definition }
  if ([string]::IsNullOrWhiteSpace($CodexPath)) { throw 'codex command path unresolved' }
  $CodexVersion = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($CodexVersion)) { throw 'codex version unavailable' }

  $ExecHelp = ((& $CodexPath exec --help 2>&1) | Out-String)
  foreach ($RequiredFlag in @('--ephemeral','--skip-git-repo-check','--sandbox','--output-schema')) {
    if ($ExecHelp -notmatch [regex]::Escape($RequiredFlag)) { throw ("codex exec missing required flag {0}" -f $RequiredFlag) }
  }

  $WorkDir = Join-Path $env:TEMP ("RelayLightDirect-{0}" -f $Nonce)
  New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null
  $SchemaPath = Join-Path $WorkDir 'schema.json'
  $PromptPath = Join-Path $WorkDir 'prompt.txt'
  $StdoutPath = Join-Path $WorkDir 'codex.stdout.txt'
  $StderrPath = Join-Path $WorkDir 'codex.stderr.txt'
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
This is a minimal read-only Codex availability test for ChatGPT Relay Light. It is not project work.
Return exactly one JSON object matching the provided output schema.
Set protocol to $Protocol.
Set nonce to $Nonce.
Set status to CODEX_DIRECT_PASS.
Do not read project files, modify files, browse, send messages, or perform any side effect.
"@
  [IO.File]::WriteAllText($PromptPath, $Prompt, (New-Object Text.UTF8Encoding($false)))

  $Wrapper = @'
$ErrorActionPreference = 'Stop'
$CodexPath = __CODEX__
$WorkDir = __WORKDIR__
$SchemaPath = __SCHEMA__
$PromptPath = __PROMPT__
$StdoutPath = __STDOUT__
$StderrPath = __STDERR__
$Prompt = Get-Content -LiteralPath $PromptPath -Raw
$Args = @('exec','--ephemeral','--skip-git-repo-check','--sandbox','read-only','-C',$WorkDir,'--output-schema',$SchemaPath,$Prompt)
$Output = & $CodexPath @Args 2> $StderrPath
$Code = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
$Output | Out-File -LiteralPath $StdoutPath -Encoding utf8
exit $Code
'@
  $Wrapper = $Wrapper.Replace('__CODEX__', (PsLiteral $CodexPath))
  $Wrapper = $Wrapper.Replace('__WORKDIR__', (PsLiteral $WorkDir))
  $Wrapper = $Wrapper.Replace('__SCHEMA__', (PsLiteral $SchemaPath))
  $Wrapper = $Wrapper.Replace('__PROMPT__', (PsLiteral $PromptPath))
  $Wrapper = $Wrapper.Replace('__STDOUT__', (PsLiteral $StdoutPath))
  $Wrapper = $Wrapper.Replace('__STDERR__', (PsLiteral $StderrPath))
  [IO.File]::WriteAllText($InvokePath, $Wrapper, (New-Object Text.UTF8Encoding($false)))

  $Process = Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$InvokePath) -WindowStyle Hidden -PassThru
  if (-not $Process.WaitForExit(120000)) {
    try { & taskkill.exe /PID $Process.Id /T /F 2>$null | Out-Null } catch {}
    throw 'codex direct test exceeded 120 seconds'
  }

  $ExitCode = [int]$Process.ExitCode
  $Err = if (Test-Path -LiteralPath $StderrPath) { ((Get-Content -LiteralPath $StderrPath -Raw -ErrorAction SilentlyContinue) | Out-String).Trim() } else { '' }
  if ($ExitCode -ne 0) {
    if (Is-CreditFailure $Err) {
      Write-Host 'CODEX_CREDITS_REQUIRED'
      exit 3
    }
    if ($Err.Length -gt 400) { $Err = $Err.Substring(0,400) }
    throw ("codex exec failed with exit code {0}: {1}" -f $ExitCode,($Err -replace '[\r\n]+',' '))
  }

  if (-not (Test-Path -LiteralPath $StdoutPath)) { throw 'codex stdout missing' }
  $Raw = (Get-Content -LiteralPath $StdoutPath -Raw).Trim()
  if ([string]::IsNullOrWhiteSpace($Raw)) { throw 'codex stdout empty' }
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
