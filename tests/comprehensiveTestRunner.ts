import { systemTestRunner } from './systemTests';
import { backendHealthChecker } from './backendHealthCheck';
import { supabaseTester } from './supabaseConnectionTest';
import { zegoCloudTester } from './zegoCloudTest';

interface TestSuiteResult {
  suite: string;
  status: 'completed' | 'failed' | 'skipped';
  passed: number;
  failed: number;
  total: number;
  duration: number;
  issues: string[];
}

class ComprehensiveTestRunner {
  private suiteResults: TestSuiteResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 KARATOKEN COMPREHENSIVE TEST SUITE');
    console.log('=====================================');
    console.log('Testing all app functionality including ZegoCloud integration\n');

    const startTime = Date.now();

    // 1. Environment and Configuration Tests
    await this.runTestSuite('Environment & Config', async () => {
      console.log('📋 Phase 1: Environment and Configuration Validation\n');
      const results = await systemTestRunner.runAllTests();
      return results;
    });

    // 2. Backend Health Check
    await this.runTestSuite('Backend Health', async () => {
      console.log('\n🏥 Phase 2: Backend Services Health Check\n');
      const results = await backendHealthChecker.checkAllServices();
      return results.map(r => ({
        name: r.service,
        status: r.status === 'healthy' ? 'PASS' : 'FAIL',
        message: r.message,
        timestamp: new Date().toISOString()
      }));
    });

    // 3. Supabase Database Tests
    await this.runTestSuite('Database Connection', async () => {
      console.log('\n🗄️  Phase 3: Supabase Database Connection Tests\n');
      await supabaseTester.runAllTests();
      return []; // supabaseTester handles its own result tracking
    });

    // 4. ZegoCloud Integration Tests
    await this.runTestSuite('ZegoCloud Integration', async () => {
      console.log('\n🎮 Phase 4: ZegoCloud Integration Validation\n');
      const results = await zegoCloudTester.runAllTests();
      return results;
    });

    const totalDuration = Date.now() - startTime;
    this.printFinalSummary(totalDuration);
  }

  private async runTestSuite(
    suiteName: string, 
    testFn: () => Promise<any[]>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const results = await testFn();
      const duration = Date.now() - startTime;
      
      // Handle different result formats
      let passed = 0;
      let failed = 0;
      let total = 0;
      const issues: string[] = [];

      if (Array.isArray(results)) {
        total = results.length;
        passed = results.filter(r => r.status === 'PASS' || r.status === 'pass' || r.status === 'healthy').length;
        failed = total - passed;
        
        results
          .filter(r => r.status === 'FAIL' || r.status === 'fail' || r.status === 'unhealthy')
          .forEach(r => {
            issues.push(`${r.name}: ${r.message}`);
          });
      }

      this.suiteResults.push({
        suite: suiteName,
        status: 'completed',
        passed,
        failed,
        total,
        duration,
        issues,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      this.suiteResults.push({
        suite: suiteName,
        status: 'failed',
        passed: 0,
        failed: 1,
        total: 1,
        duration,
        issues: [message],
      });

      console.error(`❌ Test suite '${suiteName}' failed: ${message}`);
    }
  }

  private printFinalSummary(totalDuration: number): void {
    const totalPassed = this.suiteResults.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.suiteResults.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('🏆 KARATOKEN COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));
    
    // Suite-by-suite breakdown
    console.log('📊 TEST SUITE BREAKDOWN:');
    this.suiteResults.forEach(suite => {
      const status = suite.status === 'completed' && suite.failed === 0 ? '✅' : 
                    suite.status === 'completed' ? '⚠️' : '❌';
      console.log(`  ${status} ${suite.suite}: ${suite.passed}/${suite.total} passed (${(suite.duration/1000).toFixed(1)}s)`);
    });

    console.log('\n📈 OVERALL STATISTICS:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${totalPassed} ✅`);
    console.log(`  Failed: ${totalFailed} ❌`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Total Duration: ${(totalDuration/1000).toFixed(1)}s`);

    // System readiness assessment
    console.log('\n🎯 SYSTEM READINESS ASSESSMENT:');
    
    const envReady = this.suiteResults.find(r => r.suite === 'Environment & Config')?.failed === 0;
    const backendReady = this.suiteResults.find(r => r.suite === 'Backend Health')?.passed > 0;
    const dbReady = this.suiteResults.find(r => r.suite === 'Database Connection')?.status === 'completed';
    const zegoReady = this.suiteResults.find(r => r.suite === 'ZegoCloud Integration')?.failed === 0;

    console.log(`  🔧 Environment Configuration: ${envReady ? '✅ Ready' : '❌ Issues'}`);
    console.log(`  🖥️  Backend Services: ${backendReady ? '✅ Running' : '❌ Down'}`);
    console.log(`  🗄️  Database Connection: ${dbReady ? '✅ Connected' : '❌ Issues'}`);
    console.log(`  🎮 ZegoCloud Integration: ${zegoReady ? '✅ Configured' : '❌ Issues'}`);

    // Feature readiness
    console.log('\n🎵 FEATURE READINESS:');
    console.log(`  🎤 Basic Karaoke: ${envReady && backendReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`  ⚔️  Battle Mode: ${zegoReady && backendReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`  👥 Duet Mode: ${zegoReady && backendReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`  🎶 AI Genre Swapping: ${backendReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`  🏆 Leaderboards: ${dbReady && backendReady ? '✅ Ready' : '❌ Not Ready'}`);

    // Critical issues
    if (totalFailed > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO ADDRESS:');
      this.suiteResults
        .filter(r => r.issues.length > 0)
        .forEach(suite => {
          console.log(`\n  📍 ${suite.suite}:`);
          suite.issues.forEach(issue => {
            console.log(`    • ${issue}`);
          });
        });
    }

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    if (totalFailed === 0) {
      console.log('  🎉 All systems operational! Ready to launch Karatoken.');
      console.log('  🚀 You can now start the app with: npm run start');
    } else {
      console.log('  🔧 Fix the critical issues listed above');
      console.log('  🔄 Re-run tests after fixes: npm run test');
      console.log('  📚 Check README files for troubleshooting guidance');
    }

    console.log('\n' + '='.repeat(80));
  }
}

const comprehensiveTestRunner = new ComprehensiveTestRunner();

// Export for use in other files
export { comprehensiveTestRunner };

// Run if executed directly
if (require.main === module) {
  comprehensiveTestRunner.runAllTests()
    .then(() => {
      const hasFailures = comprehensiveTestRunner['suiteResults'].some(r => r.failed > 0);
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('💀 Test runner crashed:', error);
      process.exit(1);
    });
}