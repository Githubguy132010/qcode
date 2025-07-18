import type { 
  ChangelogData, 
  ChangelogEntry, 
  GitHubCommit, 
  GitHubPullRequest 
} from '@/types/changelog'

// Repository configuration
const REPO_OWNER = 'Githubguy132010'
const REPO_NAME = 'qcode'
const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Fetch recent commits from GitHub API
 */
export async function fetchRecentCommits(limit = 10): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'QCode-App'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching commits:', error)
    return []
  }
}

/**
 * Fetch recent merged pull requests from GitHub API
 */
export async function fetchRecentPullRequests(limit = 10): Promise<GitHubPullRequest[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed&sort=updated&direction=desc&per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'QCode-App'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const pullRequests = await response.json()
    // Filter only merged PRs
    return pullRequests.filter((pr: GitHubPullRequest) => pr.merged_at)
  } catch (error) {
    console.error('Error fetching pull requests:', error)
    return []
  }
}

/**
 * Convert GitHub commits to changelog entries
 */
function commitsToChangelogEntries(commits: GitHubCommit[]): ChangelogEntry[] {
  return commits.map(commit => ({
    id: `commit-${commit.sha}`,
    type: 'commit' as const,
    title: commit.commit.message.split('\n')[0], // First line only
    description: commit.commit.message.split('\n').slice(1).join('\n').trim() || undefined,
    author: commit.author?.login || commit.commit.author.name,
    date: new Date(commit.commit.author.date),
    sha: commit.sha,
    url: commit.html_url
  }))
}

/**
 * Convert GitHub PRs to changelog entries
 */
function prsToChangelogEntries(prs: GitHubPullRequest[]): ChangelogEntry[] {
  return prs.map(pr => ({
    id: `pr-${pr.number}`,
    type: 'pr' as const,
    title: pr.title,
    description: pr.body || undefined,
    author: pr.user.login,
    date: new Date(pr.merged_at),
    prNumber: pr.number,
    url: pr.html_url,
    labels: pr.labels.map(label => label.name)
  }))
}

/**
 * Get the current app version from package.json
 */
function getCurrentVersion(): string {
  // In a real app, this would be injected at build time
  // For now, we'll use a simple timestamp-based version
  return `v${new Date().toISOString().split('T')[0].replace(/-/g, '.')}`
}

/**
 * Fetch and process changelog data
 */
export async function fetchChangelogData(): Promise<ChangelogData> {
  const [commits, prs] = await Promise.all([
    fetchRecentCommits(20),
    fetchRecentPullRequests(10)
  ])

  const commitEntries = commitsToChangelogEntries(commits)
  const prEntries = prsToChangelogEntries(prs)

  // Combine and sort by date (newest first)
  const allEntries = [...commitEntries, ...prEntries]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 15) // Keep only the 15 most recent

  return {
    version: getCurrentVersion(),
    entries: allEntries,
    lastFetched: new Date(),
    repository: `${REPO_OWNER}/${REPO_NAME}`
  }
}

/**
 * Get cached changelog data from localStorage
 */
export function getCachedChangelogData(): ChangelogData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem('qcode-changelog')
    if (!cached) return null

    const data = JSON.parse(cached)
    return {
      ...data,
      lastFetched: new Date(data.lastFetched),
      entries: data.entries.map((entry: Record<string, unknown>) => ({
        ...entry,
        date: new Date(entry.date as string)
      }))
    }
  } catch (error) {
    console.error('Error parsing cached changelog:', error)
    return null
  }
}

/**
 * Cache changelog data to localStorage
 */
export function cacheChangelogData(data: ChangelogData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('qcode-changelog', JSON.stringify(data))
  } catch (error) {
    console.error('Error caching changelog:', error)
  }
}

/**
 * Check if changelog should be refreshed (older than 1 hour)
 */
export function shouldRefreshChangelog(lastFetched: Date): boolean {
  const oneHour = 60 * 60 * 1000
  return Date.now() - lastFetched.getTime() > oneHour
}

/**
 * Get last seen version by user
 */
export function getLastSeenVersion(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qcode-last-seen-version')
}

/**
 * Set last seen version by user
 */
export function setLastSeenVersion(version: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('qcode-last-seen-version', version)
}

/**
 * Check if there are new changelog entries since last seen
 */
export function hasNewChangelog(): boolean {
  const cached = getCachedChangelogData()
  const lastSeen = getLastSeenVersion()
  
  if (!cached || !lastSeen) return false
  
  // Check if there are entries newer than the last seen version timestamp
  const lastSeenDate = new Date(lastSeen)
  return cached.entries.some(entry => entry.date > lastSeenDate)
}

/**
 * Fallback changelog data for offline scenarios
 */
export function getFallbackChangelogData(): ChangelogData {
  return {
    version: getCurrentVersion(),
    entries: [
      {
        id: 'fallback-1',
        type: 'commit',
        title: 'Initial changelog feature implementation',
        description: 'Added dynamic changelog popup that fetches recent commits and pull requests',
        author: 'GitHub Copilot',
        date: new Date(),
        url: undefined
      }
    ],
    lastFetched: new Date(),
    repository: `${REPO_OWNER}/${REPO_NAME}`
  }
}