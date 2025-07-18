export interface ChangelogEntry {
  id: string
  type: 'commit' | 'pr' | 'release'
  title: string
  description?: string
  author: string
  date: Date
  sha?: string
  prNumber?: number
  url?: string
  labels?: string[]
}

export interface ChangelogData {
  version: string
  entries: ChangelogEntry[]
  lastFetched: Date
  repository: string
}

export interface ChangelogState {
  data: ChangelogData | null
  isLoading: boolean
  error: string | null
  lastSeenVersion?: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
  author?: {
    login: string
  }
}

export interface GitHubPullRequest {
  number: number
  title: string
  body?: string
  user: {
    login: string
  }
  merged_at: string
  html_url: string
  labels: Array<{
    name: string
    color: string
  }>
}

export interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
  showNewBadge?: boolean
}