/**
 * 🎤 KARATOKEN MASTER NAVIGATOR
 * Implements the complete 100+ feature ecosystem navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import all screen components (to be created)
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Core Navigation Screens
import HomeScreen from '../(tabs)/index';
import DashboardScreen from '../screens/core/DashboardScreen';

// 🤖 AI Studio Screens (25+ features)
import AIStudioScreen from '../(tabs)/studio';
import GenreSwapperScreen from '../(tabs)/genre-swap';
import AIScoringCoachScreen from '../screens/ai/AIScoringCoachScreen';
import AIVoiceEnhancerScreen from '../screens/ai/AIVoiceEnhancerScreen';
import AIVideoAvatarScreen from '../screens/ai/AIVideoAvatarScreen';

// ⚔️ Battle Arena Screens (20+ features)
import BattleArenaScreen from '../(tabs)/battle';
import SoloBattleScreen from '../screens/battle/SoloBattleScreen';
import LiveDuetScreen from '../screens/battle/LiveDuetScreen';
import BattleRoyaleScreen from '../screens/battle/BattleRoyaleScreen';
import LiveBattleScreen from '../battle/live-battle';

// 🎵 Song Library Screens (15+ features)
import SongLibraryScreen from '../screens/song/SongLibraryScreen';
import SongCategoriesScreen from '../screens/song/SongCategoriesScreen';
import SongSearchScreen from '../screens/song/SongSearchScreen';
import SongPreviewScreen from '../screens/song/SongPreviewScreen';
import RecordTrackScreen from '../karaoke/[songId]';

// 🏆 Leaderboards Screens (15+ features)
import LeaderboardsScreen from '../(tabs)/leaderboard';
import GlobalLeaderboardScreen from '../screens/leaderboard/GlobalLeaderboardScreen';
import GenreLeaderboardScreen from '../screens/leaderboard/GenreLeaderboardScreen';
import FriendsLeaderboardScreen from '../screens/leaderboard/FriendsLeaderboardScreen';

// 💰 Rewards Screens (20+ features)
import RewardsScreen from '../(tabs)/challenges';
import DailyChallengesScreen from '../screens/rewards/DailyChallengesScreen';
import StreakBonusScreen from '../screens/rewards/StreakBonusScreen';
import CryptoPayoutsScreen from '../screens/rewards/CryptoPayoutsScreen';
import PayPalPayoutsScreen from '../screens/rewards/PayPalPayoutsScreen';

// 💎 Crypto Wallet Screens (20+ features)
import WalletScreen from '../(tabs)/wallet';
import KYCVerificationScreen from '../screens/wallet/KYCVerificationScreen';
import WalletBalanceScreen from '../screens/wallet/WalletBalanceScreen';
import WalletWithdrawScreen from '../screens/wallet/WalletWithdrawScreen';
import WalletHistoryScreen from '../screens/wallet/WalletHistoryScreen';

// 📊 Performance Screens
import AIReviewScreen from '../screens/performance/AIReviewScreen';
import ScoreSummaryScreen from '../results/[performanceId]';
import SharePerformanceScreen from '../screens/performance/SharePerformanceScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

/**
 * 🔥 Authentication Stack Navigator
 * Handles onboarding, login, registration flow
 */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </Stack.Navigator>
);

/**
 * 🤖 AI Studio Stack Navigator
 * All AI-powered features in one hub
 */
const AIStudioStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AIStudioMain" 
      component={AIStudioScreen}
      options={{ title: '🤖 AI Studio' }}
    />
    <Stack.Screen 
      name="GenreSwapper" 
      component={GenreSwapperScreen}
      options={{ title: '🌊 Genre Swapper' }}
    />
    <Stack.Screen 
      name="AIScoringCoach" 
      component={AIScoringCoachScreen}
      options={{ title: '🎯 AI Scoring Coach' }}
    />
    <Stack.Screen 
      name="AIVoiceEnhancer" 
      component={AIVoiceEnhancerScreen}
      options={{ title: '🎤 Voice Enhancer' }}
    />
    <Stack.Screen 
      name="AIVideoAvatar" 
      component={AIVideoAvatarScreen}
      options={{ title: '🎬 Video Avatar' }}
    />
  </Stack.Navigator>
);

/**
 * ⚔️ Battle Arena Stack Navigator
 * All competition features
 */
const BattleArenaStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BattleArenaMain" 
      component={BattleArenaScreen}
      options={{ title: '⚔️ Battle Arena' }}
    />
    <Stack.Screen 
      name="SoloBattle" 
      component={SoloBattleScreen}
      options={{ title: '🥊 Solo Battle' }}
    />
    <Stack.Screen 
      name="LiveDuet" 
      component={LiveDuetScreen}
      options={{ title: '🎭 Live Duet' }}
    />
    <Stack.Screen 
      name="BattleRoyale" 
      component={BattleRoyaleScreen}
      options={{ title: '👑 Battle Royale' }}
    />
    <Stack.Screen 
      name="LiveBattle" 
      component={LiveBattleScreen}
      options={{ title: '🔥 Live Battle' }}
    />
  </Stack.Navigator>
);

/**
 * 🎵 Song Library Stack Navigator
 * All content and music features
 */
const SongLibraryStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SongLibraryMain" 
      component={SongLibraryScreen}
      options={{ title: '🎵 Song Library' }}
    />
    <Stack.Screen 
      name="SongCategories" 
      component={SongCategoriesScreen}
      options={{ title: '📂 Categories' }}
    />
    <Stack.Screen 
      name="SongSearch" 
      component={SongSearchScreen}
      options={{ title: '🔍 Search Songs' }}
    />
    <Stack.Screen 
      name="SongPreview" 
      component={SongPreviewScreen}
      options={{ title: '▶️ Preview' }}
    />
    <Stack.Screen 
      name="RecordTrack" 
      component={RecordTrackScreen}
      options={{ title: '🎙️ Record Performance' }}
    />
  </Stack.Navigator>
);

/**
 * 🏆 Leaderboards Stack Navigator
 * All social ranking features
 */
const LeaderboardsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="LeaderboardsMain" 
      component={LeaderboardsScreen}
      options={{ title: '🏆 Leaderboards' }}
    />
    <Stack.Screen 
      name="GlobalLeaderboard" 
      component={GlobalLeaderboardScreen}
      options={{ title: '🌍 Global Rankings' }}
    />
    <Stack.Screen 
      name="GenreLeaderboard" 
      component={GenreLeaderboardScreen}
      options={{ title: '🎶 Genre Rankings' }}
    />
    <Stack.Screen 
      name="FriendsLeaderboard" 
      component={FriendsLeaderboardScreen}
      options={{ title: '👥 Friends Rankings' }}
    />
  </Stack.Navigator>
);

/**
 * 💰 Rewards Stack Navigator
 * All incentive and earning features
 */
const RewardsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="RewardsMain" 
      component={RewardsScreen}
      options={{ title: '💰 Rewards' }}
    />
    <Stack.Screen 
      name="DailyChallenges" 
      component={DailyChallengesScreen}
      options={{ title: '📅 Daily Challenges' }}
    />
    <Stack.Screen 
      name="StreakBonus" 
      component={StreakBonusScreen}
      options={{ title: '🔥 Streak Bonus' }}
    />
    <Stack.Screen 
      name="CryptoPayouts" 
      component={CryptoPayoutsScreen}
      options={{ title: '💎 Crypto Payouts' }}
    />
    <Stack.Screen 
      name="PayPalPayouts" 
      component={PayPalPayoutsScreen}
      options={{ title: '💳 PayPal Payouts' }}
    />
  </Stack.Navigator>
);

/**
 * 💎 Wallet Stack Navigator
 * All cryptocurrency and economy features
 */
const WalletStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="WalletMain" 
      component={WalletScreen}
      options={{ title: '💎 Crypto Wallet' }}
    />
    <Stack.Screen 
      name="KYCVerification" 
      component={KYCVerificationScreen}
      options={{ title: '🔐 KYC Verification' }}
    />
    <Stack.Screen 
      name="WalletBalance" 
      component={WalletBalanceScreen}
      options={{ title: '💰 Balance' }}
    />
    <Stack.Screen 
      name="WalletWithdraw" 
      component={WalletWithdrawScreen}
      options={{ title: '💸 Withdraw' }}
    />
    <Stack.Screen 
      name="WalletHistory" 
      component={WalletHistoryScreen}
      options={{ title: '📊 Transaction History' }}
    />
  </Stack.Navigator>
);

/**
 * 🎯 Main Tab Navigator
 * Core navigation between major feature hubs
 */
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'AIStudio') {
          iconName = focused ? 'sparkles' : 'sparkles-outline';
        } else if (route.name === 'BattleArena') {
          iconName = focused ? 'trophy' : 'trophy-outline';
        } else if (route.name === 'SongLibrary') {
          iconName = focused ? 'musical-notes' : 'musical-notes-outline';
        } else if (route.name === 'Rewards') {
          iconName = focused ? 'gift' : 'gift-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else {
          iconName = 'ellipse-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#00d4ff',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#1a1a2e',
        borderTopColor: '#0f3460',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="AIStudio" component={AIStudioStack} />
    <Tab.Screen name="BattleArena" component={BattleArenaStack} />
    <Tab.Screen name="SongLibrary" component={SongLibraryStack} />
    <Tab.Screen name="Rewards" component={RewardsStack} />
    <Tab.Screen name="Wallet" component={WalletStack} />
  </Tab.Navigator>
);

/**
 * 📊 Performance Flow Stack Navigator
 * Post-recording review and sharing flow
 */
const PerformanceStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AIReview" 
      component={AIReviewScreen}
      options={{ title: '🤖 AI Performance Review' }}
    />
    <Stack.Screen 
      name="ScoreSummary" 
      component={ScoreSummaryScreen}
      options={{ title: '📊 Score Summary' }}
    />
    <Stack.Screen 
      name="SharePerformance" 
      component={SharePerformanceScreen}
      options={{ title: '📤 Share Performance' }}
    />
  </Stack.Navigator>
);

/**
 * 🌟 Master App Navigator
 * Orchestrates the entire Karatoken universe
 */
const KaratokenMasterNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainApp" component={MainTabs} />
            <Stack.Screen name="Performance" component={PerformanceStack} />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: '📊 Dashboard' }}
            />
            <Stack.Screen 
              name="Leaderboards" 
              component={LeaderboardsStack}
              options={{ title: '🏆 Leaderboards' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default KaratokenMasterNavigator;