import { ZEGO_CONFIG, USE_MOCK_ZEGO } from '../app/config';

interface ZegoTestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  timestamp: string;
}

class ZegoCloudTester {
  private results: ZegoTestResult[] = [];

  async runAllTests(): Promise<ZegoTestResult[]> {
    console.log('🎮 ZegoCloud Integration Tests\n');

    await this.testConfiguration();
    await this.testEnvironmentVariables();
    await this.testAppCredentials();
    await this.testServiceImplementation();
    await this.testBattleIntegration();
    await this.testDuetIntegration();

    this.printResults();
    return this.results;
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.results.push({
        name,
        status: 'PASS',
        message: 'Test completed successfully',
        timestamp: new Date().toISOString(),
      });
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({
        name,
        status: 'FAIL',
        message,
        timestamp: new Date().toISOString(),
      });
      console.error(`❌ ${name} - FAILED: ${message}`);
    }
  }

  private testConfiguration = async (): Promise<void> => {
    if (!ZEGO_CONFIG.appID || ZEGO_CONFIG.appID === 0) {
      throw new Error('ZEGO_CONFIG.appID is not properly configured');
    }

    if (!ZEGO_CONFIG.appSign || ZEGO_CONFIG.appSign.length < 10) {
      throw new Error('ZEGO_CONFIG.appSign is not properly configured');
    }

    // Verify the specific App ID from context
    if (ZEGO_CONFIG.appID !== 1073526291) {
      throw new Error(`Expected App ID 1073526291, got ${ZEGO_CONFIG.appID}`);
    }

    console.log(`  ✓ App ID: ${ZEGO_CONFIG.appID}`);
    console.log(`  ✓ App Sign: ${ZEGO_CONFIG.appSign.substring(0, 20)}...`);
    console.log(`  ✓ Scenario: ${ZEGO_CONFIG.scenario}`);
    console.log(`  ✓ Platform View: ${ZEGO_CONFIG.enablePlatformView}`);
  };

  private testEnvironmentVariables = async (): Promise<void> => {
    const zegoAppId = process.env.EXPO_PUBLIC_ZEGO_APP_ID;
    const zegoAppSign = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN;

    if (!zegoAppId && !zegoAppSign) {
      console.log('  ⚠️  Environment variables not set, using hardcoded values');
      return;
    }

    if (zegoAppId && parseInt(zegoAppId) !== 1073526291) {
      throw new Error(`Environment ZEGO_APP_ID mismatch: expected 1073526291, got ${zegoAppId}`);
    }

    if (zegoAppSign && zegoAppSign === 'your_app_sign_here') {
      throw new Error('ZEGO_APP_SIGN still has placeholder value');
    }

    console.log(`  ✓ Environment variables properly configured`);
  };

  private testAppCredentials = async (): Promise<void> => {
    // Test App ID format and validity
    const appIdStr = ZEGO_CONFIG.appID.toString();
    if (appIdStr.length !== 10) {
      throw new Error(`Invalid App ID format: ${appIdStr} (should be 10 digits)`);
    }

    // Test App Sign format (should be 64 character hex string)
    const appSignRegex = /^[a-f0-9]{64}$/i;
    if (!appSignRegex.test(ZEGO_CONFIG.appSign)) {
      throw new Error(`Invalid App Sign format: should be 64 character hex string`);
    }

    console.log('  ✓ App ID format valid (10 digits)');
    console.log('  ✓ App Sign format valid (64 character hex)');
  };

  private testServiceImplementation = async (): Promise<void> => {
    try {
      // Test that ZegoService can be imported
      const zegoService = await import('../services/zegoService');
      
      if (!zegoService.ZegoService) {
        throw new Error('ZegoService not properly exported');
      }

      console.log('  ✓ ZegoService properly imported');

      // Check if using mock or real service
      if (USE_MOCK_ZEGO) {
        console.log('  ⚠️  Using Mock ZegoService (App Sign not configured)');
        
        // Test mock service methods
        const mockService = await import('../services/mockZegoService');
        if (!mockService.MockZegoService) {
          throw new Error('MockZegoService not available');
        }
        console.log('  ✓ Mock ZegoService available for development');
      } else {
        console.log('  ✓ Using Real ZegoService with valid credentials');
        
        // Test real service methods
        const realService = await import('../services/realZegoService');
        if (!realService.RealZegoService) {
          throw new Error('RealZegoService not available');
        }
        console.log('  ✓ Real ZegoService properly configured');
      }
    } catch (error) {
      throw new Error(`Service implementation test failed: ${error}`);
    }
  };

  private testBattleIntegration = async (): Promise<void> => {
    try {
      // Test battle-specific ZegoCloud integration
      const battleComponent = await import('../app/zego-battle');
      
      if (!battleComponent.default) {
        throw new Error('Zego Battle component not properly exported');
      }

      console.log('  ✓ Zego Battle component accessible');

      // Test useZegoLive hook for battles
      const zegoHook = await import('../hooks/useZegoLive');
      
      if (!zegoHook.useZegoLive) {
        throw new Error('useZegoLive hook not available');
      }

      console.log('  ✓ useZegoLive hook available for battle integration');
    } catch (error) {
      throw new Error(`Battle integration test failed: ${error}`);
    }
  };

  private testDuetIntegration = async (): Promise<void> => {
    try {
      // Test duet-specific ZegoCloud integration
      const duetComponent = await import('../app/zego-duet');
      
      if (!duetComponent.default) {
        throw new Error('Zego Duet component not properly exported');
      }

      console.log('  ✓ Zego Duet component accessible');

      // Test ZegoLiveRoom component
      const liveRoomComponent = await import('../components/ZegoLiveRoom');
      
      if (!liveRoomComponent.default) {
        throw new Error('ZegoLiveRoom component not available');
      }

      console.log('  ✓ ZegoLiveRoom component available for duet integration');
    } catch (error) {
      throw new Error(`Duet integration test failed: ${error}`);
    }
  };

  private printResults(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('🎮 ZEGOCLOUD INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.name}: ${result.message}`);
        });
    }

    console.log('\n🎯 ZEGOCLOUD STATUS:');
    console.log(`  App ID: ${ZEGO_CONFIG.appID} ${ZEGO_CONFIG.appID === 1073526291 ? '✅' : '❌'}`);
    console.log(`  App Sign: Configured ${ZEGO_CONFIG.appSign.length === 64 ? '✅' : '❌'}`);
    console.log(`  Service Type: ${USE_MOCK_ZEGO ? 'Mock (Development)' : 'Real (Production)'} ${USE_MOCK_ZEGO ? '⚠️' : '✅'}`);
    console.log(`  Battle Ready: ${this.results.find(r => r.name.includes('Battle'))?.status === 'PASS' ? '✅' : '❌'}`);
    console.log(`  Duet Ready: ${this.results.find(r => r.name.includes('Duet'))?.status === 'PASS' ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(60));
  }
}

export const zegoCloudTester = new ZegoCloudTester();