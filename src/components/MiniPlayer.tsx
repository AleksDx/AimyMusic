import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, X } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { audioEngine } from '@/lib/audioEngine'

export function MiniPlayer() {
  const navigate = useNavigate()
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    togglePlay,
    next,
  } = usePlayerStore()

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0F]/80 backdrop-blur-2xl">
            {/* Progress bar */}
            <div className="absolute left-0 top-0 h-0.5 bg-mint" style={{ width: `${progressPct}%` }} />

            <div className="flex items-center gap-3 p-3">
              <button
                onClick={() => navigate(`/player/${currentSong.id}`)}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
              >
                {currentSong.cover_url ? (
                  <img
                    src={currentSong.cover_url}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-mint/30 to-coral/30" />
                )}
              </button>

              <button
                onClick={() => navigate(`/player/${currentSong.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-semibold text-white">
                  {currentSong.title}
                </p>
                <p className="truncate text-xs text-white/50">
                  {currentSong.artist}
                </p>
              </button>

              <button
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-black transition-transform hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-black" />
                ) : (
                  <Play className="h-4 w-4 fill-black" />
                )}
              </button>

              <button
                onClick={next}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:text-mint"
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>

              <button
                onClick={() => audioEngine.pause()}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition-colors hover:text-coral"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
