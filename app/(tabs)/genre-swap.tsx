// Powered by OnSpace.AI - Karatoken Genre Swapping
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { audioProcessingService, YouTubeTrack, AudioStem } from '../../services/audioProcessingService';

const { width, height } = Dimensions.get('window');

interface ProcessingState {
  stage: string;
  progress: number;
  isProcessing: boolean;
}

export default function GenreSwapScreen() {
  // YouTube Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<YouTubeTrack | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Genre Swapping State
  const [availableGenres] = useState(audioProcessingService.getAvailableGenres());
  const [selectedGenre, setSelectedGenre] = useState('');
  const [originalStems, setOriginalStems] = useState<AudioStem | null>(null);
  const [transformedStems, setTransformedStems] = useState<AudioStem | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Processing State
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: '',
    progress: 0,
    isProcessing: false,
  });

  // Audio Playback
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // UI State
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showParameterModal, setShowParameterModal] = useState(false);

  // Animation
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (processingState.isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnimation.setValue(0);
    }
  }, [processingState.isProcessing]);

  const searchYouTubeTracks = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const results = await audioProcessingService.searchYouTubeTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search YouTube tracks');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectTrack = (track: YouTubeTrack) => {
    setSelectedTrack(track);
    setSearchResults([]);
    setSearchQuery(track.title);
  };

  const startGenreSwapping = async () => {
    if (!selectedTrack || !selectedGenre) {
      Alert.alert('Missing Selection', 'Please select a track and target genre');
      return;
    }

    // Check cache first
    const cachedStems = await audioProcessingService.getCachedAudio(
      selectedTrack.id,
      selectedGenre
    );

    if (cachedStems) {
      Alert.alert('Using Cached Version', 'Found pre-processed version!');
      setTransformedStems(cachedStems);
      return;
    }

    setProcessingState({
      stage: 'Initializing...',
      progress: 0,
      isProcessing: true,
    });

    try {
      const result = await audioProcessingService.processGenreSwap(
        selectedTrack.id,
        selectedGenre,
        (progress, stage) => {
          setProcessingState({
            stage,
            progress,
            isProcessing: true,
          });

          Animated.timing(progressAnimation, {
            toValue: progress / 100,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      );

      setOriginalStems(result.originalStems);
      setTransformedStems(result.transformedStems);
      setCurrentAudioUrl(result.mixedUrl);

      // Cache the result
      await audioProcessingService.cacheProcessedAudio(
        selectedTrack.id,
        selectedGenre,
        result.transformedStems
      );

      Alert.alert(
        '🎉 Genre Swap Complete!',
        `Successfully transformed "${selectedTrack.title}" to ${selectedGenre} style!`
      );
    } catch (error) {
      Alert.alert('Processing Error', 'Failed to process genre swap');
      console.error(error);
    } finally {
      setProcessingState({
        stage: '',
        progress: 0,
        isProcessing: false,
      });
    }
  };

  const playTransformedAudio = async () => {
    if (!currentAudioUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentAudioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying || false);
        }
      });
    } catch (error) {
      Alert.alert('Playback Error', 'Failed to play transformed audio');
      console.error(error);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const startKaraokeMode = async () => {
    if (!transformedStems) {
      Alert.alert('No Audio', 'Please process a genre swap first');
      return;
    }

    try {
      const karaokeUrl = await audioProcessingService.createKaraokeVersion(
        transformedStems,
        0.1 // Very low vocal level for karaoke
      );

      // Navigate to karaoke screen with the processed audio
      router.push({
        pathname: '/karaoke/genre-swap',
        params: {
          songTitle: selectedTrack?.title,
          artistName: selectedTrack?.artist,
          genre: selectedGenre,
          karaokeUrl,
          originalGenre: 'pop', // Default assumption
        }
      });
    } catch (error) {
      Alert.alert('Karaoke Error', 'Failed to create karaoke version');
      console.error(error);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderSearchResult = ({ item }: { item: YouTubeTrack }) => (
    <TouchableOpacity style={styles.searchResult} onPress={() => selectTrack(item)}>
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.searchResultArtist}>{item.artist}</Text>
        <Text style={styles.searchResultDuration}>
          {formatTime(item.duration * 1000)}
        </Text>
      </View>
      <MaterialIcons name="add-circle" size={24} color="#10B981" />
    </TouchableOpacity>
  );

  const renderGenre = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.genreOption,
        selectedGenre === item && styles.genreOptionSelected,
      ]}
      onPress={() => setSelectedGenre(item)}
    >
      <Text
        style={[
          styles.genreText,
          selectedGenre === item && styles.genreTextSelected,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const waveScale = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Genre Swapping</Text>
          <TouchableOpacity style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* YouTube Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Find Your Track</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search YouTube for any song..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={searchYouTubeTracks}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchYouTubeTracks}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="search" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.searchResults}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Selected Track Display */}
        {selectedTrack && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Selected Track</Text>
            <View style={styles.selectedTrack}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{selectedTrack.title}</Text>
                <Text style={styles.trackArtist}>{selectedTrack.artist}</Text>
                <Text style={styles.trackDuration}>
                  {formatTime(selectedTrack.duration * 1000)}
                </Text>
              </View>
              <MaterialIcons name="music-note" size={32} color="#10B981" />
            </View>
          </View>
        )}

        {/* Genre Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎭 Choose Target Genre</Text>
          <TouchableOpacity
            style={styles.genreSelector}
            onPress={() => setShowGenreModal(true)}
          >
            <Text style={styles.genreSelectorText}>
              {selectedGenre
                ? selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)
                : 'Select Genre...'}
            </Text>
            <MaterialIcons name="expand-more" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Processing Section */}
        {processingState.isProcessing && (
          <View style={styles.section}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.processingCard}
            >
              <Animated.View
                style={[styles.processingIcon, { transform: [{ scale: waveScale }] }]}
              >
                <MaterialIcons name="auto-awesome" size={48} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.processingTitle}>AI Processing</Text>
              <Text style={styles.processingStage}>{processingState.stage}</Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(processingState.progress)}%
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Results Section */}
        {transformedStems && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Transformation Complete</Text>
            
            {/* Audio Player */}
            {currentAudioUrl && (
              <View style={styles.audioPlayer}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={isPlaying ? stopAudio : playTransformedAudio}
                >
                  <MaterialIcons
                    name={isPlaying ? 'pause' : 'play-arrow'}
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioTitle}>
                    {selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Version
                  </Text>
                  <Text style={styles.audioTime}>
                    {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={startKaraokeMode}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialIcons name="mic" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Start Karaoke</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowParameterModal(true)}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialIcons name="tune" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Fine-tune</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Action Button */}
        {selectedTrack && selectedGenre && !processingState.isProcessing && (
          <View style={styles.mainActionContainer}>
            <TouchableOpacity
              style={styles.mainActionButton}
              onPress={startGenreSwapping}
            >
              <LinearGradient
                colors={['#6B46C1', '#8B5CF6']}
                style={styles.mainActionGradient}
              >
                <MaterialIcons name="transform" size={32} color="#FFFFFF" />
                <Text style={styles.mainActionText}>Transform Genre</Text>
                <Text style={styles.mainActionSubtext}>
                  AI-powered with Demucs
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Genre Selection Modal */}
      <Modal
        visible={showGenreModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGenreModal(false)}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Genre</Text>
            <TouchableOpacity
              onPress={() => setShowGenreModal(false)}
              disabled={!selectedGenre}
            >
              <Text
                style={[
                  styles.modalAction,
                  { opacity: selectedGenre ? 1 : 0.5 },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableGenres}
            renderItem={renderGenre}
            keyExtractor={(item) => item}
            numColumns={3}
            contentContainerStyle={styles.genreGrid}
          />
        </SafeAreaView>
      </Modal>
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
    fontSize: 24,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResult: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  searchResultArtist: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  searchResultDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedTrack: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  genreSelector: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreSelectorText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  processingCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  processingIcon: {
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  processingStage: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  audioPlayer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  audioTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  mainActionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mainActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainActionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  mainActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  mainActionSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  genreGrid: {
    padding: 20,
  },
  genreOption: {
    flex: 1,
    backgroundColor: '#1F2937',
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  genreOptionSelected: {
    backgroundColor: '#6B46C1',
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  genreTextSelected: {
    color: '#FFFFFF',
  },
});