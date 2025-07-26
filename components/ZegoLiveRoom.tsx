import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useZegoLive } from '../hooks/useZegoLive';
import { useAuthStore } from '../hooks/useAuthStore';

export interface ZegoLiveRoomProps {
  roomID: string;
  roomType: 'battle' | 'duet' | 'practice';
  songId?: string;
  songTitle?: string;
  onLeave: () => void;
  onError?: (error: string) => void;
}

export const ZegoLiveRoom: React.FC<ZegoLiveRoomProps> = ({
  roomID,
  roomType,
  songId,
  songTitle,
  onLeave,
  onError,
}) => {
  const { user } = useAuthStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [backingTrackVolume, setBackingTrackVolume] = useState(50);

  // ZegoCloud configuration - These should come from environment variables
  const ZEGO_APP_ID = parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || '0');
  const ZEGO_APP_SIGN = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || '';

  const {
    isConnected,
    isPublishing,
    isPlaying,
    currentRoom,
    participants,
    streams,
    audioLevel,
    connectionQuality,
    error,
    isInitialized,
    joinRoom,
    leaveRoom,
    startPublishing,
    stopPublishing,
    startPlaying,
    stopPlaying,
    startBackingTrack,
    stopBackingTrack,
  } = useZegoLive({
    appID: ZEGO_APP_ID,
    appSign: ZEGO_APP_SIGN,
    userID: user?.id || 'anonymous',
    userName: user?.username || 'Anonymous User',
    enableSoundLevelMonitor: true,
  });

  // Join room on component mount
  useEffect(() => {
    if (isInitialized && !isConnected) {
      joinRoom(roomID).catch((error) => {
        console.error('Failed to join room:', error);
        onError?.(error.message);
      });
    }
  }, [isInitialized, isConnected, roomID, joinRoom, onError]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Auto-play other participants' streams
  useEffect(() => {
    streams.forEach(stream => {
      if (stream.user.userID !== user?.id) {
        startPlaying(stream.streamID).catch(console.error);
      }
    });
  }, [streams, user?.id, startPlaying]);

  const handleStartSinging = useCallback(async () => {
    try {
      if (!isPublishing) {
        await startPublishing();
        setIsRecording(true);
        
        // Start backing track if available
        if (songId) {
          // This would typically fetch the backing track URL from your song service
          // await startBackingTrack(backingTrackUrl, backingTrackVolume);
        }
      } else {
        await stopPublishing();
        setIsRecording(false);
        await stopBackingTrack();
      }
    } catch (error) {
      console.error('Failed to toggle publishing:', error);
      if (Platform.OS === 'web') {
        alert(`Failed to ${isPublishing ? 'stop' : 'start'} singing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        Alert.alert('Error', `Failed to ${isPublishing ? 'stop' : 'start'} singing`);
      }
    }
  }, [isPublishing, startPublishing, stopPublishing, stopBackingTrack, songId, backingTrackVolume]);

  const handleLeave = useCallback(async () => {
    try {
      await leaveRoom();
      onLeave();
    } catch (error) {
      console.error('Failed to leave room:', error);
      onLeave(); // Leave anyway
    }
  }, [leaveRoom, onLeave]);

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'fair': return '#EF4444';
      case 'poor': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getAudioLevelColor = () => {
    if (audioLevel > 80) return '#10B981';
    if (audioLevel > 50) return '#F59E0B';
    return '#6B7280';
  };

  const renderParticipantsModal = () => (
    <Modal
      visible={showParticipants}
      transparent
      animationType="slide"
      onRequestClose={() => setShowParticipants(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.participantsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Participants ({participants.length})</Text>
            <TouchableOpacity onPress={() => setShowParticipants(false)}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {participants.map((participant) => (
            <View key={participant.userID} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                <MaterialIcons 
                  name="person" 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={styles.participantName}>{participant.userName}</Text>
              </View>
              
              <View style={styles.participantStatus}>
                {streams.find(s => s.user.userID === participant.userID) && (
                  <MaterialIcons name="mic" size={20} color="#10B981" />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Initializing live room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomTitle}>
              {roomType === 'battle' ? '⚔️ Battle Room' : 
               roomType === 'duet' ? '🎤 Duet Room' : '🎵 Practice Room'}
            </Text>
            {songTitle && (
              <Text style={styles.songTitle}>{songTitle}</Text>
            )}
          </View>
          
          <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
            <MaterialIcons name="exit-to-app" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        <View style={styles.statusRow}>
          <View style={styles.connectionStatus}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: isConnected ? '#10B981' : '#EF4444' }
              ]} 
            />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={() => setShowParticipants(true)}
            style={styles.participantsButton}
          >
            <MaterialIcons name="people" size={20} color="#FFFFFF" />
            <Text style={styles.participantCount}>{participants.length}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Audio Level Indicator */}
        <View style={styles.audioLevelContainer}>
          <Text style={styles.audioLevelLabel}>Audio Level</Text>
          <View style={styles.audioLevelBar}>
            <View 
              style={[
                styles.audioLevelFill,
                { 
                  width: `${audioLevel}%`,
                  backgroundColor: getAudioLevelColor(),
                }
              ]} 
            />
          </View>
          <Text style={styles.audioLevelValue}>{Math.round(audioLevel)}%</Text>
        </View>

        {/* Connection Quality */}
        <View style={styles.qualityIndicator}>
          <MaterialIcons 
            name="network-check" 
            size={20} 
            color={getConnectionQualityColor()} 
          />
          <Text style={[styles.qualityText, { color: getConnectionQualityColor() }]}>
            {connectionQuality.toUpperCase()}
          </Text>
        </View>

        {/* Active Streams Info */}
        <View style={styles.streamsInfo}>
          <Text style={styles.streamsTitle}>Active Streams</Text>
          {streams.map((stream) => (
            <View key={stream.streamID} style={styles.streamItem}>
              <MaterialIcons name="audiotrack" size={16} color="#10B981" />
              <Text style={styles.streamUser}>{stream.user.userName}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.mutedButton]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <MaterialIcons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* Start/Stop Singing Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isRecording && styles.recordingButton,
          ]}
          onPress={handleStartSinging}
          disabled={!isConnected}
        >
          {isPublishing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <MaterialIcons 
              name={isRecording ? "stop" : "play-arrow"} 
              size={32} 
              color="#FFFFFF" 
            />
          )}
          <Text style={styles.primaryButtonText}>
            {isRecording ? 'Stop Singing' : 'Start Singing'}
          </Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity style={styles.controlButton}>
          <MaterialIcons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderParticipantsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  songTitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  leaveButton: {
    padding: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantCount: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  audioLevelContainer: {
    marginBottom: 20,
  },
  audioLevelLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  audioLevelBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  audioLevelFill: {
    height: '100%',
    borderRadius: 4,
  },
  audioLevelValue: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'right',
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  streamsInfo: {
    marginBottom: 20,
  },
  streamsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  streamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamUser: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: '#EF4444',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  participantsModal: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});