import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import RewardRoyaltyActions from '../../components/RewardRoyaltyActions';
import LivePitchScoringScreen from './live-pitch-scoring';

export default function BattleScreen() {
  const [step, setStep] = useState(0); // 0: intro, 1: user 1, 2: user 2, 3: results
  const [user1Score, setUser1Score] = useState<number | null>(null);
  const [user2Score, setUser2Score] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Real-time: In a real app, use WebSocket or Firebase for live updates
  useEffect(() => {
    // TODO: subscribe to real-time battle session updates here
    return () => {
      // TODO: cleanup subscription
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battle Mode</Text>
      {step === 0 && (
        <>
          <Text style={styles.text}>Compete head-to-head! Each user records, then compare scores and claim rewards.</Text>
          <Button title="Start Battle" onPress={() => setStep(1)} />
        </>
      )}
      {step === 1 && (
        <>
          <Text style={styles.text}>User 1: Record your performance</Text>
          <LivePitchScoringScreen onScore={setUser1Score} />
          <Button title="Next: User 2" onPress={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.text}>User 2: Record your performance</Text>
          <LivePitchScoringScreen onScore={setUser2Score} />
          <Button title="Show Results" onPress={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.text}>
            {user1Score !== null && user2Score !== null
              ? user1Score > user2Score
                ? 'User 1 Wins!'
                : user2Score > user1Score
                ? 'User 2 Wins!'
                : 'It\'s a tie!'
              : 'Waiting for scores...'}
          </Text>
          <Button title="Claim Reward" onPress={() => setModalVisible(true)} />
        </>
      )}
      <RewardRoyaltyActions visible={modalVisible} onClose={() => setModalVisible(false)} score={Math.max(user1Score ?? 0, user2Score ?? 0)} />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
});
