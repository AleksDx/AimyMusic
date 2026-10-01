/*
# AimyMusic — Full Database Schema

## Overview
Creates the complete schema for the AimyMusic web app: profiles, songs, playlists,
playlist_songs, favorites, and play_history tables. Also creates the get_wrapped_stats
RPC function for the Wrapped feature. Seeds sample songs so the app has content immediately.

## New Tables

### profiles
- `id` (uuid, PK, references auth.users) — one row per user
- `username` (text, unique) — handle
- `display_name` (text) — shown name
- `avatar_url` (text) — profile picture URL
- `bio` (text) — short bio
- `created_at` (timestamptz) — creation time

### songs
- `id` (uuid, PK)
- `title` (text) — song name
- `artist` (text) — artist name
- `album` (text) — album name
- `cover_url` (text) — cover art URL
- `audio_url` (text) — audio file URL (mp3)
- `duration_seconds` (int) — song length
- `genre` (text) — genre tag
- `bpm` (int) — beats per minute
- `energy` (int, 0-100) — energy rating

### playlists
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users, DEFAULT auth.uid())
- `name` (text) — playlist name
- `description` (text) — description
- `cover_url` (text) — cover art
- `is_public` (boolean) — visibility
- `created_at` (timestamptz)

### playlist_songs
- `id` (uuid, PK)
- `playlist_id` (uuid, FK to playlists)
- `song_id` (uuid, FK to songs)
- `position` (int) — ordering

### favorites
- `id` (uuid, PK)
- `user_id` (uuid, DEFAULT auth.uid())
- `song_id` (uuid, FK to songs)

### play_history
- `id` (uuid, PK)
- `user_id` (uuid, DEFAULT auth.uid())
- `song_id` (uuid, FK to songs)
- `played_at` (timestamptz)
- `seconds_played` (int)
- `completed` (boolean)

## Security (RLS)
- profiles: owner-scoped (auth.uid() = id)
- songs: public read (TO anon, authenticated), no writes from client
- playlists: owner-scoped (auth.uid() = user_id)
- playlist_songs: owner-scoped through playlist membership
- favorites: owner-scoped (auth.uid() = user_id)
- play_history: owner-scoped (auth.uid() = user_id)

## RPC
- get_wrapped_stats(p_user_id): returns aggregate listening stats for Wrapped feature

## Notes
1. songs table is readable by everyone (anon + authenticated) so the home feed
   works even before login if needed. All user-specific tables are owner-scoped.
2. user_id columns default to auth.uid() so client-side inserts that omit user_id succeed.
3. Sample songs are seeded with royalty-free audio URLs.
*/

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ===== SONGS =====
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  cover_url text,
  audio_url text,
  duration_seconds int DEFAULT 0,
  genre text,
  bpm int,
  energy int DEFAULT 50
);

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_songs" ON songs;
CREATE POLICY "read_songs" ON songs FOR SELECT
  TO anon, authenticated USING (true);

-- ===== PLAYLISTS =====
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_url text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_playlists" ON playlists;
CREATE POLICY "select_own_playlists" ON playlists FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_playlists" ON playlists;
CREATE POLICY "insert_own_playlists" ON playlists FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_playlists" ON playlists;
CREATE POLICY "update_own_playlists" ON playlists FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_playlists" ON playlists;
CREATE POLICY "delete_own_playlists" ON playlists FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== PLAYLIST_SONGS =====
CREATE TABLE IF NOT EXISTS playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0
);

ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_playlist_songs" ON playlist_songs;
CREATE POLICY "select_own_playlist_songs" ON playlist_songs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_songs.playlist_id AND playlists.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_playlist_songs" ON playlist_songs;
CREATE POLICY "insert_own_playlist_songs" ON playlist_songs FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_songs.playlist_id AND playlists.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_playlist_songs" ON playlist_songs;
CREATE POLICY "update_own_playlist_songs" ON playlist_songs FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_songs.playlist_id AND playlists.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_songs.playlist_id AND playlists.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_playlist_songs" ON playlist_songs;
CREATE POLICY "delete_own_playlist_songs" ON playlist_songs FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM playlists WHERE playlists.id = playlist_songs.playlist_id AND playlists.user_id = auth.uid())
  );

-- ===== FAVORITES =====
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== PLAY_HISTORY =====
CREATE TABLE IF NOT EXISTS play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  played_at timestamptz DEFAULT now(),
  seconds_played int DEFAULT 0,
  completed boolean DEFAULT false
);

ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON play_history;
CREATE POLICY "select_own_history" ON play_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON play_history;
CREATE POLICY "insert_own_history" ON play_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON play_history;
CREATE POLICY "delete_own_history" ON play_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history(played_at);

