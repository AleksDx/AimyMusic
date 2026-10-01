import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ListMusic, Loader2, X, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Playlist } from '@/lib/types'
import { useAuth } from '@/components/AuthProvider'
import { GlassCard } from '@/components/GlassCard'

export default function Playlists() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchPlaylists() {
      if (!user) return
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setPlaylists((data as Playlist[]) ?? [])
      }
      setLoading(false)
    }
    fetchPlaylists()
  }, [user])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newName.trim()) return
    setCreating(true)

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        description: newDesc.trim() || null,
        is_public: false,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setCreating(false)
    } else {
      setPlaylists([data as Playlist, ...playlists])
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      setCreating(false)
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Playlists</h1>
            <p className="mt-1 text-sm text-white/40">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-full bg-mint px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-white/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading playlists...
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ListMusic className="mb-3 h-12 w-12 text-white/20" />
            <p className="text-lg font-medium text-white/60">No playlists yet</p>
            <p className="mt-1 text-sm text-white/40">
              Create your first playlist to organize your music
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/playlist/${pl.id}`)}
                className="cursor-pointer"
              >
                <GlassCard
                  whileHover={{ y: -6 }}
                  className="overflow-hidden p-3"
                >
                  <div className="mb-3 aspect-square w-full overflow-hidden rounded-2xl">
                    {pl.cover_url ? (
                      <img
                        src={pl.cover_url}
                        alt={pl.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mint/20 to-coral/20">
                        <ListMusic className="h-8 w-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-white">
                    {pl.name}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {pl.description || 'No description'}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6" glow>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white">
                    New playlist
                  </h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My awesome playlist"
                      autoFocus
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Description
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What's this playlist about?"
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-mint/50 focus:outline-none focus:ring-1 focus:ring-mint/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creating || !newName.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint py-3 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create playlist'
                    )}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
