
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RewardRoyaltyActions from '../../components/RewardRoyaltyActions';
import LivePitchScoringScreen from './live-pitch-scoring';

export default function GenreSwapScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Genre Swap</Text>
      <Text style={styles.text}>Transform your music with AI Genre Swap!</Text>
      <View style={{ marginTop: 24, width: '100%' }}>
        <LivePitchScoringScreen onScore={setLiveScore} />
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>$</Text>
      </TouchableOpacity>
      <RewardRoyaltyActions visible={modalVisible} onClose={() => setModalVisible(false)} score={liveScore ?? undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#10B981',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
