# Auto Prompt Processor for Claude Code

This script automatically processes a series of prompts through Claude Code, running each prompt sequentially and waiting for completion before proceeding to the next one.

## Features

- ✅ **Sequential Processing**: Runs prompts one by one, waiting for each to complete
- ✅ **Numbered Section Parsing**: Automatically splits prompts into numbered sub-tasks (1. 2. 3. etc.)
- ✅ **Progress Tracking**: Maintains status of each prompt and section (completed, failed, in progress)
- ✅ **Resume Capability**: Can resume from where it left off if interrupted
- ✅ **Detailed Logging**: Creates comprehensive logs for each prompt execution
- ✅ **Dependency Chain**: Stops processing if any prompt fails (prevents cascade failures)
- ✅ **Auto Git Commits**: Automatically commits to Git every 5-6 prompts and pushes to GitHub
- ✅ **Cross-Platform**: Works on Windows, macOS, and Linux
- ✅ **Multiple Interfaces**: Node.js, PowerShell, and Batch/Shell wrappers
- ✅ **Permission-Free**: Uses `--dangerously-skip-permissions` to avoid permission prompts

## Quick Start

### Windows
```batch
# Double-click or run from command prompt
run-prompts.bat

# Or with options
run-prompts.bat --status
run-prompts.bat --reset
```

### macOS/Linux
```bash
# Make executable and run
chmod +x run-prompts.sh
./run-prompts.sh

# Or with options
./run-prompts.sh --status
./run-prompts.sh --reset
```

### Direct Node.js Usage
```bash
# Process all prompts (dependency mode)
node auto-prompt-processor.js

# Show current status
node auto-prompt-processor.js --status

# Reset and start over
node auto-prompt-processor.js --reset

# Clear blocked prompts after fixing issues
node auto-prompt-processor.js --clear-blocked
```

### PowerShell (Windows)
```powershell
# Process all prompts
.\auto-prompt-processor.ps1

# Show current status
.\auto-prompt-processor.ps1 -Status

# Reset and start over
.\auto-prompt-processor.ps1 -Reset

# Stop on first error
.\auto-prompt-processor.ps1 -StopOnError
```

## Prompt File Format

The script expects prompt files in the `../prompts/` directory with the following format:

```markdown
# Prompt XX: Title

## Prompt to Claude:

"Your detailed prompt here...

Multiple paragraphs are supported.
The script extracts everything between this section and the next."

## Expected Output:
- List of expected outcomes

## Next Steps After Completion:
- What to do after this prompt

## Dependencies on Other Prompts:
- Which prompts must be completed first

## Notes:
- Additional information
```

**Important**: 
- Files must start with a number (e.g., `01-project-setup.md`, `02-auth-screens.md`)
- The prompt content must be between `## Prompt to Claude:` and the next `##` section
- Numbered sections use distinctive markers: `%^Prompt1^%`, `%^Prompt2^%`, etc.
- The script automatically removes surrounding quotes from the prompt text

## Directory Structure

```
scripts/
├── auto-prompt-processor.js    # Main Node.js script
├── auto-prompt-processor.ps1   # PowerShell version
├── run-prompts.bat            # Windows batch wrapper
├── run-prompts.sh             # Unix shell wrapper
└── README.md                  # This file

../prompts/                    # Prompt files directory
├── 01-project-setup.md
├── 02-auth-screens.md
├── 03-protected-routes.md
└── ...

../logs/                       # Generated logs directory
├── prompt-status.json         # Processing status
├── processor-YYYY-MM-DD.log   # Daily processing log
├── 01-project-setup-output.log
└── 02-auth-screens-output.log
```

## Dependency Chain Behavior

**🔗 IMPORTANT**: Prompts have dependencies and must complete successfully in order.

- If **Prompt 03** fails, **Prompts 04-20** will be **blocked**
- Processing stops immediately when any prompt fails
- Fix the failed prompt and resume with the same command
- Use `--clear-blocked` to unblock prompts after fixing issues

**Example Workflow:**
```bash
npm run prompts              # Starts processing
# Prompt 05 fails, prompts 06-20 get blocked

npm run prompts:status       # Shows what failed and what's blocked
# Fix the issue in your code
npm run prompts:clear-blocked # Unblock remaining prompts  
npm run prompts              # Resume from prompt 05
```

## Numbered Section Processing

**🔢 Smart Parsing**: The script automatically detects numbered sections within each prompt file.

**How it works:**
1. **Parse Prompt File**: Extracts content from markdown
2. **Detect Numbered Sections**: Finds all "1. 2. 3. ..." patterns
3. **Process Each Section**: Sends sections individually to Claude with context
4. **Track Progress**: Shows section-level progress (e.g., "3/8 sections completed")

