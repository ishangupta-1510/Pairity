@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo  Auto Prompt Processor for Claude Code
echo ==========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using Node.js version:
    node --version
    echo.
    echo Starting prompt processing...
    echo.
    node "%~dp0auto-prompt-processor.js" %*
) else (
    echo Node.js not found. Trying PowerShell version...
    echo.
    powershell -ExecutionPolicy Bypass -File "%~dp0auto-prompt-processor.ps1" %*
)

echo.
echo Press any key to exit...
pause >nul