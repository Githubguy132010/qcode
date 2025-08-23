'use client'

import { motion } from 'framer-motion'
import { springAnimation, cardVariants } from '@/lib/animations'

interface AnimatedStatCardProps {
  label: string
  value: number | string
  gradientClass: string
  onClick?: () => void
  disabled?: boolean
}

export function AnimatedStatCard({ 
  label, 
  value, 
  gradientClass, 
  onClick, 
  disabled = false 
}: AnimatedStatCardProps) {
  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!disabled ? { y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={springAnimation}
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-lg group ${disabled ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
    >
      <motion.div 
        className={`${gradientClass} w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md`}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        transition={springAnimation}
      >
        <span className="text-white font-bold text-base">{value}</span>
      </motion.div>
      <p className="text-xs font-medium theme-text-secondary group-hover:theme-text-primary transition-colors">
        {label}
      </p>
    </motion.button>
  )
}