import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Video } from 'expo-av';
import { useWalletStore } from '../hooks/useWalletStore';

const { width, height } = Dimensions.get('window');

interface TrendingClip {
  id: string;
  title: string;
  description: string;
  type: 'top-score' | 'funny' | 'viral' | 'ai-generated';
  userId: string;
  username: string;
  avatar: string;
  songTitle: string;
  artistName: string;
  score: number;
  views: number;
  likes: number;
  shares: number;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  tags: string[];
  isLiked: boolean;
  isShared: boolean;
  createdAt: string;
}

export default function TrendingScreen() {
  const [trendingClips, setTrendingClips] = useState<TrendingClip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'top-score' | 'funny' | 'viral' | 'ai-generated'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const { balance } = useWalletStore();
  
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  useEffect(() => {
    loadTrendingClips();
  }, [selectedCategory]);

  const loadTrendingClips = () => {
    setIsLoading(true);
    
    // Mock data - replace with API call
    const mockClips: TrendingClip[] = [
      {
        id: 'clip-1',
        title: 'Perfect Pitch Moment! 🎵',
        description: 'This incredible 98% score performance went viral!',
        type: 'top-score',
        userId: 'user-1',
        username: 'SarahStar',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Bohemian Rhapsody',
        artistName: 'Queen',
        score: 98,
        views: 15420,
        likes: 892,
        shares: 234,
        duration: 30,
        thumbnail: 'https://via.placeholder.com/300x200',
        videoUrl: 'https://example.com/video1.mp4',
        tags: ['viral', 'perfect-pitch', 'queen'],
        isLiked: false,
        isShared: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'clip-2',
        title: 'AI Genre Swap Magic ✨',
        description: 'Watch this song transform from pop to EDM!',
        type: 'ai-generated',
        userId: 'user-2',
        username: 'MikeMusic',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Sweet Caroline',
        artistName: 'Neil Diamond',
        score: 87,
        views: 8920,
        likes: 567,
        shares: 189,
        duration: 45,
        thumbnail: 'https://via.placeholder.com/300x200',
        videoUrl: 'https://example.com/video2.mp4',
        tags: ['ai-studio', 'genre-swap', 'edm'],
        isLiked: true,
        isShared: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'clip-3',
        title: 'Funny Karaoke Fail 😂',
        description: 'This unexpected moment had everyone laughing!',
        type: 'funny',
        userId: 'user-3',
        username: 'LisaLoves',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Hotel California',
        artistName: 'Eagles',
        score: 45,
        views: 23450,
        likes: 1234,
        shares: 567,
        duration: 20,
        thumbnail: 'https://via.placeholder.com/300x200',
        videoUrl: 'https://example.com/video3.mp4',
        tags: ['funny', 'fail', 'viral'],
        isLiked: false,
        isShared: true,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'clip-4',
        title: 'Battle Royale Winner 🏆',
        description: 'Epic battle performance that won the weekly competition!',
        type: 'viral',
        userId: 'user-4',
        username: 'JohnJams',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Stairway to Heaven',
        artistName: 'Led Zeppelin',
        score: 96,
        views: 18760,
        likes: 987,
        shares: 345,
        duration: 60,
        thumbnail: 'https://via.placeholder.com/300x200',
        videoUrl: 'https://example.com/video4.mp4',
        tags: ['battle', 'winner', 'led-zeppelin'],
        isLiked: false,
        isShared: false,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'clip-5',
        title: 'AI Composed Original Song 🎼',
        description: 'First-ever AI-assisted original composition!',
        type: 'ai-generated',
        userId: 'user-5',
        username: 'AICreator',
        avatar: 'https://via.placeholder.com/50',
        songTitle: 'Digital Dreams',
        artistName: 'AI Studio',
        score: 92,
        views: 12340,
        likes: 756,
        shares: 234,
        duration: 90,
        thumbnail: 'https://via.placeholder.com/300x200',
        videoUrl: 'https://example.com/video5.mp4',
        tags: ['original', 'ai-composed', 'digital'],
        isLiked: true,
        isShared: false,
        createdAt: new Date(Date.now() - 18000000).toISOString(),
      },
    ];

    // Filter by category
    const filteredClips = selectedCategory === 'all' 
      ? mockClips 
      : mockClips.filter(clip => clip.type === selectedCategory);

    setTrendingClips(filteredClips);
    setIsLoading(false);
  };

  const toggleLike = async (clipId: string) => {
    try {
      setTrendingClips(prev => 
        prev.map(clip => 
          clip.id === clipId 
            ? { 
                ...clip, 
                isLiked: !clip.isLiked,
                likes: clip.isLiked ? clip.likes - 1 : clip.likes + 1
              }
            : clip
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const shareClip = async (clip: TrendingClip) => {
    try {
      // TODO: Implement social sharing
      setTrendingClips(prev => 
        prev.map(c => 
          c.id === clip.id 
            ? { ...c, isShared: true, shares: c.shares + 1 }
            : c
        )
      );
      Alert.alert('Shared!', 'Clip shared to your social media!');
    } catch (error) {
      Alert.alert('Error', 'Failed to share clip');
    }
  };

  const playVideo = (clipId: string) => {
    setCurrentPlayingId(clipId);
    // TODO: Implement video playback
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'top-score': return '🏆';
      case 'funny': return '😂';
      case 'viral': return '🔥';
      case 'ai-generated': return '🤖';
      default: return '🎵';
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'top-score': return '#FFD700';
      case 'funny': return '#FF6B6B';
      case 'viral': return '#FF8C00';
      case 'ai-generated': return '#4ECDC4';
      default: return '#667eea';
    }
  };

  const renderClip = ({ item }: { item: TrendingClip }) => (
    <View style={styles.clipCard}>
      {/* Video Thumbnail */}
      <View style={styles.videoContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
        <View style={styles.videoOverlay}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => playVideo(item.id)}
          >
            <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatTime(item.duration)}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.type) }]}>
          <Text style={styles.categoryText}>{getCategoryIcon(item.type)}</Text>
        </View>
      </View>

      {/* Clip Info */}
      <View style={styles.clipInfo}>
        <View style={styles.clipHeader}>
          <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
          <View style={styles.clipDetails}>
            <Text style={styles.clipTitle}>{item.title}</Text>
            <Text style={styles.clipDescription}>{item.description}</Text>
            <Text style={styles.songInfo}>
              {item.songTitle} • {item.artistName} • {item.score}% score
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialIcons name="visibility" size={16} color="#E0E0E0" />
            <Text style={styles.statText}>{formatNumber(item.views)}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="favorite" size={16} color="#E0E0E0" />
            <Text style={styles.statText}>{formatNumber(item.likes)}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="share" size={16} color="#E0E0E0" />
            <Text style={styles.statText}>{formatNumber(item.shares)}</Text>
          </View>
        </View>

        {/* Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, item.isLiked && styles.actionButtonActive]}
            onPress={() => toggleLike(item.id)}
          >
            <MaterialIcons 
              name={item.isLiked ? "favorite" : "favorite-border"} 
              size={20} 
              color={item.isLiked ? "#EF4444" : "#E0E0E0"} 
            />
            <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, item.isShared && styles.actionButtonActive]}
            onPress={() => shareClip(item)}
          >
            <MaterialIcons 
              name="share" 
              size={20} 
              color={item.isShared ? "#667eea" : "#E0E0E0"} 
            />
            <Text style={[styles.actionText, item.isShared && styles.actionTextActive]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="comment" size={20} color="#E0E0E0" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="download" size={20} color="#E0E0E0" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const categories = [
    { id: 'all', name: 'All', icon: '🔥' },
    { id: 'top-score', name: 'Top Scores', icon: '🏆' },
    { id: 'funny', name: 'Funny', icon: '😂' },
    { id: 'viral', name: 'Viral', icon: '📈' },
    { id: 'ai-generated', name: 'AI Generated', icon: '🤖' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trending</Text>
          <TouchableOpacity style={styles.walletButton}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#FFFFFF" />
            <Text style={styles.walletText}>{balance.krt} KRT</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id as any)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Clips List */}
        <FlatList
          data={trendingClips}
          renderItem={renderClip}
          keyExtractor={(item) => item.id}
          style={styles.clipsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.clipsContainer}
        />
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
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryNameActive: {
    fontWeight: 'bold',
  },
  clipsList: {
    flex: 1,
  },
  clipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoContainer: {
    position: 'relative',
    height: 200,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
  },
  clipInfo: {
    padding: 16,
  },
  clipHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clipDetails: {
    flex: 1,
  },
  clipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clipDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 4,
    lineHeight: 18,
  },
  songInfo: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#E0E0E0',
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    color: '#E0E0E0',
    fontSize: 12,
    marginLeft: 4,
  },
  actionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});