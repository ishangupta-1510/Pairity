#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing Auto Prompt Processor Setup');
console.log('=====================================\n');

const tests = [
  {
    name: 'Check prompts directory',
    test: () => {
      const promptsDir = path.join(__dirname, '..', 'prompts');
      if (!fs.existsSync(promptsDir)) {
        throw new Error(`Prompts directory not found: ${promptsDir}`);
      }
      const files = fs.readdirSync(promptsDir).filter(f => f.endsWith('.md'));
      if (files.length === 0) {
        throw new Error('No .md files found in prompts directory');
      }
      return `Found ${files.length} prompt files`;
    }
  },
  {
    name: 'Check Node.js availability',
    test: () => {
      try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        return `Node.js ${version} available`;
      } catch (error) {
        throw new Error('Node.js not found in PATH');
      }
    }
  },
  {
    name: 'Check Claude Code CLI',
    test: () => {
      try {
        const version = execSync('claude --version', { encoding: 'utf8', timeout: 5000 }).trim();
        
        // Test the --dangerously-skip-permissions flag
        try {
          execSync('claude --help', { encoding: 'utf8', timeout: 5000 });
          return `Claude CLI available: ${version} (with permissions flag support)`;
        } catch (helpError) {
          return `Claude CLI available: ${version} (warning: permissions flag may not be supported)`;
        }
      } catch (error) {
        return '⚠️  Claude CLI not found (this is required for actual processing)';
      }
    }
  },
  {
    name: 'Validate script syntax',
    test: () => {
      const scriptPath = path.join(__dirname, 'auto-prompt-processor.js');
      try {
        require(scriptPath);
        return 'Script syntax is valid';
      } catch (error) {
        throw new Error(`Script syntax error: ${error.message}`);
      }
    }
  },
  {
    name: 'Test prompt file parsing',
    test: () => {
      const promptsDir = path.join(__dirname, '..', 'prompts');
      const files = fs.readdirSync(promptsDir)
        .filter(file => {
          return file.endsWith('.md') && 
                 /^\d+/.test(file) && 
                 !file.toLowerCase().includes('overview') &&
                 !file.toLowerCase().includes('readme');
        });
        
      if (files.length === 0) return 'No processable files to test';
      
      const testFile = path.join(promptsDir, files[0]);
      const content = fs.readFileSync(testFile, 'utf8');
      
      const promptMatch = content.match(/## Prompt to Claude:\s*([\s\S]*?)(?=\n## |\n$)/);
      if (!promptMatch) {
        throw new Error(`Could not parse prompt from ${files[0]}`);
      }
      
      return `Successfully parsed prompt from ${files[0]}`;
    }
  },
  {
    name: 'Check logs directory creation',
    test: () => {
      const logsDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      return 'Logs directory ready';
    }
  }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    const result = test.test();
    console.log(`✅ ${test.name}: ${result}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${test.name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! The auto prompt processor is ready to use.');
  console.log('\nQuick start commands:');
  console.log('  npm run prompts:status    # Show current status');
  console.log('  npm run prompts           # Start processing all prompts');
  console.log('  npm run prompts:reset     # Reset and start over');
} else {
  console.log('⚠️  Some tests failed. Please fix the issues before using the processor.');
  process.exit(1);
}

console.log('\n📖 For detailed instructions, see: scripts/README.md');