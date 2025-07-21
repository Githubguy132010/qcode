import type { ChangelogEntry, AIGeneratedSummary, DeveloperSettings } from '@/types/changelog'

/**
 * Get current developer settings
 */
function getDeveloperSettings(): DeveloperSettings {
  const defaultSettings: DeveloperSettings = {
    showAdvancedReleaseNotes: false,
    enableChangelogPopup: true,
    enableAIReleaseNotes: true,
    aiProvider: 'gemini'
  }
  
  try {
    const saved = localStorage.getItem('qcode-developer-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure aiProvider has a valid value
      return {
        ...defaultSettings,
        ...parsed,
        aiProvider: parsed.aiProvider === 'fallback' ? 'fallback' : 'gemini'
      }
    }
    return defaultSettings
  } catch {
    return defaultSettings
  }
}

/**
 * Generates an AI-powered release notes summary using Gemini 2.0 Flash Lite
 * @param entries Array of changelog entries (commits and PRs)
 * @returns Promise with AI-generated summary
 */
export async function generateAIReleaseSummary(entries: ChangelogEntry[]): Promise<AIGeneratedSummary> {
  const settings = getDeveloperSettings()
  
  // If AI is disabled or user prefers fallback, use fallback directly
  if (!settings.enableAIReleaseNotes || settings.aiProvider === 'fallback') {
    console.log('AI disabled or fallback preferred, using fallback summary')
    return generateFallbackSummary(entries)
  }

  try {
    // Call our secure API endpoint
    const response = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entries }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn('AI summary rate limited, using fallback')
        }
        return generateFallbackSummary(entries)
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const aiSummary = await response.json()
    
    // Validate the response
    if (!aiSummary.title || !aiSummary.summary || !aiSummary.highlights || !aiSummary.userImpact) {
      throw new Error('Invalid API response structure')
    }

    return aiSummary
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to generate AI summary:', error)
    }
    return generateFallbackSummary(entries)
  }
}

/**
 * Fallback summary generation when AI is unavailable
 * This is the original mock function, kept as a reliable fallback
 */
export function generateFallbackSummary(entries: ChangelogEntry[]): AIGeneratedSummary {
  const hasNewFeatures = entries.some(entry => 
    entry.title.toLowerCase().includes('add') || 
    entry.title.toLowerCase().includes('implement') ||
    entry.title.toLowerCase().includes('feature') ||
    entry.title.toLowerCase().includes('new')
  )
  
  const hasBugFixes = entries.some(entry =>
    entry.title.toLowerCase().includes('fix') ||
    entry.title.toLowerCase().includes('bug') ||
    entry.title.toLowerCase().includes('resolve') ||
    entry.title.toLowerCase().includes('patch')
  )

  const hasUIChanges = entries.some(entry =>
    entry.title.toLowerCase().includes('ui') ||
    entry.title.toLowerCase().includes('design') ||
    entry.title.toLowerCase().includes('style') ||
    entry.title.toLowerCase().includes('layout') ||
    entry.title.toLowerCase().includes('theme')
  )

  const hasPerformanceImprovements = entries.some(entry =>
    entry.title.toLowerCase().includes('performance') ||
    entry.title.toLowerCase().includes('optimize') ||
    entry.title.toLowerCase().includes('speed') ||
    entry.title.toLowerCase().includes('improve')
  )

  const highlights: string[] = []
  let userImpact = ''

  if (hasNewFeatures) {
    highlights.push('🎉 New features have been added to improve your discount code management')
    userImpact += 'You now have access to new tools and functionality. '
  }

  if (hasBugFixes) {
    highlights.push('🐛 Bug fixes for a smoother and more reliable experience')
    userImpact += 'The app should work more reliably without unexpected issues. '
  }

  if (hasUIChanges) {
    highlights.push('✨ Visual improvements and design updates for better usability')
    userImpact += 'The interface has been refined to make managing your codes easier. '
  }

  if (hasPerformanceImprovements) {
    highlights.push('🔧 Performance optimizations for faster loading and responsiveness')
    userImpact += 'The app should feel snappier and more responsive. '
  }

  if (highlights.length === 0) {
    highlights.push('📝 General improvements and maintenance updates')
    highlights.push('🔧 Behind-the-scenes optimizations for better stability')
    userImpact = 'Various improvements have been made to enhance your experience.'
  }

  // Limit to 5 highlights maximum
  const limitedHighlights = highlights.slice(0, 5)

  const title = `${entries.length} new update${entries.length > 1 ? 's' : ''} available`
  const summary = `We've made some exciting improvements to QCode! ${userImpact.trim()} Check out what's new below.`

  return {
    title,
    summary,
    highlights: limitedHighlights,
    userImpact: userImpact.trim() || 'Your discount code management experience has been improved.'
  }
}

/**
 * Rate limiting helper to prevent excessive API calls
 */
class RateLimiter {
  private static lastCall = 0
  private static get MIN_INTERVAL(): number {
    return Number(process.env.RATE_LIMIT_INTERVAL) || 5000; // Default to 5 seconds
  }

  static async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCall
    
    if (timeSinceLastCall < this.MIN_INTERVAL) {
      const waitTime = this.MIN_INTERVAL - timeSinceLastCall
      console.log(`Rate limiting: waiting ${waitTime}ms before AI call`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastCall = Date.now()
  }
}

/**
 * Wrapper function that includes rate limiting
 */
export async function generateAIReleaseSummaryWithRateLimit(entries: ChangelogEntry[]): Promise<AIGeneratedSummary> {
  await RateLimiter.waitIfNeeded()
  return generateAIReleaseSummary(entries)
}
