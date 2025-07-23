// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIMusicStore } from '../hooks/useAIMusicStore';

interface AIGenreSwapperProps {
  originalAudioUrl: string;
  onStyleSwapped: (result: any) => void;
}

export const AIGenreSwapper: React.FC<AIGenreSwapperProps> = ({
  originalAudioUrl,
  onStyleSwapped,
}) => {
  const {
    availableGenres,
    selectedGenre,
    isProcessingStyleSwap,
    loadAvailableGenres,
    swapToGenre,
  } = useAIMusicStore();

  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableGenres();
  }, []);

  const handleGenreSelect = async (genreId: string) => {
    if (isProcessingStyleSwap) return;
    
    setSelectedGenreId(genreId);
    
    try {
      const result = await swapToGenre(originalAudioUrl, genreId);
      onStyleSwapped(result);
      Alert.alert('Success!', `Style swapped to ${result.newStyle} successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to swap musical style. Please try again.');
    }
  };

  const renderGenreCard = ({ item }) => {
    const isSelected = selectedGenreId === item.id;
    const isProcessing = isProcessingStyleSwap && isSelected;

    return (
      <TouchableOpacity
        style={[styles.genreCard, isSelected && styles.selectedCard]}
        onPress={() => handleGenreSelect(item.id)}
        disabled={isProcessingStyleSwap}
      >
        <LinearGradient
          colors={isSelected ? ['#10B981', '#059669'] : ['#1F2937', '#374151']}
          style={styles.cardGradient}
        >
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.processingText}>Swapping Style...</Text>
            </View>
          )}
          
          <View style={styles.genreIcon}>
            <MaterialIcons 
              name={this.getGenreIcon(item.id)} 
              size={32} 
              color={isSelected ? "#FFFFFF" : "#10B981"} 
            />
          </View>
          
          <Text style={[styles.genreName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          
          <Text style={[styles.genreDescription, isSelected && styles.selectedDescription]}>
            {item.description}
          </Text>
          
          <View style={styles.genreDetails}>
            <Text style={[styles.detailText, isSelected && styles.selectedDetail]}>
              Tempo: {item.tempoRange[0]}-{item.tempoRange[1]} BPM
            </Text>
            <Text style={[styles.detailText, isSelected && styles.selectedDetail]}>
              Instruments: {item.instrumentPresets.slice(0, 2).join(', ')}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getGenreIcon = (genreId: string): string => {
    const iconMap: Record<string, string> = {
      pop: 'star',
      rock: 'electric-bolt',
      jazz: 'piano',
      reggae: 'beach-access',
      electronic: 'graphic-eq',
      country: 'landscape',
      hiphop: 'mic',
      classical: 'music-note',
    };
    return iconMap[genreId] || 'music-note';
  };

  if (availableGenres.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading musical styles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="auto-fix-high" size={24} color="#10B981" />
        <Text style={styles.title}>AI Style Swapper</Text>
        <Text style={styles.subtitle}>Transform your track into any musical style</Text>
      </View>

      <FlatList
        data={availableGenres}
        renderItem={renderGenreCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.genreGrid}
        showsVerticalScrollIndicator={false}
      />

      {isProcessingStyleSwap && (
        <View style={styles.processingBanner}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.bannerGradient}
          >
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.bannerText}>
              AI is transforming your music... This may take 30-60 seconds
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  genreGrid: {
    paddingHorizontal: 15,
  },
  genreCard: {
    flex: 1,
    margin: 5,
    borderRadius: 15,
    overflow: 'hidden',
    minHeight: 160,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  cardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
    position: 'relative',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  genreIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  genreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  genreDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
  },
  selectedDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  genreDetails: {
    marginTop: 'auto',
  },
  detailText: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectedDetail: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  processingBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});