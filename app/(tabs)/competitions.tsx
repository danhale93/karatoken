import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useWalletStore } from '../hooks/useWalletStore';

const { width, height } = Dimensions.get('window');

interface Competition {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  genre: string;
  entryFee: number;
  isJoined: boolean;
  isVoted: boolean;
}

interface Performance {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  songTitle: string;
  artistName: string;
  score: number;
  votes: number;
  duration: number;
  thumbnail: string;
}

export default function CompetitionsScreen() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [activeTab, setActiveTab] = useState<'competitions' | 'performances'>('competitions');
  const { balance } = useWalletStore();

  useEffect(() => {
    loadCompetitions();
    loadPerformances();
  }, []);

  const loadCompetitions = () => {
    // Mock data - replace with API call
    const mockCompetitions: Competition[] = [
      {
        id: 'comp-1',
        title: 'Pop Stars Daily Challenge',
        description: 'Show off your pop singing skills in this daily competition!',
        type: 'daily',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        prizePool: 5000,
        participants: 127,
        maxParticipants: 200,
        status: 'active',
        genre: 'pop',
        entryFee: 50,
        isJoined: false,
        isVoted: false,
      },
      {
        id: 'comp-2',
        title: 'Rock Legends Weekly',
        description: 'Weekly rock competition with amazing prizes!',
        type: 'weekly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 604800000).toISOString(),
        prizePool: 25000,
        participants: 89,
        maxParticipants: 150,
        status: 'active',
        genre: 'rock',
        entryFee: 100,
        isJoined: true,
        isVoted: false,
      },
      {
        id: 'comp-3',
        title: 'EDM Masterclass Monthly',
        description: 'Monthly EDM competition with industry judges!',
        type: 'monthly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2592000000).toISOString(),
        prizePool: 100000,
        participants: 45,
        maxParticipants: 100,
        status: 'upcoming',
        genre: 'edm',
        entryFee: 200,
        isJoined: false,
        isVoted: false,
      },
      {
        id: 'comp-4',
        title: 'Country Roads Daily',
        description: 'Daily country music challenge!',
        type: 'daily',
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date().toISOString(),
        prizePool: 3000,
        participants: 95,
        maxParticipants: 150,
        status: 'voting',
        genre: 'country',
        entryFee: 30,
        isJoined: true,
        isVoted: true,
      },
    ];
    setCompetitions(mockCompetitions);
  };

  const loadPerformances = () => {
    // Mock data - replace with API call
    const mockPerformances: Performance[] = [
      {
        id: 'perf-1',
        userId: 'user-1',
        username: 'SarahStar',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Sweet Caroline',
        artistName: 'Neil Diamond',
        score: 94,
        votes: 127,
        duration: 180,
        thumbnail: 'https://via.placeholder.com/120x80',
      },
      {
        id: 'perf-2',
        userId: 'user-2',
        username: 'MikeMusic',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Bohemian Rhapsody',
        artistName: 'Queen',
        score: 91,
        votes: 98,
        duration: 210,
        thumbnail: 'https://via.placeholder.com/120x80',
      },
      {
        id: 'perf-3',
        userId: 'user-3',
        username: 'LisaLoves',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Hotel California',
        artistName: 'Eagles',
        score: 89,
        votes: 76,
        duration: 195,
        thumbnail: 'https://via.placeholder.com/120x80',
      },
    ];
    setPerformances(mockPerformances);
  };

  const joinCompetition = async (competition: Competition) => {
    if (balance.krt < competition.entryFee) {
      Alert.alert('Insufficient Balance', 'You need more KRT tokens to join this competition.');
      return;
    }

    try {
      // TODO: API call to join competition
      setCompetitions(prev => 
        prev.map(comp => 
          comp.id === competition.id 
            ? { ...comp, isJoined: true, participants: comp.participants + 1 }
            : comp
        )
      );
      Alert.alert('Success', 'You have joined the competition!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join competition');
    }
  };

  const voteForPerformance = async (performanceId: string) => {
    try {
      // TODO: API call to vote
      setPerformances(prev => 
        prev.map(perf => 
          perf.id === performanceId 
            ? { ...perf, votes: perf.votes + 1 }
            : perf
        )
      );
      Alert.alert('Vote Cast!', 'Your vote has been recorded.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cast vote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'voting': return '#667eea';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '🌅';
      case 'weekly': return '📅';
      case 'monthly': return '🏆';
      default: return '🎵';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Global Competitions</Text>
          <TouchableOpacity style={styles.walletButton}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#FFFFFF" />
            <Text style={styles.walletText}>{balance.krt} KRT</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'competitions' && styles.activeTab]}
            onPress={() => setActiveTab('competitions')}
          >
            <Text style={[styles.tabText, activeTab === 'competitions' && styles.activeTabText]}>
              Competitions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'performances' && styles.activeTab]}
            onPress={() => setActiveTab('performances')}
          >
            <Text style={[styles.tabText, activeTab === 'performances' && styles.activeTabText]}>
              Performances
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'competitions' ? (
            // Competitions List
            <View>
              {competitions.map((competition) => (
                <View key={competition.id} style={styles.competitionCard}>
                  <View style={styles.competitionHeader}>
                    <View style={styles.competitionInfo}>
                      <Text style={styles.competitionType}>
                        {getTypeIcon(competition.type)} {competition.type.toUpperCase()}
                      </Text>
                      <Text style={styles.competitionTitle}>{competition.title}</Text>
                      <Text style={styles.competitionDescription}>{competition.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(competition.status) }]}>
                      <Text style={styles.statusText}>{competition.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.competitionDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="monetization-on" size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>Prize Pool: {competition.prizePool.toLocaleString()} KRT</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="people" size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>
                        {competition.participants}/{competition.maxParticipants} Participants
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="schedule" size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>
                        Ends: {formatDate(competition.endDate)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="music-note" size={16} color="#FFFFFF" />
                      <Text style={styles.detailText}>Genre: {competition.genre.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.competitionActions}>
                    {competition.isJoined ? (
                      <View style={styles.joinedBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#10B981" />
                        <Text style={styles.joinedText}>Joined</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => joinCompetition(competition)}
                      >
                        <MaterialIcons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.joinButtonText}>
                          Join ({competition.entryFee} KRT)
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => {
                        setSelectedCompetition(competition);
                        setActiveTab('performances');
                      }}
                    >
                      <Text style={styles.viewButtonText}>View Performances</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // Performances List
            <View>
              {selectedCompetition && (
                <View style={styles.selectedCompetition}>
                  <Text style={styles.selectedCompetitionTitle}>
                    {selectedCompetition.title}
                  </Text>
                  <Text style={styles.selectedCompetitionSubtitle}>
                    {performances.length} performances • {selectedCompetition.status}
                  </Text>
                </View>
              )}

              {performances.map((performance, index) => (
                <View key={performance.id} style={styles.performanceCard}>
                  <View style={styles.performanceHeader}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <Image source={{ uri: performance.avatar }} style={styles.avatar} />
                    <View style={styles.performanceInfo}>
                      <Text style={styles.username}>{performance.username}</Text>
                      <Text style={styles.songInfo}>
                        {performance.songTitle} • {performance.artistName}
                      </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.score}>{performance.score}%</Text>
                    </View>
                  </View>

                  <View style={styles.performanceDetails}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="schedule" size={14} color="#E0E0E0" />
                      <Text style={styles.detailText}>{formatTime(performance.duration)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="thumb-up" size={14} color="#E0E0E0" />
                      <Text style={styles.detailText}>{performance.votes} votes</Text>
                    </View>
                  </View>

                  <View style={styles.performanceActions}>
                    <TouchableOpacity style={styles.playButton}>
                      <MaterialIcons name="play-arrow" size={20} color="#667eea" />
                      <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => voteForPerformance(performance.id)}
                    >
                      <MaterialIcons name="favorite" size={16} color="#FFFFFF" />
                      <Text style={styles.voteButtonText}>Vote</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  walletText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  competitionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  competitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  competitionInfo: {
    flex: 1,
  },
  competitionType: {
    fontSize: 12,
    color: '#E0E0E0',
    marginBottom: 4,
  },
  competitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  competitionDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  competitionDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  competitionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  joinedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCompetition: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedCompetitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedCompetitionSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  performanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  performanceInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  songInfo: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  score: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  performanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  voteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});