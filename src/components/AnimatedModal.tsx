'use client'

import { motion } from 'framer-motion'
import { modalVariants } from '@/lib/animations'

interface AnimatedModalProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export function AnimatedModal({ children, isOpen, onClose }: AnimatedModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}