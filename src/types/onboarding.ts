export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetElement?: string // CSS selector for element highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  allowSkip?: boolean
  requiresTabSwitch?: string // Tab ID to switch to before showing this step
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
    id: 'dashboard-overview',
    title: 'onboarding.dashboard.title',
    description: 'onboarding.dashboard.description',
    targetElement: '[data-tutorial="dashboard"]',
    position: 'bottom'
  },
  {
    id: 'dashboard-tabs',
    title: 'onboarding.dashboardTabs.title',
    description: 'onboarding.dashboardTabs.description',
    targetElement: '[data-tutorial="dashboard-tabs"]',
    position: 'bottom'
  },
  {
    id: 'overview-stats',
    title: 'onboarding.overviewStats.title',
    description: 'onboarding.overviewStats.description',
    targetElement: '[data-tutorial="dashboard-overview"]',
    position: 'bottom',
    requiresTabSwitch: 'overview'
  },
  {
    id: 'add-code',
    title: 'onboarding.addCode.title',
    description: 'onboarding.addCode.description',
    targetElement: '[data-tutorial="add-button"]',
    position: 'bottom'
  },
  {
    id: 'search-tab',
    title: 'onboarding.searchTab.title',
    description: 'onboarding.searchTab.description',
    targetElement: '[data-tutorial="dashboard-tab-search"]',
    position: 'bottom'
  },
  {
    id: 'search-filter',
    title: 'onboarding.searchFilter.title',
    description: 'onboarding.searchFilter.description',
    targetElement: '[data-tutorial="search-filter"]',
    position: 'bottom',
    requiresTabSwitch: 'search'
  },
  {
    id: 'categories-favorites',
    title: 'onboarding.categories.title',
    description: 'onboarding.categories.description',
    targetElement: '[data-tutorial="categories"]',
    position: 'right',
    requiresTabSwitch: 'search'
  },
  {
    id: 'notifications-tab',
    title: 'onboarding.notificationsTab.title',
    description: 'onboarding.notificationsTab.description',
    targetElement: '[data-tutorial="dashboard-tab-notifications"]',
    position: 'bottom'
  },
  {
    id: 'notifications',
    title: 'onboarding.notifications.title',
    description: 'onboarding.notifications.description',
    targetElement: '[data-tutorial="dashboard-notifications"]',
    position: 'bottom',
    requiresTabSwitch: 'notifications'
  },
  {
    id: 'completion',
    title: 'onboarding.completion.title',
    description: 'onboarding.completion.description',
    position: 'center'
  }
]