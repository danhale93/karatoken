import { USE_MOCK_ZEGO } from '../app/config';

// Conditional service selection with proper imports
let zegoService: any;
let ZegoRoom: any;
let ZegoUser: any;
let ZegoStream: any;
let ZegoRoomState: any;
let ZegoPublisherState: any;
let ZegoPlayerState: any;

if (USE_MOCK_ZEGO) {
  // Use mock service when ZegoCloud credentials are not properly configured
  console.log('Using Mock ZegoCloud Service - Configure EXPO_PUBLIC_ZEGO_APP_SIGN to use real service');
  
  const mockService = require('./mockZegoService');
  zegoService = mockService.zegoService;
  ZegoRoom = mockService.ZegoRoom;
  ZegoUser = mockService.ZegoUser;
  ZegoStream = mockService.ZegoStream;
  ZegoRoomState = mockService.ZegoRoomState;
  ZegoPublisherState = mockService.ZegoPublisherState;
  ZegoPlayerState = mockService.ZegoPlayerState;
} else {
  // Use real ZegoCloud service when properly configured
  console.log('Using Real ZegoCloud Service with App ID: 1073526291');
  
  const realService = require('./realZegoService');
  zegoService = realService.realZegoService;
  ZegoRoom = realService.ZegoRoom;
  ZegoUser = realService.ZegoUser;
  ZegoStream = realService.ZegoStream;
  ZegoRoomState = realService.ZegoRoomState;
  ZegoPublisherState = realService.ZegoPublisherState;
  ZegoPlayerState = realService.ZegoPlayerState;
}

// Export the selected service and types
export { zegoService };
export type { ZegoRoom, ZegoUser, ZegoStream };
export { ZegoRoomState, ZegoPublisherState, ZegoPlayerState };

// Default export for compatibility
export default zegoService;