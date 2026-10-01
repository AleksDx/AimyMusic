import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { Song } from '@/lib/types'
import { usePlayerStore } from '@/store/playerStore'
import { GlassCard } from '@/components/GlassCard'

interface SongCardProps {
  song: Song
  queue?: Song[]
  variant?: 'default' | 'compact'
}

export function SongCard({ song, queue, variant = 'default' }: SongCardProps) {
  const { currentSong, isPlaying, play, togglePlay } = usePlayerStore()
  const isActive = currentSong?.id === song.id

  const handlePlay = () => {
    if (isActive) {
      togglePlay()
    } else {
      play(song, queue)
    }
  }

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePlay}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.08]"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          {song.cover_url ? (
            <img
              src={song.cover_url}
              alt={song.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-mint/30 to-coral/30" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${isActive ? 'text-mint' : 'text-white'}`}>
            {song.title}
          </p>
          <p className="truncate text-xs text-white/50">{song.artist}</p>
        </div>
        {isActive && isPlaying && (
          <div className="flex items-end gap-0.5">
            <span className="h-2 w-0.5 animate-pulse rounded-full bg-mint" />
            <span className="h-3 w-0.5 animate-pulse rounded-full bg-mint" style={{ animationDelay: '0.15s' }} />
            <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-mint" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <GlassCard
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group w-44 cursor-pointer overflow-hidden p-3 sm:w-48"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-mint/30 to-coral/30" />
        )}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-mint text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90"
        >
          <Play className="h-5 w-5 fill-black" />
        </button>
        {isActive && (
          <div className="absolute left-2 top-2 flex items-end gap-0.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
            <span className="h-2 w-0.5 animate-pulse rounded-full bg-mint" />
            <span className="h-3 w-0.5 animate-pulse rounded-full bg-mint" style={{ animationDelay: '0.15s' }} />
            <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-mint" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className={`truncate text-sm font-semibold ${isActive ? 'text-mint' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="truncate text-xs text-white/50">{song.artist}</p>
      </div>
    </GlassCard>
  )
}
