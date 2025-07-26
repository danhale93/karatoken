# Karatoken System Tests

This directory contains comprehensive tests to verify that all systems are properly wired up and running.

## Test Scripts

### 1. System Tests (`npm run test:system`)
Comprehensive end-to-end testing of all app components:
- ✅ Environment variables and configuration
- ✅ Supabase connection and database structure
- ✅ Authentication services
- ✅ AI music services (genre swap, vocal separation)
- ✅ YouTube integration
- ✅ Lyrics synchronization
- ✅ Backend API endpoints
- ✅ Full karaoke workflow integration

### 2. Backend Health Check (`npm run test:backend`)
Focused testing of backend API endpoints:
- 🏥 Main server health
- 🎵 Lyrics API
- ⚔️ Battle API
- 🤖 AI Genre Swap API
- 🎤 Vocal Isolation API
- 📺 YouTube Audio API

### 3. Database Tests (`npm run test:database`)
Supabase-specific connection and structure tests:
- 🔗 Database connectivity
- 🔐 Authentication system
- 📊 Table structure validation
- 🛡️ Row Level Security policies

### 4. Run All Tests (`npm run test:all`)
Executes all test suites in sequence.

## Prerequisites

### Backend Server
Make sure the backend server is running:
```bash
cd backend
npm install
npm start
```

The backend should be accessible at the URL configured in `app/config.ts`.

### Environment Variables
Ensure these are set in your `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Python Dependencies (for AI features)
Backend AI features require Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Running Tests

### Quick Health Check
```bash
npm run test:backend
```

### Full System Validation
```bash
npm run test:all
```

### Individual Test Suites
```bash
# Database only
npm run test:database

# Backend APIs only
npm run test:backend

# Complete system test
npm run test:system
```

## Understanding Test Results

### ✅ Green (PASS)
- Component is working correctly
- All expected functionality verified
- Ready for production use

### ⚠️ Yellow (WARNING)
- Component exists but has expected limitations
- May need additional configuration
- Partially functional

### ❌ Red (FAIL)
- Component has critical issues
- Requires immediate attention
- May block app functionality

## Common Issues and Solutions

### Backend Connection Failed
```
❌ Backend server not responding
```
**Solution:** 
1. Check that backend is running: `cd backend && npm start`
2. Verify `BASE_URL` in `app/config.ts` matches your backend
3. For device testing, use your computer's IP address

### Database Permission Denied
```
❌ permission denied for table profiles
```
**Solution:**
1. Check RLS policies in Supabase dashboard
2. Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Ensure tables have proper public access policies

### Python Dependencies Missing
```
❌ AI Genre Swap API structure exists (missing Python dependencies expected)
```
**Solution:**
```bash
cd backend
pip install demucs whisper torch torchaudio
```

### Authentication Issues
```
❌ Auth service sign up/in failed
```
**Solution:**
1. Check Supabase project status
2. Verify authentication is enabled in Supabase
3. Check email/password authentication settings

## Test Architecture

```
tests/
├── systemTests.ts          # Main comprehensive test suite
├── backendHealthCheck.ts   # Backend API health monitoring
├── supabaseConnectionTest.ts # Database connection tests
├── runTests.ts            # Test execution runner
└── README.md              # This documentation
```

## Adding New Tests

To add a new test to the system test suite:

```typescript
// In systemTests.ts
await this.runTest('Your New Test', this.testYourFeature);

private testYourFeature = async (): Promise<void> => {
  try {
    // Your test logic here
    console.log('  ✓ Feature working correctly');
  } catch (error) {
    throw new Error(`Your feature test failed: ${error}`);
  }
};
```

## Continuous Integration

These tests are designed to be run in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run System Tests
  run: npm run test:all
```

The tests will exit with code 0 on success and code 1 on failure, making them suitable for automated testing environments.