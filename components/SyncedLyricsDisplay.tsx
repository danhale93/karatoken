// Powered by OnSpace.AI
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIMusicStore } from '../hooks/useAIMusicStore';

interface SyncedLyricsDisplayProps {
  currentTimeMs: number;
  fontSize?: number;
  highlightColor?: string;
  backgroundColor?: string;
}

export const SyncedLyricsDisplay: React.FC<SyncedLyricsDisplayProps> = ({
  currentTimeMs,
  fontSize = 18,
  highlightColor = '#10B981',
  backgroundColor = 'rgba(0,0,0,0.8)',
}) => {
  const { syncedLyrics, currentLyricLine, updateCurrentLyricPosition } = useAIMusicStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    updateCurrentLyricPosition(currentTimeMs);
  }, [currentTimeMs]);

  useEffect(() => {
    if (syncedLyrics && currentLyricLine >= 0) {
      // Animate current line
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-scroll to current line
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: currentLyricLine * 60, // Approximate line height
          animated: true,
        });
      }, 100);
    }
  }, [currentLyricLine]);

  const getLineStyle = (index: number) => {
    const isCurrent = index === currentLyricLine;
    const isPast = index < currentLyricLine;
    const isUpcoming = index > currentLyricLine && index <= currentLyricLine + 2;

    return {
      opacity: isCurrent ? 1 : isPast ? 0.5 : isUpcoming ? 0.8 : 0.3,
      color: isCurrent ? highlightColor : isPast ? '#9CA3AF' : '#FFFFFF',
      fontSize: isCurrent ? fontSize * 1.1 : fontSize,
      fontWeight: isCurrent ? 'bold' as const : 'normal' as const,
      transform: isCurrent ? [{ scale: scaleAnim }] : [{ scale: 1 }],
    };
  };

  const getUpcomingLyrics = () => {
    if (!syncedLyrics) return [];
    
    return syncedLyrics.lines.filter(line => 
      line.startTime > currentTimeMs && 
      line.startTime <= currentTimeMs + 5000 // Next 5 seconds
    ).slice(0, 2);
  };

  if (!syncedLyrics) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.noLyricsContainer}>
          <Text style={styles.noLyricsText}>No synchronized lyrics available</Text>
          <Text style={styles.noLyricsSubtext}>
            Enjoy the instrumental and sing along!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Main Lyrics Display */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.lyricsScroll}
        contentContainerStyle={styles.lyricsContent}
        showsVerticalScrollIndicator={false}
      >
        {syncedLyrics.lines.map((line, index) => (
          <Animated.View key={index} style={styles.lyricLineContainer}>
            <Animated.Text
              style={[
                styles.lyricLine,
                getLineStyle(index),
                index === currentLyricLine && styles.currentLine,
              ]}
            >
              {line.text}
            </Animated.Text>
            
            {/* Highlight effect for current line */}
            {index === currentLyricLine && (
              <LinearGradient
                colors={[`${highlightColor}20`, 'transparent']}
                style={styles.highlightGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
          </Animated.View>
        ))}
      </ScrollView>

      {/* Upcoming Lyrics Preview */}
      <View style={styles.upcomingContainer}>
        <Text style={styles.upcomingTitle}>Coming Up:</Text>
        {getUpcomingLyrics().map((line, index) => (
          <Text key={index} style={styles.upcomingLine}>
            {line.text}
          </Text>
        ))}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, (currentTimeMs / syncedLyrics.duration) * 100)}%`,
                backgroundColor: highlightColor,
              },
            ]}
          />
        </View>
        
        <Text style={styles.progressText}>
          {syncedLyrics.syncQuality === 'high' ? '🎯' : 
           syncedLyrics.syncQuality === 'medium' ? '📍' : '⚠️'} 
          {syncedLyrics.syncQuality} sync quality
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  noLyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLyricsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  noLyricsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsContent: {
    paddingVertical: 20,
  },
  lyricLineContainer: {
    position: 'relative',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lyricLine: {
    textAlign: 'center',
    lineHeight: 28,
    zIndex: 2,
  },
  currentLine: {
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  highlightGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    zIndex: 1,
  },
  upcomingContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  upcomingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  upcomingLine: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});