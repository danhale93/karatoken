// Powered by OnSpace.AI
import { create } from 'zustand';
import { walletService, WalletBalance, Transaction } from '../services/walletService';

interface WalletState {
  balance: WalletBalance;
  transactions: Transaction[];
  getBalance: (userId: string) => Promise<void>;
  getTransactions: (userId: string) => Promise<void>;
  purchaseTokens: (userId: string, amount: number) => Promise<void>;
  requestPayout: (userId: string, amount: number, method: 'crypto' | 'paypal') => Promise<void>;
  addTokens: (amount: number) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: { krt: 0, usd: 0 },
  transactions: [],

  getBalance: async (userId: string) => {
    try {
      const balance = await walletService.getBalance(userId);
      set({ balance });
    } catch (error) {
      throw error;
    }
  },

  getTransactions: async (userId: string) => {
    try {
      const transactions = await walletService.getTransactions(userId);
      set({ transactions });
    } catch (error) {
      throw error;
    }
  },

  purchaseTokens: async (userId: string, amount: number) => {
    try {
      await walletService.purchaseTokens(userId, amount);
      const { balance } = get();
      set({ balance: { ...balance, krt: balance.krt + amount } });
    } catch (error) {
      throw error;
    }
  },

  requestPayout: async (userId: string, amount: number, method: 'crypto' | 'paypal') => {
    try {
      await walletService.requestPayout(userId, amount, method);
      const { balance } = get();
      set({ balance: { ...balance, krt: balance.krt - amount } });
    } catch (error) {
      throw error;
    }
  },

  addTokens: (amount: number) => {
    const { balance } = get();
    set({ balance: { ...balance, krt: balance.krt + amount } });
  },
}));