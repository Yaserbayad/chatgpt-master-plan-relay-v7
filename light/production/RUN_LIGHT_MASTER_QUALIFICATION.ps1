Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$Launcher = 'C:\Users\usr\Documents\Codex\ui.vision.html'
$MacroDir = 'C:\Users\usr\Desktop\uivision\macros'
$LightDir = 'C:\Users\usr\Documents\CodexLight'
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Desktop = Join-Path $env:USERPROFILE 'Desktop'
$HarnessSource = $MyInvocation.MyCommand.Path
$SourceDir = Split-Path -Parent $HarnessSource
$WatcherSource = Join-Path $SourceDir 'LIGHT_PRODUCTION_WATCHER.js'
$BridgeSource = Join-Path $SourceDir 'RelayCodexLightProduction.ps1'
$SchemaSource = Join-Path $SourceDir 'LIGHT_PRODUCTION_ACTION.schema.json'
$ContractSource = Join-Path $SourceDir 'MASTER_QUALIFICATION_CONTRACT.md'
$SourceBinding = Join-Path $SourceDir 'SOURCE.txt'
$MacroName = 'LIGHT_PRODUCTION_WATCHER.js'
$MacroTarget = Join-Path $MacroDir $MacroName
$BridgeTarget = Join-Path $LightDir 'RelayCodexLightProduction.ps1'
$SchemaTarget = Join-Path $LightDir 'LIGHT_PRODUCTION_ACTION.schema.json'
$ConfigTarget = Join-Path $LightDir 'production_config.json'
$ExpectedCodexVersion = 'codex-cli 0.151.0'
$RunStarted = Get-Date
$RunStamp = $RunStarted.ToString('yyyyMMdd_HHmmss')
$EvidenceDir = Join-Path $Desktop ("LIGHT_MASTER_QUALIFICATION_evidence_${RunStamp}")
$SummaryPath = Join-Path $EvidenceDir 'MASTER_SUMMARY.csv'
$EnvironmentPath = Join-Path $EvidenceDir 'ENVIRONMENT.txt'
$Status = 'FAIL'
$Reason = ''
$Summary = @()
$ConversationId = ''
$PreviousNewUserId = ''
$PreviousNextAssistantId = ''
$CodexVersionObserved = ''
$SeenNonces = @{}

function Get-Sha256Hex([string]$Text) {
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $bytes = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text))
    return (-join ($bytes | ForEach-Object { $_.ToString('x2') }))
  } finally { $sha.Dispose() }
}
function Require([bool]$Condition,[string]$Message) { if (-not $Condition) { throw $Message } }
function Equal([string]$Actual,[string]$Expected,[string]$Message) { if ($Actual -ne $Expected) { throw ("{0}: expected [{1}], got [{2}]" -f $Message,$Expected,$Actual) } }
function Save-Summary { if ($Summary.Count -gt 0) { $Summary | Export-Csv -LiteralPath $SummaryPath -NoTypeInformation -Encoding UTF8 } }
function Write-Config($Cycle) {
  $Config = [ordered]@{
    qualification_mode = [bool]$Cycle.qualification_mode
    master_qualification_mode = $true
    target_prompt = if ($Cycle.qualification_mode) { [string]$Cycle.expected_prompt } else { '' }
    expected_conversation_id = $ConversationId
    expected_user_message_id = $PreviousNewUserId
    expected_assistant_message_id = $PreviousNextAssistantId
    expected_assistant_text_sha256 = [string]$Cycle.expected_source_assistant_sha256
    expected_action = [string]$Cycle.expected_action
    expected_prompt_sha256 = [string]$Cycle.expected_prompt_sha256
  }
  [IO.File]::WriteAllText($ConfigTarget,($Config | ConvertTo-Json -Compress),(New-Object Text.UTF8Encoding($false)))
}
function New-EvidenceZip([string]$Result,[string]$Failure) {
  foreach ($p in @($WatcherSource,$BridgeSource,$SchemaSource,$HarnessSource,$ContractSource,$SourceBinding)) {
    if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $EvidenceDir -Force }
  }
  ("LIGHT_MASTER_QUALIFICATION={0}`r`nREASON={1}`r`nCYCLES_EXECUTED={2}`r`nCYCLES_REQUIRED=7" -f $Result,$Failure,$Summary.Count) | Set-Content -LiteralPath (Join-Path $EvidenceDir 'RESULT.txt') -Encoding UTF8
  Save-Summary
  Get-ChildItem -LiteralPath $EvidenceDir -File | Where-Object { $_.Name -ne 'SHA256.txt' } | Sort-Object Name | ForEach-Object {
    $h = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
    "{0}  {1}" -f $h.Hash.ToLowerInvariant(),$_.Name
  } | Set-Content -LiteralPath (Join-Path $EvidenceDir 'SHA256.txt') -Encoding ASCII
  $Zip = "${EvidenceDir}.zip"
  Compress-Archive -Path (Join-Path $EvidenceDir '*') -DestinationPath $Zip -Force
  return $Zip
}

