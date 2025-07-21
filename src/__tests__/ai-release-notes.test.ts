import { generateAIReleaseSummary } from '@/utils/ai-release-notes'
import type { ChangelogEntry } from '@/types/changelog'

// Mock fetch for testing
global.fetch = jest.fn()

describe('AI Release Notes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockEntries: ChangelogEntry[] = [
    {
      id: 'commit-1',
      type: 'commit',
      title: 'Add new discount code search feature',
      description: 'Implemented fuzzy search functionality for better code discovery',
      author: 'testuser',
      date: new Date('2024-01-01'),
      url: 'https://github.com/test/repo/commit/1',
      sha: 'abc123'
    },
    {
      id: 'pr-2',
      type: 'pr',
      title: 'Fix bug in expiry date calculation',
      description: 'Resolved issue where expired codes were showing as active',
      author: 'developer',
      date: new Date('2024-01-02'),
      url: 'https://github.com/test/repo/pull/2',
      prNumber: 2
    }
  ]

  const mockAIResponse = {
    title: '2 new improvements available',
    summary: 'We\'ve enhanced your discount code management experience with better search capabilities and important bug fixes.',
    highlights: [
      '🎉 New fuzzy search helps you find codes faster',
      '🐛 Fixed expiry date issues for more accurate tracking'
    ],
    userImpact: 'You can now find your codes more easily and trust that expiry dates are calculated correctly.'
  }

  it('should generate AI summary successfully', async () => {
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAIResponse
    })

    const result = await generateAIReleaseSummary(mockEntries)

    expect(fetch).toHaveBeenCalledWith('/api/ai-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries: mockEntries }),
    })

    expect(result).toEqual(mockAIResponse)
  })

  it('should handle API rate limiting', async () => {
    // Mock rate limit response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' })
    })

    const result = await generateAIReleaseSummary(mockEntries)

    // Should return fallback summary
    expect(result.title).toContain('2 new update')
    expect(result.summary).toContain('improvements')
    expect(result.highlights).toBeInstanceOf(Array)
    expect(result.highlights.length).toBeGreaterThan(0)
    expect(result.userImpact).toBeTruthy()
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await generateAIReleaseSummary(mockEntries)

    // Should return fallback summary
    expect(result.title).toContain('2 new update')
    expect(result.summary).toContain('improvements')
    expect(result.highlights).toBeInstanceOf(Array)
    expect(result.userImpact).toBeTruthy()
  })

  it('should handle invalid API response', async () => {
    // Mock invalid response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'response' })
    })

    const result = await generateAIReleaseSummary(mockEntries)

    // Should return fallback summary
    expect(result.title).toContain('2 new update')
    expect(result.summary).toContain('improvements')
    expect(result.highlights).toBeInstanceOf(Array)
    expect(result.userImpact).toBeTruthy()
  })

  it('should handle empty entries', async () => {
    const result = await generateAIReleaseSummary([])

    // Should still return a valid summary
    expect(result.title).toBeTruthy()
    expect(result.summary).toBeTruthy()
    expect(result.highlights).toBeInstanceOf(Array)
    expect(result.userImpact).toBeTruthy()
  })
})
