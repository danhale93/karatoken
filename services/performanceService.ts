// Powered by OnSpace.AI
export interface Performance {
  id: string;
  userId: string;
  songId: string;
  songTitle: string;
  artistName: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  score: number;
  duration: number;
  createdAt: string;
  status: 'draft' | 'recording' | 'completed';
}

class PerformanceService {
  async createPerformance(songId: string, songTitle: string, artistName: string): Promise<Performance> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/performances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          songTitle,
          artistName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create performance');
      }

      const performance = await response.json();
      return performance;
    } catch (error) {
      // Mock implementation for demo
      return {
        id: `performance-${Date.now()}`,
        userId: 'demo-user-1',
        songId,
        songTitle,
        artistName,
        score: 0,
        duration: 0,
        createdAt: new Date().toISOString(),
        status: 'draft',
      };
    }
  }

  async startRecording(performanceId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/performances/${performanceId}/start-recording`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording(performanceId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/performances/${performanceId}/stop-recording`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  async savePerformance(performanceId: string, videoUrl: string): Promise<Performance> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/performances/${performanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          status: 'completed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save performance');
      }

      const performance = await response.json();
      return performance;
    } catch (error) {
      // Mock implementation for demo
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      return {
        id: performanceId,
        userId: 'demo-user-1',
        songId: 'song-1',
        songTitle: 'Sample Song',
        artistName: 'Sample Artist',
        videoUrl,
        thumbnailUrl: 'https://picsum.photos/seed/performance/300/200.webp',
        score: mockScore,
        duration: 180,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
    }
  }

  async getPerformances(userId: string): Promise<Performance[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/performances`);

      if (!response.ok) {
        throw new Error('Failed to fetch performances');
      }

      const performances = await response.json();
      return performances;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'perf-1',
          userId,
          songId: 'song-1',
          songTitle: 'Bohemian Rhapsody',
          artistName: 'Queen',
          videoUrl: 'mock-video-url',
          thumbnailUrl: 'https://picsum.photos/seed/queen/300/200.webp',
          score: 92,
          duration: 355,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
        },
        {
          id: 'perf-2',
          userId,
          songId: 'song-2',
          songTitle: 'Don\'t Stop Believin\'',
          artistName: 'Journey',
          videoUrl: 'mock-video-url',
          thumbnailUrl: 'https://picsum.photos/seed/journey/300/200.webp',
          score: 87,
          duration: 251,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed',
        },
      ];
    }
  }

  async getRecentPerformances(userId: string): Promise<Performance[]> {
    try {
      const allPerformances = await this.getPerformances(userId);
      return allPerformances.slice(0, 5);
    } catch (error) {
      throw error;
    }
  }

  async deletePerformance(performanceId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/performances/${performanceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete performance');
      }
    } catch (error) {
      throw error;
    }
  }
}

export const performanceService = new PerformanceService();