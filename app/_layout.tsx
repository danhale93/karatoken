import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { supabase } from '../lib/supabase';
import { BASE_URL } from './config';

// Insert the web-specific require here
if (Platform.OS === 'web') {
  // import('./youtubePlayer.css');
}

// Global YouTube context
export const YoutubeContext = createContext({
  youtubeUrl: '',
  setYoutubeUrl: (_: string) => {},
  embedUrl: '',
  setEmbedUrl: (_: string) => {},
});

// Auth Context
const AuthContext = createContext({ user: null, loading: true });

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  // processing: '' | 'genre' | 'isolate'
  const [processing, setProcessing] = useState('');
  // processResult: {} | { error?: string, audioUrl?: string }
  const [processResult, setProcessResult] = useState({});

  // Search YouTube for videos matching the query using YouTube Data API v3
  const YOUTUBE_API_KEY = 'AIzaSyCc1jDgd-6mBy6OYzdLFf01VAuHIML04lc';
  const handleSearch = async () => {
    const query = youtubeUrl.trim();
    if (!query) return;
    // If input is a YouTube URL, just load it directly
    let match = query.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (match && match[1]) {
      setEmbedUrl(`https://www.youtube.com/embed/${match[1]}?autoplay=1`);
      setShowPlayer(true);
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      if (data && data.items) {
        setSearchResults(data.items.map((item: any) => ({
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails?.default?.url,
        })));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  // When user selects a video from search results
  const handleSelectVideo = (video: any) => {
    // Extract video ID from URL
    let match = video.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (match && match[1]) {
      setEmbedUrl(`https://www.youtube.com/embed/${match[1]}?autoplay=1`);
      setShowPlayer(true);
      setYoutubeUrl(video.url); // Set the input to the selected video URL
      setSearchResults([]);
    }
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <YoutubeContext.Provider value={{ youtubeUrl, setYoutubeUrl, embedUrl, setEmbedUrl }}>
          <StatusBar style="light" backgroundColor="#6B46C1" />
          <View style={styles.youtubeBar}>
            <TextInput
              style={styles.input}
              placeholder="Search or paste YouTube URL (global)"
              placeholderTextColor="#888"
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleSearch}
            />
            <Button title="Search" onPress={handleSearch} disabled={!youtubeUrl || searching} />
          </View>
          {searching && (
            <View style={{ backgroundColor: '#232946', padding: 8 }}>
              <ActivityIndicator color="#10B981" />
              <Text style={{ color: '#fff', marginLeft: 8 }}>Searching...</Text>
            </View>
          )}
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.url}
              renderItem={({ item }) => (
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#232946', borderBottomWidth: 1, borderBottomColor: '#333' }} onPress={() => handleSelectVideo(item)}>
                  {item.thumbnail && <Image source={{ uri: item.thumbnail }} style={{ width: 40, height: 30, borderRadius: 4, marginRight: 8 }} />}
                  <Text style={{ color: '#fff', flex: 1 }}>{item.title}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 180, backgroundColor: '#232946' }}
            />
          )}
          {showPlayer && embedUrl ? (
            <View style={styles.playerContainer}>
              {Platform.OS === 'web' ? (
                <iframe
                  src={embedUrl}
                  className="youtube-iframe"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="YouTube Player"
                />
              ) : (
                <WebView
                  source={{ uri: embedUrl }}
                  style={{ flex: 1 }}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              )}
              <Button title="Hide Player" onPress={() => setShowPlayer(false)} />
              {/* Genre Swap and Vocal Isolation Actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                <Button title="Genre Swap" onPress={async () => {
                  setProcessing('genre');
                  setProcessResult({});
                  try {
                    const res = await fetch(`${BASE_URL}/api/ai/genre-swap`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ youtubeUrl }),
                    });
                    const data = await res.json();
                    setProcessResult(data);
                  } catch {
                    setProcessResult({ error: 'Genre swap failed.' });
                  }
                  setProcessing('');
                }} disabled={processing !== ''} />
                {/* Vocal Isolation button hidden as requested */}
              </View>
              {processing !== '' && (
                <View style={{ marginTop: 8 }}><ActivityIndicator color="#10B981" /><Text style={{ color: '#fff' }}>Processing...</Text></View>
              )}
              {Object.keys(processResult).length > 0 && (
                <View style={{ marginTop: 8, backgroundColor: '#232946', borderRadius: 8, padding: 8 }}>
                  {'error' in processResult ? (
                    <Text style={{ color: '#F87171' }}>{String(processResult.error)}</Text>
                  ) : 'audioUrl' in processResult ? (
                    <TouchableOpacity onPress={() => { window.open(String(processResult.audioUrl), '_blank'); }}>
                      <Text style={{ color: '#10B981' }}>Processed Audio: Tap to open</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: '#fff' }}>Processing complete.</Text>
                  )}
                </View>
              )}
            </View>
          ) : null}
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1F2937' },
              }}
            >
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGate>
        </YoutubeContext.Provider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// AuthGate component to protect routes
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator color="#10B981" size="large" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Checking authentication...</Text>
      </View>
    );
  }
  if (!user) {
    // Lazy load login screen
    const LoginScreen = React.lazy(() => import('./login'));
    return (
      <React.Suspense fallback={<ActivityIndicator />}>
        <LoginScreen />
      </React.Suspense>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  youtubeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232946',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#232946',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  playerContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 8,
    zIndex: 9,
  },
});