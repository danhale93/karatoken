// Powered by OnSpace.AI
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function SongSelectionScreen() {
  useEffect(() => {
    // Redirect to the song selection tab
    router.replace('/(tabs)/song-selection');
  }, []);

  return null;
}