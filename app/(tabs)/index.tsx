// Powered by OnSpace.AI
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock mobile versions of our engines
class MobileKaratokenCore {
  private sessions: Map<string, any> = new Map();

  async startSession(songTitle: string) {
    const session = {
      id: `session_${Date.now()}`,
      song: songTitle,
      score: 0,
      status: 'active'
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async simulateScoring(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.score = Math.floor(Math.random() * 30) + 70; // 70-100
      return session.score;
    }
    return 0;
  }
}

class MobileInstrumentEngine {
  instruments = ['guitar', 'drums', 'piano', 'bass', 'violin', 'flute'];

  async detectInstrument() {
    const detected = this.instruments[Math.floor(Math.random() * this.instruments.length)];
    const confidence = (85 + Math.random() * 15).toFixed(1);
    return { instrument: detected, confidence };
  }

  async scorePerformance(instrument: string) {
    return {
      accuracy: (70 + Math.random() * 30).toFixed(1),
      timing: (75 + Math.random() * 25).toFixed(1),
      technique: (65 + Math.random() * 35).toFixed(1),
      creativity: (80 + Math.random() * 20).toFixed(1)
    };
  }
}

class MobileTalentMarketplace {
  async registerTalent(name: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: `talent_${Date.now()}`,
      name,
      skills: ['Vocals', 'Guitar'],
      rating: 0,
      earnings: 0
    };
  }

  async aiAnalyzeAudition() {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      technical: (70 + Math.random() * 30).toFixed(1),
      creativity: (75 + Math.random() * 25).toFixed(1),
      fit: (80 + Math.random() * 20).toFixed(1)
    };
  }
}

export default function KaratokenMobileDemo() {
  const [currentDemo, setCurrentDemo] = useState<string>('welcome');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});

  const karatokenCore = new MobileKaratokenCore();
  const instrumentEngine = new MobileInstrumentEngine();
  const talentMarketplace = new MobileTalentMarketplace();

  const runKaraokeDemo = async () => {
    setCurrentDemo('karaoke');
    setLoading(true);
    
    try {
      const session = await karatokenCore.startSession('Bohemian Rhapsody');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const score = await karatokenCore.simulateScoring(session.id);
      
      setResults({
        sessionId: session.id,
        song: session.song,
        score
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start karaoke session');
    } finally {
      setLoading(false);
    }
  };

  const runInstrumentDemo = async () => {
    setCurrentDemo('instrument');
    setLoading(true);
    
    try {
      const detection = await instrumentEngine.detectInstrument();
      const scores = await instrumentEngine.scorePerformance(detection.instrument);
      
      setResults({
        detected: detection,
        scores
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to detect instrument');
    } finally {
      setLoading(false);
    }
  };

  const runTalentDemo = async () => {
    setCurrentDemo('talent');
    setLoading(true);
    
    try {
      const talent = await talentMarketplace.registerTalent('Alex Rivera');
      const analysis = await talentMarketplace.aiAnalyzeAudition();
      
      setResults({
        talent,
        analysis
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to register talent');
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <View style={styles.section}>
      <Text style={styles.title}>🎵 Karatoken</Text>
      <Text style={styles.subtitle}>Ultimate Music Universe</Text>
      <Text style={styles.description}>
        The complete music industry revolution in your pocket!
      </Text>
      
      <View style={styles.featureList}>
        <Text style={styles.feature}>🎤 AI-powered karaoke</Text>
        <Text style={styles.feature}>🎸 Multi-instrument support</Text>
        <Text style={styles.feature}>🎭 Talent marketplace</Text>
        <Text style={styles.feature}>🇪🇺 Eurovision integration</Text>
        <Text style={styles.feature}>🤖 Agentic AI features</Text>
        <Text style={styles.feature}>🌍 Cultural genre swapping</Text>
      </View>
    </View>
  );

  const renderKaraokeResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎤 Karaoke Session</Text>
      {loading ? (
        <Text style={styles.loading}>🎵 Starting karaoke session...</Text>
      ) : (
        <View>
          <Text style={styles.result}>Song: {results.song}</Text>
          <Text style={styles.result}>Session ID: {results.sessionId}</Text>
          <Text style={[styles.result, styles.score]}>
            🏆 Score: {results.score}/100
          </Text>
          {results.score >= 90 && (
            <Text style={styles.achievement}>🌟 Excellent Performance!</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderInstrumentResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎸 Instrument Detection</Text>
      {loading ? (
        <Text style={styles.loading}>🎵 Detecting instrument...</Text>
      ) : (
        <View>
          <Text style={styles.result}>
            Detected: {results.detected?.instrument} 
            ({results.detected?.confidence}% confidence)
          </Text>
          <Text style={styles.subTitle}>Performance Scores:</Text>
          <Text style={styles.score}>📈 Accuracy: {results.scores?.accuracy}%</Text>
          <Text style={styles.score}>⏱️ Timing: {results.scores?.timing}%</Text>
          <Text style={styles.score}>🎯 Technique: {results.scores?.technique}%</Text>
          <Text style={styles.score}>✨ Creativity: {results.scores?.creativity}%</Text>
        </View>
      )}
    </View>
  );

  const renderTalentResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎭 Talent Marketplace</Text>
      {loading ? (
        <Text style={styles.loading}>🎭 Processing talent registration...</Text>
      ) : (
        <View>
          <Text style={styles.result}>Talent: {results.talent?.name}</Text>
          <Text style={styles.result}>Skills: {results.talent?.skills?.join(', ')}</Text>
          <Text style={styles.subTitle}>AI Audition Analysis:</Text>
          <Text style={styles.score}>🎯 Technical: {results.analysis?.technical}/100</Text>
          <Text style={styles.score}>✨ Creativity: {results.analysis?.creativity}/100</Text>
          <Text style={styles.score}>💫 Job Fit: {results.analysis?.fit}/100</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentDemo === 'welcome' && renderWelcome()}
        {currentDemo === 'karaoke' && renderKaraokeResults()}
        {currentDemo === 'instrument' && renderInstrumentResults()}
        {currentDemo === 'talent' && renderTalentResults()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.karaokeButton]} 
            onPress={runKaraokeDemo}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🎤 Test Karaoke</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.instrumentButton]} 
            onPress={runInstrumentDemo}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🎸 Test Instruments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.talentButton]} 
            onPress={runTalentDemo}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🎭 Test Marketplace</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={() => setCurrentDemo('welcome')}
          >
            <Text style={styles.buttonText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🚀 Karatoken - Revolutionizing Music</Text>
          <Text style={styles.footerSubtext}>
            From karaoke to talent discovery, all in one app!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  featureList: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  result: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  score: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
    textAlign: 'center',
  },
  achievement: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  loading: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  karaokeButton: {
    backgroundColor: '#FF6B35',
  },
  instrumentButton: {
    backgroundColor: '#4ECDC4',
  },
  talentButton: {
    backgroundColor: '#45B7D1',
  },
  resetButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});