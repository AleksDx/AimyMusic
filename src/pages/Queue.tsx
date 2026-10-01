import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Play, Layers, SkipForward } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { GlassCard } from '@/components/GlassCard'

export default function Queue() {
  const navigate = useNavigate()
  const { queue, queueIndex, currentSong, isPlaying, play, togglePlay, next } =
    usePlayerStore()

  if (!currentSong) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Layers className="h-10 w-10 text-white/20" />
        <p className="text-lg font-medium text-white/60">Your queue is empty</p>
        <p className="text-sm text-white/40">Play a song to start your queue</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-2 rounded-full bg-mint px-6 py-2.5 text-sm font-semibold text-black"
        >
          Browse music
        </button>
      </div>
    )
  }

  const upcoming = [
    ...queue.slice(queueIndex + 1),
    ...queue.slice(0, queueIndex),
  ]

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-1 font-display text-2xl font-bold text-white">Queue</h1>
        <p className="mb-6 text-sm text-white/40">
          {upcoming.length} song{upcoming.length !== 1 ? 's' : ''} up next
        </p>

        {/* Now playing */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mint">
            Now playing
          </p>
          <GlassCard className="flex items-center gap-4 p-4" glow>
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              {currentSong.cover_url && (
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">
                {currentSong.title}
              </p>
              <p className="truncate text-sm text-white/50">
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-black"
            >
              {isPlaying ? (
                <span className="flex items-end gap-0.5">
                  <span className="h-2 w-0.5 animate-pulse bg-black" />
                  <span className="h-3 w-0.5 animate-pulse bg-black" style={{ animationDelay: '0.15s' }} />
                  <span className="h-1.5 w-0.5 animate-pulse bg-black" style={{ animationDelay: '0.3s' }} />
                </span>
              ) : (
                <Play className="h-5 w-5 fill-black" />
              )}
            </button>
            <button
              onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:text-mint"
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </button>
          </GlassCard>
        </div>

        {/* Upcoming — 3D stacked cards */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Up next
          </p>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/30">
              No more songs in queue
            </p>
          ) : (
            <div className="space-y-0">
              {upcoming.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    perspective: 1000,
                  }}
                >
                  <motion.div
                    whileHover={{
                      rotateY: -5,
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translateZ(${Math.max(0, 20 - i * 4)}px)`,
                    }}
                    className="relative"
                  >
                    <GlassCard className="mb-2 flex items-center gap-4 p-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        {song.cover_url && (
                          <img
                            src={song.cover_url}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {song.title}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {song.artist}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-white/30">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => play(song, queue)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 opacity-0 transition-opacity hover:text-mint group-hover:opacity-100"
                        style={{ opacity: 1 }}
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </button>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
