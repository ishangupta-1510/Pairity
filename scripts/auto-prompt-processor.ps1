# Auto Prompt Processor for Claude Code (PowerShell Version)

param(
    [switch]$Status,
    [switch]$Reset,
    [switch]$StopOnError,
    [switch]$Help
)

class AutoPromptProcessor {
    [string]$PromptsDir
    [string]$LogsDir
    [string]$StatusFile
    [hashtable]$Status
    [int]$CurrentPromptIndex
    [int]$TotalPrompts

    AutoPromptProcessor() {
        $this.PromptsDir = Join-Path $PSScriptRoot ".." "prompts"
        $this.LogsDir = Join-Path $PSScriptRoot ".." "logs"
        $this.StatusFile = Join-Path $this.LogsDir "prompt-status.json"
        
        # Ensure logs directory exists
        if (-not (Test-Path $this.LogsDir)) {
            New-Item -ItemType Directory -Path $this.LogsDir -Force | Out-Null
        }
        
        $this.Status = $this.LoadStatus()
        $this.CurrentPromptIndex = 0
        $this.TotalPrompts = 0
    }

    [hashtable] LoadStatus() {
        if (Test-Path $this.StatusFile) {
            try {
                $content = Get-Content $this.StatusFile -Raw | ConvertFrom-Json
                $hashtable = @{}
                $content.PSObject.Properties | ForEach-Object { $hashtable[$_.Name] = $_.Value }
                return $hashtable
            }
            catch {
                Write-Host "❌ Error loading status file: $($_.Exception.Message)" -ForegroundColor Red
                return @{}
            }
        }
        return @{}
    }

