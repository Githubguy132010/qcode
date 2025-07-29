'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { OnboardingTutorialProps } from '@/types/onboarding'
import { ONBOARDING_STEPS } from '@/types/onboarding'

export function OnboardingTutorial({ isOpen, onClose, onComplete, onSkip }: OnboardingTutorialProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const totalSteps = ONBOARDING_STEPS.length

  // Function to switch tabs when required
  const switchTabIfNeeded = (tabId: string) => {
    const tabButton = document.querySelector(`[data-tutorial="dashboard-tab-${tabId}"]`) as HTMLButtonElement
    if (tabButton) {
      tabButton.click()
    }
  }

  // Handle element highlighting and positioning
  useEffect(() => {
    if (!isOpen || !currentStepData.targetElement) {
      setHighlightedElement(null)
      return
    }

    // Function to find and highlight element
    const findAndHighlightElement = () => {
      if (!currentStepData.targetElement) return null

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
        return element
      }
      return null
    }

    // Handle tab switching if required
    if (currentStepData.requiresTabSwitch) {
      switchTabIfNeeded(currentStepData.requiresTabSwitch)
    }

    // Steps that need extra time for tab content to become visible
    const stepsNeedingDelay = ['overview-stats', 'search-filter', 'categories-favorites', 'notifications']
    const needsDelay = stepsNeedingDelay.includes(currentStepData.id) || currentStepData.requiresTabSwitch

    let element: HTMLElement | null = null
    let timeoutId: NodeJS.Timeout

    if (needsDelay) {
      // For steps targeting content inside tabs, wait for animation to complete
      timeoutId = setTimeout(() => {
        element = findAndHighlightElement()
      }, 450) // Slightly longer wait for tab switching animation
    } else {
      // For other steps, find element immediately
      element = findAndHighlightElement()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (element) {
        element.classList.remove('onboarding-highlight')
      }
    }
  }, [currentStep, isOpen, currentStepData.targetElement, currentStepData.id, currentStepData.requiresTabSwitch])

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

      let top = 0
      let left = 0

      // Handle positioning based on whether we have a target element
      if (highlightedElement && currentStepData.position !== 'center') {
        const elementRect = highlightedElement.getBoundingClientRect()
        const minGap = 60 // Increased gap further to prevent overlap

        switch (currentStepData.position) {
          case 'top':
            // Position above element, but check if there's enough space
            const topPos = elementRect.top - tooltipHeight - minGap
            if (topPos < 20) {
              // Not enough space above, position below instead
              top = elementRect.bottom + minGap
            } else {
              top = topPos
            }
            // Center horizontally on element, but keep within viewport
            left = elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
            break
          case 'bottom':
            // Position below element, but check if there's enough space
            const bottomPos = elementRect.bottom + minGap
            if (bottomPos + tooltipHeight > viewportHeight - 20) {
              // Not enough space below, position above instead
              top = elementRect.top - tooltipHeight - minGap
            } else {
              top = bottomPos
            }
            left = elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2)
            break
          case 'left':
            // Position to the left of element
            const leftPos = elementRect.left - tooltipWidth - minGap
            if (leftPos < 20) {
              // Not enough space left, position right instead
              left = elementRect.right + minGap
            } else {
              left = leftPos
            }
            top = elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2)
            break
          case 'right':
            // Position to the right of element
            const rightPos = elementRect.right + minGap
            if (rightPos + tooltipWidth > viewportWidth - 20) {
              // Not enough space right, position left instead
              left = elementRect.left - tooltipWidth - minGap
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

      // Keep tooltip within viewport bounds with more padding
      const padding = 20
      const mobileViewport = viewportWidth <= 640 // sm breakpoint  
      const verySmallViewport = viewportWidth <= 375 // very small phones
      const mobilePadding = verySmallViewport ? 8 : (mobileViewport ? 12 : padding)
      
      top = Math.max(mobilePadding, Math.min(top, viewportHeight - tooltipHeight - mobilePadding))
      left = Math.max(mobilePadding, Math.min(left, viewportWidth - tooltipWidth - mobilePadding))

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
          
          if (spaceBelow >= tooltipHeight + mobilePadding) {
            // Position below
            top = elementRect.bottom + mobilePadding
            left = Math.max(mobilePadding, Math.min(
              elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2),
              viewportWidth - tooltipWidth - mobilePadding
            ))
          } else if (spaceAbove >= tooltipHeight + mobilePadding) {
            // Position above
            top = elementRect.top - tooltipHeight - mobilePadding
            left = Math.max(mobilePadding, Math.min(
              elementRect.left + (elementRect.width / 2) - (tooltipWidth / 2),
              viewportWidth - tooltipWidth - mobilePadding
            ))
          } else if (spaceRight >= tooltipWidth + mobilePadding) {
            // Position to the right with more gap
            left = elementRect.right + mobilePadding + 20
            top = Math.max(mobilePadding, Math.min(
              elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2),
              viewportHeight - tooltipHeight - mobilePadding
            ))
          } else if (spaceLeft >= tooltipWidth + mobilePadding) {
            // Position to the left with more gap
            left = elementRect.left - tooltipWidth - mobilePadding - 20
            top = Math.max(mobilePadding, Math.min(
              elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2),
              viewportHeight - tooltipHeight - mobilePadding
            ))
          }
        }
      }

      tooltipRef.current.style.position = 'fixed'
      tooltipRef.current.style.top = `${top}px`
      tooltipRef.current.style.left = `${left}px`
      tooltipRef.current.style.zIndex = '10000'
    }

    // Delay to ensure DOM is ready and animations complete
    const stepsNeedingDelay = ['overview-stats', 'search-filter', 'categories-favorites', 'notifications']
    const needsDelay = stepsNeedingDelay.includes(currentStepData.id) || currentStepData.requiresTabSwitch
    const delay = needsDelay ? 500 : 10 // Extra delay for tab content steps and tab switching

    const timeoutId = setTimeout(updatePosition, delay)

    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [highlightedElement, currentStepData.position, currentStepData.id, currentStepData.requiresTabSwitch, isOpen])

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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity z-[9998]"
      />

      {/* Tutorial Card */}
      <div
        ref={tooltipRef}
        className={`
          theme-card rounded-xl shadow-2xl border
          w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-3 md:mx-4 transition-all duration-300 transform
          ring-4 ring-white/10 backdrop-blur-sm
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{ zIndex: 10000 }}
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
        </div>
      </div>

      {/* Spotlight effect for highlighted elements */}
      {highlightedElement && currentStepData.position !== 'center' && (
        <style jsx global>{`
          :root {
            --onboarding-shadow-normal-start: 0 0 0 4px var(--accent-blue), 0 0 0 8px var(--accent-blue), 0 0 0 12px var(--accent-blue);
            --onboarding-shadow-normal-mid: 0 0 0 5px var(--accent-blue), 0 0 0 10px var(--accent-blue), 0 0 0 15px var(--accent-blue);
            --onboarding-shadow-notifications-start: 0 0 0 6px var(--accent-blue), 0 0 0 12px var(--accent-blue), 0 0 0 18px var(--accent-blue);
            --onboarding-shadow-notifications-mid: 0 0 0 8px var(--accent-blue), 0 0 0 16px var(--accent-blue), 0 0 0 24px var(--accent-blue);
            --onboarding-overlay-light: 0 0 0 9999px rgba(0, 0, 0, 0.5);
            --onboarding-overlay-dark: 0 0 0 9999px rgba(0, 0, 0, 0.6);
          }

          .onboarding-highlight {
            position: relative;
            z-index: 9999;
            box-shadow:
              ${currentStepData.id === 'notifications-archiving' ? `
                var(--onboarding-shadow-notifications-start),
                var(--onboarding-overlay-light);
              ` : `
                var(--onboarding-shadow-normal-start),
                var(--onboarding-overlay-light);
              `}
            border-radius: 12px;
            transition: all 0.3s ease;
            animation: ${currentStepData.id === 'notifications-archiving' ? 'onboarding-pulse-notifications' : 'onboarding-pulse'} 3s ease-in-out infinite;
          }
          
          .dark .onboarding-highlight {
            box-shadow:
              ${currentStepData.id === 'notifications-archiving' ? `
                var(--onboarding-shadow-notifications-start),
                var(--onboarding-overlay-dark);
              ` : `
                var(--onboarding-shadow-normal-start),
                var(--onboarding-overlay-dark);
              `}
            animation: ${currentStepData.id === 'notifications-archiving' ? 'onboarding-pulse-notifications-dark' : 'onboarding-pulse-dark'} 3s ease-in-out infinite;
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
          
          @keyframes onboarding-pulse-notifications {
            0%, 100% {
              box-shadow:
                var(--onboarding-shadow-notifications-start),
                var(--onboarding-overlay-light);
            }
            50% {
              box-shadow:
                var(--onboarding-shadow-notifications-mid),
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
          
          @keyframes onboarding-pulse-notifications-dark {
            0%, 100% {
              box-shadow:
                var(--onboarding-shadow-notifications-start),
                var(--onboarding-overlay-dark);
            }
            50% {
              box-shadow:
                var(--onboarding-shadow-notifications-mid),
                var(--onboarding-overlay-dark);
            }
          }
        `}</style>
      )}
    </>
  )
}