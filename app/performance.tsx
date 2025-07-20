// Powered by OnSpace.AI
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function PerformanceScreen() {
  useEffect(() => {
    // Redirect to the results screen
    router.replace('/results');
  }, []);

  return null;
}