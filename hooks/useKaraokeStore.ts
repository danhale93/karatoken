// Powered by OnSpace.AI
import { create } from 'zustand';
import { karaokeService, KaraokeSession, AIScore } from '../services/karaokeService';

interface KaraokeState {
  currentSession: KaraokeSession | null;
  isRecording: boolean;
  realTimeScore: number;
  pitchData: number[];
  startRecording: (songId: string, songTitle: string, artistName: string) => Promise<void>;
  stopRecording: () => Promise<string>;
  submitPerformance: (songId: string, videoUri: string, score: number) => Promise<number>;
  getAIFeedback: (performanceId: string) => Promise<AIScore>;
  updateRealTimeScore: (score: number) => void;
  addPitchData: (pitch: number) => void;
}

export const useKaraokeStore = create<KaraokeState>((set, get) => ({
  currentSession: null,
  isRecording: false,
  realTimeScore: 0,
  pitchData: [],

  startRecording: async (songId: string, songTitle: string, artistName: string) => {
    try {
      const session = await karaokeService.createSession(songId, songTitle, artistName);
      set({ 
        currentSession: session, 
        isRecording: true, 
        realTimeScore: 0,
        pitchData: [] 
      });
    } catch (error) {
      throw error;
    }
  },

  stopRecording: async () => {
    try {
      const { currentSession } = get();
      if (!currentSession) throw new Error('No active session');
      
      const videoUri = await karaokeService.stopRecording(currentSession.id);
      set({ isRecording: false });
      return videoUri;
    } catch (error) {
      throw error;
    }
  },

  submitPerformance: async (songId: string, videoUri: string, score: number) => {
    try {
      const { currentSession } = get();
      if (!currentSession) throw new Error('No active session');
      
      const finalScore = await karaokeService.submitPerformance(
        currentSession.id,
        songId,
        videoUri,
        score
      );
      
      set({ currentSession: null });
      return finalScore;
    } catch (error) {
      throw error;
    }
  },

  getAIFeedback: async (performanceId: string) => {
    try {
      const feedback = await karaokeService.getAIFeedback(performanceId);
      return feedback;
    } catch (error) {
      throw error;
    }
  },

  updateRealTimeScore: (score: number) => {
    set({ realTimeScore: score });
  },

  addPitchData: (pitch: number) => {
    const { pitchData } = get();
    set({ pitchData: [...pitchData, pitch] });
  },
}));