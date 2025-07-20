// Powered by OnSpace.AI
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  genre: string;
  rating: number;
  playCount: number;
  lyrics?: string;
  backingTrackUrl?: string;
  createdAt: string;
}

class SongService {
  async searchSongs(query: string): Promise<Song[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search songs');
      }
      
      const songs = await response.json();
      return songs;
    } catch (error) {
      // Mock implementation for demo
      const mockSongs: Song[] = [
        {
          id: 'song-search-1',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          albumArt: 'https://picsum.photos/seed/queen/300/300.webp',
          duration: 355,
          difficulty: 'Hard' as const,
          genre: 'Rock',
          rating: 4.9,
          playCount: 15420,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'song-search-2',
          title: 'Sweet Caroline',
          artist: 'Neil Diamond',
          albumArt: 'https://picsum.photos/seed/diamond/300/300.webp',
          duration: 201,
          difficulty: 'Medium' as const,
          genre: 'Pop',
          rating: 4.7,
          playCount: 8930,
          createdAt: new Date().toISOString(),
        },
      ].filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase())
      );
      
      return mockSongs;
    }
  }

  async getFeaturedSongs(): Promise<Song[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/songs/featured');
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured songs');
      }
      
      const songs = await response.json();
      return songs;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'featured-1',
          title: 'Perfect',
          artist: 'Ed Sheeran',
          albumArt: 'https://picsum.photos/seed/edsheeran/300/300.webp',
          duration: 263,
          difficulty: 'Medium' as const,
          genre: 'Pop',
          rating: 4.8,
          playCount: 12500,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'featured-2',
          title: 'Someone Like You',
          artist: 'Adele',
          albumArt: 'https://picsum.photos/seed/adele/300/300.webp',
          duration: 285,
          difficulty: 'Medium' as const,
          genre: 'Pop',
          rating: 4.9,
          playCount: 18200,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'featured-3',
          title: 'Hotel California',
          artist: 'Eagles',
          albumArt: 'https://picsum.photos/seed/eagles/300/300.webp',
          duration: 391,
          difficulty: 'Hard' as const,
          genre: 'Rock',
          rating: 4.7,
          playCount: 9800,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'featured-4',
          title: 'Imagine',
          artist: 'John Lennon',
          albumArt: 'https://picsum.photos/seed/lennon/300/300.webp',
          duration: 183,
          difficulty: 'Easy' as const,
          genre: 'Pop',
          rating: 4.9,
          playCount: 14300,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  async getPopularSongs(): Promise<Song[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/songs/popular');
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular songs');
      }
      
      const songs = await response.json();
      return songs;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'popular-1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          albumArt: 'https://picsum.photos/seed/weeknd/300/300.webp',
          duration: 200,
          difficulty: 'Medium' as const,
          genre: 'Pop',
          rating: 4.6,
          playCount: 22100,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'popular-2',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          albumArt: 'https://picsum.photos/seed/shape/300/300.webp',
          duration: 233,
          difficulty: 'Easy' as const,
          genre: 'Pop',
          rating: 4.5,
          playCount: 19800,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'popular-3',
          title: 'Watermelon Sugar',
          artist: 'Harry Styles',
          albumArt: 'https://picsum.photos/seed/harry/300/300.webp',
          duration: 174,
          difficulty: 'Easy' as const,
          genre: 'Pop',
          rating: 4.4,
          playCount: 17600,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  async getSongById(songId: string): Promise<Song> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/songs/${songId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch song');
      }
      
      const song = await response.json();
      return song;
    } catch (error) {
      // Mock implementation for demo
      return {
        id: songId,
        title: 'Sample Song',
        artist: 'Sample Artist',
        albumArt: 'https://picsum.photos/seed/sample/300/300.webp',
        duration: 240,
        difficulty: 'Medium',
        genre: 'Pop',
        rating: 4.5,
        playCount: 1200,
        lyrics: 'Sample lyrics for karaoke...',
        createdAt: new Date().toISOString(),
      };
    }
  }

  async getUserFavorites(userId: string): Promise<Song[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/favorites`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      
      const favorites = await response.json();
      return favorites;
    } catch (error) {
      // Mock implementation for demo
      return [];
    }
  }

  async addToFavorites(userId: string, songId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/users/${userId}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId }),
      });
    } catch (error) {
      throw error;
    }
  }

  async removeFromFavorites(userId: string, songId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/users/${userId}/favorites/${songId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error;
    }
  }
}

export const songService = new SongService();