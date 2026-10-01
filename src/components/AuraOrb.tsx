import { motion } from 'framer-motion'

interface AuraOrbProps {
  size?: number
  color1?: string
  color2?: string
  color3?: string
  pulsing?: boolean
}

export function AuraOrb({
  size = 200,
  color1 = '#1ED760',
  color2 = '#00C896',
  color3 = '#FF5C5C',
  pulsing = true,
}: AuraOrbProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {pulsing && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, ${color1}40, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * 0.85,
              height: size * 0.85,
              background: `radial-gradient(circle at 70% 70%, ${color2}40, transparent 70%)`,
            }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          background: `conic-gradient(from 0deg, ${color1}, ${color2}, ${color3}, ${color1})`,
          filter: 'blur(2px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle at 40% 40%, ${color1}, ${color2}80, ${color3}40)`,
          filter: 'blur(8px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute rounded-full bg-[#0A0A0F]/40"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          filter: 'blur(10px)',
        }}
      />
    </div>
  )
}
