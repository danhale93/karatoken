// Powered by OnSpace.AI
import { Platform } from 'react-native';
import Config from '../constants/Config';

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
  private simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  async signIn(email: string, password: string): Promise<User> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo
      if (email === Config.DEMO_CREDENTIALS.email && password === Config.DEMO_CREDENTIALS.password) {
        return {
          id: 'demo-user-1',
          email: Config.DEMO_CREDENTIALS.email,
          displayName: 'Demo User',
          photoURL: 'https://picsum.photos/seed/user/150/150.webp',
          rank: 'Gold',
          krtBalance: Config.DEFAULT_KRT_BALANCE,
          createdAt: new Date().toISOString(),
        };
      }
      
      // Allow any valid email format with "demo123" password for testing
      if (email.includes('@') && password === 'demo123') {
        return {
          id: `user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          photoURL: `https://picsum.photos/seed/${email}/150/150.webp`,
          rank: 'Silver',
          krtBalance: 750,
          createdAt: new Date().toISOString(),
        };
      }
      
      throw new Error('Invalid email or password. Try demo@karatoken.com / demo123');
    }
    
    // TODO: Replace with actual Firebase Auth implementation
    try {
      const response = await fetch(`${Config.API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const userData = await response.json();
      return userData.user;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      return {
        id: `user-${Date.now()}`,
        email,
        displayName,
        photoURL: `https://picsum.photos/seed/${email}/150/150.webp`,
        rank: 'Bronze',
        krtBalance: 100,
        createdAt: new Date().toISOString(),
      };
    }
    
    // TODO: Replace with actual Firebase Auth implementation
    try {
      const response = await fetch(`${Config.API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const userData = await response.json();
      return userData.user;
    } catch (error) {
      throw new Error('Failed to create account');
    }
  }

  async signInWithGoogle(): Promise<User> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo
      return {
        id: `google-user-${Date.now()}`,
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: 'https://picsum.photos/seed/google/150/150.webp',
        rank: 'Silver',
        krtBalance: 500,
        createdAt: new Date().toISOString(),
      };
    }
    
    // TODO: Replace with actual Google Sign-In implementation
    throw new Error('Google sign-in not implemented yet');
  }

  async signInWithApple(): Promise<User> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation for demo
      return {
        id: `apple-user-${Date.now()}`,
        email: 'user@icloud.com',
        displayName: 'Apple User',
        photoURL: 'https://picsum.photos/seed/apple/150/150.webp',
        rank: 'Silver',
        krtBalance: 750,
        createdAt: new Date().toISOString(),
      };
    }
    
    // TODO: Replace with actual Apple Sign-In implementation
    throw new Error('Apple sign-in not implemented yet');
  }

  async signOut(): Promise<void> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation - just return success
      return;
    }
    
    // TODO: Replace with actual Firebase Auth signOut
    try {
      await fetch(`${Config.API_BASE_URL}/auth/signout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await this.simulateApiDelay();
    
    if (Config.USE_MOCK_DATA) {
      // Mock implementation - return updated user data
      const currentUser = {
        id: userId,
        email: 'demo@karatoken.com',
        displayName: 'Demo User',
        photoURL: 'https://picsum.photos/seed/user/150/150.webp',
        rank: 'Gold',
        krtBalance: Config.DEFAULT_KRT_BALANCE,
        createdAt: new Date().toISOString(),
      };
      
      return { ...currentUser, ...updates };
    }
    
    // TODO: Replace with actual API call
    try {
      const response = await fetch(`${Config.API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const userData = await response.json();
      return userData.user;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }
}

export const authService = new AuthService();