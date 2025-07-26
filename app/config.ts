// Set your backend base URL here. Use your computer's LAN IP for device testing, e.g. 'http://192.168.1.100:3000'
export const BASE_URL = 'http://192.168.1.134:3000';

// ZegoCloud Configuration
export const ZEGO_CONFIG = {
  appID: parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || '1073526291'),
  appSign: process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || '952bf2fdc875692e336751aacaaeae13926141824613e39970e50aad709368e7',
  scenario: 0, // General scenario
  enablePlatformView: true,
};

// Determine if we should use mock service
export const USE_MOCK_ZEGO = !process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || process.env.EXPO_PUBLIC_ZEGO_APP_SIGN === 'your_app_sign_here';
