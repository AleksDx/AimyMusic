import { Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import { AppLayout } from '@/components/AppLayout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import Player from '@/pages/Player'
import Queue from '@/pages/Queue'
import Playlists from '@/pages/Playlists'
import PlaylistDetail from '@/pages/PlaylistDetail'
import Wrapped from '@/pages/Wrapped'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout>{children}</AppLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/player/:id" element={<ProtectedRoute><Player /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
        <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
        <Route path="/wrapped" element={<ProtectedRoute><Wrapped /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  )
}
