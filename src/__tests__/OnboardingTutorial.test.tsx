import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OnboardingTutorial } from '@/components/OnboardingTutorial'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'onboarding.welcome.title': 'Welcome to QCode!',
        'onboarding.welcome.description': 'Let\'s take a quick tour of the app\'s main features.',
        'onboarding.navigation.next': 'Next',
        'onboarding.navigation.previous': 'Previous',
        'onboarding.navigation.skip': 'Skip Tutorial',
        'onboarding.navigation.finish': 'Finish',
        'onboarding.navigation.stepOf': 'Step {{current}} of {{total}}',
        'onboarding.completion.title': 'You\'re All Set!',
        'onboarding.completion.description': 'You\'ve completed the tutorial!',
        'onboarding.dashboardTabs.title': 'Dashboard Tabs',
        'onboarding.dashboardTabs.description': 'These tabs organize your dashboard.',
        'onboarding.overviewStats.title': 'Statistics Overview',
        'onboarding.overviewStats.description': 'Here you can see an overview of all your codes.',
        'common.close': 'Close'
      }
      return translations[key] || defaultValue || key
    }
  })
}))

describe('OnboardingTutorial', () => {
  const mockOnClose = jest.fn()
  const mockOnComplete = jest.fn()
  const mockOnSkip = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.getByText('Welcome to QCode!')).toBeInTheDocument()
    expect(screen.getByText('Let\'s take a quick tour of the app\'s main features.')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <OnboardingTutorial
        isOpen={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.queryByText('Welcome to QCode!')).not.toBeInTheDocument()
  })

  it('shows step progress', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.getByText(/Step .* of .*/)).toBeInTheDocument()
  })

  it('shows next button on first step', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows skip button on first step', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    expect(screen.getByText('Skip Tutorial')).toBeInTheDocument()
  })

  it('calls onSkip when skip button is clicked', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    fireEvent.click(screen.getByText('Skip Tutorial'))
    expect(mockOnSkip).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles tab switching for steps that require it', () => {
    // Mock scrollIntoView for DOM elements
    Element.prototype.scrollIntoView = jest.fn()

    // Mock a tab button in the DOM
    const mockTabButton = document.createElement('button')
    mockTabButton.setAttribute('data-tutorial', 'dashboard-tab-search')
    mockTabButton.click = jest.fn()
    document.body.appendChild(mockTabButton)

    // Mock a target element for the tutorial step
    const mockTargetElement = document.createElement('div')
    mockTargetElement.setAttribute('data-tutorial', 'search-filter')
    document.body.appendChild(mockTargetElement)

    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    // Navigate to a step that requires tab switching (search-filter step)
    // This would be step 6 in the new tutorial flow
    const nextButton = screen.getByText('Next')

    // Click through to reach a step with requiresTabSwitch
    for (let i = 0; i < 6; i++) {
      fireEvent.click(nextButton)
    }

    // Clean up
    document.body.removeChild(mockTabButton)
    document.body.removeChild(mockTargetElement)
  })

  it('handles overview-stats step with tab switching', () => {
    // Mock scrollIntoView for DOM elements
    Element.prototype.scrollIntoView = jest.fn()

    // Mock overview tab button
    const mockOverviewTabButton = document.createElement('button')
    mockOverviewTabButton.setAttribute('data-tutorial', 'dashboard-tab-overview')
    mockOverviewTabButton.click = jest.fn()
    document.body.appendChild(mockOverviewTabButton)

    // Mock dashboard overview element
    const mockDashboardOverview = document.createElement('div')
    mockDashboardOverview.setAttribute('data-tutorial', 'dashboard-overview')
    document.body.appendChild(mockDashboardOverview)

    render(
      <OnboardingTutorial
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    )

    // Navigate to the overview-stats step (step 4)
    const nextButton = screen.getByText('Next')

    // Click through to reach the overview-stats step
    for (let i = 0; i < 3; i++) {
      fireEvent.click(nextButton)
    }

    // Should show the overview stats step content
    expect(screen.getByText('Statistics Overview')).toBeInTheDocument()

    // Clean up
    document.body.removeChild(mockOverviewTabButton)
    document.body.removeChild(mockDashboardOverview)
  })
})