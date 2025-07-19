// Powered by OnSpace.AI
import { create } from 'zustand';
import { battleService, Battle } from '../services/battleService';

interface BattleState {
  battles: Battle[];
  currentBattle: Battle | null;
  isInBattle: boolean;
  getActiveBattles: () => Promise<Battle[]>;
  joinBattle: (battleId: string) => Promise<void>;
  createBattle: (songId: string, songTitle: string) => Promise<Battle>;
  leaveBattle: (battleId: string) => Promise<void>;
  submitBattlePerformance: (battleId: string, performanceId: string) => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  battles: [],
  currentBattle: null,
  isInBattle: false,

  getActiveBattles: async () => {
    try {
      const battles = await battleService.getActiveBattles();
      set({ battles });
      return battles;
    } catch (error) {
      throw error;
    }
  },

  joinBattle: async (battleId: string) => {
    try {
      const battle = await battleService.joinBattle(battleId);
      set({ currentBattle: battle, isInBattle: true });
    } catch (error) {
      throw error;
    }
  },

  createBattle: async (songId: string, songTitle: string) => {
    try {
      const battle = await battleService.createBattle(songId, songTitle);
      set({ currentBattle: battle, isInBattle: true });
      return battle;
    } catch (error) {
      throw error;
    }
  },

  leaveBattle: async (battleId: string) => {
    try {
      await battleService.leaveBattle(battleId);
      set({ currentBattle: null, isInBattle: false });
    } catch (error) {
      throw error;
    }
  },

  submitBattlePerformance: async (battleId: string, performanceId: string) => {
    try {
      await battleService.submitBattlePerformance(battleId, performanceId);
    } catch (error) {
      throw error;
    }
  },
}));