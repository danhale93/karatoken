# Karatoken Development Guide

This guide provides comprehensive information for developers working on the Karatoken platform.

## 🏗 Project Architecture

### Directory Structure
```
karatoken-app/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home dashboard
│   │   ├── song-selection.tsx
│   │   ├── competitions.tsx
│   │   ├── trending.tsx
│   │   └── wallet.tsx
│   ├── (auth)/            # Authentication screens
│   ├── karaoke/           # Karaoke performance screens
│   ├── ai-studio.tsx      # AI Studio feature
│   └── rewards.tsx        # Rewards and bonuses
├── hooks/                  # Custom React hooks
│   ├── useAuthStore.ts    # Authentication state
│   ├── useKaraokeStore.ts # Karaoke session management
│   ├── useWalletStore.ts  # Crypto wallet state
│   └── ...
├── services/              # API and business logic
│   ├── karaokeService.ts  # Core karaoke functionality
│   ├── walletService.ts   # Crypto operations
│   ├── battleService.ts   # Competition logic
│   └── ...
├── constants/             # App constants and config
├── assets/                # Images, fonts, etc.
└── scripts/               # Build and utility scripts
```

## 🎯 Core Features Implementation

### 1. AI-Powered Karaoke Engine

**Location**: `services/karaokeService.ts`, `hooks/useKaraokeStore.ts`

**Key Components**:
- Real-time pitch detection using Web Audio API
- Performance scoring algorithm
- Session management and recording

**Implementation Notes**:
```typescript
// Example: Starting a karaoke session
const startRecording = async (songId: string, songTitle: string, artistName: string) => {
  const session = await karaokeService.createSession(songId, songTitle, artistName);
  // Initialize pitch detection and scoring
};
```

### 2. AI Studio

**Location**: `app/ai-studio.tsx`

**Features**:
- Song composition with AI assistance
- Real-time genre swapping
- Tempo and key modification
- AI training on vocal style

**Key Functions**:
```typescript
// Generate AI-assisted song
const generateSong = async () => {
  // AI processing for song generation
  const newSong = await aiService.composeSong({
    title: songTitle,
    lyrics: lyrics,
    genre: selectedGenre,
    tempo: tempo,
    key: key
  });
};

// Apply genre swap
const applyGenreSwap = async (newGenre: string) => {
  // AI genre transformation
  const transformedSong = await aiService.swapGenre(currentSong, newGenre);
};
```

### 3. Global Competitions

**Location**: `app/(tabs)/competitions.tsx`

**Features**:
- Daily, weekly, monthly tournaments
- Real-time voting system
- Prize pool management
- Participant tracking

**Competition Types**:
```typescript
interface Competition {
  type: 'daily' | 'weekly' | 'monthly';
  prizePool: number;
  participants: number;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  entryFee: number;
}
```

### 4. Trending & Viral Content

**Location**: `app/(tabs)/trending.tsx`

**Features**:
- AI-curated content selection
- Category filtering (top scores, funny, viral)
- Social sharing integration
- Engagement metrics tracking

**Content Categories**:
```typescript
type ClipType = 'top-score' | 'funny' | 'viral' | 'ai-generated';
```

### 5. Rewards System

**Location**: `app/rewards.tsx`, `hooks/useWalletStore.ts`

**Features**:
- Daily login bonuses
- Streak multipliers
- Scratch cards and spin-the-wheel
- Mystery vaults and boxes

**Reward Types**:
```typescript
type RewardType = 'daily' | 'streak' | 'scratch' | 'wheel' | 'vault' | 'mystery';
```

## 🔧 State Management

### Zustand Stores

**useAuthStore**: User authentication and profile
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

**useKaraokeStore**: Karaoke session management
```typescript
interface KaraokeState {
  currentSession: KaraokeSession | null;
  isRecording: boolean;
  realTimeScore: number;
  startRecording: (songId: string, songTitle: string, artistName: string) => Promise<void>;
  stopRecording: () => Promise<string>;
}
```

