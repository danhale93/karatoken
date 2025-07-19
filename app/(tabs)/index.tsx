// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../hooks/useAuthStore';
import { usePerformanceStore } from '../../hooks/usePerformanceStore';
import { useBattleStore } from '../../hooks/useBattleStore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { getRecentPerformances } = usePerformanceStore();
  const { getActiveBattles } = useBattleStore();
  const [recentPerformances, setRecentPerformances] = useState([]);
  const [activeBattles, setActiveBattles] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const performances = await getRecentPerformances(user.id);
      const battles = await getActiveBattles();
      setRecentPerformances(performances);
      setActiveBattles(battles);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const navigateToSongSelection = () => {
    router.push('/song-selection');
  };

  const navigateToBattle = () => {
    router.push('/(tabs)/battle');
  };

  const renderPerformanceCard = ({ item }) => (
    <TouchableOpacity style={styles.performanceCard}>
      <Image 
        source={{ uri: item.thumbnailUrl || 'https://picsum.photos/seed/music/120/120.webp' }}
        style={styles.performanceThumbnail}
      />
      <View style={styles.performanceInfo}>
        <Text style={styles.songTitle}>{item.songTitle}</Text>
        <Text style={styles.artistName}>{item.artistName}</Text>
        <View style={styles.scoreContainer}>
          <MaterialIcons name="star" size={16} color="#F59E0B" />
          <Text style={styles.scoreText}>{item.score}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBattleCard = ({ item }) => (
    <TouchableOpacity style={styles.battleCard}>
      <View style={styles.battleHeader}>
        <MaterialIcons name="flash-on" size={20} color="#10B981" />
        <Text style={styles.battleTitle}>Live Battle</Text>
        <Text style={styles.battleStatus}>ACTIVE</Text>
      </View>
      <Text style={styles.battleSong}>{item.songTitle}</Text>
      <View style={styles.battleParticipants}>
        <Text style={styles.participantCount}>{item.participantCount} singers</Text>
        <Text style={styles.battleReward}>🏆 {item.reward} KRT</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <MaterialIcons name="mic" size={80} color="#6B46C1" />
          <Text style={styles.authTitle}>Welcome to Karatoken</Text>
          <Text style={styles.authSubtitle}>Sign in to start your karaoke journey</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.authButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user.displayName}!</Text>
            <Text style={styles.subtitle}>Ready to rock the stage?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={navigateToSongSelection}
          >
            <LinearGradient
              colors={['#6B46C1', '#8B5CF6']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="mic" size={32} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Start Singing</Text>
              <Text style={styles.actionSubtitle}>Choose a song</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={navigateToBattle}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="flash-on" size={32} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Quick Battle</Text>
              <Text style={styles.actionSubtitle}>Compete now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Active Battles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Battles</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/battle')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={activeBattles}
            renderItem={renderBattleCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Recent Performances */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Recent Performances</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentPerformances}
            renderItem={renderPerformanceCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Daily Challenge */}
        <View style={styles.challengeSection}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.challengeCard}
          >
            <View style={styles.challengeContent}>
              <MaterialIcons name="emoji-events" size={40} color="#FFFFFF" />
              <Text style={styles.challengeTitle}>Daily Challenge</Text>
              <Text style={styles.challengeDescription}>
                Sing "Bohemian Rhapsody" and earn 100 KRT!
              </Text>
              <TouchableOpacity style={styles.challengeButton}>
                <Text style={styles.challengeButtonText}>Accept Challenge</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  primaryAction: {
    flex: 1,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
  },
  secondaryAction: {
    flex: 1,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 20,
  },
  performanceCard: {
    width: 160,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
  },
  performanceThumbnail: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    marginBottom: 10,
  },
  performanceInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  battleCard: {
    width: 200,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  battleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  battleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  battleStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  battleSong: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  battleParticipants: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  battleReward: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  challengeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  challengeCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  challengeContent: {
    padding: 20,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 15,
    opacity: 0.9,
  },
  challengeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  challengeButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
});