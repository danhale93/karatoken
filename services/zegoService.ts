import ZegoExpressEngine, {
  ZegoRoomConfig,
  ZegoUser,
  ZegoStream,
  ZegoPublisherConfig,
  ZegoPlayerConfig,
  ZegoScenario,
  ZegoRoomState,
  ZegoPublisherState,
  ZegoPlayerState,
  ZegoAudioRoute,
  ZegoAudioConfig,
  ZegoVideoConfig
} from 'zego-express-engine-reactnative';

export interface ZegoRoom {
  roomID: string;
  roomName: string;
  participants: ZegoUser[];
  maxParticipants: number;
  roomType: 'battle' | 'duet' | 'live_performance' | 'practice';
  songId?: string;
  songTitle?: string;
}

export interface ZegoParticipant extends ZegoUser {
  isPublishing: boolean;
  isPlaying: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ZegoConfig {
  appID: number;
  appSign: string;
  scenario: ZegoScenario;
  enablePlatformView: boolean;
}

class ZegoService {
  private engine: ZegoExpressEngine | null = null;
  private isInitialized = false;
  private currentRoom: ZegoRoom | null = null;
  private currentUser: ZegoUser | null = null;
  private publishStreamID: string | null = null;
  private playingStreams: Map<string, string> = new Map();

  // Event callbacks
  private onRoomStateUpdate?: (roomID: string, state: ZegoRoomState, errorCode: number) => void;
  private onPublisherStateUpdate?: (streamID: string, state: ZegoPublisherState, errorCode: number) => void;
  private onPlayerStateUpdate?: (streamID: string, state: ZegoPlayerState, errorCode: number) => void;
  private onRoomUserUpdate?: (roomID: string, updateType: 'ADD' | 'DELETE', userList: ZegoUser[]) => void;
  private onRoomStreamUpdate?: (roomID: string, updateType: 'ADD' | 'DELETE', streamList: ZegoStream[]) => void;
  private onAudioRouteChange?: (audioRoute: ZegoAudioRoute) => void;
  private onSoundLevelUpdate?: (soundLevelInfos: any[]) => void;

  async initialize(config: ZegoConfig): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('ZegoService already initialized');
        return;
      }

