// Powered by OnSpace.AI - Karatoken Cryptocurrency Service
// $KARA token management and blockchain integration

interface KARAWallet {
  address: string;
  balance: number;
  stakedAmount: number;
  stakingRewards: number;
  pendingRewards: number;
  transactions: KARATransaction[];
}

interface KARATransaction {
  id: string;
  type: 'earn' | 'spend' | 'stake' | 'unstake' | 'reward' | 'transfer' | 'withdraw';
  amount: number;
  description: string;
  timestamp: number;
  blockchainTxHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  metadata?: any;
}

interface StakingPool {
  id: string;
  name: string;
  description: string;
  apy: number; // Annual Percentage Yield
  minStake: number;
  totalStaked: number;
  rewardToken: 'KARA' | 'ETH' | 'MATIC';
  lockupPeriod: number; // in days
  earlyWithdrawalPenalty: number; // percentage
}

interface RewardStructure {
  performance: {
    excellent: number; // 90%+ accuracy
    good: number;      // 75-89% accuracy
    average: number;   // 60-74% accuracy
    participation: number; // <60% accuracy
  };
  streak: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  challenge: {
    daily: number;
    weekly: number;
    monthly: number;
    special: number;
  };
  social: {
    duet: number;
    battle_win: number;
    battle_participation: number;
    viral_content: number;
  };
}

interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'crypto' | 'paypal' | 'bank';
  destination: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: number;
  processedAt?: number;
  fees: number;
}

class CryptocurrencyService {
  private apiEndpoint = 'https://api.karatoken.io/crypto';
  private blockchainNetwork = 'polygon'; // Using Polygon for low fees
  private contractAddress = '0x1234...'; // KARA token contract address
  
  private rewardStructure: RewardStructure = {
    performance: {
      excellent: 50,
      good: 30,
      average: 15,
      participation: 5,
    },
    streak: {
      daily: 10,
      weekly: 50,
      monthly: 200,
    },
    challenge: {
      daily: 25,
      weekly: 100,
      monthly: 500,
      special: 250,
    },
    social: {
      duet: 20,
      battle_win: 75,
      battle_participation: 25,
      viral_content: 100,
    },
  };

