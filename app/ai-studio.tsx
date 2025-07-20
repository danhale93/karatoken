import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

interface AISong {
  id: string;
  title: string;
  lyrics: string;
  genre: string;
  tempo: number;
  key: string;
  duration: number;
  isOriginal: boolean;
}

export default function AIStudioScreen() {
  const [currentSong, setCurrentSong] = useState<AISong | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('pop');
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState('C');
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  const genres = [
    { id: 'pop', name: 'Pop', icon: '🎵' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'edm', name: 'EDM', icon: '🎧' },
    { id: 'country', name: 'Country', icon: '🤠' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'lofi', name: 'Lo-Fi', icon: '☕' },
    { id: 'trap', name: 'Trap', icon: '🎤' },
    { id: 'classical', name: 'Classical', icon: '🎻' },
  ];

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const generateSong = async () => {
    if (!songTitle.trim() || !lyrics.trim()) {
      Alert.alert('Missing Information', 'Please provide a song title and lyrics.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI song generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newSong: AISong = {
        id: `song-${Date.now()}`,
        title: songTitle,
        lyrics: lyrics,
        genre: selectedGenre,
        tempo: tempo,
        key: key,
        duration: Math.floor(lyrics.split('\n').length * 3), // Rough estimate
        isOriginal: true,
      };
      
      setCurrentSong(newSong);
      setIsComposing(true);
      Alert.alert('Song Generated!', 'Your AI-assisted song has been created successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate song. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playPreview = async () => {
    if (!currentSong) return;
    
    try {
      setIsPlaying(true);
      // Simulate audio playback
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsPlaying(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to play preview');
      setIsPlaying(false);
    }
  };

  const saveSong = async () => {
    if (!currentSong) return;
    
    try {
      // TODO: Save to backend
      Alert.alert('Success', 'Song saved to your library!');
      router.push('/song-selection');
    } catch (error) {
      Alert.alert('Error', 'Failed to save song');
    }
  };

  const applyGenreSwap = async (newGenre: string) => {
    if (!currentSong) return;
    
    setSelectedGenre(newGenre);
    // TODO: Apply AI genre transformation
    Alert.alert('Genre Swapped!', `Song converted to ${newGenre} style.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Studio</Text>
          <TouchableOpacity style={styles.helpButton}>
            <MaterialIcons name="help-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Song Creation Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 Create Original Song</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Song Title</Text>
              <TextInput
                style={styles.textInput}
                value={songTitle}
                onChangeText={setSongTitle}
                placeholder="Enter your song title..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lyrics</Text>
              <TextInput
                style={[styles.textInput, styles.lyricsInput]}
                value={lyrics}
                onChangeText={setLyrics}
                placeholder="Write your lyrics here...\n\nVerse 1:\n[Your lyrics]\n\nChorus:\n[Your lyrics]\n\nVerse 2:\n[Your lyrics]"
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
              />
            </View>

            {/* Genre Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genre</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre.id}
                    style={[
                      styles.genreButton,
                      selectedGenre === genre.id && styles.genreButtonActive
                    ]}
                    onPress={() => setSelectedGenre(genre.id)}
                  >
                    <Text style={styles.genreIcon}>{genre.icon}</Text>
                    <Text style={[
                      styles.genreText,
                      selectedGenre === genre.id && styles.genreTextActive
                    ]}>
                      {genre.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Tempo Control */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tempo: {tempo} BPM</Text>
              <Slider
                style={styles.slider}
                minimumValue={60}
                maximumValue={200}
                value={tempo}
                onValueChange={setTempo}
                minimumTrackTintColor="#667eea"
                maximumTrackTintColor="#ddd"
                thumbStyle={styles.sliderThumb}
              />
            </View>

            {/* Key Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Key</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keyScroll}>
                {keys.map((keyNote) => (
                  <TouchableOpacity
                    key={keyNote}
                    style={[
                      styles.keyButton,
                      key === keyNote && styles.keyButtonActive
                    ]}
                    onPress={() => setKey(keyNote)}
                  >
                    <Text style={[
                      styles.keyText,
                      key === keyNote && styles.keyTextActive
                    ]}>
                      {keyNote}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={generateSong}
              disabled={isGenerating}
            >
              <MaterialIcons 
                name={isGenerating ? "hourglass-empty" : "auto-awesome"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate Song with AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Song Section */}
          {currentSong && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎼 Your Song</Text>
              
              <View style={styles.songCard}>
                <Text style={styles.songTitle}>{currentSong.title}</Text>
                <Text style={styles.songDetails}>
                  {currentSong.genre.toUpperCase()} • {currentSong.tempo} BPM • Key: {currentSong.key}
                </Text>
                
                <View style={styles.songActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={playPreview}
                    disabled={isPlaying}
                  >
                    <MaterialIcons 
                      name={isPlaying ? "pause" : "play-arrow"} 
                      size={20} 
                      color="#667eea" 
                    />
                    <Text style={styles.actionButtonText}>
                      {isPlaying ? 'Playing...' : 'Preview'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={saveSong}
                  >
                    <MaterialIcons name="save" size={20} color="#667eea" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Genre Swapping Section */}
          {currentSong && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔄 Genre Swapping</Text>
              <Text style={styles.sectionDescription}>
                Instantly reimagine your song in different musical styles
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                {genres.filter(g => g.id !== selectedGenre).map((genre) => (
                  <TouchableOpacity
                    key={genre.id}
                    style={styles.swapButton}
                    onPress={() => applyGenreSwap(genre.id)}
                  >
                    <Text style={styles.genreIcon}>{genre.icon}</Text>
                    <Text style={styles.swapButtonText}>Swap to {genre.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* AI Training Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧠 AI Training</Text>
            <Text style={styles.sectionDescription}>
              Train the AI on your vocal style and songwriting preferences
            </Text>
            
            <TouchableOpacity style={styles.trainingButton}>
              <MaterialIcons name="school" size={24} color="#667eea" />
              <Text style={styles.trainingButtonText}>Train AI on My Style</Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 15,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lyricsInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  genreScroll: {
    flexDirection: 'row',
  },
  genreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  genreButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  genreIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  genreText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  genreTextActive: {
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#667eea',
  },
  keyScroll: {
    flexDirection: 'row',
  },
  keyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  keyButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
  },
  keyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  keyTextActive: {
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  generateButtonDisabled: {
    backgroundColor: '#999',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  songCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  songDetails: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 15,
  },
  songActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  swapButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  swapButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  trainingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trainingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});