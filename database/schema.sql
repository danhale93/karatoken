-- Karatoken Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    wallet_balance DECIMAL(20,8) DEFAULT 0,
    total_performances INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE public.songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL,
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
    duration INTEGER NOT NULL, -- in seconds
    audio_url TEXT NOT NULL,
    lyrics_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    popularity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    bpm INTEGER,
    key_signature TEXT,
    language TEXT DEFAULT 'en'
);

-- Performances table
CREATE TABLE public.performances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    song_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    pitch_score DECIMAL(5,2) NOT NULL,
    rhythm_score DECIMAL(5,2) NOT NULL,
    timing_score DECIMAL(5,2) NOT NULL,
    energy_score DECIMAL(5,2) NOT NULL,
    recording_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    feedback TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0
);

-- Battles table
CREATE TABLE public.battles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    song_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
    reward DECIMAL(20,8) NOT NULL,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    entry_fee DECIMAL(20,8) DEFAULT 0,
    battle_type TEXT CHECK (battle_type IN ('solo', 'duo', 'group')) DEFAULT 'solo'
);

-- Battle participants table
CREATE TABLE public.battle_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    performance_id UUID REFERENCES public.performances(id) ON DELETE SET NULL,
    score DECIMAL(5,2),
    rank INTEGER,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, user_id)
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('earn', 'spend', 'withdraw', 'deposit')) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference_id UUID, -- links to performance, battle, etc.
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed'
);

