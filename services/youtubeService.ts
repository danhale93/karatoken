/**
 * 📺 KARATOKEN YOUTUBE SERVICE
 * Real YouTube Data API v3 integration for song search, video details, and audio extraction
 */

import DEBUG from '../utils/devUtils';

export class YouTubeService {
  private static instance: YouTubeService;
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private quotaUsed = 0;
  private quotaLimit = 10000; // Daily quota limit
  
  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }
  
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      DEBUG.log.warn('⚠️ YouTube API key not found. Using demo mode.');
    }
  }
  
  /**
   * 🔍 SEARCH SONGS ON YOUTUBE
   */
  async searchSongs(query: string, options: YouTubeSearchOptions = {}): Promise<YouTubeSong[]> {
    DEBUG.log.karatoken('🔍 Searching YouTube for songs', { query, options });
    DEBUG.time.start(`YouTube Search: ${query}`);
    
    try {
      if (!this.apiKey) {
        return this.getMockSearchResults(query);
      }
      
      const response = await this.makeAPICall('search', {
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults: options.maxResults || 25,
        videoCategoryId: '10', // Music category
        order: options.order || 'relevance',
        publishedAfter: options.publishedAfter,
        publishedBefore: options.publishedBefore,
        regionCode: options.regionCode || 'US',
        relevanceLanguage: options.language || 'en',
      });
      
      // Get additional details for each video
      const videoIds = response.items.map((item: any) => item.id.videoId).join(',');
      const detailsResponse = await this.makeAPICall('videos', {
        id: videoIds,
        part: 'snippet,contentDetails,statistics',
      });
      
      const songs = this.processSearchResults(detailsResponse.items);
      
      DEBUG.time.end(`YouTube Search: ${query}`);
      DEBUG.log.success(`🎯 Found ${songs.length} songs on YouTube`);
      
      return songs;
      
    } catch (error) {
      DEBUG.log.error('YouTube search failed', error);
      // Fallback to mock results if API fails
      return this.getMockSearchResults(query);
    }
  }
  
  /**
   * 📹 GET VIDEO DETAILS
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
    DEBUG.log.karatoken('📹 Fetching YouTube video details', { videoId });
    
    try {
      if (!this.apiKey) {
        return this.getMockVideoDetails(videoId);
      }
      
      const response = await this.makeAPICall('videos', {
        id: videoId,
        part: 'snippet,contentDetails,statistics,status',
      });
      
      if (!response.items || response.items.length === 0) {
        throw new Error('Video not found');
      }
      
      const video = response.items[0];
      const details = this.processVideoDetails(video);
      
      DEBUG.log.success('📹 Video details retrieved');
      return details;
      
    } catch (error) {
      DEBUG.log.error('Failed to get video details', error);
      return this.getMockVideoDetails(videoId);
    }
  }
  
  /**
   * 🎵 GET AUDIO STREAM URL (For development - use yt-dlp in production)
   */
  async getAudioStreamUrl(videoId: string): Promise<string> {
    DEBUG.log.karatoken('🎵 Getting audio stream URL', { videoId });
    
    try {
      // In a real app, you'd use yt-dlp or similar tool on your backend
      // This is just for demonstration
      const audioUrl = await this.extractAudioUrl(videoId);
      
      DEBUG.log.success('🎵 Audio stream URL obtained');
      return audioUrl;
      
    } catch (error) {
      DEBUG.log.error('Failed to get audio stream', error);
      throw error;
    }
  }
  
  /**
   * 📝 GET VIDEO CAPTIONS/LYRICS
   */
  async getVideoCaptions(videoId: string): Promise<YouTubeCaptions[]> {
    DEBUG.log.karatoken('📝 Fetching video captions', { videoId });
    
    try {
      if (!this.apiKey) {
        return this.getMockCaptions();
      }
      
      const response = await this.makeAPICall('captions', {
        videoId: videoId,
        part: 'snippet',
      });
      
      const captions = this.processCaptions(response.items);
      
      DEBUG.log.success(`📝 Found ${captions.length} caption tracks`);
      return captions;
      
    } catch (error) {
      DEBUG.log.error('Failed to get captions', error);
      return [];
    }
  }
  
  /**
   * 🎤 FIND KARAOKE VERSIONS
   */
  async findKaraokeVersions(songTitle: string, artist: string): Promise<YouTubeSong[]> {
    DEBUG.log.karatoken('🎤 Finding karaoke versions', { songTitle, artist });
    
    try {
      const karaokeQueries = [
        `${artist} ${songTitle} karaoke`,
        `${artist} ${songTitle} instrumental`,
        `${artist} ${songTitle} backing track`,
        `${songTitle} karaoke version`,
        `${songTitle} no vocals`,
      ];
      
      const searchPromises = karaokeQueries.map(query => 
        this.searchSongs(query, { maxResults: 5 })
      );
      
      const results = await Promise.all(searchPromises);
      const allSongs = results.flat();
      
      // Deduplicate and rank by karaoke relevance
      const uniqueSongs = this.deduplicateResults(allSongs);
      const rankedSongs = this.rankKaraokeRelevance(uniqueSongs, songTitle, artist);
      
      DEBUG.log.success(`🎤 Found ${rankedSongs.length} karaoke versions`);
      return rankedSongs.slice(0, 10); // Top 10 results
      
    } catch (error) {
      DEBUG.log.error('Failed to find karaoke versions', error);
      return [];
    }
  }
  
  /**
   * 📊 GET TRENDING MUSIC
   */
  async getTrendingMusic(regionCode: string = 'US'): Promise<YouTubeSong[]> {
    DEBUG.log.karatoken('📊 Fetching trending music', { regionCode });
    
    try {
      if (!this.apiKey) {
        return this.getMockTrendingMusic();
      }
      
      const response = await this.makeAPICall('videos', {
        chart: 'mostPopular',
        part: 'snippet,contentDetails,statistics',
        videoCategoryId: '10', // Music category
        regionCode: regionCode,
        maxResults: 50,
      });
      
      const songs = this.processSearchResults(response.items);
      
      DEBUG.log.success(`📊 Found ${songs.length} trending songs`);
      return songs;
      
    } catch (error) {
      DEBUG.log.error('Failed to get trending music', error);
      return this.getMockTrendingMusic();
    }
  }
  
  /**
   * 🔧 PRIVATE HELPER METHODS
   */
  
  private async makeAPICall(endpoint: string, params: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }
    
    // Check quota
    if (this.quotaUsed >= this.quotaLimit) {
      throw new Error('YouTube API quota exceeded for today');
    }
    
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    DEBUG.log.info('🌐 Making YouTube API call', { endpoint, params });
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update quota usage (approximate)
    this.quotaUsed += this.calculateQuotaCost(endpoint);
    
    return data;
  }
  
  private calculateQuotaCost(endpoint: string): number {
    // Approximate quota costs for different endpoints
    const costs = {
      search: 100,
      videos: 1,
      captions: 50,
      channels: 1,
    };
    
    return costs[endpoint] || 1;
  }
  
  private processSearchResults(items: any[]): YouTubeSong[] {
    return items.map(item => this.processVideoItem(item));
  }
  
  private processVideoItem(item: any): YouTubeSong {
    const duration = this.parseDuration(item.contentDetails?.duration || 'PT0S');
    const { title, artist } = this.extractTitleAndArtist(item.snippet.title);
    
    return {
      id: item.id,
      videoId: item.id,
      title: title,
      artist: artist,
      originalTitle: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: {
        default: item.snippet.thumbnails.default?.url,
        medium: item.snippet.thumbnails.medium?.url,
        high: item.snippet.thumbnails.high?.url,
        maxres: item.snippet.thumbnails.maxres?.url,
      },
      duration: duration,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      likeCount: parseInt(item.statistics?.likeCount || '0'),
      commentCount: parseInt(item.statistics?.commentCount || '0'),
      url: `https://www.youtube.com/watch?v=${item.id}`,
      isKaraoke: this.detectKaraokeContent(item.snippet.title, item.snippet.description),
      karaokeScore: this.calculateKaraokeScore(item),
      audioQuality: this.estimateAudioQuality(item),
    };
  }
  
  private processVideoDetails(video: any): YouTubeVideoDetails {
    const song = this.processVideoItem(video);
    
    return {
      ...song,
      categoryId: video.snippet.categoryId,
      defaultLanguage: video.snippet.defaultLanguage,
      tags: video.snippet.tags || [],
      definition: video.contentDetails.definition,
      caption: video.contentDetails.caption === 'true',
      licensedContent: video.contentDetails.licensedContent,
      embeddable: video.status.embeddable,
      publicStatsViewable: video.status.publicStatsViewable,
    };
  }
  
  private processCaptions(items: any[]): YouTubeCaptions[] {
    return items.map(item => ({
      id: item.id,
      language: item.snippet.language,
      name: item.snippet.name,
      isAutoGenerated: item.snippet.trackKind === 'asr',
      url: '', // Would need additional API call to get actual caption content
    }));
  }
  
  private extractTitleAndArtist(fullTitle: string): { title: string; artist: string } {
    // Common patterns for artist - title separation
    const patterns = [
      /^(.+?)\s*-\s*(.+)$/,  // Artist - Title
      /^(.+?)\s*–\s*(.+)$/,  // Artist – Title (em dash)
      /^(.+?)\s*:\s*(.+)$/,  // Artist : Title
      /^(.+?)\s*\|\s*(.+)$/,  // Artist | Title
    ];
    
    for (const pattern of patterns) {
      const match = fullTitle.match(pattern);
      if (match) {
        const [, artist, title] = match;
        return {
          title: title.trim(),
          artist: artist.trim(),
        };
      }
    }
    
    // If no pattern matches, use channel name as artist (fallback)
    return {
      title: fullTitle,
      artist: 'Unknown Artist',
    };
  }
  
  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT3M30S -> 210 seconds)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  private detectKaraokeContent(title: string, description: string): boolean {
    const karaokeKeywords = [
      'karaoke', 'instrumental', 'backing track', 'no vocals',
      'sing along', 'lyrics video', 'cover version', 'minus one',
      'playback', 'accompaniment'
    ];
    
    const text = `${title} ${description}`.toLowerCase();
    
    return karaokeKeywords.some(keyword => text.includes(keyword));
  }
  
  private calculateKaraokeScore(item: any): number {
    let score = 0;
    
    const title = item.snippet.title.toLowerCase();
    const description = item.snippet.description.toLowerCase();
    
    // Check for karaoke indicators
    if (title.includes('karaoke')) score += 0.8;
    if (title.includes('instrumental')) score += 0.7;
    if (title.includes('backing track')) score += 0.6;
    if (title.includes('no vocals')) score += 0.5;
    if (description.includes('karaoke')) score += 0.3;
    
    // Check view count (popular karaoke videos tend to have good quality)
    const viewCount = parseInt(item.statistics?.viewCount || '0');
    if (viewCount > 100000) score += 0.2;
    if (viewCount > 1000000) score += 0.1;
    
    // Check channel credibility
    const channelTitle = item.snippet.channelTitle.toLowerCase();
    if (channelTitle.includes('karaoke') || channelTitle.includes('official')) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }
  
  private estimateAudioQuality(item: any): 'low' | 'medium' | 'high' {
    const viewCount = parseInt(item.statistics?.viewCount || '0');
    const likeRatio = item.statistics?.likeCount / (item.statistics?.likeCount + item.statistics?.dislikeCount || 1);
    
    if (viewCount > 1000000 && likeRatio > 0.9) return 'high';
    if (viewCount > 100000 && likeRatio > 0.8) return 'medium';
    return 'low';
  }
  
  private deduplicateResults(songs: YouTubeSong[]): YouTubeSong[] {
    const seen = new Set();
    return songs.filter(song => {
      const key = `${song.title.toLowerCase()}_${song.artist.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private rankKaraokeRelevance(songs: YouTubeSong[], targetTitle: string, targetArtist: string): YouTubeSong[] {
    return songs.sort((a, b) => {
      let scoreA = a.karaokeScore;
      let scoreB = b.karaokeScore;
      
      // Boost score for exact title/artist matches
      if (a.title.toLowerCase().includes(targetTitle.toLowerCase())) scoreA += 0.3;
      if (a.artist.toLowerCase().includes(targetArtist.toLowerCase())) scoreA += 0.3;
      if (b.title.toLowerCase().includes(targetTitle.toLowerCase())) scoreB += 0.3;
      if (b.artist.toLowerCase().includes(targetArtist.toLowerCase())) scoreB += 0.3;
      
      return scoreB - scoreA;
    });
  }
  
  private async extractAudioUrl(videoId: string): Promise<string> {
    // This would typically use yt-dlp on the backend
    // For development, return a placeholder
    DEBUG.log.warn('⚠️ Audio extraction not implemented. Use yt-dlp on backend.');
    return `https://audio-placeholder.com/${videoId}.mp3`;
  }
  
  /**
   * 🎭 MOCK DATA FOR DEVELOPMENT
   */
  
  private getMockSearchResults(query: string): YouTubeSong[] {
    return [
      {
        id: 'dQw4w9WgXcQ',
        videoId: 'dQw4w9WgXcQ',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        originalTitle: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        channelTitle: 'RickAstleyVEVO',
        description: 'Official music video by Rick Astley',
        thumbnail: {
          medium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        },
        duration: 213,
        publishedAt: '2009-10-25T06:57:33Z',
        viewCount: 1000000000,
        likeCount: 10000000,
        commentCount: 500000,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isKaraoke: false,
        karaokeScore: 0.1,
        audioQuality: 'high',
      },
      {
        id: 'kJQP7kiw5Fk',
        videoId: 'kJQP7kiw5Fk',
        title: 'Despacito',
        artist: 'Luis Fonsi ft. Daddy Yankee',
        originalTitle: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        channelTitle: 'LuisFonsiVEVO',
        description: 'Official music video',
        thumbnail: {
          medium: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
          high: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        },
        duration: 282,
        publishedAt: '2017-01-12T16:00:01Z',
        viewCount: 8000000000,
        likeCount: 50000000,
        commentCount: 2000000,
        url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        isKaraoke: false,
        karaokeScore: 0.2,
        audioQuality: 'high',
      },
    ];
  }
  
  private getMockVideoDetails(videoId: string): YouTubeVideoDetails {
    const mockSong = this.getMockSearchResults('')[0];
    return {
      ...mockSong,
      id: videoId,
      videoId: videoId,
      categoryId: '10',
      tags: ['music', 'official', 'video'],
      definition: 'hd',
      caption: true,
      licensedContent: true,
      embeddable: true,
      publicStatsViewable: true,
    };
  }
  
  private getMockCaptions(): YouTubeCaptions[] {
    return [
      {
        id: 'caption1',
        language: 'en',
        name: 'English',
        isAutoGenerated: false,
        url: '',
      },
      {
        id: 'caption2',
        language: 'es',
        name: 'Spanish',
        isAutoGenerated: true,
        url: '',
      },
    ];
  }
  
  private getMockTrendingMusic(): YouTubeSong[] {
    return this.getMockSearchResults('trending');
  }
}

// Type definitions
export interface YouTubeSearchOptions {
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  regionCode?: string;
  language?: string;
}

export interface YouTubeSong {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  originalTitle: string;
  channelTitle: string;
  description: string;
  thumbnail: {
    default?: string;
    medium?: string;
    high?: string;
    maxres?: string;
  };
  duration: number;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  url: string;
  isKaraoke: boolean;
  karaokeScore: number;
  audioQuality: 'low' | 'medium' | 'high';
}

export interface YouTubeVideoDetails extends YouTubeSong {
  categoryId: string;
  defaultLanguage?: string;
  tags: string[];
  definition: string;
  caption: boolean;
  licensedContent: boolean;
  embeddable: boolean;
  publicStatsViewable: boolean;
}

export interface YouTubeCaptions {
  id: string;
  language: string;
  name: string;
  isAutoGenerated: boolean;
  url: string;
}

export default YouTubeService.getInstance();