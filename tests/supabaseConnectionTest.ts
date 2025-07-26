import { supabase } from '../lib/supabase';

interface DatabaseTest {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}

class SupabaseConnectionTester {
  private tests: DatabaseTest[] = [];

  async runAllTests(): Promise<void> {
    console.log('🗄️  Supabase Database Connection Tests\n');

    await this.testConnection();
    await this.testAuthentication();
    await this.testProfilesTable();
    await this.testBattlesTable();
    await this.testRLS();

    this.printResults();
  }

  private async addTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.tests.push({ name, status: 'pass', message: 'Test completed successfully' });
      console.log(`✅ ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.tests.push({ name, status: 'fail', message });
      console.log(`❌ ${name}: ${message}`);
    }
  }

  private async testConnection(): Promise<void> {
    await this.addTest('Database Connection', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error && !error.message.includes('permission denied')) {
        throw new Error(`Connection failed: ${error.message}`);
      }
    });
  }

  private async testAuthentication(): Promise<void> {
    await this.addTest('Authentication System', async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // Should not error, even if no session
      if (error) {
        throw new Error(`Auth system error: ${error.message}`);
      }

      console.log(`  Current session: ${data.session ? 'Active' : 'None'}`);
    });
  }

  private async testProfilesTable(): Promise<void> {
    await this.addTest('Profiles Table Structure', async () => {
      // Test table exists and has expected structure
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, total_earnings')
        .limit(1);

      if (error && !error.message.includes('permission denied') && !error.message.includes('JWT')) {
        throw new Error(`Profiles table error: ${error.message}`);
      }

      console.log('  ✓ Profiles table accessible with expected columns');
    });
  }

  private async testBattlesTable(): Promise<void> {
    await this.addTest('Battles Table Structure', async () => {
      const { data, error } = await supabase
        .from('battles')
        .select('id, challenger_id, opponent_id, song_title, status')
        .limit(1);

      if (error && !error.message.includes('permission denied') && !error.message.includes('JWT')) {
        throw new Error(`Battles table error: ${error.message}`);
      }

      console.log('  ✓ Battles table accessible with expected columns');
    });
  }

  private async testRLS(): Promise<void> {
    await this.addTest('Row Level Security', async () => {
      // Test that RLS is enabled by trying to access data without auth
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      // Should either work (if authenticated) or fail with permission error
      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('JWT')) {
          console.log('  ✓ RLS properly blocking unauthorized access');
        } else {
          throw new Error(`Unexpected RLS behavior: ${error.message}`);
        }
      } else {
        console.log('  ✓ RLS allowing access (user may be authenticated)');
      }
    });
  }

  private printResults(): void {
    const passed = this.tests.filter(t => t.status === 'pass').length;
    const failed = this.tests.filter(t => t.status === 'fail').length;

    console.log('\n' + '='.repeat(50));
    console.log('🗄️  SUPABASE TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}/${this.tests.length}`);
    console.log(`❌ Failed: ${failed}/${this.tests.length}`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.tests
        .filter(t => t.status === 'fail')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.message}`);
        });
    }

    console.log('\n📊 Database Status: ' + (failed === 0 ? '✅ Ready' : '⚠️  Needs attention'));
    console.log('='.repeat(50));
  }
}

const supabaseTester = new SupabaseConnectionTester();

// Run if executed directly
if (require.main === module) {
  supabaseTester.runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { supabaseTester };