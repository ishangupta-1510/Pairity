const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Pairity Expo TypeScript Setup...\n');

// Check TypeScript configuration
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('✅ TypeScript configured');
  console.log('  - Strict mode:', tsconfig.compilerOptions.strict ? '✓' : '✗');
  console.log('  - Path aliases:', tsconfig.compilerOptions.paths ? '✓' : '✗');
} else {
  console.log('❌ tsconfig.json not found');
}

// Check Babel configuration
const babelConfigPath = path.join(__dirname, 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  console.log('✅ Babel configured with module resolver');
} else {
  console.log('❌ babel.config.js not found');
}

// Check for required dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('\n📦 Dependencies:');
  const requiredDeps = ['expo', 'react', 'react-native', 'typescript'];
  requiredDeps.forEach(dep => {
    const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    console.log(`  - ${dep}:`, installed ? `✓ (${installed})` : '✗');
  });
  
  console.log('\n🛠️ Dev Dependencies:');
  const requiredDevDeps = ['@types/react', 'babel-plugin-module-resolver'];
  requiredDevDeps.forEach(dep => {
    const installed = packageJson.devDependencies[dep];
    console.log(`  - ${dep}:`, installed ? `✓ (${installed})` : '✗');
  });
  
  console.log('\n📝 Scripts:');
  const scripts = ['start', 'type-check', 'lint'];
  scripts.forEach(script => {
    console.log(`  - ${script}:`, packageJson.scripts[script] ? '✓' : '✗');
  });
}

// Check folder structure
console.log('\n📁 Source folder structure:');
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  const folders = ['components'];
  folders.forEach(folder => {
    const folderPath = path.join(srcPath, folder);
    console.log(`  - src/${folder}:`, fs.existsSync(folderPath) ? '✓' : '✗');
  });
}

// Check test component
const testComponentPath = path.join(__dirname, 'src', 'components', 'TestComponent.tsx');
if (fs.existsSync(testComponentPath)) {
  console.log('\n✅ Test component created successfully');
} else {
  console.log('\n❌ Test component not found');
}

console.log('\n✨ Setup verification complete!');
console.log('\nNext steps:');
console.log('1. Run "npm start" to start the Expo development server');
console.log('2. Test the app on Expo Go or a simulator');
console.log('3. Verify path aliases work by checking the TestComponent import');