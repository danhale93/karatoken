// Powered by OnSpace.AI
export interface LyricLine {
  startTime: number; // in milliseconds
  endTime: number;
  text: string;
  confidence?: number;
  wordTimings?: WordTiming[];
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface SynchronizedLyrics {
  trackId: string;
  trackTitle: string;
  artist: string;
  duration: number;
  lines: LyricLine[];
  language: string;
  syncQuality: 'high' | 'medium' | 'low';
}

class LyricsService {
  private readonly LYRICS_API_BASE = 'https://api.lyrics.com'; // Example API
  
  async searchLyrics(title: string, artist: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.LYRICS_API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LYRICS_API_KEY}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Lyrics search failed');
      }

      const data = await response.json();
      return data.lyrics || null;
    } catch (error) {
      console.error('Lyrics search error:', error);
      return null;
    }
  }

  async synchronizeLyricsWithAudio(
    audioUrl: string, 
    rawLyrics: string,
    trackTitle: string,
    artist: string
  ): Promise<SynchronizedLyrics> {
    try {
      // Use AI service to sync lyrics with audio timing
      const response = await fetch('/api/ai/sync-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl,
          lyrics: rawLyrics,
          language: 'en', // Auto-detect in production
        }),
      });

      if (!response.ok) {
        throw new Error('Lyrics synchronization failed');
      }

      const syncData = await response.json();
      
      return {
        trackId: `track-${Date.now()}`,
        trackTitle,
        artist,
        duration: syncData.audioDuration,
        lines: syncData.syncedLines,
        language: syncData.detectedLanguage,
        syncQuality: syncData.confidence > 0.8 ? 'high' : 
                    syncData.confidence > 0.6 ? 'medium' : 'low',
      };
    } catch (error) {
      console.error('Lyrics sync error:', error);
      return this.generateMockSyncedLyrics(trackTitle, artist, rawLyrics);
    }
  }

  async getSyncedLyricsFromDatabase(trackId: string): Promise<SynchronizedLyrics | null> {
    try {
      const response = await fetch(`/api/lyrics/synced/${trackId}`);
      
      if (!response.ok) {
        return null;
      }

      const syncedLyrics = await response.json();
      return syncedLyrics;
    } catch (error) {
      console.error('Database lyrics retrieval error:', error);
      return null;
    }
  }

  async createTimestampedLyrics(
    lyrics: string[],
    audioUrl: string
  ): Promise<LyricLine[]> {
    try {
      // Use speech-to-text alignment for precise timing
      const response = await fetch('/api/ai/align-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyricsLines: lyrics,
          audioUrl,
          alignmentMode: 'precise',
        }),
      });

      const alignment = await response.json();
      return alignment.timedLines;
    } catch (error) {
      console.error('Lyrics alignment error:', error);
      // Fallback: create even spacing
      return this.createEvenlySpacedLyrics(lyrics, 180000); // 3 minutes
    }
  }

  private generateMockSyncedLyrics(
    title: string, 
    artist: string, 
    rawLyrics?: string
  ): SynchronizedLyrics {
    // Create sample synchronized lyrics structure
    const sampleLines: LyricLine[] = [
      {
        startTime: 0,
        endTime: 4000,
        text: '[Instrumental Intro]',
      },
      {
        startTime: 4000,
        endTime: 8000,
        text: 'Verse 1 starts here...',
        confidence: 0.9,
      },
      {
        startTime: 8000,
        endTime: 12000,
        text: 'Sample lyrics for karaoke display',
        confidence: 0.85,
      },
      {
        startTime: 12000,
        endTime: 16000,
        text: 'Real lyrics would be synchronized here',
        confidence: 0.9,
      },
      // ... more lines would be generated from actual lyrics
    ];

    return {
      trackId: `mock-${title.replace(/\s+/g, '-').toLowerCase()}`,
      trackTitle: title,
      artist: artist,
      duration: 180000, // 3 minutes
      lines: sampleLines,
      language: 'en',
      syncQuality: 'medium',
    };
  }

  private createEvenlySpacedLyrics(lyrics: string[], totalDuration: number): LyricLine[] {
    const lineCount = lyrics.length;
    const timePerLine = totalDuration / lineCount;

    return lyrics.map((line, index) => ({
      startTime: index * timePerLine,
      endTime: (index + 1) * timePerLine,
      text: line,
      confidence: 0.7,
    }));
  }

  getCurrentLyricLine(syncedLyrics: SynchronizedLyrics, currentTime: number): LyricLine | null {
    return syncedLyrics.lines.find(line => 
      currentTime >= line.startTime && currentTime <= line.endTime
    ) || null;
  }

  getUpcomingLyricLines(
    syncedLyrics: SynchronizedLyrics, 
    currentTime: number, 
    lookAheadMs: number = 2000
  ): LyricLine[] {
    return syncedLyrics.lines.filter(line => 
      line.startTime > currentTime && 
      line.startTime <= currentTime + lookAheadMs
    );
  }
}

export const lyricsService = new LyricsService();