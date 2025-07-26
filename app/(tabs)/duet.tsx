import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import RewardRoyaltyActions from '../../components/RewardRoyaltyActions';
import LivePitchScoringScreen from './live-pitch-scoring';

export default function DuetScreen() {
  const [step, setStep] = useState(0); // 0: intro, 1: record part 1, 2: record part 2, 3: playback, 4: reward
  const [part1Score, setPart1Score] = useState<number | null>(null);
  const [part2Score, setPart2Score] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duet Mode</Text>
      {step === 0 && (
        <>
          <Text style={styles.text}>Sing a duet! Each user records their part, then playback and rewards.</Text>
          <Button title="Start Duet" onPress={() => setStep(1)} />
        </>
      )}
      {step === 1 && (
        <>
          <Text style={styles.text}>User 1: Record your part</Text>
          <LivePitchScoringScreen onScore={setPart1Score} />
          <Button title="Next: User 2" onPress={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.text}>User 2: Record your part</Text>
          <LivePitchScoringScreen onScore={setPart2Score} />
          <Button title="Playback & Reward" onPress={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.text}>Playback both parts (simulated)</Text>
          <Button title="Claim Reward" onPress={() => setModalVisible(true)} />
        </>
      )}
      <RewardRoyaltyActions visible={modalVisible} onClose={() => setModalVisible(false)} score={((part1Score ?? 0) + (part2Score ?? 0)) / 2} />
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
