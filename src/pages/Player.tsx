import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ChevronLeft, SkipBack, SkipForward, Play, Pause, Heart, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Song } from '@/lib/types'
import { usePlayerStore } from '@/store/playerStore'
import { GlassCard } from '@/components/GlassCard'
import { useAuth } from '@/components/AuthProvider'

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    queue,
    play,
    togglePlay,
    next,
    previous,
  } = usePlayerStore()

  const [song, setSong] = useState<Song | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [optimisticFav, setOptimisticFav] = useState(false)

  useEffect(() => {
    async function fetchSong() {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        setError(error.message)
      } else if (data) {
        setSong(data as Song)
        // If not current song, play it
        if (currentSong?.id !== data.id) {
          play(data as Song, queue.length > 0 ? queue : [data as Song])
        }
      } else {
        setError('Song not found')
      }
      setLoading(false)
    }
    if (id) fetchSong()
  }, [id])

  // Check favorite status
  useEffect(() => {
    async function checkFav() {
      if (!user || !id) return
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', id)
        .maybeSingle()
      setOptimisticFav(!!data)
    }
    checkFav()
  }, [user, id])

  const handleFavorite = async () => {
    if (!user || !song) return
    // Optimistic update
    const newFav = !optimisticFav
    setOptimisticFav(newFav)

    if (newFav) {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, song_id: song.id })
      if (error) setOptimisticFav(!newFav)
    } else {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', song.id)
      if (error) setOptimisticFav(!newFav)
    }
  }

  const displaySong = currentSong ?? song
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint" />
      </div>
    )
  }

  if (error || !displaySong) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-coral" />
        <p className="text-white/60">{error || 'Song not found'}</p>
        <button onClick={() => navigate('/home')} className="text-mint hover:underline">
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-white/40 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        {/* Cover with aura */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Aura rings */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 320,
              height: 320,
              background: 'radial-gradient(circle, rgba(30,215,96,0.15) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              background: 'radial-gradient(circle, rgba(255,92,92,0.1) 0%, transparent 70%)',
            }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Cover art */}
          <motion.div
            className="relative z-10 h-64 w-64 overflow-hidden rounded-3xl shadow-2xl sm:h-72 sm:w-72"
            animate={{ scale: isPlaying ? 1 : 0.92 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {displaySong.cover_url ? (
              <img
                src={displaySong.cover_url}
                alt={displaySong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-mint/30 to-coral/30" />
            )}
          </motion.div>
        </div>

        {/* Song info */}
        <div className="mb-2 text-center">
          <h1 className="font-display text-2xl font-bold text-white">
            {displaySong.title}
          </h1>
          <p className="mt-1 text-white/50">{displaySong.artist}</p>
          {displaySong.album && (
            <p className="text-xs text-white/30">{displaySong.album}</p>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          className="mb-6 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/5"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              optimisticFav ? 'fill-coral text-coral' : 'text-white/60'
            }`}
          />
          {optimisticFav ? 'In your favorites' : 'Add to favorites'}
        </button>

        {/* Wave progress bar */}
        <div className="mb-4 w-full max-w-md">
          <div className="relative h-16 overflow-hidden rounded-2xl">
            {Array.from({ length: 48 }).map((_, i) => {
              const active = (i / 48) * 100 <= progressPct
              const baseHeight = 20 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.3) * 10
              return (
                <div
                  key={i}
                  className="absolute bottom-0 w-1 rounded-full transition-colors duration-150"
                  style={{
                    left: `${(i / 48) * 100}%`,
                    height: `${Math.max(8, baseHeight)}%`,
                    backgroundColor: active ? '#1ED760' : 'rgba(255,255,255,0.1)',
                  }}
                />
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-xs text-white/40">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls — only 3 buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={previous}
            className="text-white/60 transition-colors hover:text-white"
          >
            <SkipBack className="h-8 w-8 fill-current" />
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-black shadow-lg shadow-mint/20"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7 fill-black" />
            ) : (
              <Play className="h-7 w-7 fill-black" />
            )}
          </motion.button>

          <button
            onClick={next}
            className="text-white/60 transition-colors hover:text-white"
          >
            <SkipForward className="h-8 w-8 fill-current" />
          </button>
        </div>

        {/* Song metadata */}
        <GlassCard className="mt-8 w-full max-w-md p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-white/40">Genre</p>
              <p className="mt-1 text-sm font-medium text-white">
                {displaySong.genre || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">BPM</p>
              <p className="mt-1 font-mono text-sm font-medium text-mint">
                {displaySong.bpm || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">Energy</p>
              <div className="mt-1 flex items-center justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-3 rounded-full ${
                      (displaySong.energy || 0) > (i + 1) * 20
                        ? 'bg-mint'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
