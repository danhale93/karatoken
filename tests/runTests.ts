import { systemTestRunner } from './systemTests';

async function runSystemTests() {
  console.log('🚀 Starting Karatoken System Tests...\n');
  
  try {
    const results = await systemTestRunner.runAllTests();
    
    // Return non-zero exit code if any tests failed
    const failedTests = results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log(`\n💥 ${failedTests.length} tests failed. System needs attention.`);
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! System is ready for karaoke action.');
      process.exit(0);
    }
  } catch (error) {
    console.error('💀 Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSystemTests();
}

export { runSystemTests };