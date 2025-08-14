#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class AutoPromptProcessor {
  constructor() {
    this.promptsDir = path.join(__dirname, '..', 'prompts');
    this.logsDir = path.join(__dirname, '..', 'logs');
    this.statusFile = path.join(this.logsDir, 'prompt-status.json');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    this.status = this.loadStatus();
    this.currentPromptIndex = 0;
    this.totalPrompts = 0;
  }

  loadStatus() {
    if (fs.existsSync(this.statusFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
      } catch (error) {
        console.error('❌ Error loading status file:', error.message);
        return {};
      }
    }
    return {};
  }

  saveStatus() {
    try {
      fs.writeFileSync(this.statusFile, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('❌ Error saving status file:', error.message);
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    console.log(logMessage);
    
    // Write to log file
    const logFile = path.join(this.logsDir, `processor-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  getPromptFiles() {
    if (!fs.existsSync(this.promptsDir)) {
      throw new Error(`Prompts directory not found: ${this.promptsDir}`);
    }

    const files = fs.readdirSync(this.promptsDir)
      .filter(file => {
        // Include only .md files that start with digits and are not overview files
        return file.endsWith('.md') && 
               /^\d+/.test(file) && 
               !file.toLowerCase().includes('overview') &&
               !file.toLowerCase().includes('readme');
      })
      .sort((a, b) => {
        const numA = parseInt(a.match(/^(\d+)/)[1]);
        const numB = parseInt(b.match(/^(\d+)/)[1]);
        return numA - numB;
      });

    this.log(`Found ${files.length} processable prompt files`);
    return files;
  }

  extractPromptContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the prompt section between "## Prompt to Claude:" and "## Expected Output:"
    const promptMatch = content.match(/## Prompt to Claude:\s*([\s\S]*?)(?=\n## |\n$)/);
    
    if (!promptMatch) {
      throw new Error(`Could not extract prompt content from ${filePath}`);
    }

    // Clean up the prompt text - remove quotes and extra whitespace
    let prompt = promptMatch[1].trim();
    
    // Remove surrounding quotes if present
    if (prompt.startsWith('"') && prompt.endsWith('"')) {
      prompt = prompt.slice(1, -1);
    }
    
    return prompt;
  }

  parseNumberedPrompts(promptContent) {
    // Split prompt into numbered sections using new %^Prompt1^% format
    // This format is bulletproof and avoids confusion with version numbers
    const lines = promptContent.split('\n');
    const numberedSections = [];
    let currentSection = [];
    
    for (const line of lines) {
      if (/^%\^Prompt\d+\^\%/.test(line)) {
        // Start of new numbered section with distinctive marker
        if (currentSection.length > 0) {
          const section = currentSection.join('\n').trim();
          // Only include sections that start with our marker
          if (section.length > 10 && section.startsWith('%^Prompt')) {
            numberedSections.push(section);
          }
        }
        currentSection = [line];
      } else {
        // Continue current section (only if we're in a marked section)
        if (currentSection.length > 0) {
          currentSection.push(line);
        }
      }
    }
    
    // Add the last section if it exists and has our marker
    if (currentSection.length > 0) {
      const section = currentSection.join('\n').trim();
      if (section.length > 10 && section.startsWith('%^Prompt')) {
        numberedSections.push(section);
      }
    }
    
    // If no numbered sections found, use the whole prompt
    if (numberedSections.length === 0) {
      this.log('⚠️  No clear numbered sections found, using entire prompt as one section', 'warn');
      this.log(`📝 Prompt preview: ${promptContent.substring(0, 200)}...`);
      return [promptContent];
    }
    
    this.log(`🔍 Parsed ${numberedSections.length} numbered sections successfully with new %^Prompt^% format`);
    return numberedSections;
  }

  async runClaudeCode(prompt, promptFile) {
    const logFile = path.join(this.logsDir, `${promptFile.replace('.md', '')}-output.log`);
    const tempPromptFile = path.join(this.logsDir, `temp-prompt-${Date.now()}.txt`);
    
    try {
      this.log(`🚀 Starting Claude Code for: ${promptFile}`);
      this.log(`📝 Prompt length: ${prompt.length} characters`);
      
      // Write prompt to temporary file (handles large prompts better)
      fs.writeFileSync(tempPromptFile, prompt);
      
      this.log(`📤 Sending prompt to Claude Code via file`);
      
      // Try reading file content and passing directly (for shorter prompts) 
      // or use Get-Content with PowerShell (for longer prompts)
      let result;
      if (process.platform === 'win32') {
        if (prompt.length < 8000) {
          // For shorter prompts, pass directly as argument to avoid shell issues
          const escapedPrompt = prompt.replace(/"/g, '""');
          result = execSync(`claude --dangerously-skip-permissions "${escapedPrompt}"`, {
            cwd: process.cwd(),
            encoding: 'utf8',
            timeout: 3 * 60 * 1000,
            maxBuffer: 1024 * 1024 * 10,
            shell: true
          });
        } else {
          // For longer prompts, use PowerShell Get-Content (more reliable than cmd type)
          result = execSync(`powershell -Command "& {Get-Content '${tempPromptFile}' -Raw | claude --dangerously-skip-permissions}"`, {
            cwd: process.cwd(),
            encoding: 'utf8',
            timeout: 3 * 60 * 1000,
            maxBuffer: 1024 * 1024 * 10,
            shell: true
          });
        }
      } else {
        // Use bash on Unix systems
        result = execSync(`cat "${tempPromptFile}" | claude --dangerously-skip-permissions`, {
          cwd: process.cwd(),
          encoding: 'utf8', 
          timeout: 3 * 60 * 1000,
          maxBuffer: 1024 * 1024 * 10
        });
      }
      
      // Write result to log file
      fs.writeFileSync(logFile, result);
      
      // Clean up temp file
      fs.unlinkSync(tempPromptFile);
      
      this.log(`✅ Completed: ${promptFile} (${result.length} chars output)`);
      this.log(`🔍 Output preview: ${result.substring(0, 200)}...`);
      
      return { success: true, output: result };
      
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempPromptFile)) {
        fs.unlinkSync(tempPromptFile);
      }
      
      if (error.code === 'ETIMEDOUT') {
        this.log(`⏰ Timeout for: ${promptFile}`, 'warn');
        return { success: false, output: '', timeout: true };
      } else {
        this.log(`❌ Failed: ${promptFile} - ${error.message}`, 'error');
        // Write error to log file
        const errorOutput = error.stdout || error.message;
        fs.writeFileSync(logFile, `ERROR: ${error.message}\n${errorOutput}`);
        return { success: false, output: errorOutput, exitCode: error.status };
      }
    }
  }

  async processPrompt(promptFile) {
    const promptPath = path.join(this.promptsDir, promptFile);
    
    try {
      // Check if already processed
      if (this.status[promptFile]?.completed) {
        this.log(`⏭️  Skipping already completed: ${promptFile}`);
        return { success: true, skipped: true };
      }

      // Extract prompt content
      const fullPrompt = this.extractPromptContent(promptPath);
      
      // Parse into numbered sections
      const numberedSections = this.parseNumberedPrompts(fullPrompt);
      this.log(`📝 Found ${numberedSections.length} numbered sections in ${promptFile}`);
      
      // Update status
      this.status[promptFile] = {
        started: new Date().toISOString(),
        completed: false,
        attempts: (this.status[promptFile]?.attempts || 0) + 1,
        totalSections: numberedSections.length,
        completedSections: 0
      };
      this.saveStatus();

      // Process each numbered section
      let allSuccessful = true;
      for (let i = 0; i < numberedSections.length; i++) {
        const section = numberedSections[i];
        const sectionNum = i + 1;
        const sectionId = `${promptFile}-section-${sectionNum}`;
        
        this.log(`\n🔹 [${sectionNum}/${numberedSections.length}] Processing section of ${promptFile}`);
        this.log(`📋 Section content preview: ${section.substring(0, 100)}...`);
        
        // Create context-aware prompt for this section
        const contextualPrompt = this.createContextualPrompt(fullPrompt, section, sectionNum, numberedSections.length, promptFile);
        
        // Process this section
        const result = await this.runClaudeCode(contextualPrompt, sectionId);
        
        if (result.success) {
          this.status[promptFile].completedSections++;
          this.log(`✅ Section ${sectionNum} completed successfully`);
        } else {
          this.log(`❌ Section ${sectionNum} failed`, 'error');
          allSuccessful = false;
          break;
        }
        
        this.saveStatus();
        
        // Short delay between sections
        if (i < numberedSections.length - 1) {
          this.log(`⏳ Waiting 3 seconds before next section...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Update final status
      this.status[promptFile].completed = allSuccessful;
      this.status[promptFile].finished = new Date().toISOString();
      this.status[promptFile].success = allSuccessful;
      
      if (!allSuccessful) {
        this.status[promptFile].error = `Failed at section ${this.status[promptFile].completedSections + 1}`;
      }
      
      this.saveStatus();
      return { success: allSuccessful };

    } catch (error) {
      this.log(`❌ Error processing ${promptFile}: ${error.message}`, 'error');
      
      this.status[promptFile] = {
        ...this.status[promptFile],
        completed: false,
        error: error.message,
        finished: new Date().toISOString()
      };
      this.saveStatus();
      
      return { success: false, error: error.message };
    }
  }

  createContextualPrompt(fullPrompt, section, sectionNum, totalSections, promptFile) {
    // Extract the file path to get additional context from the markdown file
    const promptPath = path.join(this.promptsDir, promptFile);
    const fullMarkdown = fs.readFileSync(promptPath, 'utf8');
    
    // Extract additional sections like Expected Output, Next Steps, etc.
    const expectedOutputMatch = fullMarkdown.match(/## Expected Output:\s*([\s\S]*?)(?=\n## |\n$)/);
    const nextStepsMatch = fullMarkdown.match(/## Next Steps After Completion:\s*([\s\S]*?)(?=\n## |\n$)/);
    const notesMatch = fullMarkdown.match(/## Notes:\s*([\s\S]*?)(?=\n## |\n$)/);
    
    let contextualPrompt = `I need you to work on part ${sectionNum} of ${totalSections} of a larger React Native development task.

FULL PROJECT CONTEXT:
${fullPrompt}

CURRENT SECTION TO IMPLEMENT (${sectionNum}/${totalSections}):
${section}

`;

    // Add expected output if available
    if (expectedOutputMatch) {
      contextualPrompt += `EXPECTED OUTPUT FOR THIS PROMPT:
${expectedOutputMatch[1].trim()}

`;
    }

    // Add next steps if available
    if (nextStepsMatch) {
      contextualPrompt += `NEXT STEPS AFTER COMPLETION:
${nextStepsMatch[1].trim()}

`;
    }

    // Add notes if available
    if (notesMatch) {
      contextualPrompt += `IMPORTANT NOTES:
${notesMatch[1].trim()}

`;
    }

    contextualPrompt += `INSTRUCTIONS:
- Focus on implementing this specific section (${sectionNum}/${totalSections})
- Keep in mind how it fits into the overall task above
- Follow React Native best practices
- Use TypeScript throughout
- Ensure compatibility with Expo managed workflow
- Test your implementation thoroughly

Please implement this section now.`;

    return contextualPrompt;
  }

  async processAllPrompts() {
    const promptFiles = this.getPromptFiles();
    this.totalPrompts = promptFiles.length;
    
    this.log(`🎯 Starting processing of ${this.totalPrompts} prompts`);
    this.log(`📁 Prompts directory: ${this.promptsDir}`);
    this.log(`📊 Logs directory: ${this.logsDir}`);
    this.log(`🔗 Dependency Mode: Each prompt must succeed before next can run`);
    this.log(`📤 Auto-commit: Will commit to Git every 5-6 completed prompts`);
    
    const results = {
      processed: 0,
      completed: 0,
      failed: 0,
      skipped: 0
    };

    for (let i = 0; i < promptFiles.length; i++) {
      const promptFile = promptFiles[i];
      this.currentPromptIndex = i + 1;
      
      // Check if previous prompt failed (dependency check)
      if (i > 0) {
        const previousFile = promptFiles[i - 1];
        const previousStatus = this.status[previousFile];
        
        if (!previousStatus?.completed || !previousStatus?.success) {
          this.log(`🚫 Cannot process ${promptFile}: Previous prompt ${previousFile} failed or incomplete`, 'error');
          this.log(`🛑 Stopping processing due to dependency failure`, 'error');
          
          // Mark remaining prompts as blocked
          for (let j = i; j < promptFiles.length; j++) {
            const blockedFile = promptFiles[j];
            this.status[blockedFile] = {
              ...this.status[blockedFile],
              blocked: true,
              reason: `Dependency failure: ${previousFile} must complete successfully first`,
              blockedAt: new Date().toISOString()
            };
          }
          this.saveStatus();
          break;
        }
      }
      
      this.log(`\n📋 [${this.currentPromptIndex}/${this.totalPrompts}] Processing: ${promptFile}`);
      
      const result = await this.processPrompt(promptFile);
      results.processed++;
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.completed++;
        this.log(`✅ ${promptFile} completed successfully - proceeding to next prompt`, 'success');
        
        // Check if we should create a Git checkpoint (every 5-6 prompts)
        if (results.completed > 0 && (results.completed % 5 === 0)) {
          this.log(`🏁 Checkpoint reached: ${results.completed} prompts completed`);
          await this.commitToGit(results.completed, promptFile.replace('.md', ''));
        }
      } else {
        results.failed++;
        this.log(`❌ ${promptFile} failed - stopping processing to prevent cascade failures`, 'error');
        
        // Always stop on failure for dependency chain
        this.log(`🛑 Stopping processing: Prompts have dependencies and must complete in order`, 'error');
        break;
      }
      
      // Add delay between prompts
      if (i < promptFiles.length - 1) {
        this.log(`⏳ Waiting 5 seconds before next prompt...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    this.log(`\n🏁 Processing complete!`);
    this.log(`📊 Results: ${results.completed} completed, ${results.failed} failed, ${results.skipped} skipped`);
    
    // Final commit if all prompts completed successfully
    if (results.completed === this.totalPrompts && results.failed === 0) {
      this.log(`🎉 All prompts completed! Creating final commit...`);
      await this.commitToGit(results.completed, 'ALL-PROMPTS-COMPLETE');
    }
    
    if (results.failed > 0) {
      this.log(`⚠️  Processing stopped due to failure. Fix the failed prompt and resume with: npm run prompts`, 'warn');
    }
    
    return results;
  }

  showStatus() {
    const promptFiles = this.getPromptFiles();
    
    console.log('\n📊 Prompt Processing Status (Dependency Chain):');
    console.log('================================================');
    
    promptFiles.forEach((file, index) => {
      const status = this.status[file];
      const number = String(index + 1).padStart(2, '0');
      
      if (!status) {
        console.log(`${number}. ${file} - ⏸️  Not started`);
      } else if (status.blocked) {
        console.log(`${number}. ${file} - 🚫 Blocked: ${status.reason}`);
      } else if (status.completed && status.success) {
        const sections = status.totalSections ? ` (${status.completedSections}/${status.totalSections} sections)` : '';
        console.log(`${number}. ${file} - ✅ Completed${sections} (${status.finished})`);
      } else if (status.completed && !status.success) {
        const sections = status.totalSections ? ` (${status.completedSections}/${status.totalSections} sections)` : '';
        console.log(`${number}. ${file} - ❌ Failed${sections}: ${status.error}`);
      } else if (status.started) {
        const sections = status.totalSections ? ` (${status.completedSections || 0}/${status.totalSections} sections)` : '';
        console.log(`${number}. ${file} - 🔄 In progress${sections} (${status.started})`);
      } else {
        console.log(`${number}. ${file} - ❓ Unknown state`);
      }
    });
    
    const completed = Object.values(this.status).filter(s => s.completed && s.success).length;
    const failed = Object.values(this.status).filter(s => s.completed && !s.success).length;
    const blocked = Object.values(this.status).filter(s => s.blocked).length;
    
    console.log(`\nSummary: ${completed}/${promptFiles.length} completed, ${failed} failed, ${blocked} blocked`);
    
    if (failed > 0) {
      console.log(`\n⚠️  Fix failed prompts and run 'npm run prompts' to resume`);
    }
  }

  resetStatus() {
    if (fs.existsSync(this.statusFile)) {
      fs.unlinkSync(this.statusFile);
      this.log('🔄 Status file reset');
    }
    this.status = {};
  }

  clearBlocked() {
    const blockedCount = Object.values(this.status).filter(s => s.blocked).length;
    
    // Remove blocked status from all prompts
    Object.keys(this.status).forEach(file => {
      if (this.status[file].blocked) {
        delete this.status[file].blocked;
        delete this.status[file].reason;
        delete this.status[file].blockedAt;
      }
    });
    
    this.saveStatus();
    this.log(`🔓 Cleared blocked status from ${blockedCount} prompts`);
  }

  async commitToGit(promptsCompleted, lastPromptName) {
    try {
      this.log(`📤 Creating Git checkpoint after ${promptsCompleted} prompts...`);
      
      // Add all changes
      execSync('git add .', { cwd: process.cwd(), stdio: 'inherit' });
      
      // Create commit message
      const commitMessage = `feat: Complete prompts 1-${promptsCompleted} (${lastPromptName})

Auto-generated checkpoint after completing ${promptsCompleted} prompts.
Last completed: ${lastPromptName}

🤖 Generated with Auto Prompt Processor
Co-Authored-By: Claude <noreply@anthropic.com>`;

      // Write commit message to temp file to handle multiline properly
      const tempFile = path.join(__dirname, '..', 'temp-commit-msg.txt');
      fs.writeFileSync(tempFile, commitMessage);
      
      // Commit changes using file
      execSync(`git commit -F "${tempFile}"`, { 
        cwd: process.cwd(), 
        stdio: 'inherit' 
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
      // Push to origin (if remote exists)
      try {
        execSync('git push origin HEAD', { 
          cwd: process.cwd(), 
          stdio: 'inherit',
          timeout: 30000 // 30 second timeout
        });
        this.log(`✅ Successfully pushed checkpoint to GitHub`, 'success');
      } catch (pushError) {
        this.log(`⚠️  Committed locally but failed to push: ${pushError.message}`, 'warn');
      }
      
    } catch (error) {
      this.log(`❌ Git commit failed: ${error.message}`, 'error');
    }
  }
}

// CLI Interface
async function main() {
  const processor = new AutoPromptProcessor();
  const args = process.argv.slice(2);
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Auto Prompt Processor for Claude Code

Usage:
  node auto-prompt-processor.js [options]

Options:
  --status          Show current processing status
  --reset           Reset processing status completely
  --clear-blocked   Clear blocked status and allow resuming
  --help, -h        Show this help message

Examples:
  node auto-prompt-processor.js                    # Process all prompts (dependency mode)
  node auto-prompt-processor.js --status           # Show status only
  node auto-prompt-processor.js --reset            # Reset and start over
  node auto-prompt-processor.js --clear-blocked    # Clear blocked prompts after fixing issues

Note: Prompts have dependencies and must complete successfully in order.
      If a prompt fails, subsequent prompts will be blocked until the issue is fixed.
      `);
      return;
    }
    
    if (args.includes('--status')) {
      processor.showStatus();
      return;
    }
    
    if (args.includes('--reset')) {
      processor.resetStatus();
      console.log('✅ Status reset. Run again to start processing.');
      return;
    }
    
    if (args.includes('--clear-blocked')) {
      processor.clearBlocked();
      console.log('✅ Blocked status cleared. Run again to resume processing.');
      return;
    }
    
    // Start processing
    await processor.processAllPrompts();
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoPromptProcessor;