import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ChangelogModal } from '../components/ChangelogModal'
import * as changelogUtils from '../utils/changelog'

// Mock the changelog utils
jest.mock('../utils/changelog', () => ({
  fetchChangelogData: jest.fn(),
  getCachedChangelogData: jest.fn(),
  cacheChangelogData: jest.fn(),
  shouldRefreshChangelog: jest.fn(),
  getFallbackChangelogData: jest.fn(),
  setLastSeenVersion: jest.fn(),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key
  })
}))

const mockChangelogData = {
  version: 'v2024.01.01',
  entries: [
    {
      id: 'commit-123',
      type: 'commit' as const,
      title: 'Fix issue with modal rendering',
      description: 'Fixed a bug where modals would not render correctly on mobile devices',
      author: 'testuser',
      date: new Date('2024-01-01T10:00:00Z'),
      sha: '123abc',
      url: 'https://github.com/test/repo/commit/123abc'
    },
    {
      id: 'pr-456',
      type: 'pr' as const,
      title: 'Add new feature for user management',
      description: 'Added comprehensive user management features',
      author: 'anotheruser',
      date: new Date('2024-01-02T15:30:00Z'),
      prNumber: 456,
      url: 'https://github.com/test/repo/pull/456',
      labels: ['feature', 'enhancement']
    }
  ],
  lastFetched: new Date('2024-01-03T09:00:00Z'),
  repository: 'test/repo'
}

const mockedUtils = changelogUtils as jest.Mocked<typeof changelogUtils>

describe('ChangelogModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUtils.getCachedChangelogData.mockReturnValue(null)
    mockedUtils.shouldRefreshChangelog.mockReturnValue(false)
    mockedUtils.fetchChangelogData.mockResolvedValue(mockChangelogData)
    mockedUtils.getFallbackChangelogData.mockReturnValue(mockChangelogData)
  })

  it('should not render when closed', () => {
    render(<ChangelogModal isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByText('changelog.title')).not.toBeInTheDocument()
  })

  it('should render when opened', () => {
    render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('changelog.title')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('changelog.loadingTitle')).toBeInTheDocument()
  })

  it('should display changelog entries after loading', async () => {
    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    })

    await waitFor(() => {
      expect(screen.getByText('Fix issue with modal rendering')).toBeInTheDocument()
      expect(screen.getByText('Add new feature for user management')).toBeInTheDocument()
    })
  })

  it('should show new badge when showNewBadge is true', () => {
    render(<ChangelogModal isOpen={true} onClose={jest.fn()} showNewBadge={true} />)
    expect(screen.getByText('changelog.newBadge')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    
    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={onClose} />)
    })
    
    const closeButton = screen.getByText('common.close')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('should switch between tabs', async () => {
    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    })

    await waitFor(() => {
      expect(screen.getByText('Fix issue with modal rendering')).toBeInTheDocument()
    })

    // Click on "All Updates" tab
    const allTab = screen.getByText('changelog.tabs.all')
    fireEvent.click(allTab)

    // Should still show entries (this is a basic test of tab switching)
    expect(screen.getByText('Fix issue with modal rendering')).toBeInTheDocument()
  })

  it('should handle fetch error gracefully', async () => {
    mockedUtils.fetchChangelogData.mockRejectedValue(new Error('Network error'))
    
    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    })

    await waitFor(() => {
      // Should show fallback data instead of error
      expect(screen.getByText('Fix issue with modal rendering')).toBeInTheDocument()
    })
  })

  it('should set last seen version when opened', async () => {
    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    })
    expect(mockedUtils.setLastSeenVersion).toHaveBeenCalled()
  })

  it('should use cached data when available and fresh', async () => {
    const cachedData = { ...mockChangelogData, lastFetched: new Date() }
    mockedUtils.getCachedChangelogData.mockReturnValue(cachedData)
    mockedUtils.shouldRefreshChangelog.mockReturnValue(false)

    await act(async () => {
      render(<ChangelogModal isOpen={true} onClose={jest.fn()} />)
    })

    expect(mockedUtils.getCachedChangelogData).toHaveBeenCalled()
    expect(mockedUtils.fetchChangelogData).not.toHaveBeenCalled()
  })
})