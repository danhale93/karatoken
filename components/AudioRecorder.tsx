import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioRecording } from '../hooks/useAudioRecording';

export interface AudioRecorderProps {
  onRecordingComplete?: (uri: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  showWaveform?: boolean;
  enableLevelMonitoring?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  maxDuration = 300000, // 5 minutes default
  showWaveform = true,
  enableLevelMonitoring = true,
}) => {
  const [isReady, setIsReady] = useState(false);

  const {
    isRecording,
    isLoading,
    duration,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    formattedDuration,
  } = useAudioRecording({
    enableLevelMonitoring,
    updateInterval: 100,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
      if (Platform.OS === 'web') {
        alert(`Recording Error: ${error}`);
      } else {
        Alert.alert('Recording Error', error);
      }
    }
  }, [error, onError]);

  // Auto-stop recording when max duration is reached
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      handleStopRecording();
    }
  }, [isRecording, duration, maxDuration]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
      onRecordingStart?.();
      setIsReady(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      onRecordingStop?.();
      
      if (uri) {
        onRecordingComplete?.(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const getRecordingButtonColor = () => {
    if (isRecording) return '#EF4444';
    if (isReady) return '#10B981';
    return '#6B7280';
  };

  const renderWaveform = () => {
    if (!showWaveform || !isRecording) return null;

    // Generate simple waveform visualization based on audio level
    const bars = Array.from({ length: 20 }, (_, index) => {
      const height = Math.random() * audioLevel + 10;
      return (
        <View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: Math.max(4, height / 2),
              backgroundColor: audioLevel > 50 ? '#10B981' : '#6B7280',
            },
          ]}
        />
      );
    });

    return <View style={styles.waveform}>{bars}</View>;
  };

  return (
    <View style={styles.container}>
      {/* Recording Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: getRecordingButtonColor() }]} />
        <Text style={styles.statusText}>
          {isRecording ? 'Recording' : isReady ? 'Ready' : 'Tap to Start'}
        </Text>
        {isRecording && (
          <Text style={styles.durationText}>{formattedDuration}</Text>
        )}
      </View>

      {/* Audio Level Meter */}
      {enableLevelMonitoring && isRecording && (
        <View style={styles.levelMeter}>
          <Text style={styles.levelLabel}>Audio Level</Text>
          <View style={styles.levelBar}>
            <View
              style={[
                styles.levelFill,
                {
                  width: `${audioLevel}%`,
                  backgroundColor: audioLevel > 80 ? '#EF4444' : audioLevel > 50 ? '#F59E0B' : '#10B981',
                },
              ]}
            />
          </View>
          <Text style={styles.levelValue}>{Math.round(audioLevel)}%</Text>
        </View>
      )}

      {/* Waveform Visualization */}
      {renderWaveform()}

      {/* Recording Control */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={toggleRecording}
        disabled={isLoading}
      >
        <LinearGradient
          colors={
            isRecording
              ? ['#EF4444', '#DC2626']
              : isReady
              ? ['#10B981', '#059669']
              : ['#6B7280', '#4B5563']
          }
          style={styles.recordButtonGradient}
        >
          {isLoading ? (
            <View style={styles.loadingDot} />
          ) : (
            <MaterialIcons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color="#FFFFFF"
            />
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.instructionText}>
          {isRecording
            ? 'Tap to stop recording'
            : 'Tap the microphone to start recording'}
        </Text>
        
        {isRecording && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(duration / maxDuration) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.maxDurationText}>
              Max: {Math.floor(maxDuration / 60000)}:{((maxDuration % 60000) / 1000).toFixed(0).padStart(2, '0')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  durationText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  levelMeter: {
    width: '100%',
    marginBottom: 20,
  },
  levelLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  levelBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelValue: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 60,
    marginBottom: 20,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.8,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  controls: {
    alignItems: 'center',
    width: '100%',
  },
  instructionText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  maxDurationText: {
    color: '#6B7280',
    fontSize: 12,
  },
});