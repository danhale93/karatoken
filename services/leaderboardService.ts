// Powered by OnSpace.AI
import Config from '../constants/Config';
import { MOCK_LEADERBOARD } from '../constants/MockData';
export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  points: number;
  averageScore: number;
  totalPerformances: number;
  rank: string;
}

class LeaderboardService {
  async getLeaderboard(period: 'daily' | 'weekly' | 'allTime'): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/leaderboard?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const leaderboard = await response.json();
      return leaderboard;
    } catch (error) {
      // Mock implementation for demo
      const mockData: LeaderboardEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          displayName: 'VocalVirtuoso',
          photoURL: 'https://picsum.photos/seed/leader1/100/100.webp',
          points: 15420,
          averageScore: 94,
          totalPerformances: 87,
          rank: 'Diamond',
        },
        {
          id: '2',
          userId: 'user-2',
          displayName: 'MelodyMaster',
          photoURL: 'https://picsum.photos/seed/leader2/100/100.webp',
          points: 13850,
          averageScore: 91,
          totalPerformances: 72,
          rank: 'Platinum',
        },
        {
          id: '3',
          userId: 'user-3',
          displayName: 'SingStar2024',
          photoURL: 'https://picsum.photos/seed/leader3/100/100.webp',
          points: 12960,
          averageScore: 89,
          totalPerformances: 65,
          rank: 'Gold',
        },
        {
          id: '4',
          userId: 'user-4',
          displayName: 'KaraokeKing',
          photoURL: 'https://picsum.photos/seed/leader4/100/100.webp',
          points: 11750,
          averageScore: 87,
          totalPerformances: 58,
          rank: 'Gold',
        },
        {
          id: '5',
          userId: 'user-5',
          displayName: 'HarmonyHero',
          photoURL: 'https://picsum.photos/seed/leader5/100/100.webp',
          points: 10890,
          averageScore: 85,
          totalPerformances: 51,
          rank: 'Silver',
        },
        {
          id: '6',
          userId: 'user-6',
          displayName: 'TuneTitan',
          photoURL: 'https://picsum.photos/seed/leader6/100/100.webp',
          points: 9640,
          averageScore: 83,
          totalPerformances: 44,
          rank: 'Silver',
        },
        {
          id: '7',
          userId: 'user-7',
          displayName: 'MusicMaven',
          photoURL: 'https://picsum.photos/seed/leader7/100/100.webp',
          points: 8750,
          averageScore: 81,
          totalPerformances: 39,
          rank: 'Bronze',
        },
        {
          id: '8',
          userId: 'user-8',
          displayName: 'RhythmRocker',
          photoURL: 'https://picsum.photos/seed/leader8/100/100.webp',
          points: 7920,
          averageScore: 79,
          totalPerformances: 35,
          rank: 'Bronze',
        },
      ];

      return mockData;
    }
  }

  async getUserRank(userId: string, period: 'daily' | 'weekly' | 'allTime'): Promise<number> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/rank?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user rank');
      }

      const data = await response.json();
      return data.rank;
    } catch (error) {
      // Mock implementation for demo
      return Math.floor(Math.random() * 100) + 1;
    }
  }
}

export const leaderboardService = new LeaderboardService();