'use client'

import { motion } from 'framer-motion'
import { springAnimation } from '@/lib/animations'

interface AnimatedPageProps {
  children: React.ReactNode
}

export function AnimatedPage({ children }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springAnimation}
    >
      {children}
    </motion.div>
  )
}