$SeedPrompt = @(
  'This is a bounded relay reliability handshake. Follow these rules exactly and do not add any other text.',
  'Reply now exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_01 and nothing else.',
  'If the next user message is exactly LIGHT_SOAK_01, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_02 and nothing else.',
  'If the next user message is exactly LIGHT_SOAK_02, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_03 and nothing else.',
  'If the next user message is exactly LIGHT_SOAK_03, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_04 and nothing else.',
  'If the next user message is exactly LIGHT_SOAK_04, reply exactly: NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_05 and nothing else.',
  'If the next user message is exactly LIGHT_SOAK_05, reply exactly: OBJECTIVE COMPLETE. No further same-chat message is useful. Stop.'
) -join "`n"
$Step1 = 'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_01 and nothing else.'
$Step2 = 'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_02 and nothing else.'
$Step3 = 'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_03 and nothing else.'
$Step4 = 'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_04 and nothing else.'
$Step5 = 'NEXT ACTION REQUIRED: Send exactly LIGHT_SOAK_05 and nothing else.'
$Complete = 'OBJECTIVE COMPLETE. No further same-chat message is useful. Stop.'

$Cycles = @(
  [pscustomobject]@{ index=0; label='SEED'; qualification_mode=$true; expected_source_assistant_sha256=''; expected_action='SEND_PROMPT'; expected_prompt=$SeedPrompt; expected_prompt_sha256=(Get-Sha256Hex $SeedPrompt); material_send=$true },
  [pscustomobject]@{ index=1; label='SOAK_01'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Step1); expected_action='SEND_PROMPT'; expected_prompt='LIGHT_SOAK_01'; expected_prompt_sha256=(Get-Sha256Hex 'LIGHT_SOAK_01'); material_send=$true },
  [pscustomobject]@{ index=2; label='SOAK_02'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Step2); expected_action='SEND_PROMPT'; expected_prompt='LIGHT_SOAK_02'; expected_prompt_sha256=(Get-Sha256Hex 'LIGHT_SOAK_02'); material_send=$true },
  [pscustomobject]@{ index=3; label='SOAK_03'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Step3); expected_action='SEND_PROMPT'; expected_prompt='LIGHT_SOAK_03'; expected_prompt_sha256=(Get-Sha256Hex 'LIGHT_SOAK_03'); material_send=$true },
  [pscustomobject]@{ index=4; label='SOAK_04'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Step4); expected_action='SEND_PROMPT'; expected_prompt='LIGHT_SOAK_04'; expected_prompt_sha256=(Get-Sha256Hex 'LIGHT_SOAK_04'); material_send=$true },
  [pscustomobject]@{ index=5; label='SOAK_05'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Step5); expected_action='SEND_PROMPT'; expected_prompt='LIGHT_SOAK_05'; expected_prompt_sha256=(Get-Sha256Hex 'LIGHT_SOAK_05'); material_send=$true },
  [pscustomobject]@{ index=6; label='TERMINAL_STOP'; qualification_mode=$false; expected_source_assistant_sha256=(Get-Sha256Hex $Complete); expected_action='STOP'; expected_prompt=''; expected_prompt_sha256=''; material_send=$false }
)

