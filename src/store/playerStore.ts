import { create } from 'zustand'
import type { Song } from '@/lib/types'
import { audioEngine } from '@/lib/audioEngine'

interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  play: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  setQueue: (songs: Song[]) => void
  setProgress: (p: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,

  play: (song, queue) => {
    const state = get()
    const newQueue = queue ?? state.queue.length > 0 ? state.queue : [song]
    const idx = queue ? queue.findIndex((s) => s.id === song.id) : 0
    const index = idx >= 0 ? idx : 0

    audioEngine.loadAndPlay(song, () => {
      get().next()
    })

    set({
      currentSong: song,
      queue: newQueue,
      queueIndex: index,
      isPlaying: true,
      progress: 0,
    })
  },

  togglePlay: () => {
    const state = get()
    if (state.isPlaying) {
      audioEngine.pause()
      set({ isPlaying: false })
    } else {
      if (state.currentSong) {
        audioEngine.resume()
        set({ isPlaying: true })
      }
    }
  },

  pause: () => {
    audioEngine.pause()
    set({ isPlaying: false })
  },

  resume: () => {
    audioEngine.resume()
    set({ isPlaying: true })
  },

  next: () => {
    const state = get()
    if (state.queue.length === 0) return
    const nextIndex = (state.queueIndex + 1) % state.queue.length
    const nextSong = state.queue[nextIndex]

    audioEngine.loadAndPlay(nextSong, () => {
      get().next()
    })

    set({
      currentSong: nextSong,
      queueIndex: nextIndex,
      isPlaying: true,
      progress: 0,
    })
  },

  previous: () => {
    const state = get()
    if (state.queue.length === 0) return
    const prevIndex =
      state.queueIndex - 1 < 0
        ? state.queue.length - 1
        : state.queueIndex - 1
    const prevSong = state.queue[prevIndex]

    audioEngine.loadAndPlay(prevSong, () => {
      get().next()
    })

    set({
      currentSong: prevSong,
      queueIndex: prevIndex,
      isPlaying: true,
      progress: 0,
    })
  },

  setQueue: (songs) => {
    set({ queue: songs, queueIndex: 0 })
  },

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => {
    audioEngine.setVolume(v)
    set({ volume: v })
  },
}))
