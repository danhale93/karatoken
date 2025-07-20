// Powered by OnSpace.AI
export const Config = {
  // App Settings
  APP_NAME: 'OnSpace Karaoke',
  VERSION: '1.0.0',
  
  // Mock/Demo Mode
  USE_MOCK_DATA: true,
  
  // API Configuration (for future real backend integration)
  API_BASE_URL: 'https://api.onspace-karaoke.com',
  
  // Demo User Credentials
  DEMO_CREDENTIALS: {
    email: 'demo@karatoken.com',
    password: 'demo123',
  },
  
  // Default KRT (Karaoke Token) Values
  DEFAULT_KRT_BALANCE: 1250,
  DAILY_CHALLENGE_REWARD: 100,
  BATTLE_WIN_REWARD: 50,
  PERFORMANCE_BASE_REWARD: 25,
  
  // Audio/Performance Settings
  RECORDING_QUALITY: 'high',
  MAX_RECORDING_DURATION: 300, // 5 minutes in seconds
  PITCH_DETECTION_SENSITIVITY: 0.8,
  
  // Social Features
  LEADERBOARD_PAGE_SIZE: 50,
  BATTLE_MATCH_TIMEOUT: 30000, // 30 seconds
  
  // UI Settings
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
};

export default Config;