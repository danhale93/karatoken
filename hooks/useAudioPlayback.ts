import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';

export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  volume: number;
  isLooped: boolean;
  error: string | null;
}

export interface UseAudioPlaybackProps {
  initialVolume?: number;
  shouldLoop?: boolean;
}

export const useAudioPlayback = ({
  initialVolume = 1.0,
  shouldLoop = false,
}: UseAudioPlaybackProps = {}) => {
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isLoading: false,
    duration: 0,
    position: 0,
    volume: initialVolume,
    isLooped: shouldLoop,
    error: null,
  });

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize audio configuration
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
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
  }, []);

  // Load audio from URI or require
  const loadAudio = useCallback(async (source: string | number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Unload previous audio if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        typeof source === 'string' ? { uri: source } : source,
        {
          shouldPlay: false,
          isLooping: state.isLooped,
          volume: state.volume,
        }
      );

      // Set up playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setState(prev => ({
            ...prev,
            isPlaying: status.isPlaying || false,
            duration: status.durationMillis || 0,
            position: status.positionMillis || 0,
          }));

          // Handle playback completion
          if (status.didJustFinish && !status.isLooping) {
            setState(prev => ({ ...prev, isPlaying: false }));
          }
        } else if (status.error) {
          setState(prev => ({
            ...prev,
            error: `Playback error: ${status.error}`,
            isPlaying: false,
          }));
        }
      });

      setSound(newSound);

      setState(prev => ({
        ...prev,
        isLoading: false,
        duration: status.isLoaded ? status.durationMillis || 0 : 0,
      }));

      console.log('Audio loaded successfully');
      return newSound;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [sound, state.isLooped, state.volume]);

  // Play audio
  const play = useCallback(async () => {
    if (!sound) {
      throw new Error('No audio loaded');
    }

    try {
      await sound.playAsync();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [sound]);

  // Pause audio
  const pause = useCallback(async () => {
    if (!sound) return;

    try {
      await sound.pauseAsync();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to pause audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [sound]);

  // Stop audio
  const stop = useCallback(async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to stop audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [sound]);

  // Set playback position
  const setPosition = useCallback(async (positionMillis: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Failed to set position:', error);
    }
  }, [sound]);

  // Set volume
  const setVolume = useCallback(async (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (sound) {
      try {
        await sound.setVolumeAsync(clampedVolume);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }

    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, [sound]);

  // Set looping
  const setLooping = useCallback(async (shouldLoop: boolean) => {
    if (sound) {
      try {
        await sound.setIsLoopingAsync(shouldLoop);
      } catch (error) {
        console.error('Failed to set looping:', error);
      }
    }

    setState(prev => ({ ...prev, isLooped: shouldLoop }));
  }, [sound]);

  // Toggle play/pause
  const togglePlayback = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  // Unload audio
  const unload = useCallback(async () => {
    if (sound) {
      try {
        await sound.unloadAsync();
        setSound(null);
        setState(prev => ({
          ...prev,
          isPlaying: false,
          duration: 0,
          position: 0,
        }));
      } catch (error) {
        console.error('Failed to unload audio:', error);
      }
    }
  }, [sound]);

  // Get playback status
  const getStatus = useCallback(async () => {
    if (!sound) return null;

    try {
      return await sound.getStatusAsync();
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }, [sound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [sound]);

  return {
    // State
    ...state,
    
    // Actions
    loadAudio,
    play,
    pause,
    stop,
    togglePlayback,
    setPosition,
    setVolume,
    setLooping,
    unload,
    getStatus,
    
    // Utilities
    hasAudio: sound !== null,
    progress: state.duration > 0 ? state.position / state.duration : 0,
    formattedPosition: formatTime(state.position),
    formattedDuration: formatTime(state.duration),
    remainingTime: formatTime(state.duration - state.position),
  };
};

// Helper function to format time
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};