**useWalletStore**: Crypto wallet operations
```typescript
interface WalletState {
  balance: WalletBalance;
  transactions: Transaction[];
  addTokens: (amount: number) => void;
  purchaseTokens: (userId: string, amount: number) => Promise<void>;
}
```

## 🎨 UI/UX Guidelines

### Design System

**Colors**:
- Primary: `#667eea` (Purple gradient)
- Secondary: `#764ba2` (Dark purple)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Error: `#EF4444` (Red)

**Typography**:
- Headers: 24px, bold
- Subheaders: 18px, bold
- Body: 16px, regular
- Captions: 14px, regular

**Components**:
- Cards with rounded corners (16px)
- Consistent padding (20px horizontal, 16px vertical)
- Gradient backgrounds for main screens
- Glassmorphism effects for overlays

### Navigation

**Tab Structure**:
1. **Home** - Dashboard and featured content
2. **Songs** - Song selection and library
3. **Challenges** - Global competitions
4. **Trending** - Viral content
5. **Wallet** - Crypto wallet

## 🔌 API Integration

### Service Layer Pattern

All API calls are abstracted through service classes:

```typescript
// Example: Karaoke Service
class KaraokeService {
  async createSession(songId: string, songTitle: string, artistName: string): Promise<KaraokeSession>
  async submitPerformance(sessionId: string, videoUri: string, score: number): Promise<number>
  async getAIFeedback(performanceId: string): Promise<AIScore>
}
```

### Error Handling

Consistent error handling across all services:
```typescript
try {
  const result = await service.method();
  return result;
} catch (error) {
  // Log error for debugging
  console.error('Service error:', error);
  // Show user-friendly message
  Alert.alert('Error', 'Failed to complete operation');
  throw error;
}
```

## 🧪 Testing Strategy

### Unit Tests
- Service layer functions
- State management logic
- Utility functions

### Integration Tests
- API integration
- Navigation flows
- User authentication

### E2E Tests
- Complete user journeys
- Performance testing
- Cross-platform compatibility

## 🚀 Performance Optimization

### React Native Best Practices

1. **Memoization**: Use `React.memo` for expensive components
2. **Lazy Loading**: Implement for large lists and images
3. **FlatList**: Use for long scrolling lists
4. **Image Optimization**: Compress and cache images

### Audio/Video Optimization

1. **Streaming**: Implement progressive loading for audio/video
2. **Caching**: Cache frequently accessed media
3. **Compression**: Optimize file sizes for mobile

## 🔐 Security Considerations

### Data Protection
- Encrypt sensitive user data
- Secure API communications (HTTPS)
- Implement proper authentication flows

### Crypto Security
- Secure wallet key management
- Transaction signing security
- Anti-fraud measures

## 📱 Platform-Specific Considerations

### iOS
- App Store guidelines compliance
- In-app purchase integration
- Push notification setup

### Android
- Google Play Store requirements
- Background service limitations
- Permission handling

### Web
- Progressive Web App features
- Browser compatibility
- Responsive design

## 🔄 Deployment Pipeline

### Development
```bash
npm start          # Start development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run web version
```

### Building
```bash
npm run build:ios     # Build iOS app
npm run build:android # Build Android app
npm run build:web     # Build web version
```

### Publishing
```bash
npm run publish:ios     # Publish to App Store
npm run publish:android # Publish to Play Store
npm run deploy:web      # Deploy web version
```

## 🎯 Future Enhancements

### Planned Features
1. **Advanced AI Studio**: More sophisticated song generation
2. **NFT Marketplace**: Creator tokenization
3. **Social Features**: Enhanced community tools
4. **AR/VR Integration**: Immersive experiences
5. **Blockchain Gaming**: Play-to-earn mechanics

### Technical Improvements
1. **Microservices**: Scalable backend architecture
2. **Real-time Features**: WebSocket integration
3. **Offline Support**: Progressive web app features
4. **Analytics**: Advanced user behavior tracking

## 📚 Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Tools
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) for debugging

### Community
- [React Native Community](https://github.com/react-native-community)
- [Expo Community](https://forums.expo.dev/)

---

This development guide should be updated as the platform evolves. For questions or contributions, please contact the development team.