import { useEffect, useState, useCallback } from 'react';
import { ZegoUser, ZegoStream, ZegoRoomState } from 'zego-express-engine-reactnative';
import { zegoService, ZegoRoom } from '../services/zegoService';

export interface LiveStreamState {
  isConnected: boolean;
  isPublishing: boolean;
  isPlaying: boolean;
  currentRoom: ZegoRoom | null;
  participants: ZegoUser[];
  streams: ZegoStream[];
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  error: string | null;
}

export interface UseZegoLiveProps {
  appID: number;
  appSign: string;
  userID: string;
  userName: string;
  enableSoundLevelMonitor?: boolean;
}

export const useZegoLive = ({
  appID,
  appSign,
  userID,
  userName,
  enableSoundLevelMonitor = true,
}: UseZegoLiveProps) => {
  const [state, setState] = useState<LiveStreamState>({
    isConnected: false,
    isPublishing: false,
    isPlaying: false,
    currentRoom: null,
    participants: [],
    streams: [],
    audioLevel: 0,
    connectionQuality: 'good',
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize ZegoService
  useEffect(() => {
    const initializeZego = async () => {
      try {
        if (!zegoService.isReady) {
          await zegoService.initialize({
            appID,
            appSign,
            scenario: 0, // General scenario
            enablePlatformView: true,
          });
        }

        // Set up event listeners
        zegoService.setOnRoomStateUpdate((roomID, roomState, errorCode) => {
          setState(prev => ({
            ...prev,
            isConnected: roomState === ZegoRoomState.Connected,
            error: errorCode !== 0 ? `Room connection error: ${errorCode}` : null,
          }));
        });

        zegoService.setOnRoomUserUpdate((roomID, updateType, userList) => {
          setState(prev => ({
            ...prev,
            participants: updateType === 'ADD' 
              ? [...prev.participants, ...userList]
              : prev.participants.filter(p => !userList.find(u => u.userID === p.userID)),
          }));
        });

        zegoService.setOnRoomStreamUpdate((roomID, updateType, streamList) => {
          setState(prev => ({
            ...prev,
            streams: updateType === 'ADD'
              ? [...prev.streams, ...streamList]
              : prev.streams.filter(s => !streamList.find(stream => stream.streamID === s.streamID)),
          }));
        });

        if (enableSoundLevelMonitor) {
          zegoService.setOnSoundLevelUpdate((soundLevelInfos) => {
            const capturedLevel = soundLevelInfos.find(info => info.type === 'captured');
            if (capturedLevel) {
              setState(prev => ({
                ...prev,
                audioLevel: capturedLevel.soundLevel,
              }));
            }
          });

          zegoService.enableSoundLevelMonitor(true, 100);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Zego:', error);
        setState(prev => ({
          ...prev,
          error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
      }
    };

    initializeZego();

    return () => {
      // Cleanup will be handled by the service
    };
  }, [appID, appSign, enableSoundLevelMonitor]);

  // Join a room
  const joinRoom = useCallback(async (roomID: string, token?: string) => {
    if (!isInitialized) {
      throw new Error('ZegoService not initialized');
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      
      const user: ZegoUser = { userID, userName };
      await zegoService.joinRoom({
        roomID,
        user,
        token,
        isUserStatusNotify: true,
      });

      setState(prev => ({
        ...prev,
        currentRoom: {
          roomID,
          roomName: roomID,
          participants: [user],
          maxParticipants: 8,
          roomType: 'practice',
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to join room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [isInitialized, userID, userName]);

  // Leave current room
  const leaveRoom = useCallback(async () => {
    try {
      await zegoService.leaveRoom();
      setState(prev => ({
        ...prev,
        isConnected: false,
        isPublishing: false,
        isPlaying: false,
        currentRoom: null,
        participants: [],
        streams: [],
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to leave room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  // Start publishing stream
  const startPublishing = useCallback(async (streamID?: string) => {
    if (!state.isConnected) {
      throw new Error('Not connected to room');
    }

    try {
      const publishStreamID = streamID || `${userID}_stream`;
      await zegoService.startPublishing(publishStreamID);
      
      setState(prev => ({
        ...prev,
        isPublishing: true,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to start publishing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [state.isConnected, userID]);

  // Stop publishing stream
  const stopPublishing = useCallback(async () => {
    try {
      await zegoService.stopPublishing();
      setState(prev => ({
        ...prev,
        isPublishing: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to stop publishing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  // Start playing a stream
  const startPlaying = useCallback(async (streamID: string) => {
    try {
      await zegoService.startPlaying(streamID);
      setState(prev => ({
        ...prev,
        isPlaying: true,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to start playing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  // Stop playing a stream
  const stopPlaying = useCallback(async (streamID: string) => {
    try {
      await zegoService.stopPlaying(streamID);
      setState(prev => ({
        ...prev,
        isPlaying: prev.streams.length > 1, // Still playing if other streams exist
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to stop playing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  // Create battle room
  const createBattleRoom = useCallback(async (battleConfig: {
    battleId: string;
    songId: string;
    songTitle: string;
    maxParticipants: number;
  }) => {
    if (!isInitialized) {
      throw new Error('ZegoService not initialized');
    }

    try {
      const room = await zegoService.createBattleRoom({
        ...battleConfig,
        hostUser: { userID, userName },
      });

      setState(prev => ({
        ...prev,
        currentRoom: room,
        isConnected: true,
        participants: room.participants,
        error: null,
      }));

      return room;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to create battle room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [isInitialized, userID, userName]);

  // Create duet room
  const createDuetRoom = useCallback(async (duetConfig: {
    duetId: string;
    songId: string;
    songTitle: string;
  }) => {
    if (!isInitialized) {
      throw new Error('ZegoService not initialized');
    }

    try {
      const room = await zegoService.createDuetRoom({
        ...duetConfig,
        hostUser: { userID, userName },
      });

      setState(prev => ({
        ...prev,
        currentRoom: room,
        isConnected: true,
        participants: room.participants,
        error: null,
      }));

      return room;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to create duet room: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [isInitialized, userID, userName]);

  // Start audio mixing for backing track
  const startBackingTrack = useCallback(async (audioFilePath: string, volume = 50) => {
    try {
      await zegoService.startAudioMixing(audioFilePath, {
        loopCount: 1,
        isPublishOut: true,
        volume,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to start backing track: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  // Stop audio mixing
  const stopBackingTrack = useCallback(async () => {
    try {
      await zegoService.stopAudioMixing();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to stop backing track: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, []);

  return {
    // State
    ...state,
    isInitialized,

    // Actions
    joinRoom,
    leaveRoom,
    startPublishing,
    stopPublishing,
    startPlaying,
    stopPlaying,
    createBattleRoom,
    createDuetRoom,
    startBackingTrack,
    stopBackingTrack,
  };
};