// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSongStore } from '../../hooks/useSongStore';

export default function SongSelectionScreen() {
  const { songs, searchSongs, getFeaturedSongs, getPopularSongs } = useSongStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'featured' | 'popular' | 'trending'>('featured');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSongs();
  }, [selectedCategory]);

  const loadSongs = async () => {
    setLoading(true);
    try {
      switch (selectedCategory) {
        case 'featured':
          await getFeaturedSongs();
          break;
        case 'popular':
          await getPopularSongs();
          break;
        case 'trending':
          await getFeaturedSongs(); // Use featured for now
          break;
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      await searchSongs(searchQuery);
    } catch (error) {
      Alert.alert('Error', 'Failed to search songs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSong = (song: any) => {
    router.push({
      pathname: '/karaoke/[songId]',
      params: { 
        songId: song.id,
        songTitle: song.title,
        artistName: song.artist,
        duration: song.duration,
        difficulty: song.difficulty,
      },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderSongCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.songCard}
      onPress={() => handleSelectSong(item)}
    >
      <Image
        source={{ uri: item.albumArt || 'https://picsum.photos/seed/music/120/120.webp' }}
        style={styles.albumArt}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
        <View style={styles.songMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>{Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <View style={styles.songStats}>
          <MaterialIcons name="star" size={16} color="#F59E0B" />
          <Text style={styles.statsText}>{item.rating || '4.5'}</Text>
          <MaterialIcons name="play-arrow" size={16} color="#10B981" style={{ marginLeft: 15 }} />
          <Text style={styles.statsText}>{item.playCount || '1.2k'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Song</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="tune" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {(['featured', 'popular', 'trending'] as const).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.activeCategoryTab,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category && styles.activeCategoryTabText,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6']}
            style={styles.quickActionGradient}
          >
            <MaterialIcons name="shuffle" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Random Song</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionGradient}
          >
            <MaterialIcons name="history" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Recent</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <FlatList
        data={songs}
        renderItem={renderSongCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.songsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadSongs}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  activeCategoryTab: {
    backgroundColor: '#10B981',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  songsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  songCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  songStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
});