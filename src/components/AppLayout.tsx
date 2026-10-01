import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/components/AuthProvider'
import { AppNav } from '@/components/AppNav'
import { MiniPlayer } from '@/components/MiniPlayer'
import { Logo } from '@/components/Logo'
import { motion } from 'framer-motion'

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-bg">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Logo size="lg" />
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen app-bg">
      <AppNav />
      <main className="md:ml-64">
        <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 md:px-8 md:pb-8 md:pt-8">
          {/* Mobile header */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <Logo size="sm" />
          </div>
          {children}
        </div>
      </main>
      <MiniPlayer />
    </div>
  )
}
