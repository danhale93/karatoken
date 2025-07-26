import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

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

function calculateRank(totalWins: number): string {
  if (totalWins >= 100) return 'Diamond';
  if (totalWins >= 50) return 'Platinum';
  if (totalWins >= 25) return 'Gold';
  if (totalWins >= 10) return 'Silver';
  return 'Bronze';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.signIn(email, password);
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.signUp(email, password, displayName);
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithGoogle();
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.signInWithApple();
      await AsyncStorage.setItem('user_session', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      await AsyncStorage.removeItem('user_session');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: profile?.display_name || session.user.user_metadata?.display_name || 'User',
          photoURL: profile?.avatar_url || session.user.user_metadata?.avatar_url,
          rank: calculateRank(profile?.total_wins || 0),
          krtBalance: profile?.total_earnings || 0,
          createdAt: session.user.created_at || new Date().toISOString(),
        };

        await AsyncStorage.setItem('user_session', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      } else {
        // Fallback to AsyncStorage
        const savedUser = await AsyncStorage.getItem('user_session');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            set({ user, isAuthenticated: true });
          } catch (parseError) {
            console.error('Error parsing saved user:', parseError);
            await AsyncStorage.removeItem('user_session');
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await AsyncStorage.removeItem('user_session');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) {
      throw new Error('No user logged in');
    }

    set({ isLoading: true });
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));