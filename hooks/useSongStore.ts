// Powered by OnSpace.AI
import { create } from 'zustand';
import { songService, Song } from '../services/songService';

interface SongState {
  songs: Song[];
  featuredSongs: Song[];
  popularSongs: Song[];
  searchResults: Song[];
  currentSong: Song | null;
  searchSongs: (query: string) => Promise<void>;
  getFeaturedSongs: () => Promise<void>;
  getPopularSongs: () => Promise<void>;
  getSongById: (songId: string) => Promise<Song>;
  getUserFavorites: (userId: string) => Promise<Song[]>;
  addToFavorites: (userId: string, songId: string) => Promise<void>;
  removeFromFavorites: (userId: string, songId: string) => Promise<void>;
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  featuredSongs: [],
  popularSongs: [],
  searchResults: [],
  currentSong: null,

  searchSongs: async (query: string) => {
    try {
      const results = await songService.searchSongs(query);
      set({ songs: results, searchResults: results });
    } catch (error) {
      throw error;
    }
  },

  getFeaturedSongs: async () => {
    try {
      const featured = await songService.getFeaturedSongs();
      set({ songs: featured, featuredSongs: featured });
    } catch (error) {
      throw error;
    }
  },

  getPopularSongs: async () => {
    try {
      const popular = await songService.getPopularSongs();
      set({ songs: popular, popularSongs: popular });
    } catch (error) {
      throw error;
    }
  },

  getSongById: async (songId: string) => {
    try {
      const song = await songService.getSongById(songId);
      set({ currentSong: song });
      return song;
    } catch (error) {
      throw error;
    }
  },

  getUserFavorites: async (userId: string) => {
    try {
      const favorites = await songService.getUserFavorites(userId);
      return favorites;
    } catch (error) {
      throw error;
    }
  },

  addToFavorites: async (userId: string, songId: string) => {
    try {
      await songService.addToFavorites(userId, songId);
    } catch (error) {
      throw error;
    }
  },

  removeFromFavorites: async (userId: string, songId: string) => {
    try {
      await songService.removeFromFavorites(userId, songId);
    } catch (error) {
      throw error;
    }
  },
}));