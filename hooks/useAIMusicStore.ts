// Powered by OnSpace.AI
import { create } from 'zustand';
import { aiMusicService, GenreStyle, StyleSwapResult } from '../services/aiMusicService';
import { youtubeSearchService, YouTubeSearchResult } from '../services/youtubeSearchService';
import { lyricsService, SynchronizedLyrics } from '../services/lyricsService';

interface AIMusicState {
  // Genre/Style Management
  availableGenres: GenreStyle[];
  selectedGenre: GenreStyle | null;
  styleSwapResult: StyleSwapResult | null;
  isProcessingStyleSwap: boolean;
  
  // YouTube Integration
  searchResults: YouTubeSearchResult[];
  selectedVideo: YouTubeSearchResult | null;
  isSearching: boolean;
  
  // Lyrics Management
  syncedLyrics: SynchronizedLyrics | null;
  currentLyricLine: number;
  isLoadingLyrics: boolean;
  
  // Actions
  loadAvailableGenres: () => Promise<void>;
  swapToGenre: (audioUrl: string, genreId: string) => Promise<StyleSwapResult>;
  searchYouTubeVideos: (query: string) => Promise<void>;
  selectVideoForKaraoke: (video: YouTubeSearchResult) => Promise<void>;
  loadSyncedLyrics: (title: string, artist: string, audioUrl: string) => Promise<void>;
  updateCurrentLyricPosition: (timeMs: number) => void;
}

export const useAIMusicStore = create<AIMusicState>((set, get) => ({
  // Initial State
  availableGenres: [],
  selectedGenre: null,
  styleSwapResult: null,
  isProcessingStyleSwap: false,
  searchResults: [],
  selectedVideo: null,
  isSearching: false,
  syncedLyrics: null,
  currentLyricLine: 0,
  isLoadingLyrics: false,

  // Load available music genres for style swapping
  loadAvailableGenres: async () => {
    try {
      const genres = await aiMusicService.getAvailableGenres();
      set({ availableGenres: genres });
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  },

  // Swap audio to different genre/style
  swapToGenre: async (audioUrl: string, genreId: string) => {
    const { availableGenres } = get();
    const targetGenre = availableGenres.find(g => g.id === genreId);
    
    if (!targetGenre) {
      throw new Error('Genre not found');
    }

    set({ isProcessingStyleSwap: true, selectedGenre: targetGenre });
    
    try {
      const result = await aiMusicService.swapGenreStyle(audioUrl, genreId);
      set({ styleSwapResult: result });
      return result;
    } catch (error) {
      console.error('Style swap failed:', error);
      throw error;
    } finally {
      set({ isProcessingStyleSwap: false });
    }
  },

  // Search YouTube for karaoke/instrumental versions
  searchYouTubeVideos: async (query: string) => {
    set({ isSearching: true, searchResults: [] });
    
    try {
      const results = await youtubeSearchService.searchSongs(query);
      set({ searchResults: results });
    } catch (error) {
      console.error('YouTube search failed:', error);
    } finally {
      set({ isSearching: false });
    }
  },

  // Select a YouTube video for karaoke
  selectVideoForKaraoke: async (video: YouTubeSearchResult) => {
    set({ selectedVideo: video });
    
    try {
      // Extract audio from selected video
      const audioData = await youtubeSearchService.extractAudioFromVideo(video.videoId);
      
      // Automatically search for lyrics
      const { loadSyncedLyrics } = get();
      await loadSyncedLyrics(video.title, video.channelTitle, audioData.audioUrl);
      
    } catch (error) {
      console.error('Failed to process selected video:', error);
    }
  },

  // Load synchronized lyrics for the track
  loadSyncedLyrics: async (title: string, artist: string, audioUrl: string) => {
    set({ isLoadingLyrics: true });
    
    try {
      // First try to get existing synced lyrics
      let syncedLyrics = await lyricsService.getSyncedLyricsFromDatabase(
        `${title}-${artist}`.replace(/\s+/g, '-').toLowerCase()
      );
      
      if (!syncedLyrics) {
        // Search for raw lyrics and sync them
        const rawLyrics = await lyricsService.searchLyrics(title, artist);
        
        if (rawLyrics) {
          syncedLyrics = await lyricsService.synchronizeLyricsWithAudio(
            audioUrl, 
            rawLyrics, 
            title, 
            artist
          );
        }
      }
      
      set({ 
        syncedLyrics, 
        currentLyricLine: 0 
      });
    } catch (error) {
      console.error('Failed to load synced lyrics:', error);
    } finally {
      set({ isLoadingLyrics: false });
    }
  },

  // Update current lyric position during playback
  updateCurrentLyricPosition: (timeMs: number) => {
    const { syncedLyrics } = get();
    
    if (!syncedLyrics) return;
    
    const currentLine = syncedLyrics.lines.findIndex(line => 
      timeMs >= line.startTime && timeMs <= line.endTime
    );
    
    if (currentLine !== -1) {
      set({ currentLyricLine: currentLine });
    }
  },
}));