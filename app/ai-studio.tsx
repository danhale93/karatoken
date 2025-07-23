import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AIStudioScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Studio</Text>
      <Text style={styles.text}>Choose an AI feature:</Text>
      <Button title="Genre Swapper" onPress={() => router.push('/genre-swapper')} />
      <Button title="AI Scoring Coach" onPress={() => router.push('/ai-scoring-coach')} />
      <Button title="AI Voice Enhancer" onPress={() => router.push('/ai-voice-enhancer')} />
      <Button title="AI Video Avatar" onPress={() => router.push('/ai-video-avatar')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  text: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
});
