// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { usePerformanceStore } from '../hooks/usePerformanceStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { Performance } from '../services/performanceService';

const { width } = Dimensions.get('window');

export default function PerformanceScreen() {
  const { performanceId } = useLocalSearchParams();
  const { getPerformanceById } = usePerformanceStore();
  const { user } = useAuthStore();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      if (performanceId) {
        const data = await getPerformanceById(performanceId as string);
        setPerformance(data);
      }
    } catch (error) {
      console.error('Error loading performance:', error);
      Alert.alert('Error', 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = () => {
    if (performance?.id) {
      router.push(`/results/${performance.id}`);
    }
  };

  const handleTryAgain = () => {
    router.push('/(tabs)/song-selection');
  };

  const handleShare = () => {
    Alert.alert('Share Performance', 'Share your amazing performance with friends!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="music-note" size={60} color="#6B46C1" />
          <Text style={styles.loadingText}>Loading performance...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!performance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Performance Not Found</Text>
          <Text style={styles.errorText}>
            The performance you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.buttonText}>Go Home</Text>
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Performance Details</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <MaterialIcons name="share" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Performance Info */}
        <View style={styles.performanceSection}>
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6']}
            style={styles.performanceGradient}
          >
            <Image
              source={{ uri: performance.thumbnailUrl || 'https://picsum.photos/seed/song/200/200.webp' }}
              style={styles.performanceImage}
            />
            <View style={styles.performanceInfo}>
              <Text style={styles.songTitle}>{performance.songTitle}</Text>
              <Text style={styles.artistName}>{performance.artistName}</Text>
              <Text style={styles.performanceDate}>
                {new Date(performance.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Your Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{performance.score}%</Text>
            <Text style={styles.scoreLabel}>Overall Performance</Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance Statistics</Text>
          
                      <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={24} color="#10B981" />
                <Text style={styles.statValue}>{Math.floor(performance.duration / 60)}:{(performance.duration % 60).toString().padStart(2, '0')}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="trending-up" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{performance.score}%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="graphic-eq" size={24} color="#EF4444" />
                <Text style={styles.statValue}>{performance.status}</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="sentiment-satisfied" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>{new Date(performance.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.statLabel}>Created</Text>
              </View>
            </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleViewResults}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="analytics" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>View Detailed Results</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleTryAgain}
            >
              <MaterialIcons name="replay" size={20} color="#6B46C1" />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/battle')}
            >
              <MaterialIcons name="flash-on" size={20} color="#F59E0B" />
              <Text style={styles.secondaryButtonText}>Join Battle</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    padding: 8,
  },
  performanceSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  performanceGradient: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  performanceDate: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  scoreSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: (width - 64) / 2 - 8,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});