// Powered by OnSpace.AI
export interface Battle {
  id: string;
  songId: string;
  songTitle: string;
  artistName: string;
  status: 'waiting' | 'active' | 'completed';
  participants: BattleParticipant[];
  participantCount: number;
  maxParticipants: number;
  reward: number;
  duration: number;
  createdAt: string;
  startsAt: string;
}

export interface BattleParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  performanceId?: string;
  score?: number;
  rank?: number;
}

class BattleService {
  async getActiveBattles(): Promise<Battle[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/battles/active');

      if (!response.ok) {
        throw new Error('Failed to fetch active battles');
      }

      const battles = await response.json();
      return battles;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'battle-1',
          songId: 'song-1',
          songTitle: 'Sweet Caroline',
          artistName: 'Neil Diamond',
          status: 'waiting',
          participants: [
            {
              userId: 'user-1',
              displayName: 'MusicLover23',
              photoURL: 'https://picsum.photos/seed/user1/100/100.webp',
            },
            {
              userId: 'user-2',
              displayName: 'VocalVibes',
              photoURL: 'https://picsum.photos/seed/user2/100/100.webp',
            },
          ],
          participantCount: 2,
          maxParticipants: 4,
          reward: 250,
          duration: 300,
          createdAt: new Date().toISOString(),
          startsAt: new Date(Date.now() + 300000).toISOString(),
        },
        {
          id: 'battle-2',
          songId: 'song-2',
          songTitle: 'I Want It That Way',
          artistName: 'Backstreet Boys',
          status: 'active',
          participants: [
            {
              userId: 'user-3',
              displayName: 'SingingStar',
              photoURL: 'https://picsum.photos/seed/user3/100/100.webp',
              score: 89,
            },
            {
              userId: 'user-4',
              displayName: 'KaraokeKing',
              photoURL: 'https://picsum.photos/seed/user4/100/100.webp',
              score: 92,
            },
          ],
          participantCount: 2,
          maxParticipants: 3,
          reward: 400,
          duration: 240,
          createdAt: new Date(Date.now() - 600000).toISOString(),
          startsAt: new Date(Date.now() - 120000).toISOString(),
        },
      ];
    }
  }

  async joinBattle(battleId: string): Promise<Battle> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/battles/${battleId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to join battle');
      }

      const battle = await response.json();
      return battle;
    } catch (error) {
      throw error;
    }
  }

  async createBattle(songId: string, songTitle: string): Promise<Battle> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          songTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create battle');
      }

      const battle = await response.json();
      return battle;
    } catch (error) {
      // Mock implementation for demo
      return {
        id: `battle-${Date.now()}`,
        songId,
        songTitle,
        artistName: 'Sample Artist',
        status: 'waiting',
        participants: [
          {
            userId: 'demo-user-1',
            displayName: 'Demo User',
            photoURL: 'https://picsum.photos/seed/demo/100/100.webp',
          },
        ],
        participantCount: 1,
        maxParticipants: 4,
        reward: 200,
        duration: 300,
        createdAt: new Date().toISOString(),
        startsAt: new Date(Date.now() + 300000).toISOString(),
      };
    }
  }

  async leaveBattle(battleId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/battles/${battleId}/leave`, {
        method: 'POST',
      });
    } catch (error) {
      throw error;
    }
  }

  async submitBattlePerformance(battleId: string, performanceId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/battles/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          performanceId,
        }),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const battleService = new BattleService();