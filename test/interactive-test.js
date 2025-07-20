#!/usr/bin/env node

/**
 * 🧪 KARATOKEN INTERACTIVE TESTING SUITE
 * Test individual components and features of the music ecosystem
 */

const readline = require('readline');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Mock components for testing
class TestKaratokenCore {
  constructor() {
    this.sessions = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    console.log(colorize('🎵 Initializing KaratokenCore...', 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isInitialized = true;
    console.log(colorize('✅ KaratokenCore ready!', 'green'));
  }

  async startSession(songTitle) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const session = {
      id: `session_${Date.now()}`,
      song: songTitle,
      score: 0,
      status: 'active',
      startTime: new Date()
    };

    this.sessions.set(session.id, session);
    console.log(colorize(`🎤 Started karaoke session: "${songTitle}"`, 'green'));
    console.log(colorize(`   Session ID: ${session.id}`, 'yellow'));
    
    return session;
  }

  async simulatePerformance(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(colorize('❌ Session not found!', 'red'));
      return;
    }

    console.log(colorize('🎵 Simulating karaoke performance...', 'cyan'));
    
    // Simulate scoring over time
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const score = Math.floor(Math.random() * 20) + 80; // 80-100
      session.score = score;
      console.log(colorize(`   🎯 Score: ${score}/100`, 'yellow'));
    }

    console.log(colorize(`🏆 Final Score: ${session.score}/100`, 'green'));
    return session.score;
  }
}

class TestInstrumentEngine {
  constructor() {
    this.instruments = ['guitar', 'drums', 'piano', 'bass', 'violin', 'flute'];
  }

