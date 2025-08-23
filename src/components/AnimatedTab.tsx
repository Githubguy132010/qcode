'use client'

import { motion } from 'framer-motion'
import { springAnimation } from '@/lib/animations'

interface AnimatedTabProps {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  className?: string
}

export function AnimatedTab({ children, isActive, onClick, className = '' }: AnimatedTabProps) {
  return (
    <motion.button
      onClick={onClick}
      className={className}
      whileHover={{ y: isActive ? 0 : -2 }}
      whileTap={{ scale: 0.95 }}
      transition={springAnimation}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
          layoutId="tabIndicator"
          transition={springAnimation}
        />
      )}
    </motion.button>
  )
}