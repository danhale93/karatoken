// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIMusicStore } from '../hooks/useAIMusicStore';

interface YouTubeSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onVideoSelected: (video: any) => void;
}

export const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({
  visible,
  onClose,
  onVideoSelected,
}) => {
  const {
    searchResults,
    isSearching,
    searchYouTubeVideos,
    selectVideoForKaraoke,
  } = useAIMusicStore();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await searchYouTubeVideos(searchQuery);
  };

  const handleVideoSelect = async (video: any) => {
    try {
      await selectVideoForKaraoke(video);
      onVideoSelected(video);
      onClose();
    } catch (error) {
      console.error('Failed to select video:', error);
    }
  };

  const formatDuration = (duration: string): string => {
    return duration;
  };

  const formatViews = (viewCount: number): string => {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M views`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K views`;
    }
    return `${viewCount} views`;
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => handleVideoSelect(item)}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.channelName} numberOfLines={1}>
          {item.channelTitle}
        </Text>
        
        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="play-arrow" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{formatViews(item.viewCount)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.selectButton}>
        <MaterialIcons name="add-circle" size={24} color="#10B981" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Find Backing Tracks</Text>
          
          <TouchableOpacity style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for karaoke tracks, instrumentals..."
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
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.searchButtonGradient}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="search" size={20} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Search Tips:</Text>
          <Text style={styles.tipsText}>
            • Try "song name + karaoke" or "song name + instrumental"
          </Text>
          <Text style={styles.tipsText}>
            • Look for official backing tracks or karaoke versions
          </Text>
          <Text style={styles.tipsText}>
            • Higher view counts usually mean better quality
          </Text>
        </View>

        {/* Results */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Searching YouTube...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.videoId}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length > 0 ? (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={64} color="#6B7280" />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsText}>
              Try a different search term or check your spelling
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="library-music" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>Search for Backing Tracks</Text>
            <Text style={styles.emptyText}>
              Find karaoke versions and instrumentals from YouTube
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  closeButton: {
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
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  selectButton: {
    marginLeft: 12,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});