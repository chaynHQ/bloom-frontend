#!/usr/bin/env node
/**
 * Check for ungrouped Cypress tests
 *
 * This script checks if any test files exist directly in the tests/ folder
 * instead of being organized into subfolders.
 *
 * Exit codes:
 * - 0: No ungrouped tests found
 * - 1: Ungrouped tests found
 */

const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, '../cypress/integration/tests');
const TEST_PATTERN = /\.cy\.(tsx?|jsx?)$/;

console.log('🔍 Checking for ungrouped Cypress tests...\n');

try {
  const items = fs.readdirSync(TESTS_DIR);

  const ungroupedTests = items.filter((item) => {
    const fullPath = path.join(TESTS_DIR, item);
    const isFile = fs.statSync(fullPath).isFile();
    const isTestFile = TEST_PATTERN.test(item);
    return isFile && isTestFile;
  });

  if (ungroupedTests.length === 0) {
    console.log('✅ All tests are properly organized into folders!\n');
    process.exit(0);
  }

  console.log(`⚠️  Found ${ungroupedTests.length} ungrouped test(s):\n`);

  ungroupedTests.forEach((test) => {
    console.log(`   - ${test}`);
  });

  console.log('\n📁 Please move these tests into the appropriate folder:');
  console.log('   - auth/              # Authentication & Registration');
  console.log('   - user-accounts/     # User account management');
  console.log('   - admin/             # Admin & partner management');
  console.log('   - user-content/      # User content (notes, activities, etc.)');
  console.log('   - partners/          # Partner experiences');
  console.log('   - public/            # Public-facing content');
  console.log('   - system/            # System functionality\n');

  console.log('💡 See cypress/integration/tests/README.md for details.\n');

  process.exit(1);
} catch (error) {
  console.error('❌ Error checking tests:', error.message);
  process.exit(1);
}
