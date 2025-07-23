import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to Karatoken! 🎤</Text>
            <Text style={styles.subtitle}>The Future of Karaoke</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notifications')}>
            <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6']}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <MaterialIcons name="auto-awesome" size={48} color="#FFFFFF" />
            <Text style={styles.heroTitle}>AI-Powered Karaoke</Text>
            <Text style={styles.heroSubtitle}>
              Sing, compete, and earn $KARA tokens!
            </Text>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => router.push('/(tabs)/sing')}
            >
              <Text style={styles.heroButtonText}>Start Singing</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/studio')}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="music-note" size={32} color="#FFFFFF" />
              <Text style={styles.actionTitle}>AI Studio</Text>
              <Text style={styles.actionSubtitle}>Create songs</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/genre-swap')}
          >
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="swap-horiz" size={32} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Genre Swap</Text>
              <Text style={styles.actionSubtitle}>Transform music</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/battle')}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.actionGradient}
            >
              <MaterialIcons name="flash-on" size={32} color="#FFFFFF" />
              <Text style={styles.actionTitle}>Battle</Text>
              <Text style={styles.actionSubtitle}>Compete now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>🔥 What&apos;s New</Text>
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <MaterialIcons name="trending-up" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Trending Now</Text>
                <Text style={styles.featureDescription}>
                  AI Genre Swapping hits 1M+ transformations!
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <MaterialIcons name="paid" size={24} color="#F59E0B" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Earn $KARA Tokens</Text>
                <Text style={styles.featureDescription}>
                  Sing and earn cryptocurrency rewards
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureContent}>
              <MaterialIcons name="people" size={24} color="#8B5CF6" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Global Community</Text>
                <Text style={styles.featureDescription}>
                  Join millions of singers worldwide
                </Text>
              </View>
            </View>
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
  heroBanner: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  heroButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});