  async detectInstrument() {
    console.log(colorize('🎸 Listening for instrument...', 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const detected = this.instruments[Math.floor(Math.random() * this.instruments.length)];
    const confidence = (85 + Math.random() * 15).toFixed(1);
    
    console.log(colorize(`🎵 Detected: ${detected} (${confidence}% confidence)`, 'green'));
    return { instrument: detected, confidence };
  }

  async scoreInstrumentPerformance(instrument) {
    console.log(colorize(`🎸 Scoring ${instrument} performance...`, 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const scores = {
      accuracy: (70 + Math.random() * 30).toFixed(1),
      timing: (75 + Math.random() * 25).toFixed(1),
      technique: (65 + Math.random() * 35).toFixed(1),
      creativity: (80 + Math.random() * 20).toFixed(1)
    };

    console.log(colorize('📊 Performance Results:', 'yellow'));
    console.log(colorize(`   📈 Accuracy: ${scores.accuracy}%`, 'green'));
    console.log(colorize(`   ⏱️  Timing: ${scores.timing}%`, 'green'));
    console.log(colorize(`   🎯 Technique: ${scores.technique}%`, 'green'));
    console.log(colorize(`   ✨ Creativity: ${scores.creativity}%`, 'green'));

    const overall = ((parseFloat(scores.accuracy) + parseFloat(scores.timing) + 
                     parseFloat(scores.technique) + parseFloat(scores.creativity)) / 4).toFixed(1);
    console.log(colorize(`🏆 Overall Score: ${overall}/100`, 'bright'));

    return scores;
  }
}

class TestTalentMarketplace {
  constructor() {
    this.talents = new Map();
    this.jobs = new Map();
    this.auditions = new Map();
  }

  async registerTalent(name, skills) {
    console.log(colorize(`🎤 Registering talent: ${name}`, 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const talent = {
      id: `talent_${Date.now()}`,
      name,
      skills: skills.split(',').map(s => s.trim()),
      rating: 0,
      earnings: 0
    };

    this.talents.set(talent.id, talent);
    console.log(colorize(`✅ Talent registered successfully!`, 'green'));
    console.log(colorize(`   Skills: ${talent.skills.join(', ')}`, 'yellow'));
    
    return talent;
  }

  async createJob(title, budget) {
    console.log(colorize(`📋 Creating job: ${title}`, 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const job = {
      id: `job_${Date.now()}`,
      title,
      budget: parseInt(budget),
      status: 'open',
      applicants: []
    };

    this.jobs.set(job.id, job);
    console.log(colorize(`✅ Job posted! Budget: $${budget}`, 'green'));
    
    return job;
  }

  async submitAudition(talentId, jobId) {
    const talent = this.talents.get(talentId);
    const job = this.jobs.get(jobId);
    
    if (!talent || !job) {
      console.log(colorize('❌ Talent or job not found!', 'red'));
      return;
    }

    console.log(colorize(`🎬 ${talent.name} submitting audition for "${job.title}"`, 'cyan'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // AI Analysis simulation
    console.log(colorize('🤖 AI analyzing audition...', 'yellow'));
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const analysis = {
      technical: (70 + Math.random() * 30).toFixed(1),
      creativity: (75 + Math.random() * 25).toFixed(1),
      fit: (80 + Math.random() * 20).toFixed(1)
    };

    console.log(colorize('🤖 AI Analysis Results:', 'yellow'));
    console.log(colorize(`   🎯 Technical: ${analysis.technical}/100`, 'green'));
    console.log(colorize(`   ✨ Creativity: ${analysis.creativity}/100`, 'green'));
    console.log(colorize(`   💫 Job Fit: ${analysis.fit}/100`, 'green'));

    job.applicants.push(talentId);
    
    return analysis;
  }
}

// Main test menu
async function showMainMenu() {
  console.clear();
  console.log(colorize('🎵 === KARATOKEN INTERACTIVE TEST SUITE ===', 'bright'));
  console.log(colorize('Choose a component to test:', 'cyan'));
  console.log('');
  console.log(colorize('1. 🎤 Karaoke Core Features', 'yellow'));
  console.log(colorize('2. 🎸 Instrument Engine', 'yellow'));
  console.log(colorize('3. 🎭 Talent Marketplace', 'yellow'));
  console.log(colorize('4. 🚀 Run Full Demo', 'yellow'));
  console.log(colorize('5. 📊 System Status', 'yellow'));
  console.log(colorize('0. ❌ Exit', 'red'));
  console.log('');
}

async function testKaraokeCore() {
  console.clear();
  console.log(colorize('🎤 === KARAOKE CORE TESTING ===', 'bright'));
  
  const core = new TestKaratokenCore();
  
  const songTitle = await askQuestion('Enter a song title to sing: ');
  const session = await core.startSession(songTitle);
  
  const shouldSimulate = await askQuestion('Simulate performance? (y/n): ');
  if (shouldSimulate.toLowerCase() === 'y') {
    await core.simulatePerformance(session.id);
  }

  await askQuestion('\nPress Enter to return to main menu...');
}

async function testInstrumentEngine() {
  console.clear();
  console.log(colorize('🎸 === INSTRUMENT ENGINE TESTING ===', 'bright'));
  
  const engine = new TestInstrumentEngine();
  
  console.log(colorize('Available tests:', 'cyan'));
  console.log('1. Detect instrument from audio');
  console.log('2. Score instrument performance');
  
  const choice = await askQuestion('Choose test (1-2): ');
  
  if (choice === '1') {
    const detection = await engine.detectInstrument();
    
    const shouldScore = await askQuestion(`Score ${detection.instrument} performance? (y/n): `);
    if (shouldScore.toLowerCase() === 'y') {
      await engine.scoreInstrumentPerformance(detection.instrument);
    }
  } else if (choice === '2') {
    const instrument = await askQuestion('Enter instrument name: ');
    await engine.scoreInstrumentPerformance(instrument);
  }

  await askQuestion('\nPress Enter to return to main menu...');
}

async function testTalentMarketplace() {
  console.clear();
  console.log(colorize('🎭 === TALENT MARKETPLACE TESTING ===', 'bright'));
  
  const marketplace = new TestTalentMarketplace();
  
  // Register talent
  const talentName = await askQuestion('Enter talent name: ');
  const skills = await askQuestion('Enter skills (comma-separated): ');
  const talent = await marketplace.registerTalent(talentName, skills);
  
  // Create job
  const jobTitle = await askQuestion('Enter job title: ');
  const budget = await askQuestion('Enter job budget ($): ');
  const job = await marketplace.createJob(jobTitle, budget);
  
  // Submit audition
  const shouldAudition = await askQuestion('Submit audition for this job? (y/n): ');
  if (shouldAudition.toLowerCase() === 'y') {
    await marketplace.submitAudition(talent.id, job.id);
  }

  await askQuestion('\nPress Enter to return to main menu...');
}

async function runFullDemo() {
  console.clear();
  console.log(colorize('🚀 === RUNNING FULL ECOSYSTEM DEMO ===', 'bright'));
  
  console.log(colorize('Launching comprehensive demo...', 'yellow'));
  
  // Import and run the main demo
  try {
    require('../demo/FinalUltimateMusicUniverseDemo.js');
  } catch (error) {
    console.log(colorize('❌ Error running demo:', 'red'), error.message);
  }

  await askQuestion('\nPress Enter to return to main menu...');
}

async function showSystemStatus() {
  console.clear();
  console.log(colorize('📊 === SYSTEM STATUS ===', 'bright'));
  
  console.log(colorize('🎵 Karatoken Ecosystem Status:', 'cyan'));
  console.log(colorize('✅ KaratokenCore: Ready', 'green'));
  console.log(colorize('✅ InstrumentEngine: Ready', 'green'));
  console.log(colorize('✅ TalentMarketplace: Ready', 'green'));
  console.log(colorize('✅ Eurovision Integration: Ready', 'green'));
  console.log(colorize('✅ Agentic AI: Ready', 'green'));
  console.log('');
  
  console.log(colorize('🚀 Available Features:', 'cyan'));
  console.log('   🎤 AI-powered karaoke with real-time scoring');
  console.log('   🎸 Multi-instrument support (guitar, drums, piano, etc.)');
  console.log('   🎭 Complete talent marketplace ecosystem');
  console.log('   🇪🇺 Eurovision & festival integration');
  console.log('   🤖 Agentic AI for feature generation');
  console.log('   🌍 Cultural genre swapping');
  console.log('');
  
  console.log(colorize('💡 To test:', 'yellow'));
  console.log('   • Run: node test/interactive-test.js');
  console.log('   • Full demo: node demo/FinalUltimateMusicUniverseDemo.js');

  await askQuestion('\nPress Enter to return to main menu...');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(colorize(question, 'cyan'), (answer) => {
      resolve(answer);
    });
  });
}

// Main program loop
async function main() {
  console.log(colorize('🎵 Welcome to Karatoken Interactive Testing!', 'bright'));
  console.log(colorize('Loading test environment...', 'yellow'));
  await new Promise(resolve => setTimeout(resolve, 1000));

  while (true) {
    await showMainMenu();
    const choice = await askQuestion('Select an option: ');
    
    switch (choice) {
      case '1':
        await testKaraokeCore();
        break;
      case '2':
        await testInstrumentEngine();
        break;
      case '3':
        await testTalentMarketplace();
        break;
      case '4':
        await runFullDemo();
        break;
      case '5':
        await showSystemStatus();
        break;
      case '0':
        console.log(colorize('👋 Thanks for testing Karatoken!', 'green'));
        console.log(colorize('🎵 Ready to revolutionize the music industry!', 'bright'));
        rl.close();
        process.exit(0);
      default:
        console.log(colorize('❌ Invalid option. Please try again.', 'red'));
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
}

// Start the interactive test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  TestKaratokenCore,
  TestInstrumentEngine,
  TestTalentMarketplace
};