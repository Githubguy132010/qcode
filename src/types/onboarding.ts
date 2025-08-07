export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetElement?: string // CSS selector for element highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  allowSkip?: boolean
}

export interface OnboardingState {
  isActive: boolean
  currentStep: number
  isCompleted: boolean
  canSkip: boolean
}

export interface OnboardingTutorialProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  onSkip: () => void
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'onboarding.welcome.title',
    description: 'onboarding.welcome.description',
    position: 'center',
    allowSkip: true
  },
  {
    id: 'add-code',
    title: 'onboarding.addCode.title', 
    description: 'onboarding.addCode.description',
    targetElement: '[data-tutorial="add-button"]',
    position: 'bottom'
  },
  {
    id: 'search-filter',
    title: 'onboarding.searchFilter.title',
    description: 'onboarding.searchFilter.description', 
    targetElement: '[data-tutorial="search-filter"]',
    position: 'bottom'
  },
  {
    id: 'categories-favorites',
    title: 'onboarding.categories.title',
    description: 'onboarding.categories.description',
    targetElement: '[data-tutorial="categories"]',
    position: 'right'
  },
  {
    id: 'view-toggle',
    title: 'onboarding.viewToggle.title',
    description: 'onboarding.viewToggle.description',
    targetElement: '[data-tutorial="view-toggle"]',
    position: 'bottom'
  },
  {
    id: 'notifications-archiving',
    title: 'onboarding.notifications.title',
    description: 'onboarding.notifications.description',
    targetElement: '[data-tutorial="notifications"]',
    position: 'bottom'
  },
  {
    id: 'completion',
    title: 'onboarding.completion.title',
    description: 'onboarding.completion.description',
    position: 'center'
  }
]