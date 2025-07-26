#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Karatoken System Test Runner');
console.log('================================\n');

// Change to project root
process.chdir(path.join(__dirname, '..'));

// Run TypeScript compilation and tests
const command = 'npx ts-node tests/runTests.ts';

console.log('📦 Compiling and running tests...\n');

exec(command, (error, stdout, stderr) => {
  if (stdout) {
    console.log(stdout);
  }
  
  if (stderr) {
    console.error('STDERR:', stderr);
  }
  
  if (error) {
    console.error(`\n💥 Test execution failed: ${error.message}`);
    process.exit(1);
  }
});