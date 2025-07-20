// Powered by OnSpace.AI
export const Config = {
  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.karatoken.com',
  
  // App Configuration
  APP_NAME: 'Karatoken',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_AI_SCORING: true,
  ENABLE_BATTLES: true,
  ENABLE_WALLET: true,
  ENABLE_NOTIFICATIONS: true,
  
  // Audio Configuration
  AUDIO_SAMPLE_RATE: 44100,
  AUDIO_CHANNELS: 1,
  AUDIO_BIT_DEPTH: 16,
  
  // Recording Configuration
  MAX_RECORDING_DURATION: 300, // 5 minutes in seconds
  MIN_RECORDING_DURATION: 30,  // 30 seconds
  
  // Scoring Configuration
  SCORING_WEIGHTS: {
    pitch: 0.4,
    rhythm: 0.3,
    timing: 0.2,
    energy: 0.1,
  },
  
  // Battle Configuration
  BATTLE_DURATION: 180, // 3 minutes
  MIN_BATTLE_PARTICIPANTS: 2,
  MAX_BATTLE_PARTICIPANTS: 10,
  
  // Wallet Configuration
  CRYPTO_SYMBOL: 'KRT',
  MIN_WITHDRAWAL: 100,
  TRANSACTION_FEE: 0.01, // 1%
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    AUTH_ERROR: 'Authentication failed. Please sign in again.',
    RECORDING_ERROR: 'Recording failed. Please try again.',
    SCORING_ERROR: 'Scoring failed. Please try again.',
    BATTLE_ERROR: 'Battle creation failed. Please try again.',
    WALLET_ERROR: 'Wallet operation failed. Please try again.',
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    RECORDING_SAVED: 'Recording saved successfully!',
    SCORE_CALCULATED: 'Score calculated successfully!',
    BATTLE_CREATED: 'Battle created successfully!',
    WALLET_UPDATED: 'Wallet updated successfully!',
  },
};