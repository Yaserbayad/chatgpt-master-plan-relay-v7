# Q12 remaining interruption cases — execution

Run `qualification/Q12_MANUAL_COMPLETION.ps1` on the frozen Windows/UI.Vision target machine.

The harness:
1. verifies/downloads the four governed Q12 probes into the existing UI.Vision xfile macro directory;
2. executes Case B: append FENCE, then abruptly terminates Chrome/UI.Vision before any post-append reread, restarts, and verifies the exact FENCE;
3. executes Case D: append + exact reread, then abruptly terminates Chrome/UI.Vision before normal completion, restarts, and verifies the exact FENCE;
4. creates a ZIP on the Desktop containing the generated evidence and hashes.

The harness uses native filesystem reads only to time the interruption. Acceptance evidence itself comes from UI.Vision hard-drive CSV write/read and restart verification.

Important: the harness force-terminates all Chrome processes twice. Save any unrelated browser work before execution.

When the script reports both cases PASS, upload the generated `Q12_completion_evidence_*.zip` to ChatGPT for independent reconciliation. Do not rerun either case after a material append unless the prior outcome has first been reconciled.
