'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { OnboardingTutorialProps } from '@/types/onboarding'
import { ONBOARDING_STEPS } from '@/types/onboarding'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamic configuration for responsive positioning
const POSITIONING_CONFIG = {
  // Responsive breakpoints
  breakpoints: {
    mobile: 640,
    small: 375,
  },
  // Dynamic gap calculation based on viewport
  getGap: (viewportWidth: number) => {
    if (viewportWidth <= 375) return 16
    if (viewportWidth <= 640) return 24
    return 32
  },
  // Dynamic padding based on viewport
  getPadding: (viewportWidth: number) => {
    if (viewportWidth <= 375) return 8
    if (viewportWidth <= 640) return 12
    return 20
  },
  // Dynamic z-index based on context
  zIndex: {
    overlay: 9998,
    tooltip: 10000,
    highlight: 9999,
  },
  // Dynamic sizing constraints
  getMaxWidth: (viewportWidth: number) => {
    if (viewportWidth <= 375) return 'calc(100vw - 16px)'
    if (viewportWidth <= 640) return 'calc(100vw - 24px)'
    if (viewportWidth <= 768) return '400px'
    return '500px'
  },
}

export function OnboardingTutorial({ isOpen, onClose, onComplete, onSkip }: OnboardingTutorialProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const totalSteps = ONBOARDING_STEPS.length

  // Handle element highlighting and positioning
  useEffect(() => {
    if (!isOpen || !currentStepData.targetElement) {
      setHighlightedElement(null)
      return
    }

    const element = document.querySelector(currentStepData.targetElement) as HTMLElement
    if (element) {
      setHighlightedElement(element)
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })

      // Add highlight class
      element.classList.add('onboarding-highlight')
    }

    return () => {
      if (element) {
        element.classList.remove('onboarding-highlight')
      }
    }
  }, [currentStep, isOpen, currentStepData.targetElement])

  // Position tooltip relative to highlighted element or center it
   useEffect(() => {
     if (!tooltipRef.current) return

     const updatePosition = () => {
       if (!tooltipRef.current) return

       const tooltipRect = tooltipRef.current.getBoundingClientRect()
       const viewportHeight = window.innerHeight
       const viewportWidth = window.innerWidth
       const tooltipWidth = tooltipRect.width
       const tooltipHeight = tooltipRect.height

       // If tooltip has no dimensions, wait a bit longer for it to render
       if (tooltipWidth === 0 || tooltipHeight === 0) {
         setTimeout(updatePosition, 50)
         return
       }

       // Get dynamic configuration values
       const config = POSITIONING_CONFIG
       const gap = config.getGap(viewportWidth)
       const padding = config.getPadding(viewportWidth)

       let top = 0
       let left = 0

       // Handle positioning based on whether we have a target element
       if (highlightedElement && currentStepData.position !== 'center') {
         const elementRect = highlightedElement.getBoundingClientRect()

         switch (currentStepData.position) {
           case 'top':
             // Position above element, but check if there's enough space
             const topPos = elementRect.top - tooltipHeight - gap
             if (topPos < padding) {
               // Not enough space above, position below instead
               top = elementRect.bottom + gap
             } else {
               top = topPos
             }
             // Center horizontally on element, but keep within viewport
             left = elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
             break
           case 'bottom':
             // Position below element, but check if there's enough space
             const bottomPos = elementRect.bottom + gap
             if (bottomPos + tooltipHeight > viewportHeight - padding) {
               // Not enough space below, position above instead
               top = elementRect.top - tooltipHeight - gap
             } else {
               top = bottomPos
             }
             left = elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
             break
           case 'left':
             // Position to the left of element
             const leftPos = elementRect.left - tooltipWidth - gap
             if (leftPos < padding) {
               // Not enough space left, position right instead
               left = elementRect.right + gap
             } else {
               left = leftPos
             }
             top = elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2)
             break
           case 'right':
             // Position to the right of element
             const rightPos = elementRect.right + gap
             if (rightPos + tooltipWidth > viewportWidth - padding) {
               // Not enough space right, position left instead
               left = elementRect.left - tooltipWidth - gap
             } else {
               left = rightPos
             }
             top = elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2)
             break
         }
       } else {
         // Center position (for steps with no target element or explicitly center)
         top = (viewportHeight / 2) - (tooltipHeight / 2)
         left = (viewportWidth / 2) - (tooltipWidth / 2)
       }

       // Keep tooltip within viewport bounds with dynamic padding
       top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))
       left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))

       // Additional collision detection - ensure tooltip doesn't overlap with highlighted element
       if (highlightedElement && currentStepData.position !== 'center') {
         const elementRect = highlightedElement.getBoundingClientRect()
         const tooltipLeft = left
         const tooltipRight = left + tooltipWidth
         const tooltipTop = top
         const tooltipBottom = top + tooltipHeight

         // Check if tooltip would overlap with the element
         const wouldOverlapHorizontally = tooltipLeft < elementRect.right && tooltipRight > elementRect.left
         const wouldOverlapVertically = tooltipTop < elementRect.bottom && tooltipBottom > elementRect.top

         if (wouldOverlapHorizontally && wouldOverlapVertically) {
           // Try to reposition to avoid overlap - prefer bottom position for small elements
           const spaceBelow = viewportHeight - elementRect.bottom
           const spaceAbove = elementRect.top
           const spaceLeft = elementRect.left
           const spaceRight = viewportWidth - elementRect.right

           if (spaceBelow >= tooltipHeight + padding) {
             // Position below
             top = elementRect.bottom + padding
             left = Math.max(padding, Math.min(
               elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2),
               viewportWidth - tooltipWidth - padding
             ))
           } else if (spaceAbove >= tooltipHeight + padding) {
             // Position above
             top = elementRect.top - tooltipHeight - padding
             left = Math.max(padding, Math.min(
               elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2),
               viewportWidth - tooltipWidth - padding
             ))
           } else if (spaceRight >= tooltipWidth + padding) {
             // Position to the right with more gap
             left = elementRect.right + padding + gap
             top = Math.max(padding, Math.min(
               elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2),
               viewportHeight - tooltipHeight - padding
             ))
           } else if (spaceLeft >= tooltipWidth + padding) {
             // Position to the left with more gap
             left = elementRect.left - tooltipWidth - padding - gap
             top = Math.max(padding, Math.min(
               elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2),
               viewportHeight - tooltipHeight - padding
             ))
           }
         }
       }

       // Apply dynamic sizing to tooltip
       if (tooltipRef.current) {
         tooltipRef.current.style.position = 'fixed'
         tooltipRef.current.style.top = `${top}px`
         tooltipRef.current.style.left = `${left}px`
         tooltipRef.current.style.zIndex = config.zIndex.tooltip.toString()
         tooltipRef.current.style.maxWidth = config.getMaxWidth(viewportWidth)
       }
     }

     // Small delay to ensure DOM is ready
     const timeoutId = setTimeout(updatePosition, 10)

     const handleResize = () => updatePosition()
     const handleScroll = () => updatePosition()

     window.addEventListener('resize', handleResize)
     window.addEventListener('scroll', handleScroll, true)

     return () => {
       clearTimeout(timeoutId)
       window.removeEventListener('resize', handleResize)
       window.removeEventListener('scroll', handleScroll, true)
     }
   }, [highlightedElement, currentStepData.position, isOpen])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60"
            style={{ zIndex: POSITIONING_CONFIG.zIndex.overlay }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              theme-card rounded-xl shadow-2xl border
              w-full ring-4 ring-white/10 backdrop-blur-sm
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b theme-text-primary">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {isLastStep ? (
                    <CheckCircle size={20} className="text-white" />
                  ) : (
                    <span className="text-white text-sm font-semibold">{currentStep + 1}</span>
                  )}
                </div>
                <h2 className="text-lg font-semibold theme-text-primary">
                  {t(currentStepData.title)}
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t('common.close', 'Close')}
              >
                <X size={20} className="theme-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep} // Key is crucial for AnimatePresence to detect changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="theme-text-secondary leading-relaxed mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
                    {t(currentStepData.description)}
                  </p>

                  {/* Progress bar */}
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="flex justify-between text-xs sm:text-sm theme-text-muted mb-1 sm:mb-2">
                      <span>
                        {t('onboarding.navigation.stepOf', { 
                          current: currentStep + 1, 
                          total: totalSteps 
                        })}
                      </span>
                      <span>{Math.round((currentStep + 1) / totalSteps * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep + 1) / totalSteps * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    <div className="flex gap-1 sm:gap-2">
                      {!isFirstStep && (
                        <button
                          onClick={handlePrevious}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 theme-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
                        >
                          <ArrowLeft size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">{t('onboarding.navigation.previous')}</span>
                        </button>
                      )}
                      
                      {currentStepData.allowSkip && !isLastStep && (
                        <button
                          onClick={handleSkip}
                          className="px-2 sm:px-3 md:px-4 py-2 theme-text-muted hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-xs sm:text-sm"
                        >
                          {t('onboarding.navigation.skip')}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-xs sm:text-sm"
                    >
                      {isLastStep ? (
                        <>
                          <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">{t('onboarding.navigation.finish')}</span>
                          <span className="sm:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">{t('onboarding.navigation.next')}</span>
                          <span className="sm:hidden">→</span>
                          <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight effect for highlighted elements */}
      {highlightedElement && currentStepData.position !== 'center' && (
        <style jsx global>{`
          :root {
            --onboarding-shadow-normal-start: 0 0 0 4px var(--accent-blue), 0 0 0 8px var(--accent-blue), 0 0 0 12px var(--accent-blue);
            --onboarding-shadow-normal-mid: 0 0 0 5px var(--accent-blue), 0 0 0 10px var(--accent-blue), 0 0 0 15px var(--accent-blue);
            --onboarding-overlay-light: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            --onboarding-overlay-dark: 0 0 0 9999px rgba(0, 0, 0, 0.6);
            --onboarding-highlight-z-index: ${POSITIONING_CONFIG.zIndex.highlight};
          }

          .onboarding-highlight {
            position: relative;
            z-index: var(--onboarding-highlight-z-index);
            box-shadow:
              var(--onboarding-shadow-normal-start),
              var(--onboarding-overlay-light);
            border-radius: 12px;
            transition: all 0.3s ease;
            animation: onboarding-pulse 3s ease-in-out infinite;
          }

          .dark .onboarding-highlight {
            box-shadow:
              var(--onboarding-shadow-normal-start),
              var(--onboarding-overlay-dark);
            animation: onboarding-pulse-dark 3s ease-in-out infinite;
          }

          @keyframes onboarding-pulse {
            0%, 100% {
              box-shadow:
                var(--onboarding-shadow-normal-start),
                var(--onboarding-overlay-light);
            }
            50% {
              box-shadow:
                var(--onboarding-shadow-normal-mid),
                var(--onboarding-overlay-light);
            }
          }

          @keyframes onboarding-pulse-dark {
            0%, 100% {
              box-shadow:
                var(--onboarding-shadow-normal-start),
                var(--onboarding-overlay-dark);
            }
            50% {
              box-shadow:
                var(--onboarding-shadow-normal-mid),
                var(--onboarding-overlay-dark);
            }
          }
        `}</style>
      )}
    </>
  )
}