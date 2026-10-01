import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  GripVertical,
  Play,
  Loader2,
  AlertCircle,
  ListMusic,
  Plus,
  X,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import type { Playlist, Song, PlaylistSong } from '@/lib/types'
import { usePlayerStore } from '@/store/playerStore'
import { GlassCard } from '@/components/GlassCard'

function SortableRow({
  ps,
  index,
  onPlay,
}: {
  ps: PlaylistSong
  index: number
  onPlay: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ps.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const song = ps.song
  if (!song) return null

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3">
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-white/30 hover:text-white/60"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="w-6 font-mono text-xs text-white/30">{index + 1}</span>
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
        {song.cover_url && (
          <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{song.title}</p>
        <p className="truncate text-xs text-white/50">{song.artist}</p>
      </div>
      <button
        onClick={onPlay}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-mint"
      >
        <Play className="h-4 w-4 fill-current" />
      </button>
    </div>
  )
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { play } = usePlayerStore()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [items, setItems] = useState<PlaylistSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    async function fetchData() {
      const [{ data: pl, error: plErr }, { data: ps, error: psErr }] =
        await Promise.all([
          supabase.from('playlists').select('*').eq('id', id).maybeSingle(),
          supabase
            .from('playlist_songs')
            .select('*, song:songs(*)')
            .eq('playlist_id', id)
            .order('position', { ascending: true }),
        ])

      if (plErr || psErr) {
        setError(plErr?.message ?? psErr?.message ?? null)
      } else {
        setPlaylist(pl as Playlist)
        setItems((ps as PlaylistSong[]) ?? [])
      }
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    // Update positions in DB
    for (let i = 0; i < newItems.length; i++) {
      await supabase
        .from('playlist_songs')
        .update({ position: i })
        .eq('id', newItems[i].id)
    }
  }

  const playAll = () => {
    const songs = items.map((i) => i.song).filter(Boolean) as Song[]
    if (songs.length > 0) play(songs[0], songs)
  }

  const handleAddSong = async (song: Song) => {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: id,
        song_id: song.id,
        position: items.length,
      })
      .select('*, song:songs(*)')
      .single()

    if (!error && data) {
      setItems([...items, data as PlaylistSong])
    }
  }

  useEffect(() => {
    if (showAdd && allSongs.length === 0) {
      supabase.from('songs').select('*').limit(20).then(({ data }) => {
        if (data) setAllSongs(data as Song[])
      })
    }
  }, [showAdd])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint" />
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-coral" />
        <p className="text-white/60">{error || 'Playlist not found'}</p>
        <button onClick={() => navigate('/playlists')} className="text-mint hover:underline">
          Back to playlists
        </button>
      </div>
    )
  }

  const songs = items.map((i) => i.song).filter(Boolean) as Song[]

  return (
    <div>
      <button
        onClick={() => navigate('/playlists')}
        className="mb-4 flex items-center gap-1 text-sm text-white/40 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Playlists
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6 flex items-end gap-4">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
            {playlist.cover_url ? (
              <img
                src={playlist.cover_url}
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mint/20 to-coral/20">
                <ListMusic className="h-10 w-10 text-white/30" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-bold text-white">
              {playlist.name}
            </h1>
            <p className="mt-1 truncate text-sm text-white/40">
              {playlist.description || 'No description'}
            </p>
            <p className="mt-1 text-xs text-white/30">
              {items.length} song{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {songs.length > 0 && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={playAll}
              className="flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              <Play className="h-4 w-4 fill-black" />
              Play all
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
            >
              <Plus className="h-4 w-4" />
              Add songs
            </button>
          </div>
        )}

        {/* Songs list with drag-and-drop */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ListMusic className="mb-3 h-12 w-12 text-white/20" />
            <p className="text-lg font-medium text-white/60">This playlist is empty</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-black"
            >
              Add songs
            </button>
          </div>
        ) : (
          <GlassCard className="p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((ps, i) => (
                    <SortableRow
                      key={ps.id}
                      ps={ps}
                      index={i}
                      onPlay={() => play(ps.song!, songs)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </GlassCard>
        )}
      </motion.div>

      {/* Add songs modal */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAdd(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="max-h-[70vh] overflow-hidden p-5" glow>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">Add songs</h2>
                <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                {allSongs.map((song) => {
                  const inPlaylist = items.some((i) => i.song_id === song.id)
                  return (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        {song.cover_url && (
                          <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{song.title}</p>
                        <p className="truncate text-xs text-white/50">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => handleAddSong(song)}
                        disabled={inPlaylist}
                        className="rounded-full p-2 text-mint disabled:text-white/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
