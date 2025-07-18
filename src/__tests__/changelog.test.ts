import {
  getCachedChangelogData,
  cacheChangelogData,
  shouldRefreshChangelog,
  getLastSeenVersion,
  setLastSeenVersion,
  hasNewChangelog,
  getFallbackChangelogData
} from '../utils/changelog'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

const mockChangelogData = {
  version: 'v2024.01.01',
  entries: [
    {
      id: 'commit-123',
      type: 'commit' as const,
      title: 'Fix issue with modal rendering',
      description: 'Fixed a bug where modals would not render correctly',
      author: 'testuser',
      date: new Date('2024-01-01T10:00:00Z'),
      sha: '123abc',
      url: 'https://github.com/test/repo/commit/123abc'
    }
  ],
  lastFetched: new Date('2024-01-03T09:00:00Z'),
  repository: 'test/repo'
}

describe('changelog utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('cacheChangelogData and getCachedChangelogData', () => {
    it('should cache and retrieve changelog data', () => {
      cacheChangelogData(mockChangelogData)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'qcode-changelog',
        JSON.stringify(mockChangelogData)
      )
    })

    it('should return null when no cached data exists', () => {
      const result = getCachedChangelogData()
      expect(result).toBeNull()
    })

    it('should parse cached data correctly', () => {
      const cachedString = JSON.stringify(mockChangelogData)
      localStorageMock.getItem.mockReturnValue(cachedString)

      const result = getCachedChangelogData()
      
      expect(result).toBeTruthy()
      expect(result?.version).toBe(mockChangelogData.version)
      expect(result?.entries).toHaveLength(1)
      expect(result?.entries[0].title).toBe('Fix issue with modal rendering')
    })

    it('should handle invalid cached data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const result = getCachedChangelogData()
      expect(result).toBeNull()
    })
  })

  describe('shouldRefreshChangelog', () => {
    it('should return true for data older than 1 hour', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(shouldRefreshChangelog(twoHoursAgo)).toBe(true)
    })

    it('should return false for recent data', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      expect(shouldRefreshChangelog(thirtyMinutesAgo)).toBe(false)
    })
  })

  describe('version tracking', () => {
    it('should get and set last seen version', () => {
      const version = '2024-01-01T10:00:00.000Z'
      
      setLastSeenVersion(version)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'qcode-last-seen-version',
        version
      )

      localStorageMock.getItem.mockReturnValue(version)
      expect(getLastSeenVersion()).toBe(version)
    })

    it('should return null when no last seen version exists', () => {
      expect(getLastSeenVersion()).toBeNull()
    })
  })

  describe('hasNewChangelog', () => {
    it('should return false when no cached data exists', () => {
      expect(hasNewChangelog()).toBe(false)
    })

    it('should return false when no last seen version exists', () => {
      const cachedString = JSON.stringify(mockChangelogData)
      localStorageMock.getItem.mockReturnValueOnce(cachedString).mockReturnValueOnce(null)
      
      expect(hasNewChangelog()).toBe(false)
    })

    it('should return true when there are newer entries', () => {
      const oldDate = '2023-12-31T10:00:00.000Z'
      const cachedString = JSON.stringify(mockChangelogData)
      
      localStorageMock.getItem
        .mockReturnValueOnce(cachedString) // for getCachedChangelogData
        .mockReturnValueOnce(oldDate) // for getLastSeenVersion
      
      expect(hasNewChangelog()).toBe(true)
    })

    it('should return false when all entries are older than last seen', () => {
      const newDate = '2024-12-31T10:00:00.000Z'
      const cachedString = JSON.stringify(mockChangelogData)
      
      localStorageMock.getItem
        .mockReturnValueOnce(cachedString) // for getCachedChangelogData
        .mockReturnValueOnce(newDate) // for getLastSeenVersion
      
      expect(hasNewChangelog()).toBe(false)
    })
  })

  describe('getFallbackChangelogData', () => {
    it('should return fallback data with current timestamp', () => {
      const result = getFallbackChangelogData()
      
      expect(result.version).toBeTruthy()
      expect(result.entries).toHaveLength(1)
      expect(result.entries[0].title).toBe('Initial changelog feature implementation')
      expect(result.repository).toBe('Githubguy132010/qcode')
    })
  })
})