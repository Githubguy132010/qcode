import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OnboardingTutorial } from '@/components/OnboardingTutorial'
import { render, screen, fireEvent } from '@testing-library/react'

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


})