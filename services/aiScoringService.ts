// Powered by OnSpace.AI - Karatoken AI Scoring Service
// Real-time pitch detection and vocal analysis

interface PitchData {
  frequency: number;
  confidence: number;
  timestamp: number;
  note: string;
  octave: number;
}

interface VocalMetrics {
  pitchAccuracy: number;
  rhythmAccuracy: number;
  toneQuality: number;
  vibrato: number;
  breathControl: number;
  dynamics: number;
}

interface PerformanceScore {
  overallScore: number;
  pitchScore: number;
  rhythmScore: number;
  expressionScore: number;
  bonusPoints: number;
  breakdown: VocalMetrics;
  streakMultiplier: number;
}

interface RealTimeAnalysis {
  currentPitch: PitchData;
  targetPitch: PitchData;
  accuracy: number;
  trend: 'improving' | 'declining' | 'stable';
  suggestions: string[];
}

interface DuetAnalysis {
  harmony: number;
  synchronization: number;
  balance: number;
  interaction: number;
  combinedScore: number;
}

interface BattleMetrics {
  player1Score: PerformanceScore;
  player2Score: PerformanceScore;
  crowdVotes: { player1: number; player2: number };
  realTimeLeader: 'player1' | 'player2' | 'tie';
  momentumShift: number[];
}

class AIScoringService {
  private pitchDetectionEndpoint = 'https://api.karatoken.io/ai/pitch-detect';
  private scoringModelEndpoint = 'https://api.karatoken.io/ai/score-performance';
  private duetAnalysisEndpoint = 'https://api.karatoken.io/ai/duet-analysis';
  private battleScoringEndpoint = 'https://api.karatoken.io/ai/battle-score';

  // Real-time pitch detection
  async detectPitch(audioData: Float32Array, sampleRate: number = 44100): Promise<PitchData> {
    try {
      const response = await fetch(this.pitchDetectionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          audioData: Array.from(audioData),
          sampleRate,
          algorithm: 'crepe', // Google's CREPE algorithm for pitch detection
          confidence_threshold: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error('Pitch detection failed');
      }

      const result = await response.json();
      return {
        frequency: result.frequency,
        confidence: result.confidence,
        timestamp: Date.now(),
        note: result.note,
        octave: result.octave,
      };
    } catch (error) {
      console.error('Pitch detection error:', error);
      // Fallback to basic frequency detection
      return this.basicPitchDetection(audioData, sampleRate);
    }
  }

  // Fallback pitch detection using autocorrelation
  private basicPitchDetection(audioData: Float32Array, sampleRate: number): PitchData {
    const minPeriod = Math.floor(sampleRate / 800); // ~800 Hz max
    const maxPeriod = Math.floor(sampleRate / 80);  // ~80 Hz min
    
    let bestPeriod = 0;
    let bestCorrelation = 0;

    for (let period = minPeriod; period < maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    const frequency = bestPeriod > 0 ? sampleRate / bestPeriod : 0;
    const { note, octave } = this.frequencyToNote(frequency);

    return {
      frequency,
      confidence: Math.min(bestCorrelation / 10000, 1),
      timestamp: Date.now(),
      note,
      octave,
    };
  }

  // Convert frequency to musical note
  private frequencyToNote(frequency: number): { note: string; octave: number } {
    if (frequency <= 0) return { note: 'N/A', octave: 0 };

    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const semitones = Math.round(12 * Math.log2(frequency / A4));
    const octave = Math.floor((semitones + 9) / 12) + 4;
    const noteIndex = ((semitones % 12) + 12) % 12;
    
    return {
      note: noteNames[noteIndex],
      octave: Math.max(0, octave),
    };
  }

  // Real-time performance analysis
  async analyzePerformanceRealTime(
    userPitch: PitchData,
    targetPitch: PitchData,
    lyrics: string,
    timestamp: number
  ): Promise<RealTimeAnalysis> {
    const pitchDifference = Math.abs(userPitch.frequency - targetPitch.frequency);
    const semitonesDiff = 12 * Math.log2(userPitch.frequency / targetPitch.frequency);
    
    // Calculate accuracy (0-100)
    let accuracy = 100;
    if (pitchDifference > 0) {
      const maxDifference = targetPitch.frequency * 0.1; // 10% tolerance
      accuracy = Math.max(0, 100 - (pitchDifference / maxDifference) * 100);
    }

    // Generate suggestions based on performance
    const suggestions = this.generateRealTimeSuggestions(userPitch, targetPitch, accuracy);

    return {
      currentPitch: userPitch,
      targetPitch: targetPitch,
      accuracy: Math.round(accuracy),
      trend: 'stable', // Would be calculated from history in real implementation
      suggestions,
    };
  }

  private generateRealTimeSuggestions(
    userPitch: PitchData,
    targetPitch: PitchData,
    accuracy: number
  ): string[] {
    const suggestions: string[] = [];
    
    if (accuracy < 70) {
      if (userPitch.frequency > targetPitch.frequency) {
        suggestions.push('🎵 Sing a bit lower');
      } else {
        suggestions.push('🎵 Sing a bit higher');
      }
    }
    
    if (userPitch.confidence < 0.6) {
      suggestions.push('🎤 Sing with more confidence');
    }
    
    if (accuracy > 90) {
      suggestions.push('🔥 Perfect pitch! Keep it up!');
    }
    
    return suggestions;
  }

  // Complete performance scoring
  async scorePerformance(
    pitchData: PitchData[],
    targetMelody: PitchData[],
    duration: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<PerformanceScore> {
    try {
      const response = await fetch(this.scoringModelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userPitchData: pitchData,
          targetMelody,
          duration,
          difficulty,
          analysisType: 'comprehensive',
        }),
      });

      if (!response.ok) {
        throw new Error('Performance scoring failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Performance scoring error:', error);
      // Fallback to basic scoring
      return this.basicPerformanceScoring(pitchData, targetMelody, difficulty);
    }
  }

