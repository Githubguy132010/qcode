import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedDashboardCard } from '@/components/UnifiedDashboardCard'
import type { DiscountCode, SearchFilters } from '@/types/discount-code'

describe('UnifiedDashboardCard', () => {
  const mockStats = {
    total: 10,
    active: 8,
    expired: 2,
    favorites: 3,
    archived: 1,
    totalUsages: 25,
    expiringSoon: 2
  }

  const mockFilters: SearchFilters = {
    searchTerm: '',
    category: 'all',
    sortBy: 'dateAdded',
    filterBy: 'all'
  }

  const mockExpiringSoon: DiscountCode[] = [
    {
      id: '1',
      code: 'EXPIRE1',
      store: 'TestStore',
      discount: '10%',
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires tomorrow
      category: 'Test',
      description: 'Test code',
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(),
      timesUsed: 0
    }
  ]

  const defaultProps = {
    stats: mockStats,
    filters: mockFilters,
    onFiltersChange: jest.fn(),
    expiringSoon: mockExpiringSoon,
    showNotificationBanner: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the unified dashboard card component', () => {
    render(<UnifiedDashboardCard {...defaultProps} />)

    // Check that the component renders without crashing by looking for tab buttons
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /search/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument()
  })

  it('auto-switches to notifications tab when showNotificationBanner is true', () => {
    render(<UnifiedDashboardCard {...defaultProps} showNotificationBanner={true} />)

    // Should automatically show notifications tab content
    expect(screen.getByText('Discount code expiring soon')).toBeInTheDocument()
  })

  it('shows notification badge when there are expiring codes', () => {
    render(<UnifiedDashboardCard {...defaultProps} />)

    // Should show badge with count of expiring codes on notifications tab
    const notificationsTab = screen.getByRole('tab', { name: /notifications/i })
    expect(notificationsTab).toBeInTheDocument()
    // The badge should be visible within the notifications tab
    expect(notificationsTab.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('switches to search tab and shows search content', () => {
    render(<UnifiedDashboardCard {...defaultProps} />)

    // Click search tab
    const searchTab = screen.getByRole('tab', { name: /search/i })
    fireEvent.click(searchTab)

    // Should show search content
    expect(screen.getByText('Search & Filter')).toBeInTheDocument()
  })
})
