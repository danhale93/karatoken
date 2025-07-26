// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useBattleStore } from '../../hooks/useBattleStore';

export default function BattleScreen() {
  const { user } = useAuthStore();
  const { getActiveBattles, joinBattle, createBattle } = useBattleStore();
  const [battles, setBattles] = useState([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming'>('active');

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      const activeBattles = await getActiveBattles();
      setBattles(activeBattles);
    } catch (error) {
      console.error('Error loading battles:', error);
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    try {
      await joinBattle(battleId);
      Alert.alert('Success', 'You have joined the battle!');
      router.push(`/battle/${battleId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to join battle');
    }
  };

  const handleCreateBattle = () => {
    router.push('/song-selection?mode=battle');
  };

  const getBattleStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return '#F59E0B';
      case 'active':
        return '#10B981';
      case 'completed':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  const renderBattleCard = ({ item }) => {
    const isActive = item.status === 'active';
    const isWaiting = item.status === 'waiting';
    const canJoin = isWaiting && item.participantCount < item.maxParticipants;

    return (
      <View style={styles.battleCard}>
        <LinearGradient
          colors={isActive ? ['#10B981', '#059669'] : ['#1F2937', '#374151']}
          style={styles.cardGradient}
        >
          {/* Battle Header */}
          <View style={styles.battleHeader}>
            <View style={styles.battleInfo}>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getBattleStatusColor(item.status) }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.battleReward}>🏆 {item.reward} KRT</Text>
            </View>
            <MaterialIcons 
              name="flash-on" 
              size={32} 
              color={isActive ? '#FFFFFF' : '#10B981'} 
            />
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{item.songTitle}</Text>
            <Text style={styles.artistName}>{item.artistName}</Text>
          </View>

          {/* Participants */}
          <View style={styles.participantsSection}>
            <Text style={styles.participantsTitle}>Participants</Text>
            <View style={styles.participantsList}>
              {item.participants.slice(0, 3).map((participant, index) => (
                <Image
                  key={participant.userId}
                  source={{ uri: participant.photoURL || 'https://picsum.photos/seed/participant/40/40.webp' }}
                  style={[styles.participantPhoto, { marginLeft: index > 0 ? -10 : 0 }]}
                />
              ))}
              {item.participantCount > 3 && (
                <View style={styles.moreParticipants}>
                  <Text style={styles.moreParticipantsText}>
                    +{item.participantCount - 3}
                  </Text>
                </View>
              )}
              <Text style={styles.participantCount}>
                {item.participantCount}/{item.maxParticipants}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              !canJoin && styles.disabledButton,
            ]}
            onPress={() => canJoin ? handleJoinBattle(item.id) : null}
            disabled={!canJoin}
          >
            <Text style={styles.actionButtonText}>
              {isActive ? 'Battle in Progress' : canJoin ? 'Join Battle' : 'Battle Full'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Battle Arena</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateBattle}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'active' && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('active')}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'active' && styles.activeTabButtonText,
            ]}
          >
            Active Battles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'upcoming' && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text
            style={[
              styles.tabButtonText,
              selectedTab === 'upcoming' && styles.activeTabButtonText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Start */}
      <View style={styles.quickStart}>
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.quickStartGradient}
        >
          <MaterialIcons name="rocket-launch" size={40} color="#FFFFFF" />
          <View style={styles.quickStartContent}>
            <Text style={styles.quickStartTitle}>Quick Battle</Text>
            <Text style={styles.quickStartSubtitle}>
              Join a random battle and start singing!
            </Text>
          </View>
          <TouchableOpacity style={styles.quickStartButton}>
            <Text style={styles.quickStartButtonText}>Start</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Battles List */}
      <FlatList
        data={battles}
        renderItem={renderBattleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={loadBattles}
      />
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  quickStart: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  quickStartContent: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  quickStartButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickStartButtonText: {
    color: '#6B46C1',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  battleCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  battleInfo: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  battleReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  songInfo: {
    marginBottom: 15,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  participantsSection: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    opacity: 0.8,
  },
  participantsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreParticipantsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 15,
    opacity: 0.8,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