      // Create engine instance
      this.engine = await ZegoExpressEngine.createEngineWithProfile({
        appID: config.appID,
        appSign: config.appSign,
        scenario: config.scenario,
        enablePlatformView: config.enablePlatformView,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Configure audio settings for karaoke
      await this.configureAudioSettings();

      this.isInitialized = true;
      console.log('ZegoService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ZegoService:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.engine) return;

    // Room state updates
    this.engine.on('roomStateUpdate', (roomID: string, state: ZegoRoomState, errorCode: number) => {
      console.log(`Room ${roomID} state update:`, state, errorCode);
      this.onRoomStateUpdate?.(roomID, state, errorCode);
    });

    // Publisher state updates
    this.engine.on('publisherStateUpdate', (streamID: string, state: ZegoPublisherState, errorCode: number) => {
      console.log(`Publisher ${streamID} state update:`, state, errorCode);
      this.onPublisherStateUpdate?.(streamID, state, errorCode);
    });

    // Player state updates
    this.engine.on('playerStateUpdate', (streamID: string, state: ZegoPlayerState, errorCode: number) => {
      console.log(`Player ${streamID} state update:`, state, errorCode);
      this.onPlayerStateUpdate?.(streamID, state, errorCode);
    });

    // Room user updates
    this.engine.on('roomUserUpdate', (roomID: string, updateType: 'ADD' | 'DELETE', userList: ZegoUser[]) => {
      console.log(`Room ${roomID} user update:`, updateType, userList);
      this.onRoomUserUpdate?.(roomID, updateType, userList);
    });

    // Room stream updates
    this.engine.on('roomStreamUpdate', (roomID: string, updateType: 'ADD' | 'DELETE', streamList: ZegoStream[]) => {
      console.log(`Room ${roomID} stream update:`, updateType, streamList);
      this.onRoomStreamUpdate?.(roomID, updateType, streamList);
    });

    // Audio route changes
    this.engine.on('audioRouteChange', (audioRoute: ZegoAudioRoute) => {
      console.log('Audio route changed:', audioRoute);
      this.onAudioRouteChange?.(audioRoute);
    });

    // Sound level updates for real-time audio monitoring
    this.engine.on('capturedSoundLevelUpdate', (soundLevel: number) => {
      // This can be used for real-time pitch detection and scoring
      this.onSoundLevelUpdate?.([{ soundLevel, type: 'captured' }]);
    });
  }

  private async configureAudioSettings(): Promise<void> {
    if (!this.engine) return;

    try {
      // Configure audio for karaoke performance
      const audioConfig: ZegoAudioConfig = {
        bitrate: 128000, // High quality audio for singing
        channel: 1, // Mono for vocals
        codecID: 0, // Default codec
      };

      await this.engine.setAudioConfig(audioConfig);

      // Enable audio processing features
      await this.engine.enableAudioCaptureDevice(true);
      await this.engine.enableAEC(true); // Echo cancellation
      await this.engine.enableAGC(true); // Automatic gain control
      await this.engine.enableANS(true); // Audio noise suppression

      // Set audio route to speaker for karaoke experience
      await this.engine.setAudioRouteToSpeaker(true);

      console.log('Audio settings configured for karaoke');
    } catch (error) {
      console.error('Failed to configure audio settings:', error);
    }
  }

  async joinRoom(roomConfig: {
    roomID: string;
    user: ZegoUser;
    token?: string;
    isUserStatusNotify?: boolean;
  }): Promise<void> {
    if (!this.engine || !this.isInitialized) {
      throw new Error('ZegoService not initialized');
    }

    try {
      const config: ZegoRoomConfig = {
        isUserStatusNotify: roomConfig.isUserStatusNotify ?? true,
        maxMemberCount: 8, // Maximum participants in a room
        token: roomConfig.token,
      };

      await this.engine.loginRoom(roomConfig.roomID, roomConfig.user, config);
      this.currentUser = roomConfig.user;
      
      console.log(`Joined room ${roomConfig.roomID} as ${roomConfig.user.userName}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    if (!this.engine) return;

    try {
      // Stop publishing if active
      if (this.publishStreamID) {
        await this.stopPublishing();
      }

      // Stop playing all streams
      for (const streamID of this.playingStreams.keys()) {
        await this.stopPlaying(streamID);
      }

      // Leave the room
      if (this.currentRoom) {
        await this.engine.logoutRoom(this.currentRoom.roomID);
      }

      this.currentRoom = null;
      this.currentUser = null;
      
      console.log('Left room successfully');
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  async startPublishing(streamID: string, config?: ZegoPublisherConfig): Promise<void> {
    if (!this.engine) {
      throw new Error('ZegoService not initialized');
    }

    try {
      await this.engine.startPublishingStream(streamID, config);
      this.publishStreamID = streamID;
      
      console.log(`Started publishing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to start publishing:', error);
      throw error;
    }
  }

  async stopPublishing(): Promise<void> {
    if (!this.engine || !this.publishStreamID) return;

    try {
      await this.engine.stopPublishingStream();
      this.publishStreamID = null;
      
      console.log('Stopped publishing stream');
    } catch (error) {
      console.error('Failed to stop publishing:', error);
      throw error;
    }
  }

  async startPlaying(streamID: string, config?: ZegoPlayerConfig): Promise<void> {
    if (!this.engine) {
      throw new Error('ZegoService not initialized');
    }

    try {
      await this.engine.startPlayingStream(streamID, config);
      this.playingStreams.set(streamID, streamID);
      
      console.log(`Started playing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to start playing:', error);
      throw error;
    }
  }

  async stopPlaying(streamID: string): Promise<void> {
    if (!this.engine) return;

    try {
      await this.engine.stopPlayingStream(streamID);
      this.playingStreams.delete(streamID);
      
      console.log(`Stopped playing stream: ${streamID}`);
    } catch (error) {
      console.error('Failed to stop playing:', error);
      throw error;
    }
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
    if (!this.engine) {
      throw new Error('ZegoService not initialized');
    }

    try {
      await this.engine.startAudioMixing(filePath, {
        loopCount: config?.loopCount ?? 1,
        isPublishOut: config?.isPublishOut ?? true,
        volume: config?.volume ?? 50, // Lower volume for backing track
      });
      
      console.log('Started audio mixing for backing track');
    } catch (error) {
      console.error('Failed to start audio mixing:', error);
      throw error;
    }
  }

  async stopAudioMixing(): Promise<void> {
    if (!this.engine) return;

    try {
      await this.engine.stopAudioMixing();
      console.log('Stopped audio mixing');
    } catch (error) {
      console.error('Failed to stop audio mixing:', error);
    }
  }

  // Real-time audio monitoring for pitch scoring
  enableSoundLevelMonitor(enable: boolean, millisecond: number = 100): void {
    if (!this.engine) return;

    try {
      this.engine.startSoundLevelMonitor(millisecond);
      console.log(`Sound level monitoring ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to configure sound level monitoring:', error);
    }
  }

  // Event handler setters
  setOnRoomStateUpdate(callback: (roomID: string, state: ZegoRoomState, errorCode: number) => void): void {
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
      
      if (this.engine) {
        await ZegoExpressEngine.destroyEngine();
        this.engine = null;
      }
      
      this.isInitialized = false;
      console.log('ZegoService destroyed');
    } catch (error) {
      console.error('Failed to destroy ZegoService:', error);
    }
  }

  // Getters
  get isReady(): boolean {
    return this.isInitialized && this.engine !== null;
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

export const zegoService = new ZegoService();