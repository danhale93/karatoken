// Powered by OnSpace.AI
import { create } from 'zustand';
import { performanceService, Performance } from '../services/performanceService';

interface PerformanceState {
  performances: Performance[];
  currentRecording: Performance | null;
  isRecording: boolean;
  createPerformance: (songId: string, songTitle: string, artistName: string) => Promise<Performance>;
  startRecording: (performanceId: string) => Promise<void>;
  stopRecording: (performanceId: string) => Promise<void>;
  savePerformance: (performanceId: string, videoUrl: string) => Promise<void>;
  getPerformances: (userId: string) => Promise<Performance[]>;
  getRecentPerformances: (userId: string) => Promise<Performance[]>;
  deletePerformance: (performanceId: string) => Promise<void>;
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  performances: [],
  currentRecording: null,
  isRecording: false,

  createPerformance: async (songId: string, songTitle: string, artistName: string) => {
    try {
      const performance = await performanceService.createPerformance(songId, songTitle, artistName);
      set({ currentRecording: performance });
      return performance;
    } catch (error) {
      throw error;
    }
  },

  startRecording: async (performanceId: string) => {
    try {
      set({ isRecording: true });
      await performanceService.startRecording(performanceId);
    } catch (error) {
      set({ isRecording: false });
      throw error;
    }
  },

  stopRecording: async (performanceId: string) => {
    try {
      await performanceService.stopRecording(performanceId);
      set({ isRecording: false });
    } catch (error) {
      throw error;
    }
  },

  savePerformance: async (performanceId: string, videoUrl: string) => {
    try {
      const savedPerformance = await performanceService.savePerformance(performanceId, videoUrl);
      const { performances } = get();
      set({
        performances: [...performances, savedPerformance],
        currentRecording: null,
      });
    } catch (error) {
      throw error;
    }
  },

  getPerformances: async (userId: string) => {
    try {
      const performances = await performanceService.getPerformances(userId);
      set({ performances });
      return performances;
    } catch (error) {
      throw error;
    }
  },

  getRecentPerformances: async (userId: string) => {
    try {
      const performances = await performanceService.getRecentPerformances(userId);
      return performances;
    } catch (error) {
      throw error;
    }
  },

  deletePerformance: async (performanceId: string) => {
    try {
      await performanceService.deletePerformance(performanceId);
      const { performances } = get();
      set({
        performances: performances.filter(p => p.id !== performanceId),
      });
    } catch (error) {
      throw error;
    }
  },
}));