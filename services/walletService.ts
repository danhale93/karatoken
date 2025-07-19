// Powered by OnSpace.AI
export interface WalletBalance {
  krt: number;
  usd: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'purchase' | 'payout' | 'battle_win' | 'performance_reward';
  amount: number;
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

class WalletService {
  async getBalance(userId: string): Promise<WalletBalance> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/wallet/balance`);

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const balance = await response.json();
      return balance;
    } catch (error) {
      // Mock implementation for demo
      return {
        krt: 1250,
        usd: 125.00,
      };
    }
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${userId}/wallet/transactions`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const transactions = await response.json();
      return transactions;
    } catch (error) {
      // Mock implementation for demo
      return [
        {
          id: 'txn-1',
          userId,
          type: 'battle_win',
          amount: 250,
          description: 'Battle Victory - Sweet Caroline',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
        },
        {
          id: 'txn-2',
          userId,
          type: 'performance_reward',
          amount: 50,
          description: 'Performance Bonus - 92% Score',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
        },
        {
          id: 'txn-3',
          userId,
          type: 'purchase',
          amount: 500,
          description: 'Token Purchase',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
        },
        {
          id: 'txn-4',
          userId,
          type: 'earn',
          amount: 100,
          description: 'Daily Challenge Completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'completed',
        },
        {
          id: 'txn-5',
          userId,
          type: 'payout',
          amount: -200,
          description: 'PayPal Withdrawal',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed',
        },
      ];
    }
  }

  async purchaseTokens(userId: string, amount: number): Promise<void> {
    try {
      // TODO: Replace with actual payment processing
      const response = await fetch(`/api/users/${userId}/wallet/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase tokens');
      }
    } catch (error) {
      // Mock implementation for demo - simulate success
      console.log(`Mock purchase: ${amount} KRT tokens`);
    }
  }

  async requestPayout(userId: string, amount: number, method: 'crypto' | 'paypal'): Promise<void> {
    try {
      // TODO: Replace with actual payout processing
      const response = await fetch(`/api/users/${userId}/wallet/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, method }),
      });

      if (!response.ok) {
        throw new Error('Failed to request payout');
      }
    } catch (error) {
      // Mock implementation for demo - simulate success
      console.log(`Mock payout request: ${amount} KRT via ${method}`);
    }
  }
}

export const walletService = new WalletService();