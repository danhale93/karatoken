import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface AudioRecordingState {
  isRecording: boolean;
  isLoading: boolean;
  duration: number;
  audioLevel: number;
  error: string | null;
}

export interface UseAudioRecordingProps {
  enableLevelMonitoring?: boolean;
  updateInterval?: number;
}

export const useAudioRecording = ({
  enableLevelMonitoring = true,
  updateInterval = 100,
}: UseAudioRecordingProps = {}) => {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isLoading: false,
    duration: 0,
    audioLevel: 0,
    error: null,
  });

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [levelInterval, setLevelInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize audio permissions and configuration
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setState(prev => ({
            ...prev,
            error: 'Audio permission not granted',
          }));
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to initialize audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
      }
    };

    initializeAudio();

    return () => {
      if (levelInterval) {
        clearInterval(levelInterval);
      }
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

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

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      
      // Set up recording status updates
      newRecording.setOnRecordingStatusUpdate((status) => {
        setState(prev => ({
          ...prev,
          duration: status.durationMillis || 0,
        }));
      });

      await newRecording.startAsync();
      setRecording(newRecording);

      // Start audio level monitoring
      if (enableLevelMonitoring) {
        startLevelMonitoring();
      }

      setState(prev => ({
        ...prev,
        isRecording: true,
        isLoading: false,
      }));

      console.log('Recording started successfully');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [recording, enableLevelMonitoring]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (!recording) {
        throw new Error('No active recording');
      }

      // Stop level monitoring
      if (levelInterval) {
        clearInterval(levelInterval);
        setLevelInterval(null);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      setState(prev => ({
        ...prev,
        isRecording: false,
        isLoading: false,
        audioLevel: 0,
      }));

      console.log('Recording stopped, saved to:', uri);
      return uri;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [recording, levelInterval]);

  // Start audio level monitoring
  const startLevelMonitoring = useCallback(() => {
    const interval = setInterval(() => {
      // Simulate audio level monitoring since Expo doesn't provide real-time level data
      // In a real implementation, you would use native modules or WebRTC APIs
      const simulatedLevel = Math.random() * 100;
      setState(prev => ({
        ...prev,
        audioLevel: simulatedLevel,
      }));
    }, updateInterval);

    setLevelInterval(interval);
  }, [updateInterval]);

  // Pause recording (iOS only)
  const pauseRecording = useCallback(async () => {
    if (!recording) return;

    try {
      if (Platform.OS === 'ios') {
        await recording.pauseAsync();
      }
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, [recording]);

  // Resume recording (iOS only)
  const resumeRecording = useCallback(async () => {
    if (!recording) return;

    try {
      if (Platform.OS === 'ios') {
        await recording.startAsync();
      }
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }, [recording]);

  // Get recording status
  const getRecordingStatus = useCallback(async () => {
    if (!recording) return null;

    try {
      return await recording.getStatusAsync();
    } catch (error) {
      console.error('Failed to get recording status:', error);
      return null;
    }
  }, [recording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (levelInterval) {
        clearInterval(levelInterval);
      }
    };
  }, [recording, levelInterval]);

  return {
    // State
    ...state,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordingStatus,
    
    // Utilities
    hasRecording: recording !== null,
    formattedDuration: formatDuration(state.duration),
  };
};

// Helper function to format duration
const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};