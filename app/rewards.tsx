import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useWalletStore } from '../hooks/useWalletStore';

const { width, height } = Dimensions.get('window');

interface Reward {
  id: string;
  type: 'daily' | 'streak' | 'scratch' | 'wheel' | 'vault' | 'mystery';
  title: string;
  description: string;
  amount: number;
  icon: string;
  isClaimed: boolean;
  isAvailable: boolean;
  expiresAt?: string;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastClaimDate: string;
  nextClaimDate: string;
}

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    currentStreak: 7,
    longestStreak: 15,
    lastClaimDate: new Date(Date.now() - 86400000).toISOString(),
    nextClaimDate: new Date(Date.now() + 86400000).toISOString(),
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const { balance, addTokens } = useWalletStore();
  
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const scratchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = () => {
    // Mock data - replace with API call
    const mockRewards: Reward[] = [
      {
        id: 'daily-1',
        type: 'daily',
        title: 'Daily Login Bonus',
        description: 'Claim your daily reward!',
        amount: 50,
        icon: '🎁',
        isClaimed: false,
        isAvailable: true,
      },
      {
        id: 'streak-1',
        type: 'streak',
        title: '7-Day Streak Bonus',
        description: 'Amazing streak reward!',
        amount: 200,
        icon: '🔥',
        isClaimed: false,
        isAvailable: true,
      },
      {
        id: 'scratch-1',
        type: 'scratch',
        title: 'Scratch Card',
        description: 'Scratch to reveal your reward!',
        amount: 0, // Will be revealed
        icon: '🎫',
        isClaimed: false,
        isAvailable: true,
      },
      {
        id: 'wheel-1',
        type: 'wheel',
        title: 'Spin the Wheel',
        description: 'Spin for a chance to win big!',
        amount: 0, // Will be determined by spin
        icon: '🎡',
        isClaimed: false,
        isAvailable: true,
      },
      {
        id: 'vault-1',
        type: 'vault',
        title: 'Mystery Vault',
        description: 'Unlock the vault for a surprise!',
        amount: 500,
        icon: '🔒',
        isClaimed: false,
        isAvailable: true,
      },
      {
        id: 'mystery-1',
        type: 'mystery',
        title: 'Mystery Box',
        description: 'What\'s inside?',
        amount: 150,
        icon: '📦',
        isClaimed: false,
        isAvailable: true,
      },
    ];
    setRewards(mockRewards);
  };

  const claimDailyReward = async () => {
    try {
      const dailyReward = rewards.find(r => r.type === 'daily' && r.isAvailable);
      if (!dailyReward) {
        Alert.alert('Already Claimed', 'You\'ve already claimed your daily reward today!');
        return;
      }

      // Update streak
      const newStreak = streakInfo.currentStreak + 1;
      setStreakInfo(prev => ({
        ...prev,
        currentStreak: newStreak,
        lastClaimDate: new Date().toISOString(),
        nextClaimDate: new Date(Date.now() + 86400000).toISOString(),
      }));

      // Add tokens
      addTokens(dailyReward.amount);

      // Mark as claimed
      setRewards(prev => 
        prev.map(r => 
          r.id === dailyReward.id 
            ? { ...r, isClaimed: true, isAvailable: false }
            : r
        )
      );

      Alert.alert('Reward Claimed!', `You earned ${dailyReward.amount} KRT tokens!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to claim daily reward');
    }
  };

  const spinWheel = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    // Simulate spinning animation
    const spinDuration = 3000;
    const spinRotations = 5 + Math.random() * 5; // 5-10 rotations
    
    Animated.timing(spinAnimation, {
      toValue: spinRotations * 360,
      duration: spinDuration,
      useNativeDriver: true,
    }).start();

    // Determine reward after spin
    setTimeout(() => {
      const possibleRewards = [25, 50, 100, 200, 500, 1000];
      const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
      
      addTokens(reward);
      
      setRewards(prev => 
        prev.map(r => 
          r.type === 'wheel' 
            ? { ...r, isClaimed: true, isAvailable: false, amount: reward }
            : r
        )
      );

      Alert.alert('Spin Complete!', `You won ${reward} KRT tokens!`);
      setIsSpinning(false);
      spinAnimation.setValue(0);
    }, spinDuration);
  };

  const scratchCard = async () => {
    if (isScratching) return;

    setIsScratching(true);
    
    // Simulate scratching animation
    Animated.timing(scratchAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Determine reward after scratching
    setTimeout(() => {
      const possibleRewards = [10, 25, 50, 75, 100];
      const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
      
      addTokens(reward);
      
      setRewards(prev => 
        prev.map(r => 
          r.type === 'scratch' 
            ? { ...r, isClaimed: true, isAvailable: false, amount: reward }
            : r
        )
      );

      Alert.alert('Scratch Complete!', `You revealed ${reward} KRT tokens!`);
      setIsScratching(false);
      scratchAnimation.setValue(0);
    }, 2000);
  };

  const unlockVault = async () => {
    try {
      const vaultReward = rewards.find(r => r.type === 'vault' && r.isAvailable);
      if (!vaultReward) {
        Alert.alert('Vault Unavailable', 'This vault is not available right now.');
        return;
      }

      addTokens(vaultReward.amount);
      
      setRewards(prev => 
        prev.map(r => 
          r.id === vaultReward.id 
            ? { ...r, isClaimed: true, isAvailable: false }
            : r
        )
      );

      Alert.alert('Vault Unlocked!', `You found ${vaultReward.amount} KRT tokens!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock vault');
    }
  };

  const claimMysteryBox = async () => {
    try {
      const mysteryReward = rewards.find(r => r.type === 'mystery' && r.isAvailable);
      if (!mysteryReward) {
        Alert.alert('Box Unavailable', 'This mystery box is not available right now.');
        return;
      }

      addTokens(mysteryReward.amount);
      
      setRewards(prev => 
        prev.map(r => 
          r.id === mysteryReward.id 
            ? { ...r, isClaimed: true, isAvailable: false }
            : r
        )
      );

      Alert.alert('Mystery Revealed!', `You found ${mysteryReward.amount} KRT tokens!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to claim mystery box');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStreakMultiplier = (streak: number) => {
    if (streak >= 30) return 3;
    if (streak >= 14) return 2;
    if (streak >= 7) return 1.5;
    return 1;
  };

  const renderReward = (reward: Reward) => {
    const isClaimable = reward.isAvailable && !reward.isClaimed;
    
    return (
      <View key={reward.id} style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <Text style={styles.rewardIcon}>{reward.icon}</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>{reward.title}</Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
          </View>
          {reward.amount > 0 && (
            <View style={styles.amountBadge}>
              <Text style={styles.amountText}>{reward.amount} KRT</Text>
            </View>
          )}
        </View>

        <View style={styles.rewardActions}>
          {reward.isClaimed ? (
            <View style={styles.claimedBadge}>
              <MaterialIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.claimedText}>Claimed</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.claimButton, !isClaimable && styles.claimButtonDisabled]}
              onPress={() => {
                switch (reward.type) {
                  case 'daily':
                    claimDailyReward();
                    break;
                  case 'wheel':
                    spinWheel();
                    break;
                  case 'scratch':
                    scratchCard();
                    break;
                  case 'vault':
                    unlockVault();
                    break;
                  case 'mystery':
                    claimMysteryBox();
                    break;
                  default:
                    // Handle other reward types
                    break;
                }
              }}
              disabled={!isClaimable}
            >
              <Text style={styles.claimButtonText}>
                {reward.type === 'wheel' ? 'Spin' : 
                 reward.type === 'scratch' ? 'Scratch' :
                 reward.type === 'vault' ? 'Unlock' :
                 'Claim'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewards</Text>
          <TouchableOpacity style={styles.walletButton}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#FFFFFF" />
            <Text style={styles.walletText}>{balance.krt} KRT</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Streak Info */}
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakTitle}>Login Streak</Text>
            </View>
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{streakInfo.currentStreak}</Text>
                <Text style={styles.streakLabel}>Current</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{streakInfo.longestStreak}</Text>
                <Text style={styles.streakLabel}>Longest</Text>
              </View>
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>x{getStreakMultiplier(streakInfo.currentStreak)}</Text>
                <Text style={styles.streakLabel}>Multiplier</Text>
              </View>
            </View>
            <Text style={styles.streakInfo}>
              Next daily reward: {formatDate(streakInfo.nextClaimDate)}
            </Text>
          </View>

          {/* Available Rewards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {rewards.filter(r => r.isAvailable).map(renderReward)}
          </View>

          {/* Claimed Rewards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claimed Rewards</Text>
            {rewards.filter(r => r.isClaimed).map(renderReward)}
          </View>

          {/* Spin the Wheel Section */}
          {rewards.find(r => r.type === 'wheel' && r.isAvailable) && (
            <View style={styles.wheelSection}>
              <Text style={styles.sectionTitle}>🎡 Spin the Wheel</Text>
              <View style={styles.wheelContainer}>
                <Animated.View
                  style={[
                    styles.wheel,
                    {
                      transform: [{
                        rotate: spinAnimation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.wheelInner}>
                    <Text style={styles.wheelText}>SPIN</Text>
                  </View>
                </Animated.View>
                <TouchableOpacity
                  style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]}
                  onPress={spinWheel}
                  disabled={isSpinning}
                >
                  <Text style={styles.spinButtonText}>
                    {isSpinning ? 'Spinning...' : 'Spin Now!'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Scratch Card Section */}
          {rewards.find(r => r.type === 'scratch' && r.isAvailable) && (
            <View style={styles.scratchSection}>
              <Text style={styles.sectionTitle}>🎫 Scratch Card</Text>
              <View style={styles.scratchContainer}>
                <Animated.View
                  style={[
                    styles.scratchCard,
                    {
                      opacity: scratchAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.3],
                      })
                    }
                  ]}
                >
                  <Text style={styles.scratchText}>???</Text>
                </Animated.View>
                <TouchableOpacity
                  style={[styles.scratchButton, isScratching && styles.scratchButtonDisabled]}
                  onPress={scratchCard}
                  disabled={isScratching}
                >
                  <Text style={styles.scratchButtonText}>
                    {isScratching ? 'Scratching...' : 'Scratch Now!'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  streakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  streakLabel: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 4,
  },
  streakInfo: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  rewardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  amountBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amountText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardActions: {
    alignItems: 'flex-end',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  claimedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  claimButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  claimButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  wheelSection: {
    marginBottom: 20,
  },
  wheelContainer: {
    alignItems: 'center',
  },
  wheel: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  wheelInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  spinButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  spinButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scratchSection: {
    marginBottom: 20,
  },
  scratchContainer: {
    alignItems: 'center',
  },
  scratchCard: {
    width: 120,
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scratchText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  scratchButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scratchButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  scratchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});