  // Wallet Management
  async createWallet(userId: string): Promise<KARAWallet> {
    try {
      const response = await fetch(`${this.apiEndpoint}/wallet/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          network: this.blockchainNetwork,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create wallet');
      }

      const walletData = await response.json();
      return {
        address: walletData.address,
        balance: 0,
        stakedAmount: 0,
        stakingRewards: 0,
        pendingRewards: 0,
        transactions: [],
      };
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error('Failed to create KARA wallet');
    }
  }

  async getWalletBalance(userId: string): Promise<KARAWallet> {
    try {
      const response = await fetch(`${this.apiEndpoint}/wallet/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      return await response.json();
    } catch (error) {
      console.error('Wallet fetch error:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  // Token Earning System
  async awardTokens(
    userId: string,
    amount: number,
    type: 'performance' | 'streak' | 'challenge' | 'social',
    metadata: any = {}
  ): Promise<KARATransaction> {
    try {
      const response = await fetch(`${this.apiEndpoint}/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          type,
          metadata,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to award tokens');
      }

      const transaction = await response.json();
      
      // Update local storage cache
      this.updateLocalBalance(userId, amount);
      
      return transaction;
    } catch (error) {
      console.error('Token award error:', error);
      throw new Error('Failed to award KARA tokens');
    }
  }

  // Performance-based rewards calculation
  calculatePerformanceReward(
    accuracy: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    streakCount: number = 0
  ): number {
    let baseReward = 0;
    
    // Base reward based on accuracy
    if (accuracy >= 90) {
      baseReward = this.rewardStructure.performance.excellent;
    } else if (accuracy >= 75) {
      baseReward = this.rewardStructure.performance.good;
    } else if (accuracy >= 60) {
      baseReward = this.rewardStructure.performance.average;
    } else {
      baseReward = this.rewardStructure.performance.participation;
    }

    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5,
      expert: 2.0,
    }[difficulty];

    // Streak bonus
    const streakBonus = Math.min(streakCount * 5, 50); // Max 50 bonus

    return Math.round(baseReward * difficultyMultiplier + streakBonus);
  }

  // Staking System
  async getStakingPools(): Promise<StakingPool[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/staking/pools`, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staking pools');
      }

      return await response.json();
    } catch (error) {
      console.error('Staking pools fetch error:', error);
      return [
        {
          id: 'basic',
          name: 'Basic Staking',
          description: 'Earn steady rewards on your KARA tokens',
          apy: 12,
          minStake: 100,
          totalStaked: 1250000,
          rewardToken: 'KARA',
          lockupPeriod: 0,
          earlyWithdrawalPenalty: 0,
        },
        {
          id: 'premium',
          name: 'Premium Staking',
          description: 'Higher rewards with 30-day lock',
          apy: 25,
          minStake: 500,
          totalStaked: 850000,
          rewardToken: 'KARA',
          lockupPeriod: 30,
          earlyWithdrawalPenalty: 5,
        },
        {
          id: 'exclusive',
          name: 'Exclusive Pool',
          description: 'Maximum rewards for dedicated users',
          apy: 40,
          minStake: 2000,
          totalStaked: 350000,
          rewardToken: 'KARA',
          lockupPeriod: 90,
          earlyWithdrawalPenalty: 10,
        },
      ];
    }
  }

  async stakeTokens(
    userId: string,
    poolId: string,
    amount: number
  ): Promise<KARATransaction> {
    try {
      const response = await fetch(`${this.apiEndpoint}/staking/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          poolId,
          amount,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to stake tokens');
      }

      return await response.json();
    } catch (error) {
      console.error('Staking error:', error);
      throw new Error('Failed to stake KARA tokens');
    }
  }

  async unstakeTokens(
    userId: string,
    poolId: string,
    amount: number
  ): Promise<KARATransaction> {
    try {
      const response = await fetch(`${this.apiEndpoint}/staking/unstake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          poolId,
          amount,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unstake tokens');
      }

      return await response.json();
    } catch (error) {
      console.error('Unstaking error:', error);
      throw new Error('Failed to unstake KARA tokens');
    }
  }

  // Token Purchase System
  async purchaseTokens(
    userId: string,
    amount: number,
    paymentMethod: 'card' | 'paypal' | 'crypto',
    paymentDetails: any
  ): Promise<KARATransaction> {
    try {
      const response = await fetch(`${this.apiEndpoint}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod,
          paymentDetails,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase tokens');
      }

      const transaction = await response.json();
      
      // Update local balance after successful purchase
      this.updateLocalBalance(userId, amount);
      
      return transaction;
    } catch (error) {
      console.error('Token purchase error:', error);
      throw new Error('Failed to purchase KARA tokens');
    }
  }

  // Withdrawal/Payout System
  async requestPayout(
    userId: string,
    amount: number,
    method: 'crypto' | 'paypal' | 'bank',
    destination: string
  ): Promise<PayoutRequest> {
    try {
      const response = await fetch(`${this.apiEndpoint}/payout/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          amount,
          method,
          destination,
          requestedAt: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request payout');
      }

      return await response.json();
    } catch (error) {
      console.error('Payout request error:', error);
      throw new Error('Failed to request payout');
    }
  }

  async getPayoutRequests(userId: string): Promise<PayoutRequest[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/payout/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payout requests');
      }

      return await response.json();
    } catch (error) {
      console.error('Payout fetch error:', error);
      return [];
    }
  }

  // PayPal Integration
  async withdrawToPayPal(
    userId: string,
    amount: number,
    paypalEmail: string
  ): Promise<PayoutRequest> {
    try {
      // Convert KARA to USD (mock rate: 1 KARA = $0.05)
      const usdAmount = amount * 0.05;
      const minimumUSD = 10; // $10 minimum withdrawal
      
      if (usdAmount < minimumUSD) {
        throw new Error(`Minimum withdrawal is $${minimumUSD} (${minimumUSD / 0.05} KARA tokens)`);
      }

      const response = await fetch(`${this.apiEndpoint}/withdraw/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
        body: JSON.stringify({
          userId,
          karaAmount: amount,
          usdAmount,
          paypalEmail,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process PayPal withdrawal');
      }

      return await response.json();
    } catch (error) {
      console.error('PayPal withdrawal error:', error);
      throw new Error('Failed to withdraw to PayPal');
    }
  }

  // Transaction History
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<KARATransaction[]> {
    try {
      const response = await fetch(
        `${this.apiEndpoint}/transactions/${userId}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      return await response.json();
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }

  // Price and Market Data
  async getKARAPrice(): Promise<{ usd: number; change24h: number; marketCap: number }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/price`, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_KARATOKEN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch KARA price');
      }

      return await response.json();
    } catch (error) {
      console.error('Price fetch error:', error);
      // Return mock data as fallback
      return {
        usd: 0.05,
        change24h: 2.5,
        marketCap: 5000000,
      };
    }
  }

  // Local Storage Helpers
  private updateLocalBalance(userId: string, amount: number): void {
    try {
      // This would typically update local storage or cache
      // For demo purposes, we'll just log it
      console.log(`Updated balance for ${userId}: +${amount} KARA`);
    } catch (error) {
      console.error('Local balance update error:', error);
    }
  }

  // Reward Calculation Helpers
  calculateDailyReward(consecutiveDays: number): number {
    const baseReward = this.rewardStructure.streak.daily;
    const bonus = Math.min(consecutiveDays * 2, 20); // Max 20 bonus
    return baseReward + bonus;
  }

  calculateBattleReward(
    won: boolean,
    accuracy: number,
    opponentRating: number = 1000
  ): number {
    const baseReward = won 
      ? this.rewardStructure.social.battle_win 
      : this.rewardStructure.social.battle_participation;
    
    const accuracyBonus = Math.round((accuracy / 100) * 25);
    const difficultyBonus = Math.round((opponentRating / 1000) * 10);
    
    return baseReward + accuracyBonus + difficultyBonus;
  }

  calculateDuetReward(harmonyScore: number, synchronization: number): number {
    const baseReward = this.rewardStructure.social.duet;
    const harmonyBonus = Math.round((harmonyScore / 100) * 15);
    const syncBonus = Math.round((synchronization / 100) * 10);
    
    return baseReward + harmonyBonus + syncBonus;
  }

  // Utility Methods
  formatKARAAmount(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  }

  convertKARAToUSD(karaAmount: number, karaPrice: number = 0.05): number {
    return karaAmount * karaPrice;
  }

  convertUSDToKARA(usdAmount: number, karaPrice: number = 0.05): number {
    return Math.round(usdAmount / karaPrice);
  }
}

export const cryptocurrencyService = new CryptocurrencyService();
export type {
  KARAWallet,
  KARATransaction,
  StakingPool,
  RewardStructure,
  PayoutRequest,
};