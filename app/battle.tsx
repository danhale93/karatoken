// Powered by OnSpace.AI
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function BattleScreen() {
  useEffect(() => {
    // Redirect to the battle tab
    router.replace('/(tabs)/battle');
  }, []);

  return null;
}