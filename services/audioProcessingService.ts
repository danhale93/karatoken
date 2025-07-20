// Powered by OnSpace.AI - Karatoken Audio Processing Service
// Core audio processing using Demucs for stem separation and genre transformation

interface AudioStem {
  vocals: string;
  bass: string;
  drums: string;
  other: string;
}

interface GenreTransformParams {
  targetGenre: string;
  tempo?: number;
  key?: number;
  intensity?: number;
}

interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  thumbnail: string;
}

class AudioProcessingService {
  private demucsEndpoint = 'https://api.karatoken.io/audio/separate';
  private genreModelEndpoint = 'https://api.karatoken.io/ai/genre-transform';
  private youtubeApiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  private youtubeApiEndpoint = 'https://www.googleapis.com/youtube/v3';

  // YouTube API Integration
  async searchYouTubeTracks(query: string, maxResults: number = 20): Promise<YouTubeTrack[]> {
    try {
      const searchUrl = `${this.youtubeApiEndpoint}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${this.youtubeApiKey}&maxResults=${maxResults}&videoCategoryId=10`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      const tracks: YouTubeTrack[] = await Promise.all(
        data.items.map(async (item: any) => {
          const videoDetails = await this.getVideoDetails(item.id.videoId);
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            duration: this.parseDuration(videoDetails.contentDetails.duration),
            audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url,
          };
        })
      );

      return tracks;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error('Failed to search YouTube tracks');
    }
  }

  async getVideoDetails(videoId: string) {
    const detailsUrl = `${this.youtubeApiEndpoint}/videos?part=contentDetails,statistics&id=${videoId}&key=${this.youtubeApiKey}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();
    return data.items[0];
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT4M13S) to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Audio extraction from YouTube (using yt-dlp backend)
  async extractAudioFromYouTube(videoId: string): Promise<string> {
    try {
      const response = await fetch('https://api.karatoken.io/audio/extract-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          format: 'wav',
          quality: 'best'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract audio from YouTube');
      }

      const { audioUrl } = await response.json();
      return audioUrl;
    } catch (error) {
      console.error('Audio extraction error:', error);
      throw new Error('Failed to extract audio from YouTube');
    }
  }

  // Demucs-powered stem separation
  async separateAudioStems(audioUrl: string): Promise<AudioStem> {
    try {
      const response = await fetch(this.demucsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          audioUrl,
          model: 'htdemucs_ft', // High-quality Demucs model
          device: 'cuda', // Use GPU acceleration
          stems: ['vocals', 'bass', 'drums', 'other'],
          format: 'wav',
          sampleRate: 44100,
        }),
      });

      if (!response.ok) {
        throw new Error('Stem separation failed');
      }

      const stems = await response.json();
      return {
        vocals: stems.vocals_url,
        bass: stems.bass_url,
        drums: stems.drums_url,
        other: stems.other_url,
      };
    } catch (error) {
      console.error('Stem separation error:', error);
      throw new Error('Failed to separate audio stems');
    }
  }

  // AI-powered genre transformation
  async transformGenre(stems: AudioStem, params: GenreTransformParams): Promise<AudioStem> {
    try {
      const response = await fetch(this.genreModelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          stems,
          targetGenre: params.targetGenre,
          tempo: params.tempo || 120,
          key: params.key || 0,
          intensity: params.intensity || 0.8,
          preserveVocals: true, // Keep original vocals for karaoke
        }),
      });

      if (!response.ok) {
        throw new Error('Genre transformation failed');
      }

      const transformedStems = await response.json();
      return {
        vocals: stems.vocals, // Keep original vocals
        bass: transformedStems.bass_transformed,
        drums: transformedStems.drums_transformed,
        other: transformedStems.other_transformed,
      };
    } catch (error) {
      console.error('Genre transformation error:', error);
      throw new Error('Failed to transform genre');
    }
  }

  // Real-time genre swapping process
  async processGenreSwap(
    youtubeVideoId: string, 
    targetGenre: string,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<{ originalStems: AudioStem; transformedStems: AudioStem; mixedUrl: string }> {
    try {
      // Step 1: Extract audio from YouTube
      onProgress?.(10, 'Extracting audio from YouTube...');
      const audioUrl = await this.extractAudioFromYouTube(youtubeVideoId);

      // Step 2: Separate stems using Demucs
      onProgress?.(30, 'Separating audio stems with AI...');
      const originalStems = await this.separateAudioStems(audioUrl);

      // Step 3: Transform genre
      onProgress?.(60, `Transforming to ${targetGenre} style...`);
      const transformedStems = await this.transformGenre(originalStems, { targetGenre });

      // Step 4: Create mixed version for playback
      onProgress?.(80, 'Creating final mix...');
      const mixedUrl = await this.createMixedTrack(transformedStems);

      onProgress?.(100, 'Genre transformation complete!');

      return {
        originalStems,
        transformedStems,
        mixedUrl,
      };
    } catch (error) {
      console.error('Genre swap processing error:', error);
      throw error;
    }
  }

  // Create mixed track from stems
  private async createMixedTrack(stems: AudioStem): Promise<string> {
    try {
      const response = await fetch('https://api.karatoken.io/audio/mix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          stems,
          outputFormat: 'mp3',
          quality: 'high',
          normalize: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Audio mixing failed');
      }

      const { mixedUrl } = await response.json();
      return mixedUrl;
    } catch (error) {
      console.error('Audio mixing error:', error);
      throw new Error('Failed to create mixed track');
    }
  }

  // Real-time stem manipulation for live performance
  async createKaraokeVersion(stems: AudioStem, vocalLevel: number = 0.1): Promise<string> {
    try {
      const response = await fetch('https://api.karatoken.io/audio/karaoke-mix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          stems,
          vocalLevel, // 0.0 = no vocals, 1.0 = full vocals
          addHarmonies: true,
          addReverb: true,
          outputFormat: 'wav', // High quality for real-time processing
        }),
      });

      if (!response.ok) {
        throw new Error('Karaoke version creation failed');
      }

      const { karaokeUrl } = await response.json();
      return karaokeUrl;
    } catch (error) {
      console.error('Karaoke creation error:', error);
      throw new Error('Failed to create karaoke version');
    }
  }

  // Get available genres for transformation
  getAvailableGenres(): string[] {
    return [
      'pop',
      'rock',
      'hip-hop',
      'electronic',
      'jazz',
      'blues',
      'country',
      'reggae',
      'metal',
      'funk',
      'r&b',
      'classical',
      'latin',
      'folk',
      'punk',
      'indie',
      'trap',
      'house',
      'techno',
      'lo-fi'
    ];
  }

  // Advanced: Real-time parameter adjustment
  async adjustGenreParameters(
    stemUrls: AudioStem,
    adjustments: {
      tempo?: number;
      key?: number;
      bassBoost?: number;
      drumIntensity?: number;
      effectsLevel?: number;
    }
  ): Promise<AudioStem> {
    try {
      const response = await fetch('https://api.karatoken.io/audio/adjust-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          stems: stemUrls,
          adjustments,
          realtime: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Real-time adjustment failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Real-time adjustment error:', error);
      throw error;
    }
  }

  // Cache management for processed audio
  async cacheProcessedAudio(videoId: string, genre: string, stems: AudioStem): Promise<void> {
    try {
      await fetch('https://api.karatoken.io/cache/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          cacheKey: `${videoId}_${genre}`,
          stems,
          ttl: 24 * 60 * 60, // 24 hours
        }),
      });
    } catch (error) {
      console.error('Caching error:', error);
    }
  }

  async getCachedAudio(videoId: string, genre: string): Promise<AudioStem | null> {
    try {
      const response = await fetch(
        `https://api.karatoken.io/cache/get?key=${videoId}_${genre}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }
}

export const audioProcessingService = new AudioProcessingService();
export type { AudioStem, GenreTransformParams, YouTubeTrack };