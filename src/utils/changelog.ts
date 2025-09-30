import type { ChangelogEntry, AIGeneratedSummary, ChangelogData } from '@/types/changelog'
import i18n from '@/lib/i18n'

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

export const generateAISummary = (entries: ChangelogEntry[]): AIGeneratedSummary => {
  // Heuristic classification based on commit/PR titles
  const lowerCasedTitles = entries.map(entry => entry.title.toLowerCase());

  const hasNewFeatures = lowerCasedTitles.some(title =>
    title.includes('add') || title.includes('implement') || title.includes('feature')
  );

  const hasBugFixes = lowerCasedTitles.some(title =>
    title.includes('fix') || title.includes('bug') || title.includes('resolve')
  );

  const hasUIChanges = lowerCasedTitles.some(title =>
    title.includes('ui') || title.includes('design') || title.includes('style')
  );

  const highlights: string[] = [];
  const impactParts: string[] = [];

  if (hasNewFeatures) {
    highlights.push(i18n.t('releaseNotes.ai.highlights.newFeatures'));
    impactParts.push(i18n.t('releaseNotes.ai.userImpact.newFeatures'));
  }

  if (hasBugFixes) {
    highlights.push(i18n.t('releaseNotes.ai.highlights.bugFixes'));
    impactParts.push(i18n.t('releaseNotes.ai.userImpact.bugFixes'));
  }

  if (hasUIChanges) {
    highlights.push(i18n.t('releaseNotes.ai.highlights.uiChanges'));
    impactParts.push(i18n.t('releaseNotes.ai.userImpact.uiChanges'));
  }

  if (highlights.length === 0) {
    highlights.push(i18n.t('releaseNotes.ai.highlights.general'));
    impactParts.push(i18n.t('releaseNotes.ai.userImpact.general'));
  }

  const title = i18n.t('releaseNotes.ai.title', { count: entries.length });
  const summaryPrefix = i18n.t('releaseNotes.ai.summaryPrefix', { appName: i18n.t('common.appName') });
  const userImpact = impactParts.join(' ').trim();
  const summary = `${summaryPrefix} ${userImpact}`.trim();

  return {
    title,
    summary,
    highlights,
    userImpact,
  };
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
      aiSummary = generateAISummary(allEntries)
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