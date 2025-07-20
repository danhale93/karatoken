// Powered by OnSpace.AI
import { createClient } from '@supabase/supabase-js';
import { Config } from '../constants/Config';

const supabaseUrl = Config.SUPABASE_URL;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database table types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          wallet_balance: number;
          total_performances: number;
          average_score: number;
        };
        Insert: {
          id?: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          wallet_balance?: number;
          total_performances?: number;
          average_score?: number;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          wallet_balance?: number;
          total_performances?: number;
          average_score?: number;
        };
      };
      performances: {
        Row: {
          id: string;
          user_id: string;
          song_id: string;
          song_title: string;
          artist_name: string;
          score: number;
          pitch_score: number;
          rhythm_score: number;
          timing_score: number;
          energy_score: number;
          recording_url: string;
          duration: number;
          created_at: string;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          song_id: string;
          song_title: string;
          artist_name: string;
          score: number;
          pitch_score: number;
          rhythm_score: number;
          timing_score: number;
          energy_score: number;
          recording_url: string;
          duration: number;
          created_at?: string;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          song_id?: string;
          song_title?: string;
          artist_name?: string;
          score?: number;
          pitch_score?: number;
          rhythm_score?: number;
          timing_score?: number;
          energy_score?: number;
          recording_url?: string;
          duration?: number;
          created_at?: string;
          feedback?: string | null;
        };
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist: string;
          genre: string;
          difficulty: number;
          duration: number;
          audio_url: string;
          lyrics_url: string;
          thumbnail_url: string;
          created_at: string;
          popularity: number;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          genre: string;
          difficulty: number;
          duration: number;
          audio_url: string;
          lyrics_url: string;
          thumbnail_url: string;
          created_at?: string;
          popularity?: number;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          genre?: string;
          difficulty?: number;
          duration?: number;
          audio_url?: string;
          lyrics_url?: string;
          thumbnail_url?: string;
          created_at?: string;
          popularity?: number;
        };
      };
      battles: {
        Row: {
          id: string;
          title: string;
          song_id: string;
          song_title: string;
          artist_name: string;
          status: 'waiting' | 'active' | 'completed';
          reward: number;
          max_participants: number;
          current_participants: number;
          start_time: string;
          end_time: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          song_id: string;
          song_title: string;
          artist_name: string;
          status?: 'waiting' | 'active' | 'completed';
          reward: number;
          max_participants: number;
          current_participants?: number;
          start_time: string;
          end_time?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          song_id?: string;
          song_title?: string;
          artist_name?: string;
          status?: 'waiting' | 'active' | 'completed';
          reward?: number;
          max_participants?: number;
          current_participants?: number;
          start_time?: string;
          end_time?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      battle_participants: {
        Row: {
          id: string;
          battle_id: string;
          user_id: string;
          performance_id: string | null;
          score: number | null;
          rank: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          user_id: string;
          performance_id?: string | null;
          score?: number | null;
          rank?: number | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          battle_id?: string;
          user_id?: string;
          performance_id?: string | null;
          score?: number | null;
          rank?: number | null;
          joined_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'earn' | 'spend' | 'withdraw' | 'deposit';
          amount: number;
          description: string;
          created_at: string;
          reference_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'earn' | 'spend' | 'withdraw' | 'deposit';
          amount: number;
          description: string;
          created_at?: string;
          reference_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'earn' | 'spend' | 'withdraw' | 'deposit';
          amount?: number;
          description?: string;
          created_at?: string;
          reference_id?: string | null;
        };
      };
    };
  };
}