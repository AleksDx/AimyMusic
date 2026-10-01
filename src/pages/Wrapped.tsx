import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Loader2, Share2, Sparkles, Clock, Users, Music2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import type { WrappedStats } from '@/lib/types'
import { AuraOrb } from '@/components/AuraOrb'
import { GlassCard } from '@/components/GlassCard'

export default function Wrapped() {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const [stats, setStats] = useState<WrappedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 360])
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 1])

  useEffect(() => {
    async function fetchStats() {
      if (!user) return
      const { data, error } = await supabase.rpc('get_wrapped_stats', {
        p_user_id: user.id,
      })
      if (error) {
        setError(error.message)
      } else if (data) {
        setStats(data as WrappedStats)
      }
      setLoading(false)
    }
    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3">
        <p className="text-white/60">{error}</p>
      </div>
    )
  }

  const hasData = stats && stats.total_plays > 0

  return (
    <div
      ref={containerRef}
      className="snap-y snap-mandatory overflow-y-auto"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      {/* Story 1: Intro with aura orb */}
      <section className="flex h-full snap-start flex-col items-center justify-center px-4">
        <motion.div style={{ scale: orbScale, rotate: orbRotate }}>
          <AuraOrb size={220} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-mint">
            AimyMusic
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">
            Your Wrapped
          </h1>
          <p className="mt-2 text-sm text-white/40">
            {hasData ? 'A year in sound' : 'Start listening to see your stats'}
          </p>
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-xs text-white/30"
        >
          Scroll to explore
        </motion.div>
      </section>

      {/* Story 2: Total minutes */}
      {hasData && (
        <section className="flex h-full snap-start flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="text-center"
          >
            <Clock className="mb-4 h-10 w-10 text-mint" />
            <p className="text-sm text-white/40">You spent</p>
            <p className="my-2 font-display text-6xl font-bold text-mint">
              {stats!.total_minutes.toLocaleString()}
            </p>
            <p className="text-lg text-white/60">minutes listening</p>
          </motion.div>
        </section>
      )}

      {/* Story 3: Artists and plays */}
      {hasData && (
        <section className="flex h-full snap-start flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="w-full max-w-md"
          >
            <div className="mb-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-mint" />
              <p className="font-display text-3xl font-bold text-white">
                {stats!.unique_artists} artists
              </p>
              <p className="text-sm text-white/40">
                across {stats!.total_plays} plays
              </p>
            </div>
            <GlassCard className="p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Top artists
              </p>
              <div className="space-y-3">
                {stats!.top_artists.slice(0, 5).map((a, i) => (
                  <div key={a.artist} className="flex items-center gap-3">
                    <span className="font-mono text-sm text-mint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-white">
                      {a.artist}
                    </span>
                    <span className="font-mono text-xs text-white/40">
                      {a.plays} plays
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </section>
      )}

      {/* Story 4: Top songs */}
      {hasData && stats!.top_songs.length > 0 && (
        <section className="flex h-full snap-start flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="w-full max-w-md"
          >
            <div className="mb-6 text-center">
              <Music2 className="mx-auto mb-3 h-8 w-8 text-mint" />
              <p className="font-display text-3xl font-bold text-white">Top songs</p>
            </div>
            <div className="space-y-3">
              {stats!.top_songs.slice(0, 5).map((s, i) => (
                <GlassCard key={s.id} className="flex items-center gap-3 p-3">
                  <span className="font-mono text-sm text-mint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    {s.cover_url && (
                      <img src={s.cover_url} alt={s.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{s.title}</p>
                    <p className="truncate text-xs text-white/50">{s.artist}</p>
                  </div>
                  <span className="font-mono text-xs text-white/40">
                    {s.plays}x
                  </span>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Story 5: Musical Aura */}
      {hasData && (
        <section className="flex h-full snap-start flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="text-center"
          >
            <Sparkles className="mb-4 h-8 w-8 text-mint" />
            <p className="text-sm text-white/40">Your musical aura</p>
            <div className="my-6">
              <AuraOrb size={180} color1="#1ED760" color2={stats!.top_genres[0]?.genre === 'Electrónica' ? '#00C896' : '#FF5C5C'} color3="#7B61FF" />
            </div>
            <p className="font-display text-2xl font-bold text-white">
              {stats!.top_genres[0]?.genre || 'Eclectic'} Soul
            </p>
            {stats!.top_genres.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {stats!.top_genres.slice(0, 3).map((g) => (
                  <span
                    key={g.genre}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                  >
                    {g.genre}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Story 6: Shareable card */}
      <section className="flex h-full snap-start flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="w-full max-w-sm"
        >
          <GlassCard className="overflow-hidden p-6" glow>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-mint">
                  AimyMusic Wrapped
                </p>
                <p className="font-display text-lg font-bold text-white">2026</p>
              </div>
              <AuraOrb size={50} pulsing={false} />
            </div>

            {hasData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Minutes listened</span>
                  <span className="font-mono text-lg font-bold text-mint">
                    {stats!.total_minutes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Artists discovered</span>
                  <span className="font-mono text-lg font-bold text-white">
                    {stats!.unique_artists}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Total plays</span>
                  <span className="font-mono text-lg font-bold text-white">
                    {stats!.total_plays}
                  </span>
                </div>
                {stats!.top_genres[0] && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Top genre</span>
                    <span className="text-sm font-bold text-mint">
                      {stats!.top_genres[0].genre}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-white/40">
                Play some music to fill your Wrapped!
              </p>
            )}

            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              <Share2 className="h-4 w-4" />
              Share your Wrapped
            </button>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  )
}
