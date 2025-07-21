import type { ChangelogEntry, AIGeneratedSummary, ChangelogData } from '@/types/changelog'
import { generateAIReleaseSummaryWithRateLimit } from '@/utils/ai-release-notes'

// Storage keys
const LAST_VISIT_KEY = 'qcode-last-visit'
const CHANGELOG_CACHE_KEY = 'qcode-changelog-cache'

export const getLastVisitDate = (): Date | null => {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
  return lastVisit ? new Date(lastVisit) : null
}

export const updateLastVisitDate = (): void => {
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString())
}

export const generateAISummary = async (entries: ChangelogEntry[]): Promise<AIGeneratedSummary> => {
  return generateAIReleaseSummaryWithRateLimit(entries)
}

// Legacy fallback function (kept for compatibility, but not used)
export const generateAISummaryFallback = (entries: ChangelogEntry[]): AIGeneratedSummary => {
  // Simulate AI-generated summary based on entries
  const hasNewFeatures = entries.some(entry => 
    entry.title.toLowerCase().includes('add') || 
    entry.title.toLowerCase().includes('implement') ||
    entry.title.toLowerCase().includes('feature')
  )
  
  const hasBugFixes = entries.some(entry =>
    entry.title.toLowerCase().includes('fix') ||
    entry.title.toLowerCase().includes('bug') ||
    entry.title.toLowerCase().includes('resolve')
  )

  const hasUIChanges = entries.some(entry =>
    entry.title.toLowerCase().includes('ui') ||
    entry.title.toLowerCase().includes('design') ||
    entry.title.toLowerCase().includes('style')
  )

  const highlights: string[] = []
  let userImpact = ''

  if (hasNewFeatures) {
    highlights.push('🎉 New features have been added to improve your experience')
    userImpact += 'You now have access to new tools and functionality. '
  }

  if (hasBugFixes) {
    highlights.push('🐛 Bug fixes for a smoother experience')
    userImpact += 'The app should work more reliably. '
  }

  if (hasUIChanges) {
    highlights.push('✨ Visual improvements and design updates')
    userImpact += 'The interface has been refined for better usability. '
  }

  if (highlights.length === 0) {
    highlights.push('📝 General improvements and maintenance')
    userImpact = 'Various behind-the-scenes improvements have been made.'
  }

  const title = `${entries.length} new update${entries.length > 1 ? 's' : ''} available`
  const summary = `We've made some exciting improvements to QCode! ${userImpact.trim()}`

  return {
    title,
    summary,
    highlights,
    userImpact: userImpact.trim()
  }
}

// GitHub API types
interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author?: {
    login: string
  }
  html_url: string
}

interface GitHubPullRequest {
  number: number
  title: string
  body?: string
  user: {
    login: string
  }
  merged_at: string | null
  html_url: string
  merge_commit_sha?: string
}

export const fetchCommitsSince = async (since: Date): Promise<ChangelogEntry[]> => {
  try {
    const owner = 'Githubguy132010'
    const repo = 'qcode'
    const sinceISO = since.toISOString()
    
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'QCode-App'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const commits: GitHubCommit[] = await response.json()

    const changelogEntries: ChangelogEntry[] = commits.map((commit) => ({
      id: `commit-${commit.sha}`,
      type: 'commit' as const,
      title: commit.commit.message.split('\n')[0], // First line of commit message
      description: commit.commit.message.split('\n').slice(1).join('\n').trim() || commit.commit.message.split('\n')[0], // Rest of commit message or fallback to title
      author: commit.commit.author.name || commit.author?.login || 'Unknown',
      date: new Date(commit.commit.author.date),
      url: commit.html_url,
      sha: commit.sha
    }))

    // Filter by date (GitHub API 'since' parameter might not be precise enough)
    return changelogEntries.filter(entry => entry.date.getTime() > since.getTime())
  } catch (error) {
    console.error('Failed to fetch commits:', error)
    return []
  }
}

export const fetchPullRequestsSince = async (since: Date): Promise<ChangelogEntry[]> => {
  try {
    const owner = 'Githubguy132010'
    const repo = 'qcode'
    
    // Fetch closed PRs merged since the given date
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'QCode-App'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const pullRequests: GitHubPullRequest[] = await response.json()

    const changelogEntries: ChangelogEntry[] = pullRequests
      .filter((pr) => pr.merged_at && new Date(pr.merged_at).getTime() > since.getTime())
      .map((pr) => ({
        id: `pr-${pr.number}`,
        type: 'pr' as const,
        title: pr.title,
        description: pr.body || pr.title,
        author: pr.user.login || 'Unknown',
        date: new Date(pr.merged_at!),
        url: pr.html_url,
        prNumber: pr.number,
        sha: pr.merge_commit_sha
      }))

    return changelogEntries
  } catch (error) {
    console.error('Failed to fetch pull requests:', error)
    return []
  }
}

export const checkForUpdates = async (): Promise<ChangelogData> => {
  const lastVisit = getLastVisitDate()
  
  // If no last visit, consider it first time and don't show popup
  if (!lastVisit) {
    updateLastVisitDate()
    return {
      hasNewUpdates: false,
      lastCheckDate: new Date(),
      entries: []
    }
  }

  try {
    const [commits, prs] = await Promise.all([
      fetchCommitsSince(lastVisit),
      fetchPullRequestsSince(lastVisit)
    ])

    const allEntries = [...commits, ...prs].sort((a, b) => b.date.getTime() - a.date.getTime())
    const hasNewUpdates = allEntries.length > 0

    let aiSummary: AIGeneratedSummary | undefined
    if (hasNewUpdates) {
      aiSummary = await generateAISummary(allEntries)
    }

    const changelogData: ChangelogData = {
      hasNewUpdates,
      lastCheckDate: new Date(),
      entries: allEntries,
      aiSummary
    }

    // Cache the results
    localStorage.setItem(CHANGELOG_CACHE_KEY, JSON.stringify(changelogData))

    return changelogData
  } catch (error) {
    console.error('Failed to check for updates:', error)
    return {
      hasNewUpdates: false,
      lastCheckDate: new Date(),
      entries: []
    }
  }
}

export const getCachedChangelog = (): ChangelogData | null => {
  try {
    const cached = localStorage.getItem(CHANGELOG_CACHE_KEY)
    if (!cached) return null

    const data = JSON.parse(cached)
    // Parse dates
    data.lastCheckDate = new Date(data.lastCheckDate)
    data.entries = data.entries.map((entry: ChangelogEntry) => ({
      ...entry,
      date: new Date(entry.date)
    }))

    return data
  } catch (error) {
    console.error('Failed to parse cached changelog:', error)
    return null
  }
}