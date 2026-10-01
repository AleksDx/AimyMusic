import { Howl } from 'howler'
import type { Song } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { usePlayerStore } from '@/store/playerStore'

class AudioEngine {
  private howl: Howl | null = null
  private rafId: number | null = null
  private currentSongId: string | null = null

  loadAndPlay(song: Song, onEnd?: () => void) {
    if (this.howl) {
      this.howl.unload()
      this.howl = null
    }

    if (!song.audio_url) {
      console.warn('No audio URL for song:', song.title)
      return
    }

    this.currentSongId = song.id

    this.howl = new Howl({
      src: [song.audio_url],
      html5: true,
      volume: usePlayerStore.getState().volume,
      onplay: () => {
        usePlayerStore.getState().setDuration(this.howl?.duration() || 0)
        this.startProgressLoop()
        this.recordPlay(song)
      },
      onend: () => {
        this.stopProgressLoop()
        usePlayerStore.getState().setProgress(0)
        onEnd?.()
      },
      onloaderror: (_id, err) => {
        console.error('Howler load error:', err)
      },
    })

    this.howl.play()
  }

  private startProgressLoop() {
    this.stopProgressLoop()
    const update = () => {
      if (this.howl && this.howl.playing()) {
        const seek = this.howl.seek() as number
        usePlayerStore.getState().setProgress(seek)
        this.rafId = requestAnimationFrame(update)
      }
    }
    this.rafId = requestAnimationFrame(update)
  }

  private stopProgressLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  pause() {
    this.howl?.pause()
    this.stopProgressLoop()
  }

  resume() {
    this.howl?.play()
    this.startProgressLoop()
  }

  setVolume(v: number) {
    this.howl?.volume(v)
  }

  seek(seconds: number) {
    if (this.howl) {
      this.howl.seek(seconds)
      usePlayerStore.getState().setProgress(seconds)
    }
  }

  getDuration(): number {
    return this.howl?.duration() || 0
  }

  private async recordPlay(song: Song) {
    if (!song.id || song.id === this.currentSongId) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('play_history').insert({
          user_id: user.id,
          song_id: song.id,
          played_at: new Date().toISOString(),
          seconds_played: 0,
          completed: false,
        })
      } catch (e) {
        // Silently fail — don't interrupt playback
        console.error('Failed to record play history:', e)
      }
    }
  }
}

export const audioEngine = new AudioEngine()
