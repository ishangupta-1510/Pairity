#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_EXAMPLE = path.join(__dirname, '..', '.env.example');
const ENV_DEVELOPMENT = path.join(__dirname, '..', '.env.development');
const ENV_PRODUCTION = path.join(__dirname, '..', '.env.production');

console.log('🚀 Pairity Environment Setup\n');

// Check if .env files already exist
const checkExistingFiles = () => {
  const files = [];
  if (fs.existsSync(ENV_DEVELOPMENT)) files.push('.env.development');
  if (fs.existsSync(ENV_PRODUCTION)) files.push('.env.production');
  
  if (files.length > 0) {
    console.log('⚠️  The following environment files already exist:');
    files.forEach(file => console.log(`   - ${file}`));
    console.log('\n');
    
    rl.question('Do you want to overwrite them? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        setupEnvironment();
      } else {
        console.log('✅ Setup cancelled. Existing files preserved.');
        rl.close();
      }
    });
  } else {
    setupEnvironment();
  }
};

const setupEnvironment = () => {
  if (!fs.existsSync(ENV_EXAMPLE)) {
    console.error('❌ Error: .env.example file not found!');
    console.log('Please ensure .env.example exists in the root directory.');
    rl.close();
    process.exit(1);
  }

  console.log('Creating environment files from .env.example...\n');

  try {
    // Copy .env.example to .env.development
    fs.copyFileSync(ENV_EXAMPLE, ENV_DEVELOPMENT);
    console.log('✅ Created .env.development');

    // Copy .env.example to .env.production
    fs.copyFileSync(ENV_EXAMPLE, ENV_PRODUCTION);
    console.log('✅ Created .env.production');

    console.log('\n📝 Next steps:');
    console.log('1. Update .env.development with your development API endpoints and keys');
    console.log('2. Update .env.production with your production API endpoints and keys');
    console.log('3. NEVER commit these files to source control!');
    console.log('\n🔒 Security reminder:');
    console.log('   - Keep your API keys and secrets secure');
    console.log('   - Use different keys for development and production');
    console.log('   - Rotate keys regularly');
    console.log('\n✨ Environment setup complete!');
  } catch (error) {
    console.error('❌ Error creating environment files:', error.message);
    process.exit(1);
  }

  rl.close();
};

// Start the setup process
checkExistingFiles();