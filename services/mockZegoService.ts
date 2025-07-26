import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface ZegoRoom {
  roomID: string;
  roomName: string;
  participants: ZegoUser[];
  maxParticipants: number;
  roomType: 'battle' | 'duet' | 'live_performance' | 'practice';
  songId?: string;
  songTitle?: string;
}

export interface ZegoUser {
  userID: string;
  userName: string;
}

export interface ZegoStream {
  streamID: string;
  user: ZegoUser;
}

export const ZegoRoomState = {
  Disconnected: 0,
  Connecting: 1,
  Connected: 2,
} as const;

export const ZegoPublisherState = {
  NoPublish: 0,
  PublishRequesting: 1,
  Publishing: 2,
} as const;

export const ZegoPlayerState = {
  NoPlay: 0,
  PlayRequesting: 1,
  Playing: 2,
} as const;

export interface ZegoParticipant extends ZegoUser {
  isPublishing: boolean;
  isPlaying: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ZegoConfig {
  appID: number;
  appSign: string;
  scenario: number;
  enablePlatformView: boolean;
}

class MockZegoService {
  private isInitialized = false;
  private currentRoom: ZegoRoom | null = null;
  private currentUser: ZegoUser | null = null;
  private publishStreamID: string | null = null;
  private playingStreams: Map<string, string> = new Map();
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private audioLevel = 0;
  private audioLevelInterval: NodeJS.Timeout | null = null;

  // Mock participants for demo purposes
  private mockParticipants: ZegoUser[] = [
    { userID: 'mock_user_1', userName: 'SingingStarX' },
    { userID: 'mock_user_2', userName: 'VocalVibes' },
    { userID: 'mock_user_3', userName: 'MelodyMaster' },
  ];

  // Event callbacks
  private onRoomStateUpdate?: (roomID: string, state: number, errorCode: number) => void;
  private onPublisherStateUpdate?: (streamID: string, state: number, errorCode: number) => void;
  private onPlayerStateUpdate?: (streamID: string, state: number, errorCode: number) => void;
  private onRoomUserUpdate?: (roomID: string, updateType: 'ADD' | 'DELETE', userList: ZegoUser[]) => void;
  private onRoomStreamUpdate?: (roomID: string, updateType: 'ADD' | 'DELETE', streamList: ZegoStream[]) => void;
  private onAudioRouteChange?: (audioRoute: string) => void;
  private onSoundLevelUpdate?: (soundLevelInfos: any[]) => void;

