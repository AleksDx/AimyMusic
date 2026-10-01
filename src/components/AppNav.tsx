import { motion } from 'framer-motion'
import { Home, ListMusic, Layers, Sparkles, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/components/AuthProvider'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/queue', label: 'Queue', icon: Layers },
  { path: '/playlists', label: 'Playlists', icon: ListMusic },
  { path: '/wrapped', label: 'Wrapped', icon: Sparkles },
]

export function AppNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-white/5 bg-base/80 backdrop-blur-2xl md:flex">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-mint/10 text-mint'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="p-4">
          <button
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/40 transition-colors hover:bg-coral/10 hover:text-coral"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/5 bg-base/90 backdrop-blur-2xl md:hidden">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-1 flex-col items-center gap-1 py-3"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-mint"
                />
              )}
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  active ? 'text-mint' : 'text-white/40'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-mint' : 'text-white/40'
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
