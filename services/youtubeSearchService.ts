// Powered by OnSpace.AI
export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
  description: string;
}

export interface AudioExtractionResult {
  audioUrl: string;
  format: string;
  quality: string;
  duration: number;
  sampleRate: number;
}

class YouTubeSearchService {
  private readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  private readonly API_BASE = 'https://www.googleapis.com/youtube/v3';

  async searchSongs(query: string, maxResults: number = 20): Promise<YouTubeSearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        part: 'snippet',
        maxResults: maxResults.toString(),
        q: `${query} karaoke OR instrumental OR backing track`,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: this.YOUTUBE_API_KEY || '',
      });

      const response = await fetch(`${this.API_BASE}/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('YouTube search failed');
      }

      const data = await response.json();
      
      // Get additional video details
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `${this.API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.YOUTUBE_API_KEY}`
      );
      
      const detailsData = await detailsResponse.json();
      
      return data.items.map((item: any, index: number) => {
        const details = detailsData.items[index];
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          duration: this.parseISO8601Duration(details.contentDetails.duration),
          viewCount: parseInt(details.statistics.viewCount || '0'),
          publishedAt: item.snippet.publishedAt,
          description: item.snippet.description,
        };
      });
    } catch (error) {
      console.error('YouTube search error:', error);
      // Mock implementation for demo
      return this.getMockSearchResults(query);
    }
  }

  async extractAudioFromVideo(videoId: string): Promise<AudioExtractionResult> {
    try {
      // Note: This would typically use a service like yt-dlp or similar
      // For legal compliance, this should only be used with permission
      const response = await fetch('/api/youtube/extract-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          format: 'mp3',
          quality: 'high',
        }),
      });

      if (!response.ok) {
        throw new Error('Audio extraction failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Audio extraction error:', error);
      // Mock implementation for demo
      return {
        audioUrl: `mock-audio-${videoId}.mp3`,
        format: 'mp3',
        quality: 'high',
        duration: 180,
        sampleRate: 44100,
      };
    }
  }

  async searchKaraokeVersions(songTitle: string, artist: string): Promise<YouTubeSearchResult[]> {
    const queries = [
      `${songTitle} ${artist} karaoke`,
      `${songTitle} ${artist} instrumental`,
      `${songTitle} ${artist} backing track`,
      `${songTitle} karaoke version`,
      `${songTitle} instrumental version`,
    ];

    const allResults: YouTubeSearchResult[] = [];
    
    for (const query of queries) {
      try {
        const results = await this.searchSongs(query, 5);
        allResults.push(...results);
      } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.videoId === result.videoId)
    );

    return uniqueResults.slice(0, 15);
  }

  private parseISO8601Duration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    
    return result;
  }

  private getMockSearchResults(query: string): YouTubeSearchResult[] {
    return [
      {
        videoId: 'mock-video-1',
        title: `${query} - Karaoke Version`,
        channelTitle: 'Karaoke Mugen',
        thumbnailUrl: 'https://picsum.photos/seed/karaoke1/480/360.webp',
        duration: '3:45',
        viewCount: 125000,
        publishedAt: '2024-01-15T10:00:00Z',
        description: `High quality karaoke version of ${query} with lyrics`,
      },
      {
        videoId: 'mock-video-2',
        title: `${query} - Instrumental Backing Track`,
        channelTitle: 'Backing Tracks Studio',
        thumbnailUrl: 'https://picsum.photos/seed/karaoke2/480/360.webp',
        duration: '3:42',
        viewCount: 89000,
        publishedAt: '2024-01-10T14:30:00Z',
        description: `Professional instrumental backing track for ${query}`,
      },
    ];
  }
}

export const youtubeSearchService = new YouTubeSearchService();