-- Leaderboard table (materialized view for performance)
CREATE TABLE public.leaderboard (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    total_score DECIMAL(10,2) NOT NULL,
    performances_count INTEGER NOT NULL,
    average_score DECIMAL(5,2) NOT NULL,
    rank INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User relationships (followers/following)
CREATE TABLE public.user_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Performance likes
CREATE TABLE public.performance_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    performance_id UUID REFERENCES public.performances(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(performance_id, user_id)
);

-- Daily challenges
CREATE TABLE public.daily_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    reward DECIMAL(20,8) NOT NULL,
    challenge_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Challenge completions
CREATE TABLE public.challenge_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    performance_id UUID REFERENCES public.performances(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_performances_user_id ON public.performances(user_id);
CREATE INDEX idx_performances_song_id ON public.performances(song_id);
CREATE INDEX idx_performances_created_at ON public.performances(created_at);
CREATE INDEX idx_battles_status ON public.battles(status);
CREATE INDEX idx_battles_start_time ON public.battles(start_time);
CREATE INDEX idx_battle_participants_battle_id ON public.battle_participants(battle_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(rank);
CREATE INDEX idx_songs_genre ON public.songs(genre);
CREATE INDEX idx_songs_popularity ON public.songs(popularity);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

-- Performances policies
CREATE POLICY "Users can view public performances" ON public.performances
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own performances" ON public.performances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performances" ON public.performances
    FOR UPDATE USING (auth.uid() = user_id);

-- Battles policies
CREATE POLICY "Anyone can view battles" ON public.battles
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create battles" ON public.battles
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Battle creators can update their battles" ON public.battles
    FOR UPDATE USING (auth.uid() = created_by);

-- Battle participants policies
CREATE POLICY "Anyone can view battle participants" ON public.battle_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join battles" ON public.battle_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (true);

-- Leaderboard policies
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

-- User relationships policies
CREATE POLICY "Users can view relationships" ON public.user_relationships
    FOR SELECT USING (true);

CREATE POLICY "Users can create relationships" ON public.user_relationships
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own relationships" ON public.user_relationships
    FOR DELETE USING (auth.uid() = follower_id);

-- Performance likes policies
CREATE POLICY "Anyone can view likes" ON public.performance_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like performances" ON public.performance_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.performance_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Daily challenges policies
CREATE POLICY "Anyone can view challenges" ON public.daily_challenges
    FOR SELECT USING (true);

-- Challenge completions policies
CREATE POLICY "Users can view challenge completions" ON public.challenge_completions
    FOR SELECT USING (true);

CREATE POLICY "Users can complete challenges" ON public.challenge_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's total performances and average score
    UPDATE public.users 
    SET 
        total_performances = (
            SELECT COUNT(*) FROM public.performances 
            WHERE user_id = NEW.user_id
        ),
        average_score = (
            SELECT AVG(score) FROM public.performances 
            WHERE user_id = NEW.user_id
        ),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when performance is created
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON public.performances
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert leaderboard entry
    INSERT INTO public.leaderboard (user_id, total_score, performances_count, average_score, rank, updated_at)
    SELECT 
        u.id,
        COALESCE(SUM(p.score), 0) as total_score,
        COUNT(p.id) as performances_count,
        COALESCE(AVG(p.score), 0) as average_score,
        0 as rank, -- Will be updated below
        NOW() as updated_at
    FROM public.users u
    LEFT JOIN public.performances p ON u.id = p.user_id
    WHERE u.id = NEW.user_id
    GROUP BY u.id
    ON CONFLICT (user_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        performances_count = EXCLUDED.performances_count,
        average_score = EXCLUDED.average_score,
        updated_at = NOW();
    
    -- Update ranks
    UPDATE public.leaderboard 
    SET rank = subquery.rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
        FROM public.leaderboard
    ) subquery
    WHERE public.leaderboard.id = subquery.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard when performance is created
CREATE TRIGGER trigger_update_leaderboard
    AFTER INSERT ON public.performances
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard();

-- Function to handle battle participant count
CREATE OR REPLACE FUNCTION update_battle_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.battles 
        SET current_participants = current_participants + 1
        WHERE id = NEW.battle_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.battles 
        SET current_participants = current_participants - 1
        WHERE id = OLD.battle_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update battle participant count
CREATE TRIGGER trigger_update_battle_participants
    AFTER INSERT OR DELETE ON public.battle_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_battle_participants();

-- Function to handle performance likes count
CREATE OR REPLACE FUNCTION update_performance_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.performances 
        SET likes_count = likes_count + 1
        WHERE id = NEW.performance_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.performances 
        SET likes_count = likes_count - 1
        WHERE id = OLD.performance_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update performance likes count
CREATE TRIGGER trigger_update_performance_likes
    AFTER INSERT OR DELETE ON public.performance_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_performance_likes();

-- Insert sample data
INSERT INTO public.songs (title, artist, genre, difficulty, duration, audio_url, lyrics_url, thumbnail_url, popularity) VALUES
('Bohemian Rhapsody', 'Queen', 'Rock', 9, 354, 'https://example.com/bohemian.mp3', 'https://example.com/bohemian.txt', 'https://picsum.photos/seed/bohemian/300/300', 100),
('Imagine', 'John Lennon', 'Pop', 6, 183, 'https://example.com/imagine.mp3', 'https://example.com/imagine.txt', 'https://picsum.photos/seed/imagine/300/300', 95),
('Hotel California', 'Eagles', 'Rock', 8, 391, 'https://example.com/hotel.mp3', 'https://example.com/hotel.txt', 'https://picsum.photos/seed/hotel/300/300', 90),
('Wonderwall', 'Oasis', 'Rock', 5, 258, 'https://example.com/wonderwall.mp3', 'https://example.com/wonderwall.txt', 'https://picsum.photos/seed/wonderwall/300/300', 85),
('Shape of You', 'Ed Sheeran', 'Pop', 4, 233, 'https://example.com/shape.mp3', 'https://example.com/shape.txt', 'https://picsum.photos/seed/shape/300/300', 80);

-- Create storage buckets for audio files
INSERT INTO storage.buckets (id, name, public) VALUES
('karaoke-recordings', 'karaoke-recordings', true),
('song-audio', 'song-audio', true),
('song-lyrics', 'song-lyrics', true),
('user-avatars', 'user-avatars', true);

-- Set up storage policies
CREATE POLICY "Public access to song audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'song-audio');

CREATE POLICY "Public access to song lyrics" ON storage.objects
    FOR SELECT USING (bucket_id = 'song-lyrics');

CREATE POLICY "Public access to user avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated users can upload recordings" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'karaoke-recordings' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own recordings" ON storage.objects
    FOR SELECT USING (bucket_id = 'karaoke-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recordings" ON storage.objects
    FOR DELETE USING (bucket_id = 'karaoke-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);