  // Fallback basic scoring
  private basicPerformanceScoring(
    pitchData: PitchData[],
    targetMelody: PitchData[],
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): PerformanceScore {
    let totalAccuracy = 0;
    let validNotes = 0;

    // Calculate pitch accuracy
    for (let i = 0; i < Math.min(pitchData.length, targetMelody.length); i++) {
      const user = pitchData[i];
      const target = targetMelody[i];
      
      if (user.confidence > 0.5 && target.frequency > 0) {
        const semitonesDiff = Math.abs(12 * Math.log2(user.frequency / target.frequency));
        const accuracy = Math.max(0, 100 - semitonesDiff * 20);
        totalAccuracy += accuracy;
        validNotes++;
      }
    }

    const pitchScore = validNotes > 0 ? totalAccuracy / validNotes : 0;
    
    // Apply difficulty multiplier
    const difficultyMultiplier = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.2,
      expert: 1.5,
    }[difficulty];

    const overallScore = Math.min(100, pitchScore * difficultyMultiplier);

    return {
      overallScore: Math.round(overallScore),
      pitchScore: Math.round(pitchScore),
      rhythmScore: Math.round(pitchScore * 0.9), // Simplified
      expressionScore: Math.round(pitchScore * 0.8), // Simplified
      bonusPoints: 0,
      breakdown: {
        pitchAccuracy: pitchScore,
        rhythmAccuracy: pitchScore * 0.9,
        toneQuality: pitchScore * 0.85,
        vibrato: 50,
        breathControl: 70,
        dynamics: 60,
      },
      streakMultiplier: 1.0,
    };
  }

  // Duet performance analysis
  async analyzeDuetPerformance(
    singer1Data: PitchData[],
    singer2Data: PitchData[],
    targetHarmony: PitchData[]
  ): Promise<DuetAnalysis> {
    try {
      const response = await fetch(this.duetAnalysisEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          singer1Data,
          singer2Data,
          targetHarmony,
          analysisType: 'harmony_sync_balance',
        }),
      });

      if (!response.ok) {
        throw new Error('Duet analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Duet analysis error:', error);
      // Fallback to basic duet analysis
      return this.basicDuetAnalysis(singer1Data, singer2Data);
    }
  }

  private basicDuetAnalysis(singer1Data: PitchData[], singer2Data: PitchData[]): DuetAnalysis {
    // Calculate harmony (how well the notes complement each other)
    let harmonyScore = 0;
    let syncScore = 0;
    let validPairs = 0;

    for (let i = 0; i < Math.min(singer1Data.length, singer2Data.length); i++) {
      const s1 = singer1Data[i];
      const s2 = singer2Data[i];

      if (s1.confidence > 0.5 && s2.confidence > 0.5) {
        // Check for harmonious intervals (perfect 5th, major 3rd, etc.)
        const ratio = s1.frequency / s2.frequency;
        const semitones = Math.abs(12 * Math.log2(ratio));
        
        // Perfect intervals get higher scores
        const harmoniousIntervals = [0, 3, 4, 5, 7, 8, 9, 12]; // Unison, minor 3rd, major 3rd, perfect 4th, perfect 5th, etc.
        const closestInterval = harmoniousIntervals.reduce((prev, curr) => 
          Math.abs(curr - (semitones % 12)) < Math.abs(prev - (semitones % 12)) ? curr : prev
        );
        
        const intervalAccuracy = 100 - Math.abs(closestInterval - (semitones % 12)) * 20;
        harmonyScore += intervalAccuracy;

        // Synchronization (timing alignment)
        const timeDiff = Math.abs(s1.timestamp - s2.timestamp);
        syncScore += Math.max(0, 100 - timeDiff / 10);
        
        validPairs++;
      }
    }

    const avgHarmony = validPairs > 0 ? harmonyScore / validPairs : 0;
    const avgSync = validPairs > 0 ? syncScore / validPairs : 0;
    const balance = 80; // Simplified balance calculation
    const interaction = 75; // Simplified interaction score

    return {
      harmony: Math.round(avgHarmony),
      synchronization: Math.round(avgSync),
      balance: balance,
      interaction: interaction,
      combinedScore: Math.round((avgHarmony + avgSync + balance + interaction) / 4),
    };
  }

  // Battle mode real-time scoring
  async scoreBattleRealTime(
    player1Pitch: PitchData,
    player2Pitch: PitchData,
    targetPitch: PitchData,
    crowdVotes: { player1: number; player2: number }
  ): Promise<{ player1Accuracy: number; player2Accuracy: number; leader: 'player1' | 'player2' | 'tie' }> {
    const p1Accuracy = this.calculateAccuracy(player1Pitch, targetPitch);
    const p2Accuracy = this.calculateAccuracy(player2Pitch, targetPitch);
    
    // Factor in crowd votes (weighted at 20%)
    const p1Score = p1Accuracy * 0.8 + (crowdVotes.player1 / (crowdVotes.player1 + crowdVotes.player2)) * 100 * 0.2;
    const p2Score = p2Accuracy * 0.8 + (crowdVotes.player2 / (crowdVotes.player1 + crowdVotes.player2)) * 100 * 0.2;
    
    let leader: 'player1' | 'player2' | 'tie';
    if (Math.abs(p1Score - p2Score) < 5) {
      leader = 'tie';
    } else {
      leader = p1Score > p2Score ? 'player1' : 'player2';
    }

    return {
      player1Accuracy: Math.round(p1Accuracy),
      player2Accuracy: Math.round(p2Accuracy),
      leader,
    };
  }

  private calculateAccuracy(userPitch: PitchData, targetPitch: PitchData): number {
    if (userPitch.confidence < 0.5 || targetPitch.frequency <= 0) return 0;
    
    const pitchDifference = Math.abs(userPitch.frequency - targetPitch.frequency);
    const maxDifference = targetPitch.frequency * 0.1; // 10% tolerance
    return Math.max(0, 100 - (pitchDifference / maxDifference) * 100);
  }

  // AI-powered feedback generation
  async generatePerformanceFeedback(score: PerformanceScore): Promise<string[]> {
    const feedback: string[] = [];
    
    if (score.overallScore >= 90) {
      feedback.push('🌟 Outstanding performance! You nailed it!');
      feedback.push('🎯 Your pitch accuracy is incredible!');
    } else if (score.overallScore >= 75) {
      feedback.push('🎵 Great job! You\'re a natural performer!');
      feedback.push('💪 Keep practicing to reach the next level!');
    } else if (score.overallScore >= 60) {
      feedback.push('🎤 Good effort! You\'re making progress!');
      feedback.push('📈 Focus on pitch accuracy for better scores.');
    } else {
      feedback.push('🌱 Everyone starts somewhere! Keep practicing!');
      feedback.push('🎯 Try the genre swap feature to find your style!');
    }

    // Specific suggestions based on breakdown
    if (score.breakdown.pitchAccuracy < 60) {
      feedback.push('🎼 Try using the AI vocal training mode to improve pitch.');
    }
    
    if (score.breakdown.rhythmAccuracy < 60) {
      feedback.push('🥁 Practice with the metronome feature to improve timing.');
    }

    return feedback;
  }

  // Calculate KARA token rewards based on performance
  calculateTokenReward(
    score: PerformanceScore,
    difficulty: string,
    challengeMultiplier: number = 1,
    streakBonus: number = 0
  ): number {
    const baseReward = {
      easy: 10,
      medium: 15,
      hard: 25,
      expert: 40,
    }[difficulty] || 10;

    const scoreMultiplier = score.overallScore / 100;
    const difficultyBonus = score.overallScore > 85 ? 1.5 : 1.0;
    
    const totalReward = Math.round(
      baseReward * scoreMultiplier * difficultyBonus * challengeMultiplier + streakBonus
    );

    return Math.max(1, totalReward); // Minimum 1 KARA token
  }
}

export const aiScoringService = new AIScoringService();
export type {
  PitchData,
  VocalMetrics,
  PerformanceScore,
  RealTimeAnalysis,
  DuetAnalysis,
  BattleMetrics,
};