    [void] SaveStatus() {
        try {
            $this.Status | ConvertTo-Json -Depth 3 | Set-Content $this.StatusFile
        }
        catch {
            Write-Host "❌ Error saving status file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    [void] Log([string]$Message, [string]$Type = "info") {
        $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
        $logMessage = "[$timestamp] $($Type.ToUpper()): $Message"
        
        $color = switch ($Type) {
            "error" { "Red" }
            "warn" { "Yellow" }
            "success" { "Green" }
            default { "White" }
        }
        
        Write-Host $logMessage -ForegroundColor $color
        
        # Write to log file
        $logFile = Join-Path $this.LogsDir "processor-$(Get-Date -Format 'yyyy-MM-dd').log"
        Add-Content -Path $logFile -Value $logMessage
    }

    [array] GetPromptFiles() {
        if (-not (Test-Path $this.PromptsDir)) {
            throw "Prompts directory not found: $($this.PromptsDir)"
        }

        $files = Get-ChildItem -Path $this.PromptsDir -Filter "*.md" | 
                 Where-Object { $_.Name -match "^\d+" } |
                 Sort-Object { [int]($_.Name -replace "^(\d+).*", '$1') }

        $this.Log("Found $($files.Count) prompt files")
        return $files.Name
    }

    [string] ExtractPromptContent([string]$FilePath) {
        $content = Get-Content -Path $FilePath -Raw
        
        # Extract the prompt section between "## Prompt to Claude:" and "## Expected Output:"
        if ($content -match '## Prompt to Claude:\s*([\s\S]*?)(?=\n## |\n$)') {
            $prompt = $matches[1].Trim()
            
            # Remove surrounding quotes if present
            if ($prompt.StartsWith('"') -and $prompt.EndsWith('"')) {
                $prompt = $prompt.Substring(1, $prompt.Length - 2)
            }
            
            return $prompt
        }
        
        throw "Could not extract prompt content from $FilePath"
    }

    [hashtable] RunClaudeCode([string]$Prompt, [string]$PromptFile) {
        $this.Log("🚀 Starting Claude Code for: $PromptFile")
        
        $logFile = Join-Path $this.LogsDir "$($PromptFile.Replace('.md', ''))-output.log"
        
        try {
            # Create temporary file for the prompt
            $tempPromptFile = [System.IO.Path]::GetTempFileName()
            Set-Content -Path $tempPromptFile -Value $Prompt
            
            # Start Claude CLI process with skip permissions flag
            # --dangerously-skip-permissions prevents interactive permission prompts
            # which would block automated processing
            $process = Start-Process -FilePath "claude" -ArgumentList "--dangerously-skip-permissions" -PassThru -NoNewWindow -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError
            
            # Send the prompt
            $process.StandardInput.WriteLine($Prompt)
            $process.StandardInput.WriteLine("/exit")
            $process.StandardInput.Close()
            
            # Wait for completion with timeout (10 minutes)
            $completed = $process.WaitForExit(600000)
            
            if (-not $completed) {
                $process.Kill()
                $this.Log("⏰ Timeout for: $PromptFile", "warn")
                return @{ success = $false; timeout = $true }
            }
            
            $output = $process.StandardOutput.ReadToEnd()
            $error = $process.StandardError.ReadToEnd()
            
            # Write output to log file
            Set-Content -Path $logFile -Value $output
            if ($error) {
                Add-Content -Path $logFile -Value "STDERR: $error"
            }
            
            Remove-Item -Path $tempPromptFile -Force
            
            if ($process.ExitCode -eq 0) {
                $this.Log("✅ Completed: $PromptFile (exit code: $($process.ExitCode))", "success")
                return @{ success = $true; output = $output }
            }
            else {
                $this.Log("❌ Failed: $PromptFile (exit code: $($process.ExitCode))", "error")
                return @{ success = $false; output = $output; exitCode = $process.ExitCode }
            }
        }
        catch {
            $this.Log("❌ Process error for $PromptFile`: $($_.Exception.Message)", "error")
            return @{ success = $false; error = $_.Exception.Message }
        }
    }

    [hashtable] ProcessPrompt([string]$PromptFile) {
        $promptPath = Join-Path $this.PromptsDir $PromptFile
        
        try {
            # Check if already processed
            if ($this.Status[$PromptFile] -and $this.Status[$PromptFile].completed) {
                $this.Log("⏭️ Skipping already completed: $PromptFile")
                return @{ success = $true; skipped = $true }
            }

            # Extract prompt content
            $prompt = $this.ExtractPromptContent($promptPath)
            
            # Update status
            $this.Status[$PromptFile] = @{
                started = (Get-Date).ToString("o")
                completed = $false
                attempts = if ($this.Status[$PromptFile]) { $this.Status[$PromptFile].attempts + 1 } else { 1 }
            }
            $this.SaveStatus()

            # Process with Claude Code
            $result = $this.RunClaudeCode($prompt, $PromptFile)
            
            # Update status based on result
            $this.Status[$PromptFile].completed = $result.success
            $this.Status[$PromptFile].finished = (Get-Date).ToString("o")
            $this.Status[$PromptFile].success = $result.success
            
            if (-not $result.success) {
                $errorMsg = if ($result.exitCode) { "Exit code: $($result.exitCode)" } else { "Unknown error" }
                if ($result.timeout) { $errorMsg = "Timeout" }
                $this.Status[$PromptFile].error = $errorMsg
            }
            
            $this.SaveStatus()
            return $result
        }
        catch {
            $this.Log("❌ Error processing $PromptFile`: $($_.Exception.Message)", "error")
            
            $this.Status[$PromptFile] = @{
                started = if ($this.Status[$PromptFile]) { $this.Status[$PromptFile].started } else { (Get-Date).ToString("o") }
                completed = $false
                error = $_.Exception.Message
                finished = (Get-Date).ToString("o")
            }
            $this.SaveStatus()
            
            return @{ success = $false; error = $_.Exception.Message }
        }
    }

    [hashtable] ProcessAllPrompts([bool]$StopOnError = $false) {
        $promptFiles = $this.GetPromptFiles()
        $this.TotalPrompts = $promptFiles.Count
        
        $this.Log("🎯 Starting processing of $($this.TotalPrompts) prompts")
        $this.Log("📁 Prompts directory: $($this.PromptsDir)")
        $this.Log("📊 Logs directory: $($this.LogsDir)")
        
        $results = @{
            processed = 0
            completed = 0
            failed = 0
            skipped = 0
        }

        for ($i = 0; $i -lt $promptFiles.Count; $i++) {
            $promptFile = $promptFiles[$i]
            $this.CurrentPromptIndex = $i + 1
            
            $this.Log("`n📋 [$($this.CurrentPromptIndex)/$($this.TotalPrompts)] Processing: $promptFile")
            
            $result = $this.ProcessPrompt($promptFile)
            $results.processed++
            
            if ($result.skipped) {
                $results.skipped++
            }
            elseif ($result.success) {
                $results.completed++
            }
            else {
                $results.failed++
                
                if ($StopOnError) {
                    $this.Log("🛑 Stopping due to error (StopOnError flag)", "error")
                    break
                }
            }
            
            # Add delay between prompts
            if ($i -lt $promptFiles.Count - 1) {
                $this.Log("⏳ Waiting 5 seconds before next prompt...")
                Start-Sleep -Seconds 5
            }
        }

        $this.Log("`n🏁 Processing complete!", "success")
        $this.Log("📊 Results: $($results.completed) completed, $($results.failed) failed, $($results.skipped) skipped")
        
        return $results
    }

    [void] ShowStatus() {
        $promptFiles = $this.GetPromptFiles()
        
        Write-Host "`n📊 Prompt Processing Status:" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        
        for ($i = 0; $i -lt $promptFiles.Count; $i++) {
            $file = $promptFiles[$i]
            $status = $this.Status[$file]
            $number = "{0:D2}" -f ($i + 1)
            
            if (-not $status) {
                Write-Host "$number. $file - ⏸️ Not started" -ForegroundColor Gray
            }
            elseif ($status.completed) {
                Write-Host "$number. $file - ✅ Completed ($($status.finished))" -ForegroundColor Green
            }
            elseif ($status.started) {
                Write-Host "$number. $file - 🔄 In progress ($($status.started))" -ForegroundColor Yellow
            }
            else {
                Write-Host "$number. $file - ❌ Failed: $($status.error)" -ForegroundColor Red
            }
        }
        
        $completed = ($this.Status.Values | Where-Object { $_.completed }).Count
        Write-Host "`nTotal: $completed/$($promptFiles.Count) completed" -ForegroundColor Cyan
    }

    [void] ResetStatus() {
        if (Test-Path $this.StatusFile) {
            Remove-Item -Path $this.StatusFile -Force
            $this.Log("🔄 Status file reset", "success")
        }
        $this.Status = @{}
    }
}

# Main script execution
function Main {
    if ($Help) {
        Write-Host @"

Auto Prompt Processor for Claude Code (PowerShell Version)

Usage:
  .\auto-prompt-processor.ps1 [options]

Options:
  -Status          Show current processing status
  -Reset           Reset processing status
  -StopOnError     Stop processing if any prompt fails
  -Help            Show this help message

Examples:
  .\auto-prompt-processor.ps1                    # Process all prompts
  .\auto-prompt-processor.ps1 -Status            # Show status only
  .\auto-prompt-processor.ps1 -Reset             # Reset and start over
  .\auto-prompt-processor.ps1 -StopOnError       # Stop on first error

"@
        return
    }
    
    try {
        $processor = [AutoPromptProcessor]::new()
        
        if ($Status) {
            $processor.ShowStatus()
            return
        }
        
        if ($Reset) {
            $processor.ResetStatus()
            Write-Host "✅ Status reset. Run again to start processing." -ForegroundColor Green
            return
        }
        
        # Start processing
        $results = $processor.ProcessAllPrompts($StopOnError)
        
    }
    catch {
        Write-Host "❌ Fatal error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Run main function
Main