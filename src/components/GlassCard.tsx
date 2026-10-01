import { type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function GlassCard({
  children,
  className,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl',
        glow && 'shadow-[0_0_40px_-10px_rgba(30,215,96,0.3)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
