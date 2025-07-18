interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  prerelease: boolean
  draft: boolean
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  }
}

interface ChangelogData {
  hasNewChanges: boolean
  latestRelease?: GitHubRelease
  recentCommits: GitHubCommit[]
  lastChecked: string
}

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'Githubguy132010'
const REPO_NAME = 'qcode'
const STORAGE_KEY = 'qcode-changelog-data'

export async function checkForNewChanges(): Promise<ChangelogData> {
  try {
    // Get stored data to compare
    const storedData = getStoredChangelogData()
    
    // Fetch latest release
    const latestRelease = await fetchLatestRelease()
    
    // Fetch recent commits (last 10)
    const recentCommits = await fetchRecentCommits()
    
    // Check if there are new changes
    const hasNewChanges = checkForNewData(storedData, latestRelease, recentCommits)
    
    const changelogData: ChangelogData = {
      hasNewChanges,
      latestRelease,
      recentCommits,
      lastChecked: new Date().toISOString()
    }
    
    // Update stored data
    if (hasNewChanges) {
      updateStoredChangelogData(changelogData)
    }
    
    return changelogData
  } catch (error) {
    console.error('Error checking for changes:', error)
    return {
      hasNewChanges: false,
      recentCommits: [],
      lastChecked: new Date().toISOString()
    }
  }
}

async function fetchLatestRelease(): Promise<GitHubRelease | undefined> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching latest release:', error)
  }
  return undefined
}

async function fetchRecentCommits(): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=10`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching recent commits:', error)
  }
  return []
}

function getStoredChangelogData(): ChangelogData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function updateStoredChangelogData(data: ChangelogData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error storing changelog data:', error)
  }
}

function checkForNewData(
  storedData: ChangelogData | null,
  latestRelease: GitHubRelease | undefined,
  recentCommits: GitHubCommit[]
): boolean {
  if (!storedData) {
    // First time checking - consider it as new changes
    return latestRelease !== undefined || recentCommits.length > 0
  }
  
  // Check for new release
  if (latestRelease && (!storedData.latestRelease || latestRelease.id !== storedData.latestRelease.id)) {
    return true
  }
  
  // Check for new commits
  if (recentCommits.length > 0 && storedData.recentCommits.length > 0) {
    const latestStoredCommitSha = storedData.recentCommits[0]?.sha
    const latestCurrentCommitSha = recentCommits[0]?.sha
    
    if (latestStoredCommitSha !== latestCurrentCommitSha) {
      return true
    }
  }
  
  return false
}

export function generateAISummary(changelogData: ChangelogData): string {
  // Simple AI-like summary generation
  // In a real implementation, this would call an AI service
  
  const { latestRelease, recentCommits } = changelogData
  
  let summary = "🎉 **New updates available!**\n\n"
  
  if (latestRelease) {
    summary += `**Latest Release: ${latestRelease.name || latestRelease.tag_name}**\n`
    
    // Extract key features from release notes
    const releaseBody = latestRelease.body || ''
    const features = extractFeatures(releaseBody)
    
    if (features.length > 0) {
      summary += "✨ **What's New:**\n"
      features.forEach(feature => {
        summary += `• ${feature}\n`
      })
    }
    
    summary += "\n"
  }
  
  if (recentCommits.length > 0) {
    summary += "📝 **Recent Improvements:**\n"
    const recentFeatures = recentCommits
      .slice(0, 3) // Show top 3 commits
      .map(commit => extractCommitFeature(commit.commit.message))
      .filter(feature => feature.length > 0)
    
    recentFeatures.forEach(feature => {
      summary += `• ${feature}\n`
    })
  }
  
  summary += "\n💡 *These updates help make QCode better for managing your discount codes!*"
  
  return summary
}

function extractFeatures(releaseBody: string): string[] {
  const features: string[] = []
  
  // Look for common patterns in release notes
  const lines = releaseBody.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Look for bullet points, features, additions
    if (trimmedLine.match(/^[-*+]\s+/)) {
      const feature = trimmedLine.replace(/^[-*+]\s+/, '').trim()
      if (feature.length > 0) {
        features.push(feature)
      }
    }
    
    // Look for "Add", "Fix", "Improve" patterns
    if (trimmedLine.match(/^(Add|Fix|Improve|Update|New)/i)) {
      features.push(trimmedLine)
    }
  }
  
  return features.slice(0, 5) // Limit to 5 features
}

function extractCommitFeature(commitMessage: string): string {
  // Clean up commit message to be user-friendly
  const firstLine = commitMessage.split('\n')[0].trim()
  
  // Remove common prefixes
  const cleanMessage = firstLine
    .replace(/^(feat|fix|chore|docs|style|refactor|test):\s*/i, '')
    .replace(/^(add|fix|improve|update|remove)\s+/i, '')
  
  // Capitalize first letter
  return cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1)
}

export function markChangelogAsViewed(): void {
  const storedData = getStoredChangelogData()
  if (storedData) {
    storedData.hasNewChanges = false
    updateStoredChangelogData(storedData)
  }
}