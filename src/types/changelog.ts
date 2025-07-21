export interface ChangelogEntry {
  id: string
  type: 'commit' | 'pr'
  title: string
  description: string
  author: string
  date: Date
  url: string
  sha?: string
  prNumber?: number
}

export interface AIGeneratedSummary {
  title: string
  summary: string
  highlights: string[]
  userImpact: string
}

export interface ChangelogData {
  hasNewUpdates: boolean
  lastCheckDate: Date
  entries: ChangelogEntry[]
  aiSummary?: AIGeneratedSummary
}

export interface DeveloperSettings {
  showAdvancedReleaseNotes: boolean
  enableChangelogPopup: boolean
  enableAIReleaseNotes: boolean
  aiProvider: 'gemini' | 'fallback'
}