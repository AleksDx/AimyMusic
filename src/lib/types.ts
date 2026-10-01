export interface Song {
  id: string
  title: string
  artist: string
  album: string | null
  cover_url: string | null
  audio_url: string | null
  duration_seconds: number
  genre: string | null
  bpm: number | null
  energy: number | null
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_url: string | null
  is_public: boolean
  created_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  position: number
  song?: Song
}

export interface Favorite {
  id: string
  user_id: string
  song_id: string
  song?: Song
}

export interface PlayHistoryEntry {
  id: string
  user_id: string
  song_id: string
  played_at: string
  seconds_played: number
  completed: boolean
  song?: Song
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface WrappedStats {
  total_minutes: number
  total_plays: number
  unique_artists: number
  top_artists: { artist: string; plays: number }[]
  top_songs: {
    id: string
    title: string
    artist: string
    cover_url: string | null
    plays: number
  }[]
  top_genres: { genre: string; plays: number }[]
}
