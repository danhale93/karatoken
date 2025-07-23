// Powered by OnSpace.AI
import { create } from 'zustand';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboardService';

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  getLeaderboard: (period: 'daily' | 'weekly' | 'allTime') => Promise<LeaderboardEntry[]>;
  getUserRank: (userId: string, period: 'daily' | 'weekly' | 'allTime') => Promise<number>;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  leaderboard: [],
  userRank: null,

  getLeaderboard: async (period: 'daily' | 'weekly' | 'allTime') => {
    try {
      const leaderboard = await leaderboardService.getLeaderboard(period);
      set({ leaderboard });
      return leaderboard;
    } catch (error) {
      throw error;
    }
  },

  getUserRank: async (userId: string, period: 'daily' | 'weekly' | 'allTime') => {
    try {
      const rank = await leaderboardService.getUserRank(userId, period);
      set({ userRank: rank });
      return rank;
    } catch (error) {
      throw error;
    }
  },
}));