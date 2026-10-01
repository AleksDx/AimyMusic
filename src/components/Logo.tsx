import { motion } from 'framer-motion'
import { Music } from 'lucide-react'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 'h-5 w-5', text: 'text-lg' },
    md: { icon: 'h-6 w-6', text: 'text-xl' },
    lg: { icon: 'h-8 w-8', text: 'text-3xl' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={`flex ${s.icon} items-center justify-center rounded-full bg-mint`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Music className="h-3/5 w-3/5 text-black" />
        </motion.div>
        <div className="absolute inset-0 rounded-full bg-mint/40 blur-md" />
      </div>
      <span className={`font-display font-bold tracking-tight text-white ${s.text}`}>
        Aimy<span className="text-mint">Music</span>
      </span>
    </div>
  )
}
