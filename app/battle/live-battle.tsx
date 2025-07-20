// Powered by OnSpace.AI - Karatoken Live Battle Arena
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { aiScoringService, PitchData, RealTimeAnalysis } from '../../services/aiScoringService';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useWalletStore } from '../../hooks/useWalletStore';

const { width, height } = Dimensions.get('window');

interface BattlePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  accuracy: number;
  streak: number;
  isActive: boolean;
}

interface CrowdVote {
  player1: number;
  player2: number;
  totalVotes: number;
}

interface BattleState {
  mode: 'battle' | 'duet' | 'coop';
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  timeRemaining: number;
  currentLyric: string;
  targetPitch: PitchData | null;
}

export default function LiveBattleScreen() {
  const { battleId, mode = 'battle' } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { addTokens } = useWalletStore();

  // Battle State
  const [battleState, setBattleState] = useState<BattleState>({
    mode: mode as any,
    status: 'waiting',
    timeRemaining: 180, // 3 minutes
    currentLyric: '',
    targetPitch: null,
  });

  // Players
  const [players, setPlayers] = useState<BattlePlayer[]>([
    {
      id: user?.id || '1',
      name: user?.displayName || 'You',
      avatar: user?.avatar || 'https://picsum.photos/seed/player1/60/60.webp',
      score: 0,
      accuracy: 0,
      streak: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'VocalMaster_88',
      avatar: 'https://picsum.photos/seed/player2/60/60.webp',
      score: 0,
      accuracy: 0,
      streak: 0,
      isActive: true,
    },
  ]);

  // Crowd Voting
  const [crowdVotes, setCrowdVotes] = useState<CrowdVote>({
    player1: 0,
    player2: 0,
    totalVotes: 0,
  });

  const [audienceCount, setAudienceCount] = useState(1247);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Audio Analysis
  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<RealTimeAnalysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Animation refs
  const player1ScoreAnim = useRef(new Animated.Value(0)).current;
  const player2ScoreAnim = useRef(new Animated.Value(0)).current;
  const battlePulseAnim = useRef(new Animated.Value(1)).current;
  const crowdEnergyAnim = useRef(new Animated.Value(0)).current;

  // Audio recording
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    initializeBattle();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (battleState.status === 'active') {
      const interval = setInterval(() => {
        setBattleState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);

      const battleTimer = setTimeout(() => {
        finishBattle();
      }, battleState.timeRemaining * 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(battleTimer);
      };
    }
  }, [battleState.status]);

  const initializeBattle = async () => {
    // Simulate battle initialization
    setBattleState(prev => ({ ...prev, status: 'countdown' }));
    
    // Countdown animation
    Animated.sequence([
      Animated.timing(battlePulseAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(battlePulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setBattleState(prev => ({ ...prev, status: 'active' }));
      startRecording();
    }, 3000);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for battles');
        return;
      }

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      setRecording(newRecording);
      setIsRecording(true);
      
      // Start real-time pitch detection simulation
      startPitchDetection();
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const startPitchDetection = () => {
    const pitchInterval = setInterval(async () => {
      if (battleState.status !== 'active') {
        clearInterval(pitchInterval);
        return;
      }

      // Simulate pitch detection (in real app, this would use actual audio data)
      const mockAudioData = new Float32Array(1024).map(() => Math.random() * 2 - 1);
      
      try {
        const detectedPitch = await aiScoringService.detectPitch(mockAudioData);
        setCurrentPitch(detectedPitch);

        // Simulate target pitch based on current lyric
        const targetPitch: PitchData = {
          frequency: 440 + Math.sin(Date.now() / 1000) * 100, // Simulate melody
          confidence: 0.9,
          timestamp: Date.now(),
          note: 'A',
          octave: 4,
        };

        const analysis = await aiScoringService.analyzePerformanceRealTime(
          detectedPitch,
          targetPitch,
          battleState.currentLyric,
          Date.now()
        );

        setRealTimeAnalysis(analysis);
        updatePlayerScore(user?.id || '1', analysis.accuracy);

        // Simulate opponent performance
        const opponentAccuracy = 60 + Math.random() * 30; // 60-90% accuracy
        updatePlayerScore('2', opponentAccuracy);

      } catch (error) {
        console.error('Pitch detection error:', error);
      }
    }, 100); // 10 FPS analysis
  };

  const updatePlayerScore = (playerId: string, accuracy: number) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newScore = player.score + (accuracy > 80 ? 10 : accuracy > 60 ? 5 : 1);
        const newStreak = accuracy > 80 ? player.streak + 1 : 0;
        
        // Animate score changes
        const animValue = playerId === players[0].id ? player1ScoreAnim : player2ScoreAnim;
        Animated.spring(animValue, {
          toValue: newScore,
          useNativeDriver: false,
        }).start();

        return {
          ...player,
          score: newScore,
          accuracy: Math.round(accuracy),
          streak: newStreak,
        };
      }
      return player;
    }));
  };

  const submitCrowdVote = (playerIndex: number) => {
    setCrowdVotes(prev => ({
      player1: prev.player1 + (playerIndex === 0 ? 1 : 0),
      player2: prev.player2 + (playerIndex === 1 ? 1 : 0),
      totalVotes: prev.totalVotes + 1,
    }));

    // Animate crowd energy
    Animated.timing(crowdEnergyAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(crowdEnergyAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });

    setShowVoteModal(false);
  };

  const finishBattle = async () => {
    setBattleState(prev => ({ ...prev, status: 'finished' }));
    setIsRecording(false);
    
    if (recording) {
      await recording.stopAndUnloadAsync();
    }

    // Determine winner
    const [player1, player2] = players;
    const winner = player1.score > player2.score ? player1 : player2;
    const isUserWinner = winner.id === user?.id;

    // Calculate KARA rewards
    const baseReward = 50;
    const winnerBonus = isUserWinner ? 25 : 0;
    const accuracyBonus = Math.round((player1.accuracy / 100) * 20);
    const totalReward = baseReward + winnerBonus + accuracyBonus;

    if (isUserWinner) {
      await addTokens(user?.id || '', totalReward);
    }

    Alert.alert(
      isUserWinner ? '🏆 Victory!' : '💪 Good Battle!',
      `${winner.name} wins!\nYou earned ${totalReward} KARA tokens!`,
      [
        { text: 'View Results', onPress: () => router.push('/results') },
        { text: 'Battle Again', onPress: () => router.push('/(tabs)/battle') },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLeaderDisplay = () => {
    const [player1, player2] = players;
    if (player1.score === player2.score) return 'TIE';
    return player1.score > player2.score ? player1.name : player2.name;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.battleTitle}>
            {battleState.mode === 'duet' ? '🎭 Duet Mode' : 
             battleState.mode === 'coop' ? '🤝 Co-op Mode' : '⚡ Battle Arena'}
          </Text>
          <Text style={styles.audienceCount}>👥 {audienceCount} watching</Text>
        </View>
        <TouchableOpacity onPress={() => setShowVoteModal(true)}>
          <MaterialIcons name="how-to-vote" size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      {/* Battle Status */}
      <View style={styles.statusContainer}>
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.statusBar}
        >
          <Text style={styles.statusText}>
            {battleState.status === 'waiting' ? 'Waiting for opponent...' :
             battleState.status === 'countdown' ? 'Get Ready!' :
             battleState.status === 'active' ? `Leading: ${getLeaderDisplay()}` :
             'Battle Complete!'}
          </Text>
          <Text style={styles.timeRemaining}>
            {formatTime(battleState.timeRemaining)}
          </Text>
        </LinearGradient>
      </View>

      {/* Players Display */}
      <View style={styles.playersContainer}>
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerCard}>
            <LinearGradient
              colors={
                player.id === user?.id 
                  ? ['#10B981', '#059669'] 
                  : ['#EF4444', '#DC2626']
              }
              style={styles.playerGradient}
            >
              <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
              <Text style={styles.playerName}>{player.name}</Text>
              
              <Animated.View style={styles.scoreContainer}>
                <Text style={styles.playerScore}>{player.score}</Text>
                <Text style={styles.accuracyText}>{player.accuracy}% accurate</Text>
              </Animated.View>

              {player.streak > 0 && (
                <View style={styles.streakBadge}>
                  <MaterialIcons name="local-fire-department" size={16} color="#FFFFFF" />
                  <Text style={styles.streakText}>{player.streak}x</Text>
                </View>
              )}

              {/* Real-time pitch indicator */}
              {player.id === user?.id && currentPitch && (
                <View style={styles.pitchIndicator}>
                  <Text style={styles.pitchNote}>
                    {currentPitch.note}{currentPitch.octave}
                  </Text>
                  <View style={[
                    styles.pitchConfidence,
                    { width: `${currentPitch.confidence * 100}%` }
                  ]} />
                </View>
              )}
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Crowd Voting Bar */}
      <View style={styles.crowdVotingContainer}>
        <Text style={styles.crowdVotingTitle}>🎭 Crowd Votes</Text>
        <View style={styles.votingBar}>
          <View style={[
            styles.vote1Bar,
            { width: crowdVotes.totalVotes > 0 ? `${(crowdVotes.player1 / crowdVotes.totalVotes) * 100}%` : '50%' }
          ]} />
          <View style={[
            styles.vote2Bar,
            { width: crowdVotes.totalVotes > 0 ? `${(crowdVotes.player2 / crowdVotes.totalVotes) * 100}%` : '50%' }
          ]} />
        </View>
        <View style={styles.voteNumbers}>
          <Text style={styles.voteCount}>{crowdVotes.player1}</Text>
          <Text style={styles.voteCount}>{crowdVotes.player2}</Text>
        </View>
      </View>

      {/* Real-time Analysis */}
      {realTimeAnalysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>🎯 Live Analysis</Text>
          <Text style={styles.accuracyDisplay}>
            Accuracy: {realTimeAnalysis.accuracy}%
          </Text>
          {realTimeAnalysis.suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestion}>
              {suggestion}
            </Text>
          ))}
        </View>
      )}

      {/* Battle Controls */}
      <View style={styles.controlsContainer}>
        {battleState.status === 'active' && (
          <TouchableOpacity
            style={[styles.micButton, { opacity: isRecording ? 1 : 0.6 }]}
            disabled={!isRecording}
          >
            <Animated.View style={{ transform: [{ scale: battlePulseAnim }] }}>
              <MaterialIcons name="mic" size={32} color="#FFFFFF" />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* Crowd Voting Modal */}
      <Modal
        visible={showVoteModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voteModal}>
            <Text style={styles.voteModalTitle}>Vote for Your Favorite!</Text>
            <View style={styles.voteOptions}>
              {players.map((player, index) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.voteOption}
                  onPress={() => submitCrowdVote(index)}
                >
                  <Image source={{ uri: player.avatar }} style={styles.voteAvatar} />
                  <Text style={styles.votePlayerName}>{player.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.voteCancel}
              onPress={() => setShowVoteModal(false)}
            >
              <Text style={styles.voteCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerInfo: {
    alignItems: 'center',
  },
  battleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  audienceCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusBar: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  playerCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  playerGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 180,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  playerScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  accuracyText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  pitchIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  pitchNote: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pitchConfidence: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  crowdVotingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  crowdVotingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  votingBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    marginBottom: 8,
  },
  vote1Bar: {
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  vote2Bar: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  voteNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analysisContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  accuracyDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  micButton: {
    backgroundColor: '#EF4444',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  voteModal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  voteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  voteOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  voteOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    minWidth: 100,
  },
  voteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  votePlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  voteCancel: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  voteCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});