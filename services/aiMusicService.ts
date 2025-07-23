// Powered by OnSpace.AI
export interface GenreStyle {
  id: string;
  name: string;
  description: string;
  instrumentPresets: string[];
  tempoRange: [number, number];
  keySignatures: string[];
}

export interface AudioSeparation {
  vocals: string;
  instruments: string;
  drums: string;
  bass: string;
  melody: string;
}

export interface StyleSwapResult {
  originalTrackId: string;
  newStyle: string;
  instrumentalUrl: string;
  vocalGuideUrl?: string;
  processingTime: number;
}

class AIMusicService {
  private readonly API_BASE = 'https://api.spleeter.ai'; // Example AI service
  
  async separateAudioTracks(audioUrl: string): Promise<AudioSeparation> {
    try {
      const response = await fetch(`${this.API_BASE}/separate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          audioUrl,
          separationModel: '5stems', // vocals, drums, bass, piano, other
          outputFormat: 'wav',
          sampleRate: 44100,
        }),
      });

      if (!response.ok) {
        throw new Error('Audio separation failed');
      }

      const result = await response.json();
      return {
        vocals: result.stems.vocals,
        instruments: result.stems.other,
        drums: result.stems.drums,
        bass: result.stems.bass,
        melody: result.stems.piano,
      };
    } catch (error) {
      console.error('Audio separation error:', error);
      // Mock implementation for demo
      return {
        vocals: `mock-vocals-${Date.now()}.wav`,
        instruments: `mock-instruments-${Date.now()}.wav`,
        drums: `mock-drums-${Date.now()}.wav`,
        bass: `mock-bass-${Date.now()}.wav`,
        melody: `mock-melody-${Date.now()}.wav`,
      };
    }
  }

  async swapGenreStyle(
    originalTrackUrl: string, 
    targetGenre: string,
    stylePreferences?: any
  ): Promise<StyleSwapResult> {
    try {
      // First separate the original track
      const separation = await this.separateAudioTracks(originalTrackUrl);
      
      // Apply AI style transfer to instrumental parts
      const response = await fetch(`${this.API_BASE}/style-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          instrumentalUrl: separation.instruments,
          drumsUrl: separation.drums,
          bassUrl: separation.bass,
          melodyUrl: separation.melody,
          targetGenre,
          stylePreferences: {
            tempo: stylePreferences?.tempo || 'auto',
            energy: stylePreferences?.energy || 'medium',
            instrumentation: stylePreferences?.instruments || 'auto',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Genre swap failed');
      }

      const result = await response.json();
      return {
        originalTrackId: originalTrackUrl,
        newStyle: targetGenre,
        instrumentalUrl: result.swappedInstrumental,
        vocalGuideUrl: separation.vocals,
        processingTime: result.processingTime,
      };
    } catch (error) {
      console.error('Genre swap error:', error);
      // Mock implementation for demo
      return {
        originalTrackId: originalTrackUrl,
        newStyle: targetGenre,
        instrumentalUrl: `mock-${targetGenre}-instrumental-${Date.now()}.wav`,
        vocalGuideUrl: `mock-vocal-guide-${Date.now()}.wav`,
        processingTime: 45000, // 45 seconds
      };
    }
  }

  async getAvailableGenres(): Promise<GenreStyle[]> {
    try {
      const response = await fetch(`${this.API_BASE}/genres`);
      const genres = await response.json();
      return genres;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'pop',
          name: 'Pop',
          description: 'Modern pop with synthesizers and electronic beats',
          instrumentPresets: ['synth', 'electronic_drums', 'bass_synth'],
          tempoRange: [120, 140],
          keySignatures: ['C', 'G', 'D', 'A', 'F'],
        },
        {
          id: 'rock',
          name: 'Rock',
          description: 'Classic rock with electric guitars and powerful drums',
          instrumentPresets: ['electric_guitar', 'bass_guitar', 'rock_drums'],
          tempoRange: [100, 160],
          keySignatures: ['E', 'A', 'D', 'G', 'B'],
        },
        {
          id: 'jazz',
          name: 'Jazz',
          description: 'Smooth jazz with piano, brass, and improvisation',
          instrumentPresets: ['piano', 'saxophone', 'trumpet', 'upright_bass'],
          tempoRange: [80, 200],
          keySignatures: ['Bb', 'Eb', 'F', 'C', 'G'],
        },
        {
          id: 'reggae',
          name: 'Reggae',
          description: 'Laid-back reggae with characteristic rhythm patterns',
          instrumentPresets: ['reggae_guitar', 'reggae_bass', 'reggae_drums'],
          tempoRange: [60, 90],
          keySignatures: ['A', 'D', 'G', 'C', 'F'],
        },
        {
          id: 'electronic',
          name: 'Electronic',
          description: 'Electronic dance music with synthesizers and beats',
          instrumentPresets: ['edm_synth', 'electronic_bass', 'edm_drums'],
          tempoRange: [128, 140],
          keySignatures: ['Am', 'Dm', 'Gm', 'Em', 'Bm'],
        },
      ];
    }
  }

  async enhanceVocalClarity(vocalTrackUrl: string): Promise<string> {
    try {
      const response = await fetch(`${this.API_BASE}/enhance-vocals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          vocalUrl: vocalTrackUrl,
          enhancements: {
            noiseReduction: true,
            clarityBoost: true,
            dynamicRange: 'normalize',
          },
        }),
      });

      const result = await response.json();
      return result.enhancedVocalUrl;
    } catch (error) {
      console.error('Vocal enhancement error:', error);
      return `enhanced-${vocalTrackUrl}`;
    }
  }
}

export const aiMusicService = new AIMusicService();