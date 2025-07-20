// Powered by OnSpace.AI - Karatoken Challenges
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuthStore';

const { width } = Dimensions.get('window');

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  reward: number;
  participants: number;
  timeLeft: string;
  song?: string;
  artist?: string;
  genre?: string;
  status: 'active' | 'upcoming' | 'completed';
  userParticipated?: boolean;
  userRank?: number;
}

interface DailyReward {
  id: string;
  type: 'kara' | 'bonus' | 'mystery';
  amount: number;
  description: string;
  claimed: boolean;
}

export default function ChallengesScreen() {
  const { user } = useAuthStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dailyRewards, setDailyRewards] = useState<DailyReward[]>([]);
  const [selectedTab, setSelectedTab] = useState<'challenges' | 'rewards'>('challenges');
  const [loginStreak, setLoginStreak] = useState(7);

  useEffect(() => {
    loadChallenges();
    loadDailyRewards();
  }, []);

  const loadChallenges = () => {
    // Mock challenge data
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: '🔥 Daily Fire Challenge',
        description: 'Sing any trending song and get scored by the community',
        type: 'daily',
        difficulty: 'easy',
        reward: 50,
        participants: 1247,
        timeLeft: '18h 42m',
        status: 'active',
        userParticipated: false,
      },
      {
        id: '2',
        title: '🎵 Weekly Genre Master',
        description: 'Master 3 different genres this week',
        type: 'weekly',
        difficulty: 'medium',
        reward: 250,
        participants: 489,
        timeLeft: '3d 12h',
        status: 'active',
        userParticipated: true,
        userRank: 23,
      },
      {
        id: '3',
        title: '👑 Monthly Vocal Championship',
        description: 'Compete for the ultimate vocal crown',
        type: 'monthly',
        difficulty: 'expert',
        reward: 1000,
        participants: 2847,
        timeLeft: '12d 6h',
        song: 'Bohemian Rhapsody',
        artist: 'Queen',
        genre: 'Rock',
        status: 'active',
        userParticipated: false,
      },
      {
        id: '4',
        title: '✨ Holiday Special',
        description: 'Sing holiday classics for bonus rewards',
        type: 'special',
        difficulty: 'medium',
        reward: 500,
        participants: 892,
        timeLeft: '5d 3h',
        status: 'active',
        userParticipated: false,
      },
      {
        id: '5',
        title: '🎤 Duet Challenge',
        description: 'Partner up for amazing duet performances',
        type: 'weekly',
        difficulty: 'hard',
        reward: 350,
        participants: 156,
        timeLeft: 'Starting in 2h',
        status: 'upcoming',
        userParticipated: false,
      },
    ];
    setChallenges(mockChallenges);
  };

  const loadDailyRewards = () => {
    // Mock daily rewards
    const mockRewards: DailyReward[] = [
      {
        id: '1',
        type: 'kara',
        amount: 25,
        description: 'Daily Login Bonus',
        claimed: true,
      },
      {
        id: '2',
        type: 'bonus',
        amount: 15,
        description: `Day ${loginStreak} Streak Bonus`,
        claimed: false,
      },
      {
        id: '3',
        type: 'mystery',
        amount: 0,
        description: 'Mystery Box Available',
        claimed: false,
      },
    ];
    setDailyRewards(mockRewards);
  };

  const joinChallenge = (challenge: Challenge) => {
    if (challenge.status !== 'active') {
      Alert.alert('Not Available', 'This challenge is not currently active');
      return;
    }

    Alert.alert(
      'Join Challenge',
      `Join "${challenge.title}" for a chance to win ${challenge.reward} KARA tokens?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            // In a real app, this would navigate to the karaoke screen with challenge parameters
            if (challenge.song && challenge.artist) {
              router.push({
                pathname: '/karaoke/[songId]',
                params: {
                  songId: challenge.id,
                  songTitle: challenge.song,
                  artistName: challenge.artist,
                  challenge: 'true',
                  challengeId: challenge.id,
                }
              });
            } else {
              router.push('/song-selection');
            }
          }
        }
      ]
    );
  };

  const claimReward = (reward: DailyReward) => {
    if (reward.claimed) return;

    if (reward.type === 'mystery') {
      // Simulate mystery box opening
      const prizes = [50, 75, 100, 150, 200];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      
      Alert.alert(
        '🎉 Mystery Box Opened!',
        `You won ${randomPrize} KARA tokens!`,
        [{ text: 'Awesome!', onPress: () => {
          setDailyRewards(prev => prev.map(r => 
            r.id === reward.id ? { ...r, claimed: true, amount: randomPrize } : r
          ));
        }}]
      );
    } else {
      setDailyRewards(prev => prev.map(r => 
        r.id === reward.id ? { ...r, claimed: true } : r
      ));
      Alert.alert('Reward Claimed!', `You received ${reward.amount} KARA tokens!`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      case 'expert': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return 'today';
      case 'weekly': return 'view-week';
      case 'monthly': return 'calendar-month';
      case 'special': return 'stars';
      default: return 'event';
    }
  };

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <TouchableOpacity 
      style={styles.challengeCard}
      onPress={() => joinChallenge(item)}
    >
      <LinearGradient
        colors={
          item.type === 'special' 
            ? ['#F59E0B', '#D97706']
            : item.type === 'monthly'
            ? ['#8B5CF6', '#7C3AED']
            : ['#1F2937', '#374151']
        }
        style={styles.challengeGradient}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTypeContainer}>
            <MaterialIcons 
              name={getTypeIcon(item.type)} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.challengeType}>{item.type.toUpperCase()}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeDescription}>{item.description}</Text>

        {item.song && item.artist && (
          <View style={styles.songInfo}>
            <MaterialIcons name="music-note" size={16} color="#FFFFFF" />
            <Text style={styles.songText}>{item.song} - {item.artist}</Text>
          </View>
        )}

        <View style={styles.challengeStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="group" size={16} color="#FFFFFF" />
            <Text style={styles.statText}>{item.participants} joined</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={16} color="#FFFFFF" />
            <Text style={styles.statText}>{item.timeLeft}</Text>
          </View>
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.rewardContainer}>
            <MaterialIcons name="paid" size={20} color="#F59E0B" />
            <Text style={styles.rewardText}>{item.reward} KARA</Text>
          </View>
          
          {item.userParticipated ? (
            <View style={styles.participatedBadge}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.participatedText}>
                {item.userRank ? `Rank #${item.userRank}` : 'Joined'}
              </Text>
            </View>
          ) : (
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'active' ? '#10B981' : '#6B7280' }
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'active' ? 'JOIN NOW' : 'UPCOMING'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDailyReward = ({ item }: { item: DailyReward }) => (
    <TouchableOpacity 
      style={[styles.rewardCard, item.claimed && styles.rewardCardClaimed]}
      onPress={() => claimReward(item)}
      disabled={item.claimed}
    >
      <View style={styles.rewardIcon}>
        <MaterialIcons 
          name={
            item.type === 'kara' ? 'paid' :
            item.type === 'bonus' ? 'card-giftcard' : 'help_outline'
          }
          size={24} 
          color={item.claimed ? '#6B7280' : '#F59E0B'} 
        />
      </View>
      <View style={styles.rewardInfo}>
        <Text style={[styles.rewardTitle, item.claimed && styles.rewardTitleClaimed]}>
          {item.description}
        </Text>
        {item.amount > 0 && (
          <Text style={[styles.rewardAmount, item.claimed && styles.rewardAmountClaimed]}>
            +{item.amount} KARA
          </Text>
        )}
      </View>
      {item.claimed ? (
        <MaterialIcons name="check-circle" size={24} color="#10B981" />
      ) : (
        <MaterialIcons name="arrow-forward-ios" size={16} color="#6B7280" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <TouchableOpacity style={styles.infoButton}>
          <MaterialIcons name="info" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'challenges' && styles.tabActive]}
          onPress={() => setSelectedTab('challenges')}
        >
          <Text style={[styles.tabText, selectedTab === 'challenges' && styles.tabTextActive]}>
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'rewards' && styles.tabActive]}
          onPress={() => setSelectedTab('rewards')}
        >
          <Text style={[styles.tabText, selectedTab === 'rewards' && styles.tabTextActive]}>
            Daily Rewards
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedTab === 'challenges' ? (
          <>
            {/* Featured Challenge */}
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>🏆 Featured Challenge</Text>
              {challenges.filter(c => c.type === 'monthly').map(challenge => (
                <View key={challenge.id}>
                  {renderChallenge({ item: challenge })}
                </View>
              ))}
            </View>

            {/* All Challenges */}
            <View style={styles.allChallengesSection}>
              <Text style={styles.sectionTitle}>All Challenges</Text>
              <FlatList
                data={challenges.filter(c => c.type !== 'monthly')}
                renderItem={renderChallenge}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </>
        ) : (
          <View style={styles.rewardsSection}>
            {/* Streak Info */}
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.streakBanner}
            >
              <View style={styles.streakContent}>
                <MaterialIcons name="local-fire-department" size={32} color="#FFFFFF" />
                <View style={styles.streakText}>
                  <Text style={styles.streakTitle}>{loginStreak} Day Streak!</Text>
                  <Text style={styles.streakSubtitle}>Keep it up for bonus rewards</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Daily Rewards */}
            <Text style={styles.sectionTitle}>Today's Rewards</Text>
            <FlatList
              data={dailyRewards}
              renderItem={renderDailyReward}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            {/* Mystery Features */}
            <View style={styles.mysterySection}>
              <Text style={styles.sectionTitle}>🎁 Mystery Features</Text>
              
              <TouchableOpacity style={styles.mysteryCard}>
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.mysteryGradient}
                >
                  <MaterialIcons name="casino" size={32} color="#FFFFFF" />
                  <Text style={styles.mysteryTitle}>Spin the Wheel</Text>
                  <Text style={styles.mysterySubtitle}>Win up to 500 KARA!</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mysteryCard}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.mysteryGradient}
                >
                  <MaterialIcons name="lock" size={32} color="#FFFFFF" />
                  <Text style={styles.mysteryTitle}>Treasure Vault</Text>
                  <Text style={styles.mysterySubtitle}>Unlock with daily streaks</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#6B46C1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  allChallengesSection: {
    paddingHorizontal: 20,
  },
  rewardsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  challengeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  songText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
  },
  challengeStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  participatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participatedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 16,
    flex: 1,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  rewardCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardCardClaimed: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rewardTitleClaimed: {
    color: '#6B7280',
  },
  rewardAmount: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 4,
  },
  rewardAmountClaimed: {
    color: '#6B7280',
  },
  mysterySection: {
    marginTop: 24,
  },
  mysteryCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mysteryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  mysteryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  mysterySubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
});