**Example Processing Flow:**
```
📋 [1/20] Processing: 01-project-setup.md
📝 Found 8 numbered sections in 01-project-setup.md

🔹 [1/8] Processing section of 01-project-setup.md
📋 Section content preview: %^Prompt1^% Initialize an Expo project with TypeScript...
🚀 Starting Claude Code for: 01-project-setup.md-section-1
✅ Section 1 completed successfully

🔹 [2/8] Processing section of 01-project-setup.md  
📋 Section content preview: %^Prompt2^% Set up the following folder structure...
🚀 Starting Claude Code for: 01-project-setup.md-section-2
✅ Section 2 completed successfully
...
```

**Benefits:**
- 🎯 **Focused Implementation**: Each section gets dedicated attention
- 📊 **Granular Progress**: See exactly which parts are complete
- 🔄 **Better Context**: Claude understands both the full task and current section
- ⚡ **Faster Processing**: Smaller, focused prompts complete faster

## Git Integration

**📤 Automatic Commits**: The script creates Git checkpoints to save progress.

**Commit Schedule:**
- **Every 5-6 prompts**: Creates checkpoint commit
- **Final completion**: Creates final commit when all 20 prompts done
- **Auto-push**: Pushes commits to GitHub automatically

**Commit Message Format:**
```
feat: Complete prompts 1-6 (06-settings)

Auto-generated checkpoint after completing 6 prompts.
Last completed: 06-settings

🤖 Generated with Auto Prompt Processor
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Benefits:**
- 🔄 **Backup your work** as prompts complete
- 📈 **Track progress** with Git history
- 🚀 **Auto-push to GitHub** for cloud backup
- 🛡️ **Recovery points** if something goes wrong

## Command Line Options

### Node.js Script
- `--status` - Show current processing status with dependency info
- `--reset` - Reset processing status completely and start over
- `--clear-blocked` - Clear blocked status after fixing failed prompts
- `--help` or `-h` - Show help message

### PowerShell Script
- `-Status` - Show current processing status
- `-Reset` - Reset processing status and start over
- `-StopOnError` - Stop processing if any prompt fails
- `-Help` - Show help message

## Status Tracking

The script maintains a `prompt-status.json` file that tracks:

```json
{
  "01-project-setup.md": {
    "started": "2025-01-13T10:30:00.000Z",
    "completed": true,
    "finished": "2025-01-13T10:45:00.000Z",
    "success": true,
    "attempts": 1
  },
  "02-auth-screens.md": {
    "started": "2025-01-13T10:45:05.000Z",
    "completed": false,
    "error": "Exit code: 1",
    "finished": "2025-01-13T11:00:00.000Z",
    "attempts": 2
  }
}
```

## Logging

The script creates comprehensive logs:

1. **Daily Processing Log**: `processor-YYYY-MM-DD.log`
   - Overall processing timeline
   - Start/stop times for each prompt
   - Error messages and warnings

2. **Individual Prompt Logs**: `{prompt-name}-output.log`
   - Complete output from Claude Code for each prompt
   - STDOUT and STDERR capture
   - Execution details

## Error Handling

- **Individual Prompt Failures**: By default, the script continues to the next prompt
- **Stop on Error**: Use `--stop-on-error` to halt processing on first failure
- **Timeouts**: Each prompt has a 10-minute timeout limit
- **Resume**: The script can resume from where it left off using the status file

## Prerequisites

- **Claude Code CLI** must be installed and accessible in PATH
- **Node.js** (for Node.js version) or **PowerShell 5.1+** (for PowerShell version)
- **Prompt files** must exist in the `../prompts/` directory

## Troubleshooting

### Script Won't Start
- Ensure Claude Code CLI is installed: `claude --version`
- Check that prompt files exist in the correct directory
- Verify Node.js installation: `node --version`

### Prompts Failing
- Check individual prompt log files in `../logs/`
- Verify prompt file format and content
- Ensure Claude Code has necessary permissions

### Status File Issues
- Use `--reset` to clear corrupted status
- Manually delete `../logs/prompt-status.json` if needed

### Permission Errors
- On Unix systems, ensure scripts are executable: `chmod +x *.sh`
- On Windows, check PowerShell execution policy

### Claude Code Permission Prompts
The script automatically uses `--dangerously-skip-permissions` flag to avoid permission prompts during automated processing. If you see permission prompts:
- Ensure you're using Claude Code v1.0.77 or later
- The flag prevents interruption during automated processing
- For manual use, you may want to remove this flag for security

## Advanced Usage

### Custom Timeout
Modify the timeout value in the script (default: 10 minutes):

```javascript
// In auto-prompt-processor.js, line ~180
setTimeout(() => {
  // Change 10 * 60 * 1000 to desired milliseconds
}, 15 * 60 * 1000); // 15 minutes
```

### Custom Delays
Modify the delay between prompts (default: 5 seconds):

```javascript
// In auto-prompt-processor.js, line ~400
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
```

### Processing Specific Prompts
To process only certain prompts, temporarily move unwanted files out of the prompts directory or modify the `getPromptFiles()` function.

## License

This script is part of the Pairity project and follows the same license terms.

## Support

For issues or questions:
1. Check the log files in `../logs/`
2. Review this README for troubleshooting steps
3. Ensure all prerequisites are met
4. Test with a single prompt file first