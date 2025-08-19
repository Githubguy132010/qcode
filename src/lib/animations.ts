// Swift-style animation utilities
export const springAnimation = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1
};

export const springAnimationFast = {
  type: "spring" as const,
  stiffness: 800,
  damping: 40,
  mass: 1
};

export const springAnimationBounce = {
  type: "spring" as const,
  stiffness: 600,
  damping: 20,
  mass: 1
};

export const easeInOut = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
};

export const easeOut = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
};

export const easeIn = {
  duration: 0.2,
  ease: [0.8, 0, 1, 0.8] as [number, number, number, number]
};

// Animation variants for framer-motion
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

// Stagger animation for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Reusable animation presets
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { 
      duration: 0.25,
      ease: "easeInOut" as const
    }
  }
};

export const popupVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2,
      ease: "easeIn" as const
    }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  },
  hover: { 
    y: -4,
    transition: { 
      duration: 0.2,
      ease: "easeInOut" as const
    }
  }
};

// Dashboard animations
export const dashboardCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

export const tabVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: "easeIn" as const
    }
  }
};

export const chartVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};

export const staggerDashboard = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};