// Powered by OnSpace.AI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { useKaraokeStore } from '../../hooks/useKaraokeStore';

const { width, height } = Dimensions.get('window');

export default function KaraokeScreen() {
  const { songId, songTitle, artistName, duration } = useLocalSearchParams();
  const { startRecording, stopRecording, submitPerformance } = useKaraokeStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [lyrics, setLyrics] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const pitchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermissions();
    loadSongData();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= parseInt(duration as string)) {
            handleStopRecording();
            return prev;
          }
          return newTime;
        });
        
        // Simulate real-time scoring and pitch detection
        const newScore = Math.floor(Math.random() * 20) + 80; // 80-100
        const newPitch = Math.floor(Math.random() * 100);
        
        setScore(newScore);
        setPitch(newPitch);
        
        // Animate score changes
        Animated.spring(scoreAnimation, {
          toValue: newScore,
          useNativeDriver: false,
        }).start();
        
        Animated.spring(pitchAnimation, {
          toValue: newPitch,
          useNativeDriver: false,
        }).start();
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording, duration]);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    const audioStatus = await Audio.requestPermissionsAsync();
    
    setCameraPermission(cameraStatus.status === 'granted');
    setAudioPermission(audioStatus.status === 'granted');
  };

  const loadSongData = () => {
    // Mock lyrics data - in a real app, this would come from the backend
    const mockLyrics = `Welcome to the karaoke session for "${songTitle}" by ${artistName}. Get ready to sing along with the music!`;
    setLyrics(mockLyrics);
  };

  const handleStartRecording = async () => {
    if (!cameraPermission || !audioPermission) {
      Alert.alert('Permissions Required', 'Camera and microphone permissions are needed to record.');
      return;
    }

    try {
      await startRecording(songId as string, songTitle as string, artistName as string);
      setIsRecording(true);
      setCurrentTime(0);
      setScore(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      const videoUri = await stopRecording();
      
      // Submit performance for AI scoring
      const finalScore = await submitPerformance(songId as string, videoUri, score);
      
      Alert.alert(
        'Performance Complete!',
        `Your final score: ${finalScore}%\n\nGreat job! Keep practicing to improve your score.`,
        [
          { text: 'Try Again', onPress: () => router.back() },
          { text: 'View Results', onPress: () => router.push('/results') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPitchColor = (pitch: number) => {
    if (pitch >= 80) return '#10B981';
    if (pitch >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (cameraPermission === null || audioPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cameraPermission || !audioPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="videocam-off" size={80} color="#EF4444" />
          <Text style={styles.permissionTitle}>Permissions Required</Text>
          <Text style={styles.permissionText}>
            Camera and microphone access are needed to record your karaoke performance.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{songTitle}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{artistName}</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          {/* Score Overlay */}
          <View style={styles.scoreOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'transparent']}
              style={styles.scoreGradient}
            >
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Animated.Text style={[styles.scoreValue, { opacity: scoreAnimation.interpolate({ inputRange: [0, 100], outputRange: [0.5, 1] }) }]}>
                  {score}%
                </Animated.Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime)} / {formatTime(parseInt(duration as string))}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Pitch Indicator */}
          <View style={styles.pitchContainer}>
            <View style={styles.pitchMeter}>
              <View style={styles.pitchScale}>
                {[...Array(10)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.pitchMark,
                      pitch >= (i + 1) * 10 && { backgroundColor: getPitchColor(pitch) }
                    ]} 
                  />
                ))}
              </View>
              <Text style={styles.pitchLabel}>Pitch</Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Lyrics Display */}
      <View style={styles.lyricsContainer}>
        <Text style={styles.lyricsText}>{lyrics}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.muteButton}>
          <MaterialIcons name="mic" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={false}
        >
          <LinearGradient
            colors={isRecording ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
            style={styles.recordButtonGradient}
          >
            <MaterialIcons 
              name={isRecording ? 'stop' : 'play-arrow'} 
              size={40} 
              color="#FFFFFF" 
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.flipButton}>
          <MaterialIcons name="flip-camera-ios" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {isRecording && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: `${(currentTime / parseInt(duration as string)) * 100}%`
                }
              ]}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 15,
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  scoreGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pitchContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -60 }],
  },
  pitchMeter: {
    alignItems: 'center',
  },
  pitchScale: {
    height: 120,
    width: 20,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pitchMark: {
    height: 8,
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  pitchLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  lyricsContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 80,
    justifyContent: 'center',
  },
  lyricsText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  muteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  recordingButton: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressBar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
});