try {
  New-Item -ItemType Directory -Force -Path $EvidenceDir | Out-Null
  foreach ($p in @($Chrome,$Launcher,$WatcherSource,$BridgeSource,$SchemaSource)) { if (-not (Test-Path -LiteralPath $p)) { throw "required path missing: ${p}" } }
  [IO.Directory]::CreateDirectory($MacroDir) | Out-Null
  [IO.Directory]::CreateDirectory($LightDir) | Out-Null
  Require (Test-Path -LiteralPath $MacroDir -PathType Container) "macro staging directory unavailable after create: ${MacroDir}"
  Require (Test-Path -LiteralPath $LightDir -PathType Container) "Light staging directory unavailable after create: ${LightDir}"

  $Codex = Get-Command codex -ErrorAction Stop
  $CodexPath = if (-not [string]::IsNullOrWhiteSpace([string]$Codex.Source)) { [string]$Codex.Source } else { [string]$Codex.Definition }
  $CodexVersionObserved = ((& $CodexPath --version 2>$null) | Out-String).Trim()
  Equal $CodexVersionObserved $ExpectedCodexVersion 'Codex CLI version mismatch'
  $ChromeVersion = try { [string](Get-Item -LiteralPath $Chrome).VersionInfo.ProductVersion } catch { '' }
  @(
    "run_started=$($RunStarted.ToUniversalTime().ToString('o'))",
    "powershell=$($PSVersionTable.PSVersion)",
    "codex=$CodexVersionObserved",
    "chrome=$ChromeVersion",
    "cycles=7",
    "material_sends=6",
    "semantic_production_cycles=6",
    "semantic_send_cycles=5",
    "terminal_stop_cycles=1"
  ) | Set-Content -LiteralPath $EnvironmentPath -Encoding UTF8

  Copy-Item -LiteralPath $WatcherSource -Destination $MacroTarget -Force
  Copy-Item -LiteralPath $BridgeSource -Destination $BridgeTarget -Force
  Copy-Item -LiteralPath $SchemaSource -Destination $SchemaTarget -Force

  $LauncherUri = 'file:///' + ($Launcher -replace '\\','/')

  foreach ($Cycle in $Cycles) {
    Write-Host ("Starting master qualification cycle {0}/6: {1}" -f $Cycle.index,$Cycle.label)
    Write-Config $Cycle

    $CycleTag = ('{0:D2}_{1}' -f [int]$Cycle.index,[string]$Cycle.label)
    $LogPath = Join-Path $Downloads ("LIGHT_MASTER_${RunStamp}_${CycleTag}.log")
    Remove-Item -LiteralPath $LogPath -Force -ErrorAction SilentlyContinue
    $Known = @{}
    Get-ChildItem -LiteralPath $Downloads -Filter 'LIGHT_PRODUCTION_target_*.csv' -File -ErrorAction SilentlyContinue | ForEach-Object { $Known[$_.FullName] = $true }
    $LogUrl = $LogPath -replace '\\','/'
    $LaunchUrl = "${LauncherUri}?direct=1&macro=${MacroName}&storage=xfile&savelog=${LogUrl}"
    Start-Process -FilePath $Chrome -ArgumentList $LaunchUrl

    $Deadline = (Get-Date).AddMinutes(12)
    $Evidence = $null
    while ((Get-Date) -lt $Deadline) {
      $Evidence = Get-ChildItem -LiteralPath $Downloads -Filter 'LIGHT_PRODUCTION_target_*.csv' -File -ErrorAction SilentlyContinue | Where-Object { -not $Known.ContainsKey($_.FullName) } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
      if ($null -ne $Evidence) { break }
      Start-Sleep -Seconds 2
    }
    if ($null -eq $Evidence) { throw ("cycle {0} evidence CSV not produced within 12 minutes" -f $CycleTag) }
    $Row = Import-Csv -LiteralPath $Evidence.FullName | Select-Object -First 1
    if ($null -eq $Row) { throw ("cycle {0} evidence CSV is empty" -f $CycleTag) }

    $CycleCsv = Join-Path $EvidenceDir ("CYCLE_${CycleTag}.csv")
    Copy-Item -LiteralPath $Evidence.FullName -Destination $CycleCsv -Force
    if (Test-Path -LiteralPath $LogPath) { Copy-Item -LiteralPath $LogPath -Destination (Join-Path $EvidenceDir ("CYCLE_${CycleTag}.log")) -Force }

    $SummaryRow = [pscustomobject]@{
      cycle = [int]$Cycle.index; label = [string]$Cycle.label; qualification_mode = [bool]$Cycle.qualification_mode;
      expected_action = [string]$Cycle.expected_action; actual_action = [string]$Row.bridge_action;
      expected_prompt_sha256 = [string]$Cycle.expected_prompt_sha256; actual_prompt_sha256 = [string]$Row.bridge_prompt_sha256;
      expected_source_assistant_sha256 = [string]$Cycle.expected_source_assistant_sha256; actual_source_assistant_sha256 = [string]$Row.assistant_text_sha256;
      conversation_id = [string]$Row.conversation_id; source_user_message_id = [string]$Row.source_user_message_id; source_assistant_message_id = [string]$Row.source_assistant_message_id; nonce = [string]$Row.nonce;
      codex_version = [string]$Row.codex_version; codex_duration_ms = [string]$Row.codex_duration_ms;
      baseline_submit_aria = [string]$Row.baseline_submit_aria; primer_submit_aria = [string]$Row.primer_submit_aria; primer_cleared_aria = [string]$Row.primer_cleared_aria; pasted_submit_aria = [string]$Row.pasted_submit_aria; copy_sentinel_replaced = [string]$Row.copy_sentinel_replaced; staged_copy_exact = [string]$Row.staged_copy_exact;
      send_click_count = [string]$Row.send_click_count; submission_confirmed = [string]$Row.submission_confirmed; new_user_message_id = [string]$Row.new_user_message_id; next_completion_observed = [string]$Row.next_completion_observed; next_assistant_message_id = [string]$Row.next_assistant_message_id;
      validator = 'PENDING'
    }
    $Summary += $SummaryRow
    Save-Summary

    Equal ([string]$Row.result) 'PASS' ("cycle {0} watcher result" -f $CycleTag)
    Equal ([string]$Row.failure_reason) '' ("cycle {0} failure_reason" -f $CycleTag)
    Equal ([string]$Row.xrun_exit_code) '0' ("cycle {0} XRun exit" -f $CycleTag)
    Equal ([string]$Row.codex_exit_code) '0' ("cycle {0} Codex exit" -f $CycleTag)
    Equal ([string]$Row.codex_version) $CodexVersionObserved ("cycle {0} Codex version" -f $CycleTag)
    Equal ([string]$Row.browser_identity_revalidated) 'true' ("cycle {0} browser identity revalidation" -f $CycleTag)
    Equal ([string]$Row.bridge_action) ([string]$Cycle.expected_action) ("cycle {0} Codex action" -f $CycleTag)
    Equal ([string]$Row.bridge_prompt_sha256) ([string]$Cycle.expected_prompt_sha256) ("cycle {0} Codex prompt sha256" -f $CycleTag)
    Require (-not [string]::IsNullOrWhiteSpace([string]$Row.conversation_id)) ("cycle {0} missing conversation id" -f $CycleTag)
    Require (-not [string]::IsNullOrWhiteSpace([string]$Row.source_user_message_id)) ("cycle {0} missing source user id" -f $CycleTag)
    Require (-not [string]::IsNullOrWhiteSpace([string]$Row.source_assistant_message_id)) ("cycle {0} missing source assistant id" -f $CycleTag)
    Require (-not [string]::IsNullOrWhiteSpace([string]$Row.nonce)) ("cycle {0} missing nonce" -f $CycleTag)
    Require (-not $SeenNonces.ContainsKey([string]$Row.nonce)) ("cycle {0} nonce reused" -f $CycleTag)
    $SeenNonces[[string]$Row.nonce] = $true

    if ([int]$Cycle.index -eq 0) {
      $ConversationId = [string]$Row.conversation_id
    } else {
      Equal ([string]$Row.conversation_id) $ConversationId ("cycle {0} conversation continuity" -f $CycleTag)
      Equal ([string]$Row.source_user_message_id) $PreviousNewUserId ("cycle {0} user-message chain" -f $CycleTag)
      Equal ([string]$Row.source_assistant_message_id) $PreviousNextAssistantId ("cycle {0} assistant-message chain" -f $CycleTag)
      Equal ([string]$Row.assistant_text_sha256) ([string]$Cycle.expected_source_assistant_sha256) ("cycle {0} source assistant sha256" -f $CycleTag)
    }

    if ($Cycle.material_send) {
      Equal ([string]$Row.failure_class) 'NONE' ("cycle {0} failure class" -f $CycleTag)
      Equal ([string]$Row.baseline_submit_aria) 'Start Voice' ("cycle {0} baseline submit surface" -f $CycleTag)
      Equal ([string]$Row.primer_submit_aria) 'Send prompt' ("cycle {0} primer submit surface" -f $CycleTag)
      Equal ([string]$Row.primer_cleared_aria) 'Start Voice' ("cycle {0} primer cleared surface" -f $CycleTag)
      Equal ([string]$Row.pasted_submit_aria) 'Send prompt' ("cycle {0} pasted submit surface" -f $CycleTag)
      Equal ([string]$Row.copy_sentinel_replaced) 'true' ("cycle {0} copy sentinel" -f $CycleTag)
      Equal ([string]$Row.staged_copy_exact) 'true' ("cycle {0} staged copy" -f $CycleTag)
      Equal ([string]$Row.send_click_count) '1' ("cycle {0} Send count" -f $CycleTag)
      Equal ([string]$Row.submission_confirmed) 'true' ("cycle {0} submission confirmation" -f $CycleTag)
      Equal ([string]$Row.next_completion_observed) 'true' ("cycle {0} next completion" -f $CycleTag)
      Require (-not [string]::IsNullOrWhiteSpace([string]$Row.new_user_message_id)) ("cycle {0} missing new user id" -f $CycleTag)
      Require (-not [string]::IsNullOrWhiteSpace([string]$Row.next_assistant_message_id)) ("cycle {0} missing next assistant id" -f $CycleTag)
      Require ([string]$Row.new_user_message_id -ne [string]$Row.source_user_message_id) ("cycle {0} user id did not advance" -f $CycleTag)
      Require ([string]$Row.next_assistant_message_id -ne [string]$Row.source_assistant_message_id) ("cycle {0} assistant id did not advance" -f $CycleTag)
      $PreviousNewUserId = [string]$Row.new_user_message_id
      $PreviousNextAssistantId = [string]$Row.next_assistant_message_id
    } else {
      Equal ([string]$Row.failure_class) 'STOP_REQUESTED' ("cycle {0} STOP class" -f $CycleTag)
      Equal ([string]$Row.baseline_submit_aria) '' ("cycle {0} STOP baseline surface must be untouched" -f $CycleTag)
      Equal ([string]$Row.primer_submit_aria) '' ("cycle {0} STOP primer surface must be untouched" -f $CycleTag)
      Equal ([string]$Row.primer_cleared_aria) '' ("cycle {0} STOP primer clear surface must be untouched" -f $CycleTag)
      Equal ([string]$Row.pasted_submit_aria) '' ("cycle {0} STOP paste surface must be untouched" -f $CycleTag)
      Equal ([string]$Row.copy_sentinel_replaced) 'false' ("cycle {0} STOP sentinel must be untouched" -f $CycleTag)
      Equal ([string]$Row.staged_copy_exact) 'false' ("cycle {0} STOP staged copy must be false" -f $CycleTag)
      Equal ([string]$Row.send_click_count) '0' ("cycle {0} STOP Send count" -f $CycleTag)
      Equal ([string]$Row.submission_confirmed) 'false' ("cycle {0} STOP submission" -f $CycleTag)
      Equal ([string]$Row.new_user_message_id) '' ("cycle {0} STOP new user id" -f $CycleTag)
      Equal ([string]$Row.next_completion_observed) 'false' ("cycle {0} STOP next completion" -f $CycleTag)
      Equal ([string]$Row.next_assistant_message_id) '' ("cycle {0} STOP next assistant id" -f $CycleTag)
    }

    $SummaryRow.validator = 'PASS'
    Save-Summary
    Start-Sleep -Milliseconds 750
  }

  Require ($Summary.Count -eq 7) 'master qualification cycle count must be 7'
  $Status = 'PASS'
} catch {
  $Reason = [string]$_.Exception.Message
  if ($Summary.Count -gt 0 -and [string]$Summary[-1].validator -eq 'PENDING') { $Summary[-1].validator = "FAIL: $Reason" }
  Save-Summary
} finally {
  Remove-Item -LiteralPath $ConfigTarget -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $MacroTarget -Force -ErrorAction SilentlyContinue
}

$Bundle = New-EvidenceZip -Result $Status -Failure $Reason
if ($Status -ne 'PASS') {
  Write-Host "LIGHT MASTER QUALIFICATION FAIL: ${Reason}"
  Write-Host "Upload this evidence bundle: ${Bundle}"
  exit 1
}
Write-Host 'LIGHT MASTER QUALIFICATION PASS: production target + five semantic SEND soak cycles + terminal STOP all verified.'
Write-Host "Upload this evidence bundle: ${Bundle}"
exit 0