  async initialize(config: ZegoConfig): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('MockZegoService already initialized');
        return;
      }

      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('MockZegoService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MockZegoService:', error);
      throw error;
    }
  }

  async joinRoom(roomConfig: {
    roomID: string;
    user: ZegoUser;
    token?: string;
    isUserStatusNotify?: boolean;
  }): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MockZegoService not initialized');
    }

    try {
      this.currentUser = roomConfig.user;
      
      // Create mock room
      this.currentRoom = {
        roomID: roomConfig.roomID,
        roomName: roomConfig.roomID,
        participants: [roomConfig.user],
        maxParticipants: 8,
        roomType: 'practice',
      };

      // Simulate room connection
      setTimeout(() => {
        this.onRoomStateUpdate?.(roomConfig.roomID, ZegoRoomState.Connected, 0);
        
        // Add some mock participants for demo
        const randomParticipants = this.mockParticipants
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .filter(p => p.userID !== roomConfig.user.userID);
        
        if (randomParticipants.length > 0) {
          this.onRoomUserUpdate?.(roomConfig.roomID, 'ADD', randomParticipants);
          
          // Add mock streams
          const mockStreams: ZegoStream[] = randomParticipants.map(user => ({
            streamID: `${user.userID}_stream`,
            user,
          }));
          
          setTimeout(() => {
            this.onRoomStreamUpdate?.(roomConfig.roomID, 'ADD', mockStreams);
          }, 1000);
        }
      }, 1000);
      
      console.log(`Joined mock room ${roomConfig.roomID} as ${roomConfig.user.userName}`);
    } catch (error) {
      console.error('Failed to join mock room:', error);
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    try {
      // Stop any ongoing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Stop any playing audio
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Clear audio level monitoring
      if (this.audioLevelInterval) {
        clearInterval(this.audioLevelInterval);
        this.audioLevelInterval = null;
      }

      // Reset state
      this.currentRoom = null;
      this.currentUser = null;
      this.publishStreamID = null;
      this.playingStreams.clear();
      
      console.log('Left mock room successfully');
    } catch (error) {
      console.error('Failed to leave mock room:', error);
      throw error;
    }
  }

  async startPublishing(streamID: string, config?: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MockZegoService not initialized');
    }

    try {
      // Start audio recording to simulate publishing
      await this.startRecording();
      this.publishStreamID = streamID;
      
      // Simulate audio level monitoring
      this.startAudioLevelMonitoring();
      
      // Notify publisher state change
      this.onPublisherStateUpdate?.(streamID, ZegoPublisherState.Publishing, 0);
      
      console.log(`Started mock publishing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to start mock publishing:', error);
      throw error;
    }
  }

  async stopPublishing(): Promise<void> {
    if (!this.publishStreamID) return;

    try {
      await this.stopRecording();
      
      // Stop audio level monitoring
      if (this.audioLevelInterval) {
        clearInterval(this.audioLevelInterval);
        this.audioLevelInterval = null;
      }
      
      const streamID = this.publishStreamID;
      this.publishStreamID = null;
      
      // Notify publisher state change
      this.onPublisherStateUpdate?.(streamID, ZegoPublisherState.NoPublish, 0);
      
      console.log('Stopped mock publishing stream');
    } catch (error) {
      console.error('Failed to stop mock publishing:', error);
      throw error;
    }
  }

  async startPlaying(streamID: string, config?: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MockZegoService not initialized');
    }

    try {
      // Simulate playing remote stream (in real implementation, this would play actual audio)
      this.playingStreams.set(streamID, streamID);
      
      // Notify player state change
      this.onPlayerStateUpdate?.(streamID, ZegoPlayerState.Playing, 0);
      
      console.log(`Started mock playing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to start mock playing:', error);
      throw error;
    }
  }

  async stopPlaying(streamID: string): Promise<void> {
    try {
      this.playingStreams.delete(streamID);
      
      // Notify player state change
      this.onPlayerStateUpdate?.(streamID, ZegoPlayerState.NoPlay, 0);
      
      console.log(`Stopped mock playing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to stop mock playing:', error);
      throw error;
    }
  }

  private async startRecording(): Promise<void> {
    try {
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      
      console.log('Started mock audio recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  private async stopRecording(): Promise<void> {
    if (!this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      
      console.log('Stopped mock audio recording, saved to:', uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  private startAudioLevelMonitoring(): void {
    // Simulate audio level changes
    this.audioLevelInterval = setInterval(() => {
      // Generate realistic audio level simulation
      const baseLevel = 30 + Math.random() * 40; // 30-70 base range
      const spike = Math.random() < 0.1 ? Math.random() * 30 : 0; // Occasional spikes
      this.audioLevel = Math.min(100, baseLevel + spike);
      
      this.onSoundLevelUpdate?.([{
        soundLevel: this.audioLevel,
        type: 'captured'
      }]);
    }, 100);
  }

  // Battle-specific methods
  async createBattleRoom(battleConfig: {
    battleId: string;
    songId: string;
    songTitle: string;
    maxParticipants: number;
    hostUser: ZegoUser;
  }): Promise<ZegoRoom> {
    const roomID = `battle_${battleConfig.battleId}`;
    
    await this.joinRoom({
      roomID,
      user: battleConfig.hostUser,
      isUserStatusNotify: true,
    });

    const room: ZegoRoom = {
      roomID,
      roomName: `Battle: ${battleConfig.songTitle}`,
      participants: [battleConfig.hostUser],
      maxParticipants: battleConfig.maxParticipants,
      roomType: 'battle',
      songId: battleConfig.songId,
      songTitle: battleConfig.songTitle,
    };

    this.currentRoom = room;
    return room;
  }

  // Duet-specific methods
  async createDuetRoom(duetConfig: {
    duetId: string;
    songId: string;
    songTitle: string;
    hostUser: ZegoUser;
  }): Promise<ZegoRoom> {
    const roomID = `duet_${duetConfig.duetId}`;
    
    await this.joinRoom({
      roomID,
      user: duetConfig.hostUser,
      isUserStatusNotify: true,
    });

    const room: ZegoRoom = {
      roomID,
      roomName: `Duet: ${duetConfig.songTitle}`,
      participants: [duetConfig.hostUser],
      maxParticipants: 2,
      roomType: 'duet',
      songId: duetConfig.songId,
      songTitle: duetConfig.songTitle,
    };

    this.currentRoom = room;
    return room;
  }

  // Audio mixing for karaoke backing tracks
  async startAudioMixing(filePath: string, config?: {
    loopCount?: number;
    isPublishOut?: boolean;
    volume?: number;
  }): Promise<void> {
    try {
      // In a real implementation, this would load and play a backing track
      // For now, we'll simulate it
      console.log('Started mock audio mixing for backing track');
    } catch (error) {
      console.error('Failed to start mock audio mixing:', error);
      throw error;
    }
  }

  async stopAudioMixing(): Promise<void> {
    try {
      console.log('Stopped mock audio mixing');
    } catch (error) {
      console.error('Failed to stop mock audio mixing:', error);
    }
  }

  // Real-time audio monitoring for pitch scoring
  enableSoundLevelMonitor(enable: boolean, millisecond: number = 100): void {
    console.log(`Mock sound level monitoring ${enable ? 'enabled' : 'disabled'}`);
  }

  // Event handler setters
  setOnRoomStateUpdate(callback: (roomID: string, state: number, errorCode: number) => void): void {
    this.onRoomStateUpdate = callback;
  }

  setOnRoomUserUpdate(callback: (roomID: string, updateType: 'ADD' | 'DELETE', userList: ZegoUser[]) => void): void {
    this.onRoomUserUpdate = callback;
  }

  setOnRoomStreamUpdate(callback: (roomID: string, updateType: 'ADD' | 'DELETE', streamList: ZegoStream[]) => void): void {
    this.onRoomStreamUpdate = callback;
  }

  setOnSoundLevelUpdate(callback: (soundLevelInfos: any[]) => void): void {
    this.onSoundLevelUpdate = callback;
  }

  // Cleanup
  async destroy(): Promise<void> {
    try {
      await this.leaveRoom();
      this.isInitialized = false;
      console.log('MockZegoService destroyed');
    } catch (error) {
      console.error('Failed to destroy MockZegoService:', error);
    }
  }

  // Getters
  get isReady(): boolean {
    return this.isInitialized;
  }

  get currentRoomInfo(): ZegoRoom | null {
    return this.currentRoom;
  }

  get currentUserInfo(): ZegoUser | null {
    return this.currentUser;
  }

  get isPublishing(): boolean {
    return this.publishStreamID !== null;
  }

  get playingStreamCount(): number {
    return this.playingStreams.size;
  }
}

export const zegoService = new MockZegoService();