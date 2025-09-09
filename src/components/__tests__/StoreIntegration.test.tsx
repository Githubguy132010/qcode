import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HomePage from '@/app/page'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { useOnboarding } from '@/hooks/useOnboarding'

// Mock the hooks
jest.mock('@/hooks/useDiscountCodes')
jest.mock('@/hooks/useOnboarding')

// Mock fetch API
window.fetch = jest.fn()
// Mock alert
window.alert = jest.fn()

describe('Store Integration E2E Test', () => {
  const mockAddCode = jest.fn()
  const mockUseDiscountCodes = useDiscountCodes as jest.Mock
  const mockUseOnboarding = useOnboarding as jest.Mock

  beforeEach(() => {
    // Reset mocks and localStorage before each test
    mockAddCode.mockClear();
    (window.fetch as jest.Mock).mockClear();
    (window.alert as jest.Mock).mockClear();
    localStorage.clear()

    // Default mock for useOnboarding to prevent tutorial from showing
    mockUseOnboarding.mockReturnValue({
      state: { isActive: false, currentStep: 0 },
      startTutorial: jest.fn(),
      skipTutorial: jest.fn(),
      completeTutorial: jest.fn(),
      closeTutorial: jest.fn(),
      resetTutorial: jest.fn(),
      shouldShowTutorial: false,
      isInitialized: true,
    })
  })

  it('allows user to select a store, fetch coupons, and see them added to the list', async () => {
    // Start with one existing code so the fetch button is visible
    const existingCode = {
      id: '1',
      code: 'EXISTING',
      store: 'Test',
      isArchived: false,
      isFavorite: false,
      dateAdded: new Date(),
      timesUsed: 0,
      discount: '10%',
      category: 'Anders',
    }
    mockUseDiscountCodes.mockReturnValue({
      codes: [existingCode],
      isLoading: false,
      addCode: mockAddCode,
      deleteCode: jest.fn(),
      toggleFavorite: jest.fn(),
      toggleArchived: jest.fn(),
      incrementUsage: jest.fn(),
      isExpired: jest.fn().mockReturnValue(false),
      filterCodes: jest.fn(() => [existingCode]),
      getStats: jest.fn().mockReturnValue({}),
      getExpiringSoon: jest.fn().mockReturnValue([]),
    })

    render(<HomePage />)

    // 1. Open Settings and select a store
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)

    // Wait for the modal to appear and select the 'Amazon' checkbox
    const amazonCheckbox = await screen.findByLabelText('Amazon')
    fireEvent.click(amazonCheckbox)

    // Close the modal
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    fireEvent.click(closeButtons[0])

    // 2. Mock the API response
    const fetchedCoupons = [
      { code: 'FETCHEDCODE1', store: 'Amazon', discount: '20%' },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fetchedCoupons,
    })

    // 3. Click the "Fetch Coupons" button
    const fetchButton = screen.getByRole('button', { name: /fetch coupons/i })
    fireEvent.click(fetchButton)

    // 4. Verify API call and that new codes are added
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/scrape?store=amazon')
    })

    await waitFor(() => {
      expect(mockAddCode).toHaveBeenCalledWith(fetchedCoupons[0])
    })

    // 5. Verify the user is notified
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Finished fetching. Added 1 new coupons.')
    })
  })
})
