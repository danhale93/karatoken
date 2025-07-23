import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BASE_URL } from '../config';


export default function LeaderboardScreen() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${BASE_URL}/api/leaderboard`);
        const result = await response.json();
        if (response.ok && result.leaderboard) {
          setData(result.leaderboard);
        } else {
          setError('Failed to load leaderboard');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {loading ? <Text style={{ color: '#fff', marginBottom: 16 }}>Loading...</Text> : null}
      {error ? <Text style={{ color: 'red', marginBottom: 16 }}>{error}</Text> : null}
      <FlatList
        data={data}
        keyExtractor={item => item.performanceId || item.id || Math.random().toString()}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.name}>{item.username || item.name}</Text>
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rank: {
    fontSize: 16,
    color: '#F59E0B',
    width: 32,
    textAlign: 'center',
  },
  name: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  score: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
});
