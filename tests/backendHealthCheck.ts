import { BASE_URL } from '../app/config';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message: string;
  responseTime?: number;
}

class BackendHealthChecker {
  private results: HealthCheckResult[] = [];

  async checkAllServices(): Promise<HealthCheckResult[]> {
    console.log('🏥 Backend Health Check Starting...\n');

    await this.checkMainServer();
    await this.checkLyricsAPI();
    await this.checkBattleAPI();
    await this.checkAIGenreSwapAPI();
    await this.checkVocalIsolationAPI();
    await this.checkYouTubeAPI();

    this.printHealthSummary();
    return this.results;
  }

  private async checkService(
    serviceName: string,
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.results.push({
          service: serviceName,
          status: 'healthy',
          message: `Responding normally (${response.status})`,
          responseTime,
        });
        console.log(`✅ ${serviceName}: Healthy (${responseTime}ms)`);
      } else {
        const errorText = await response.text();
        this.results.push({
          service: serviceName,
          status: 'unhealthy',
          message: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
          responseTime,
        });
        console.log(`⚠️  ${serviceName}: Unhealthy (${response.status}) - ${responseTime}ms`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      this.results.push({
        service: serviceName,
        status: 'unknown',
        message: `Connection failed: ${message}`,
        responseTime,
      });
      console.log(`❌ ${serviceName}: Connection failed (${responseTime}ms)`);
    }
  }

  private async checkMainServer(): Promise<void> {
    await this.checkService('Main Server', '/');
  }

  private async checkLyricsAPI(): Promise<void> {
    await this.checkService(
      'Lyrics API',
      '/api/lyrics/fetch',
      'POST',
      { youtubeUrl: 'https://www.youtube.com/watch?v=test' }
    );
  }

  private async checkBattleAPI(): Promise<void> {
    // Check battle creation
    await this.checkService(
      'Battle API - Create',
      '/api/battle/create',
      'POST',
      { userIds: ['test1', 'test2'], songId: 'test-song' }
    );
  }

  private async checkAIGenreSwapAPI(): Promise<void> {
    await this.checkService(
      'AI Genre Swap API',
      '/api/ai/genre-swap',
      'POST',
      { youtubeUrl: 'https://www.youtube.com/watch?v=test', targetGenre: 'rock' }
    );
  }

  private async checkVocalIsolationAPI(): Promise<void> {
    await this.checkService(
      'Vocal Isolation API',
      '/api/ai/vocal-isolate',
      'POST',
      { youtubeUrl: 'https://www.youtube.com/watch?v=test' }
    );
  }

  private async checkYouTubeAPI(): Promise<void> {
    await this.checkService(
      'YouTube Audio API',
      '/api/youtube/extract-audio',
      'POST',
      { youtubeUrl: 'https://www.youtube.com/watch?v=test' }
    );
  }

  private printHealthSummary(): void {
    const healthy = this.results.filter(r => r.status === 'healthy').length;
    const unhealthy = this.results.filter(r => r.status === 'unhealthy').length;
    const unknown = this.results.filter(r => r.status === 'unknown').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('🏥 BACKEND HEALTH SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Healthy: ${healthy}/${total}`);
    console.log(`⚠️  Unhealthy: ${unhealthy}/${total}`);
    console.log(`❌ Unknown: ${unknown}/${total}`);

    const avgResponseTime = this.results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      this.results.filter(r => r.responseTime).length;

    console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

    if (unhealthy > 0 || unknown > 0) {
      console.log('\n🚨 ISSUES DETECTED:');
      this.results
        .filter(r => r.status !== 'healthy')
        .forEach(result => {
          console.log(`  ❌ ${result.service}: ${result.message}`);
        });
    }

    console.log('\n📋 RECOMMENDATIONS:');
    if (unknown > 0) {
      console.log('  • Check that the backend server is running on ' + BASE_URL);
      console.log('  • Verify network connectivity');
      console.log('  • Update BASE_URL in app/config.ts if needed');
    }
    if (unhealthy > 0) {
      console.log('  • Check backend logs for specific API errors');
      console.log('  • Verify Python dependencies are installed');
      console.log('  • Check that all required environment variables are set');
    }

    console.log('\n' + '='.repeat(60));
  }
}

export const backendHealthChecker = new BackendHealthChecker();

// Run health check if this file is executed directly
if (require.main === module) {
  backendHealthChecker.checkAllServices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}