# Karatoken - AI-Powered Karaoke App

Karatoken is a revolutionary karaoke application that combines AI-powered scoring, live battles, and cryptocurrency rewards. Built with React Native and Expo, it delivers seamless cross-platform performance across iOS, Android, and Web environments.

## 🎯 Features

### ✅ Completed Features
- **Authentication System** - Email/password and social login
- **AI-Powered Scoring** - Real-time pitch, rhythm, and timing analysis
- **Live Battles** - Compete with other singers in real-time
- **Cryptocurrency Wallet** - Earn and spend KRT tokens
- **Song Library** - Extensive collection of songs with lyrics
- **Performance Tracking** - Detailed analytics and progress
- **Leaderboards** - Global and friend-based rankings
- **User Profiles** - Comprehensive user management
- **Recording System** - High-quality audio recording
- **Results & Analytics** - Detailed performance feedback

### 🚀 Core Functionality
- **Real-time Recording** with AI analysis
- **Live Battle System** with rewards
- **Cryptocurrency Integration** (KRT tokens)
- **Social Features** - Follow friends, share performances
- **Cross-platform** - iOS, Android, and Web support

## 🛠️ Tech Stack

- **Frontend**: React Native 0.79.3, Expo 53.0.10
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **UI Components**: React Native Paper, NativeWind
- **Audio**: Expo AV, Audio Recording
- **AI Integration**: Custom scoring algorithms
- **Payments**: Stripe integration
- **Navigation**: Expo Router

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd onspace-app
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.karatoken.com
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations (see `database/schema.sql`)
3. Configure authentication providers
4. Set up storage buckets for audio files
5. Update environment variables with your Supabase credentials

### 4. Start Development

```bash
# Start Expo development server
npm run start

# Platform-specific commands
npm run android    # Launch Android emulator
npm run ios        # Launch iOS simulator
npm run web        # Start web version
```

### 5. Reset Project (if needed)

```bash
npm run reset-project
```

## 📱 App Structure

```
app/
├── (auth)/           # Authentication screens
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── (tabs)/           # Main tab navigation
│   ├── index.tsx     # Home dashboard
│   ├── leaderboard.tsx
│   ├── battle.tsx
│   ├── wallet.tsx
│   ├── profile.tsx
│   └── song-selection.tsx
├── karaoke/          # Recording interface
│   └── [songId].tsx
├── results/          # Performance results
│   └── [performanceId].tsx
└── _layout.tsx       # Root layout

services/             # API services
├── authService.ts
├── battleService.ts
├── karaokeService.ts
├── leaderboardService.ts
├── performanceService.ts
├── songService.ts
├── walletService.ts
└── supabase.ts

hooks/                # State management
├── useAuthStore.ts
├── useBattleStore.ts
├── useKaraokeStore.ts
├── useLeaderboardStore.ts
├── usePerformanceStore.ts
├── useSongStore.ts
└── useWalletStore.ts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `EXPO_PUBLIC_API_BASE_URL` | Custom API base URL | No |
| `EXPO_PUBLIC_AI_SERVICE_URL` | AI scoring service URL | No |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | No |

### Feature Flags

Configure features in `constants/Config.ts`:

```typescript
export const Config = {
  ENABLE_AI_SCORING: true,
  ENABLE_BATTLES: true,
  ENABLE_WALLET: true,
  ENABLE_NOTIFICATIONS: true,
  // ... more configuration
};
```

## 🎵 AI Scoring System

The app uses advanced AI algorithms to score performances:

- **Pitch Accuracy** (40% weight) - Measures vocal pitch precision
- **Rhythm Timing** (30% weight) - Evaluates beat synchronization  
- **Timing Accuracy** (20% weight) - Assesses overall timing
- **Energy Level** (10% weight) - Measures performance enthusiasm

## 💰 Cryptocurrency Integration

- **KRT Tokens** - Native cryptocurrency for rewards
- **Earning Methods**:
  - Performance scores
  - Battle victories
  - Daily challenges
  - Referral bonuses
- **Spending Options**:
  - Battle entry fees
  - Premium features
  - Withdrawal to external wallets

## 🏆 Battle System

- **Live Battles** - Real-time competitions
- **Reward Pools** - KRT token rewards
- **Ranking System** - Global leaderboards
- **Tournament Mode** - Multi-round competitions

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 📦 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npm run build:web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private. For collaboration inquiries, please contact the author.

## 🆘 Support

For support and questions:
- Check the [Issues](../../issues) page
- Review the documentation
- Contact the development team

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] Core karaoke functionality
- [x] AI scoring system
- [x] Battle system
- [x] Wallet integration
- [x] User authentication

### Phase 2 (Next)
- [ ] Advanced AI features
- [ ] Social features
- [ ] Tournament system
- [ ] Mobile app stores
- [ ] Premium subscriptions

### Phase 3 (Future)
- [ ] VR/AR integration
- [ ] Live streaming
- [ ] Music creation tools
- [ ] Global competitions
- [ ] NFT integration

---

**Built with ❤️ by the Karatoken Team**
