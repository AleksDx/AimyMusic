import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Song } from '@/lib/types'
import { usePlayerStore } from '@/store/playerStore'
import { SongCard } from '@/components/SongCard'
import { GlassCard } from '@/components/GlassCard'
import { AuraOrb } from '@/components/AuraOrb'

function SongCardSkeleton() {
  return (
    <div className="w-44 shrink-0 p-3 sm:w-48">
      <div className="mb-3 aspect-square w-full animate-pulse rounded-2xl bg-white/5" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-white/5" />
      <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-white/5" />
    </div>
  )
}

function Carousel({
  title,
  songs,
  loading,
}: {
  title: string
  songs: Song[]
  loading: boolean
}) {
  if (!loading && songs.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="mb-3 px-1 font-display text-lg font-semibold text-white">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SongCardSkeleton key={i} />)
          : songs.map((song) => (
              <SongCard key={song.id} song={song} queue={songs} />
            ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { play, currentSong, isPlaying, togglePlay } = usePlayerStore()

  useEffect(() => {
    async function fetchSongs() {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .limit(20)

      if (error) {
        setError(error.message)
      } else if (data) {
        setSongs(data as Song[])
      }
      setLoading(false)
    }
    fetchSongs()
  }, [])

  const heroSong = songs[0]
  const forYou = songs.slice(0, 10)
  const discover = songs.slice(5, 15)
  const continueListening = songs.slice(10, 16)

  const handleHeroPlay = () => {
    if (!heroSong) return
    if (currentSong?.id === heroSong.id) {
      togglePlay()
    } else {
      play(heroSong, songs)
    }
  }

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <GlassCard className="relative overflow-hidden p-6 sm:p-8" glow>
          <div className="absolute right-0 top-0 -mt-10 -mr-10 opacity-40">
            <AuraOrb size={240} />
          </div>
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-mint">
              <Sparkles className="h-3.5 w-3.5" />
              CURATED FOR YOU
            </div>
            <h1 className="mb-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Your moment now
            </h1>
            <p className="mb-6 max-w-md text-sm text-white/50">
              {heroSong
                ? `${heroSong.title} by ${heroSong.artist} — picked to match your vibe today.`
                : 'Let AI find the perfect track for this moment.'}
            </p>
            {heroSong && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleHeroPlay}
                  className="flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-black" />
                  {currentSong?.id === heroSong.id && isPlaying ? 'Now playing' : 'Play now'}
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg">
                    {heroSong.cover_url && (
                      <img
                        src={heroSong.cover_url}
                        alt={heroSong.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{heroSong.title}</p>
                    <p className="text-xs text-white/50">{heroSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your music...
        </div>
      ) : songs.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-white/60">No songs yet</p>
          <p className="mt-1 text-sm text-white/40">
            Check back soon for new music
          </p>
        </div>
      ) : (
        <>
          <Carousel title="Para ti hoy" songs={forYou} loading={loading} />
          <Carousel title="Continuar escuchando" songs={continueListening} loading={loading} />
          <Carousel title="Descubrimiento IA" songs={discover} loading={loading} />
        </>
      )}
    </div>
  )
}
