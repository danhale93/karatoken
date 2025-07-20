// Powered by OnSpace.AI
import Config from '../constants/Config';
import { MOCK_SONGS } from '../constants/MockData';

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
  private simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  }

  async searchSongs(query: string): Promise<Song[]> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo
      const filteredSongs = MOCK_SONGS.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.genre.toLowerCase().includes(query.toLowerCase())
      );
      
      return filteredSongs;
    }
    
    // TODO: Replace with actual API call
    try {
      const response = await fetch(`${Config.API_BASE_URL}/songs/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search songs');
      }
      
      const songs = await response.json();
      return songs;
    } catch (error) {
      throw new Error('Failed to search songs');
    }
  }

  async getFeaturedSongs(): Promise<Song[]> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo - return featured songs
      return MOCK_SONGS.slice(0, 4); // Return first 4 songs as featured
    }
    
    // TODO: Replace with actual API call
    try {
      const response = await fetch(`${Config.API_BASE_URL}/songs/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured songs');
      }
      
      const songs = await response.json();
      return songs;
    } catch (error) {
      throw new Error('Failed to fetch featured songs');
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
          difficulty: 'Medium',
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
          difficulty: 'Easy',
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
          difficulty: 'Easy',
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