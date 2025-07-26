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
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Sign in failed. Please try again.');
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();

      // Validate inputs
      if (!cleanEmail || !password || !cleanDisplayName) {
        throw new Error('All fields are required');
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanDisplayName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (error.message.includes('Unable to validate email')) {
          throw new Error('Please enter a valid email address');
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      // If user is immediately confirmed (local development), create profile
      if (data.user.email_confirmed_at) {
        try {
          await this.createUserProfile(data.user.id, cleanDisplayName, cleanEmail);
        } catch (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here as the user was created successfully
        }
      }

      return {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        displayName: cleanDisplayName,
        photoURL: data.user.user_metadata?.avatar_url,
        rank: 'Bronze',
        krtBalance: 100,
        createdAt: data.user.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Account creation failed. Please try again.');
    }
  }

  private async createUserProfile(userId: string, displayName: string, email: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        username: displayName.toLowerCase().replace(/\s+/g, '_'),
        display_name: displayName,
        total_earnings: 100,
        total_battles: 0,
        total_wins: 0,
        total_losses: 0,
        win_rate: 0.00,
      });

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/(tabs)`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw new Error('Google sign-in failed. Please try again.');
      }

      // This will redirect on web or open the OAuth flow
      // The actual user data will be available after the redirect
      throw new Error('OAuth redirect in progress');
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign-in is not available');
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/(tabs)`,
        },
      });

      if (error) {
        console.error('Apple sign in error:', error);
        throw new Error('Apple sign-in failed. Please try again.');
      }

      // This will redirect on web or open the OAuth flow
      throw new Error('OAuth redirect in progress');
    } catch (error) {
      console.error('Apple sign in error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Apple sign-in is not available');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error('Sign out failed. Please try again.');
      }
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

      if (error) {
        console.error('Update profile error:', error);
        throw new Error('Profile update failed. Please try again.');
      }

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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Profile update failed. Please try again.');
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