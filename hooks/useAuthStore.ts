// Powered by OnSpace.AI
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rank: string;
  krtBalance: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.signIn(email, password);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.signUp(email, password, displayName);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithGoogle();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithApple();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      await AsyncStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      throw error;
    }
  },
}));