import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rank: string;
  krtBalance: number;
  createdAt: string;
}

class AuthService {
  async signIn(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) throw new Error('No user data returned');

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: profile?.display_name || data.user.user_metadata?.display_name || 'User',
        photoURL: profile?.avatar_url || data.user.user_metadata?.avatar_url,
        rank: this.calculateRank(profile?.total_wins || 0),
        krtBalance: profile?.total_earnings || 0,
        createdAt: data.user.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Invalid email or password');
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;

      if (!data.user) throw new Error('No user data returned');

      return {
        id: data.user.id,
        email: data.user.email || '',
        displayName: displayName,
        photoURL: data.user.user_metadata?.avatar_url,
        rank: 'Bronze',
        krtBalance: 100,
        createdAt: data.user.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to create account');
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      // This will redirect on web or open the OAuth flow
      // The actual user data will be available after the redirect
      throw new Error('OAuth redirect in progress');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Google sign-in failed');
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });

      if (error) throw error;

      // This will redirect on web or open the OAuth flow
      throw new Error('OAuth redirect in progress');
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw new Error('Apple sign-in failed');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Update the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.photoURL,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: userId,
        email: updates.email || '',
        displayName: data.display_name || '',
        photoURL: data.avatar_url,
        rank: this.calculateRank(data.total_wins || 0),
        krtBalance: data.total_earnings || 0,
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  private calculateRank(totalWins: number): string {
    if (totalWins >= 100) return 'Diamond';
    if (totalWins >= 50) return 'Platinum';
    if (totalWins >= 25) return 'Gold';
    if (totalWins >= 10) return 'Silver';
    return 'Bronze';
  }
}

export const authService = new AuthService();