-- ===== WRAPPED STATS RPC =====
CREATE OR REPLACE FUNCTION get_wrapped_stats(p_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  uid uuid;
BEGIN
  uid := COALESCE(p_user_id, auth.uid());
  SELECT json_build_object(
    'total_minutes', COALESCE(SUM(ph.seconds_played) / 60, 0),
    'total_plays', COUNT(ph.id),
    'unique_artists', COUNT(DISTINCT s.artist),
    'top_artists', (
      SELECT json_agg(json_build_object('artist', artist, 'plays', play_count))
      FROM (
        SELECT s.artist, COUNT(*) as play_count
        FROM play_history ph
        JOIN songs s ON s.id = ph.song_id
        WHERE ph.user_id = uid
        GROUP BY s.artist
        ORDER BY play_count DESC
        LIMIT 5
      ) t
    ),
    'top_songs', (
      SELECT json_agg(json_build_object('id', song_id, 'title', title, 'artist', artist, 'cover_url', cover_url, 'plays', play_count))
      FROM (
        SELECT ph.song_id, s.title, s.artist, s.cover_url, COUNT(*) as play_count
        FROM play_history ph
        JOIN songs s ON s.id = ph.song_id
        WHERE ph.user_id = uid
        GROUP BY ph.song_id, s.title, s.artist, s.cover_url
        ORDER BY play_count DESC
        LIMIT 5
      ) t
    ),
    'top_genres', (
      SELECT json_agg(json_build_object('genre', genre, 'plays', play_count))
      FROM (
        SELECT s.genre, COUNT(*) as play_count
        FROM play_history ph
        JOIN songs s ON s.id = ph.song_id
        WHERE ph.user_id = uid
        GROUP BY s.genre
        ORDER BY play_count DESC
        LIMIT 5
      ) t
    )
  ) INTO result
  FROM play_history ph
  JOIN songs s ON s.id = ph.song_id
  WHERE ph.user_id = uid;
  
  IF result IS NULL THEN
    result := json_build_object(
      'total_minutes', 0,
      'total_plays', 0,
      'unique_artists', 0,
      'top_artists', '[]'::json,
      'top_songs', '[]'::json,
      'top_genres', '[]'::json
    );
  END IF;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_wrapped_stats(uuid) TO authenticated;

-- ===== SEED SAMPLE SONGS =====
INSERT INTO songs (title, artist, album, cover_url, audio_url, duration_seconds, genre, bpm, energy)
VALUES
  ('Midnight Aura', 'Lunar Drift', 'Eclipse', 'https://picsum.photos/seed/aimy1/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 372, 'Electrónica', 120, 75),
  ('Neon Pulse', 'Synthwave Collective', 'Retrograde', 'https://picsum.photos/seed/aimy2/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 426, 'Electrónica', 110, 85),
  ('Velvet Hours', 'The Midnight Set', 'Afterglow', 'https://picsum.photos/seed/aimy3/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 348, 'Jazz', 90, 55),
  ('Golden Dust', 'Sunset Avenue', 'Horizons', 'https://picsum.photos/seed/aimy4/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 295, 'Pop', 100, 60),
  ('Crystal Vision', 'Aurora Lens', 'Prism', 'https://picsum.photos/seed/aimy5/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 380, 'Electrónica', 128, 90),
  ('Paper Moon', 'Lantern Folk', 'Origami', 'https://picsum.photos/seed/aimy6/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 310, 'Indie', 95, 45),
  ('Deep Current', 'Submerge', 'Depths', 'https://picsum.photos/seed/aimy7/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 420, 'Hip-Hop', 124, 80),
  ('Starlight Echo', 'Nova Wave', 'Constellations', 'https://picsum.photos/seed/aimy8/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 355, 'Electrónica', 118, 70),
  ('Electric Bloom', 'Garden Circuit', 'Florescence', 'https://picsum.photos/seed/aimy9/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 268, 'Rock', 130, 95),
  ('Solar Flare', 'Helios Ray', 'Corona', 'https://picsum.photos/seed/aimy10/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 390, 'Electrónica', 126, 88),
  ('Amber Sky', 'Dusk Choir', 'Twilight', 'https://picsum.photos/seed/aimy11/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 340, 'Indie', 95, 58),
  ('Gravity Pull', 'Orbit Method', 'Mass', 'https://picsum.photos/seed/aimy12/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 365, 'Hip-Hop', 132, 92),
  ('Soft Landing', 'Cloud Nine', 'Altitude', 'https://picsum.photos/seed/aimy13/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 300, 'Pop', 100, 50),
  ('Mirage', 'Desert Sound', 'Oasis', 'https://picsum.photos/seed/aimy14/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 325, 'Latina', 105, 65),
  ('Moonlight Sonata', 'Claire Voss', 'Nocturnes', 'https://picsum.photos/seed/aimy15/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 285, 'Clásica', 70, 35),
  ('Rhythm of the Night', 'Calle Sur', 'Fuego', 'https://picsum.photos/seed/aimy16/500/500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 410, 'Latina', 128, 92)
ON CONFLICT DO NOTHING;
