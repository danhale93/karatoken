
import { BASE_URL } from '../app/config';
// @ts-ignore
import * as Notifications from 'expo-notifications';
// @ts-ignore
import * as Sharing from 'expo-sharing';
import * as React from 'react';
import { ActivityIndicator, Alert, Animated, Button, Clipboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RoyaltiesScreen from '../app/(tabs)/royalties';
import { getCurrentUserId } from '../hooks/useUserId';
import { supabase } from '../lib/supabase';



type RewardRoyaltyActionsProps = {
  visible: boolean;
  onClose: () => void;
  score?: number;
  streak?: number;
  battleId?: string;
  userId?: string;
};

export default function RewardRoyaltyActions(props: RewardRoyaltyActionsProps) {
  const { visible, onClose, score, streak, battleId, userId } = props;
  const [showRoyalties, setShowRoyalties] = React.useState(false);
  const [claimStatus, setClaimStatus] = React.useState('');
  const [claimResult, setClaimResult] = React.useState<any>(null);
  const [wallet, setWallet] = React.useState<any>(null);
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [battleStatus, setBattleStatus] = React.useState<any>(null);
  const rewardAnim = React.useRef(new Animated.Value(0)).current;
  // Battle chat state
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  // Rematch state
  const [rematchRequested, setRematchRequested] = React.useState(false);
  // Moderation state
  const [reported, setReported] = React.useState(false);
  const [blockedUsers, setBlockedUsers] = React.useState<string[]>([]);
  // AI Coach Tips
  const [coachTip, setCoachTip] = React.useState<string | null>(null);
  // NFT/Reward Showcase
  const [showcaseVisible, setShowcaseVisible] = React.useState(false);
  // Analytics
  const [battleStats, setBattleStats] = React.useState<any>(null);
  // Custom Rules
  const [customRules, setCustomRules] = React.useState<string>('');

  // Profanity filter (simple demo)
  const profanityList = ['badword1', 'badword2'];
  function filterProfanity(text: string) {
    let clean = text;
    profanityList.forEach(word => {
      const re = new RegExp(word, 'gi');
      clean = clean.replace(re, '****');
    });
    return clean;
  }

  // Send chat message with profanity filter and notification
  const sendChat = async () => {
    if (!battleId || !userId || !chatInput.trim()) return;
    const cleanMsg = filterProfanity(chatInput);
    
    try {
      const { error } = await supabase
        .from('battle_messages')
        .insert({
          battle_id: battleId,
          user_id: userId,
          message: cleanMsg,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setChatInput('');
      
      // Push notification to other users (demo)
      try {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'New Battle Chat', body: `${userId}: ${cleanMsg}` },
          trigger: null,
        });
      } catch {}
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  // Report/block user (demo)
  const reportUser = (uid: string) => {
    setReported(true);
    // In production, send to backend/moderator
    Alert.alert('User reported.');
  };
  const blockUser = (uid: string) => {
    setBlockedUsers([...blockedUsers, uid]);
    Alert.alert('User blocked.');
  };

  // AI Coach Tips (demo)
  React.useEffect(() => {
    if (battleStatus && battleStatus.scores && userId && battleStatus.scores[userId] !== undefined) {
      // Simple tip logic
      const score = battleStatus.scores[userId];
      if (score > 90) setCoachTip('Amazing! You hit almost every note.');
      else if (score > 70) setCoachTip('Great job! Try to keep your pitch steady.');
      else setCoachTip('Keep practicing! Focus on matching the melody.');
    }
  }, [battleStatus, userId]);

  // Social sharing
  const shareResults = async () => {
    if (!(await Sharing.isAvailableAsync())) return;
    let score = '';
    if (battleStatus && battleStatus.scores && userId && Object.prototype.hasOwnProperty.call(battleStatus.scores, userId)) {
      score = String(battleStatus.scores[userId]);
    }
    const msg = `I just scored ${score} in a Karatoken battle!`;
    await Sharing.shareAsync('', { dialogTitle: 'Share your result', mimeType: 'text/plain', UTI: 'public.text' });
  };

  // NFT/Reward Showcase (demo)
  const openShowcase = () => setShowcaseVisible(true);
  const closeShowcase = () => setShowcaseVisible(false);

  // Analytics (demo)
  React.useEffect(() => {
    if (battleId && userId) {
      // Fetch stats from backend or Firestore
      // setBattleStats({ wins: 5, losses: 2, streak: 3 });
    }
  }, [battleId, userId]);

  // Custom rules (demo)
  const setRules = (rules: string) => setCustomRules(rules);

  // Subscribe to chat messages if in battle mode
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (battleId && visible) {
      // Using Supabase real-time subscriptions for battle chat
      const subscription = supabase
        .channel(`battle-chat-${battleId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'battle_messages',
          filter: `battle_id=eq.${battleId}`
        }, (payload) => {
          // Handle real-time chat updates
          console.log('Chat message update:', payload);
        })
        .subscribe();

      unsubscribe = () => subscription.unsubscribe();
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [battleId, visible]);

  // Listen for rematch request
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (battleId && visible) {
      // Using Supabase real-time subscriptions for battle updates
      const subscription = supabase
        .channel(`battle-${battleId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`
        }, (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'rematch_requested' in payload.new) {
            setRematchRequested(!!payload.new.rematch_requested);
          }
        })
        .subscribe();

      unsubscribe = () => subscription.unsubscribe();
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [battleId, visible]);

  // Request rematch
  const requestRematch = async () => {
    if (!battleId) return;
    try {
      const { error } = await supabase
        .from('battles')
        .update({ rematch_requested: true })
        .eq('id', battleId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error requesting rematch:', error);
    }
  };

  const fetchWallet = async (userId: string) => {
    try {
      const walletRes = await fetch(`${BASE_URL}/api/wallet?userId=${userId}`);
      if (walletRes.ok) setWallet(await walletRes.json());
    } catch {}
  };

  const fetchLeaderboard = async () => {
    try {
      const lbRes = await fetch(`${BASE_URL}/api/leaderboard`);
      if (lbRes.ok) {
        const lb = await lbRes.json();
        setLeaderboard(lb.leaderboard || []);
      }
    } catch {}
  };

  const refreshAll = async () => {
    setRefreshing(true);
    const userId = getCurrentUserId();
    if (userId) await fetchWallet(userId);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  // Fetch battle status if in battle mode and subscribe to real-time updates
  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    if (visible && !showRoyalties) {
      refreshAll();
      if (battleId) {
        // Subscribe to Supabase real-time updates for this battle
        const subscription = supabase
          .channel(`battle-status-${battleId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'battles',
            filter: `id=eq.${battleId}`
          }, (payload) => {
            if (payload.new) {
              setBattleStatus(payload.new);
            }
          })
          .subscribe();

        unsub = () => subscription.unsubscribe();
      }
    }
    return () => {
      if (unsub) unsub();
    };
    // eslint-disable-next-line
  }, [visible, showRoyalties, battleId]);

  const fetchBattleStatus = async () => {
    if (!battleId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/battle/status/${battleId}`);
      if (res.ok) setBattleStatus(await res.json());
    } catch {}
  };

  const claimReward = async () => {
    setClaimStatus('Claiming...');
    setClaimResult(null);
    setLoading(true);
    try {
      let userId = getCurrentUserId();
      // userId is always string or undefined, skip .id check
      if (!userId && !props.userId) {
        setClaimStatus('You must be logged in to claim rewards.');
        setLoading(false);
        return;
      }
      userId = props.userId || userId;
      // If in battle mode, submit score to battle API first
      let battleResult = null;
      if (battleId && userId && typeof score === 'number') {
        const res = await fetch(`${BASE_URL}/api/battle/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ battleId, userId, score }),
        });
        battleResult = await res.json();
        if (!res.ok) {
          setClaimStatus(battleResult.error || 'Battle submit failed');
          setLoading(false);
          return;
        }
        setBattleStatus(battleResult);
      }
      // Then claim reward as usual
      const res = await fetch(`${BASE_URL}/api/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          score: typeof score === 'number' ? score : 100,
          streak: typeof streak === 'number' ? streak : 1,
          context: { battleId, battleStatus: battleResult },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimResult(data);
        setClaimStatus('Reward claimed!');
        Animated.sequence([
          Animated.timing(rewardAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(rewardAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start();
        await refreshAll();
      } else {
        setClaimStatus(data.error || 'Claim failed');
      }
    } catch (e) {
      setClaimStatus('Network error');
    }
    setLoading(false);
  };

  // Use userId from props or fallback to getCurrentUserId
  const resolvedUserId = props.userId || getCurrentUserId();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {!showRoyalties ? (
          <View style={styles.sheet}>
            <Text style={styles.title}>Rewards & Royalties</Text>
            <Button title={loading ? 'Claiming...' : 'Claim Reward'} onPress={claimReward} disabled={loading} />
            {/* Battle Chat UI with moderation */}
            {battleId && (
              <View style={{ width: '100%', marginVertical: 8, backgroundColor: '#18181b', borderRadius: 8, padding: 8 }}>
                <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>Battle Chat</Text>
                <View style={{ maxHeight: 80 }}>
                  {chatMessages.filter(msg => !blockedUsers.includes(msg.userId)).map(msg => (
                    <View key={msg.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: msg.userId === userId ? '#10B981' : '#fff', fontSize: 13 }}>{msg.userId}: {msg.message}</Text>
                      {msg.userId !== userId && (
                        <>
                          <TouchableOpacity onPress={() => reportUser(msg.userId)} style={{ marginLeft: 8 }}>
                            <Text style={{ color: '#F87171', fontSize: 12 }}>Report</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => blockUser(msg.userId)} style={{ marginLeft: 4 }}>
                            <Text style={{ color: '#FBBF24', fontSize: 12 }}>Block</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <TextInput value={chatInput} onChangeText={setChatInput} placeholder="Type..." style={{ flex: 1, color: '#fff', backgroundColor: '#232946', borderRadius: 4, padding: 4, fontSize: 13 }} />
                  <TouchableOpacity onPress={sendChat} style={{ marginLeft: 8, backgroundColor: '#10B981', borderRadius: 4, padding: 6 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Rematch Button & Social Sharing */}
            {battleId && (
              <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                <TouchableOpacity onPress={requestRematch} style={{ flex: 1, backgroundColor: rematchRequested ? '#FBBF24' : '#38BDF8', borderRadius: 4, padding: 8, marginRight: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{rematchRequested ? 'Rematch Requested' : 'Request Rematch'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={shareResults} style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 4, padding: 8, marginLeft: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Share</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Battle Stats & Analytics */}
            {battleId && battleStatus && battleStatus.scores && (
              <View style={{ marginVertical: 4 }}>
                <Text style={{ color: '#FBBF24', fontWeight: 'bold' }}>Battle Stats</Text>
                {Object.entries(battleStatus.scores).map(([uid, s]) => (
                  <Text key={uid} style={{ color: '#fff', fontSize: 13 }}>{uid}: {String(s)} pts</Text>
                ))}
                {battleStats && (
                  <Text style={{ color: '#38BDF8', fontSize: 12 }}>Wins: {battleStats.wins} | Losses: {battleStats.losses} | Streak: {battleStats.streak}</Text>
                )}
              </View>
            )}
            {/* AI Coach Tips */}
            {coachTip && (
              <Text style={{ color: '#A78BFA', fontStyle: 'italic', marginVertical: 4 }}>{coachTip}</Text>
            )}
            {/* NFT/Reward Showcase */}
            <TouchableOpacity onPress={openShowcase} style={{ marginVertical: 4, backgroundColor: '#FFD700', borderRadius: 4, padding: 8 }}>
              <Text style={{ color: '#232946', fontWeight: 'bold', textAlign: 'center' }}>Showcase Rewards/NFTs</Text>
            </TouchableOpacity>
            {/* Custom Rules */}
            <View style={{ marginVertical: 4 }}>
              <Text style={{ color: '#FBBF24', fontWeight: 'bold' }}>Custom Battle Rules</Text>
              <TextInput value={customRules} onChangeText={setRules} placeholder="Set rules (e.g. genre, wager, etc.)" style={{ color: '#fff', backgroundColor: '#232946', borderRadius: 4, padding: 4, fontSize: 13 }} />
            </View>
            {/* NFT/Reward Showcase Modal */}
            {showcaseVisible && (
              <Modal visible={showcaseVisible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 240 }}>
                    <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Your Rewards & NFTs</Text>
                    {/* List NFTs/rewards here (demo) */}
                    <Text style={{ color: '#232946', fontSize: 16 }}>NFT: Golden Mic</Text>
                    <Text style={{ color: '#232946', fontSize: 16 }}>Reward: 100 KARAT</Text>
                    <TouchableOpacity onPress={closeShowcase} style={{ marginTop: 16, backgroundColor: '#10B981', borderRadius: 4, padding: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
            {battleId && battleStatus && (
              <Text style={{ color: '#38BDF8', marginVertical: 4 }}>
                Battle Status: {battleStatus.status} | Scores: {battleStatus.scores ? Object.entries(battleStatus.scores).map(([k,v]) => `${k}: ${v}`).join(', ') : 'N/A'}
              </Text>
            )}
            {loading && <ActivityIndicator color="#10B981" style={{ marginVertical: 8 }} />}
            {claimStatus ? <Text style={{ color: claimStatus.includes('claimed') ? '#10B981' : '#FBBF24', marginVertical: 8 }}>{claimStatus}</Text> : null}
            {claimResult && (
              <Animated.View style={{ marginBottom: 8, transform: [{ scale: rewardAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }}>
                <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 22 }}>+{claimResult.reward} {claimResult.currency}</Text>
                <Text style={{ color: '#fff' }}>Tier: {claimResult.tier} ({claimResult.tierDescription})</Text>
                {claimResult.nftReward && <Text style={{ color: '#FFD700' }}>NFT: {claimResult.nftReward}</Text>}
                {claimResult.streakBonus ? <Text style={{ color: '#38BDF8' }}>Streak Bonus: {claimResult.streakBonus}</Text> : null}
                {claimResult.bonuses && Object.keys(claimResult.bonuses).length > 0 && (
                  <Text style={{ color: '#FBBF24' }}>Bonuses: {Object.entries(claimResult.bonuses).map(([k,v]) => `${k}: ${v}`).join(', ')}</Text>
                )}
              </Animated.View>
            )}
            {refreshing && <ActivityIndicator color="#38BDF8" style={{ marginBottom: 8 }} />}
            {wallet && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Wallet: {wallet.balance} {wallet.currency}</Text>
                {wallet.address && (
                  <TouchableOpacity onPress={() => { Clipboard.setString(wallet.address); Alert.alert('Copied', 'Wallet address copied to clipboard!'); }}>
                    <Text style={{ color: '#38BDF8', textDecorationLine: 'underline', fontSize: 12 }}>Copy Address</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {leaderboard.length > 0 && (
              <View style={{ marginBottom: 8, maxHeight: 120 }}>
                <Text style={{ color: '#FBBF24', fontWeight: 'bold' }}>Leaderboard</Text>
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <Text key={entry.id || i} style={{ color: '#fff' }}>{i + 1}. {entry.username || entry.name}: {entry.score} pts</Text>
                ))}
                <TouchableOpacity onPress={refreshAll} style={{ marginTop: 4 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 12 }}>Refresh Leaderboard</Text>
                </TouchableOpacity>
              </View>
            )}
            <Button title="Register Track" onPress={() => setShowRoyalties(true)} />
            <Button title="Calculate Royalty" onPress={() => setShowRoyalties(true)} />
            <Button title="Unlock Vault" onPress={() => setShowRoyalties(true)} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.sheet, { height: '90%' }]}> 
            <RoyaltiesScreen />
            <TouchableOpacity onPress={() => setShowRoyalties(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#232946',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeBtn: {
    marginTop: 16,
    padding: 8,
  },
  closeText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
