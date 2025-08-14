#!/bin/bash

echo ""
echo "=========================================="
echo "  Auto Prompt Processor for Claude Code"
echo "=========================================="
echo ""

# Make the script executable
chmod +x "$0"

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "Using Node.js version:"
    node --version
    echo ""
    echo "Starting prompt processing..."
    echo ""
    node "$(dirname "$0")/auto-prompt-processor.js" "$@"
else
    echo "❌ Node.js not found. Please install Node.js to run this script."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo ""
echo "Press Enter to exit..."
read