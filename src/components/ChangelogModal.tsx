import { useState, useEffect } from 'react'
import { X, ExternalLink, GitCommit, GitPullRequest, Tag, AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ChangelogModalProps, ChangelogData, ChangelogEntry } from '@/types/changelog'
import { 
  fetchChangelogData, 
  getCachedChangelogData, 
  cacheChangelogData, 
  shouldRefreshChangelog,
  getFallbackChangelogData,
  setLastSeenVersion
} from '@/utils/changelog'

export function ChangelogModal({ isOpen, onClose, showNewBadge = false }: ChangelogModalProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<ChangelogData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent')
  const [filter, setFilter] = useState<'all' | 'commits' | 'prs' | 'releases'>('all')

  useEffect(() => {
    if (isOpen) {
      loadChangelog()
      // Mark as seen when opened
      setLastSeenVersion(new Date().toISOString())
    }
  }, [isOpen])

  const loadChangelog = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to get cached data first
      const cached = getCachedChangelogData()
      
      if (cached && !shouldRefreshChangelog(cached.lastFetched)) {
        setData(cached)
        setIsLoading(false)
        return
      }

      // Set cached data while fetching new data
      if (cached) {
        setData(cached)
      }

      // Fetch fresh data
      const freshData = await fetchChangelogData()
      setData(freshData)
      cacheChangelogData(freshData)
    } catch (err) {
      console.error('Error loading changelog:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Use cached data as fallback
      const cached = getCachedChangelogData()
      if (cached) {
        setData(cached)
      } else {
        // Use fallback data if no cache available
        setData(getFallbackChangelogData())
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMinutes < 1) return t('changelog.timeAgo.now')
    if (diffMinutes === 1) return t('changelog.timeAgo.minute')
    if (diffMinutes < 60) return t('changelog.timeAgo.minutes', { count: diffMinutes })
    if (diffHours === 1) return t('changelog.timeAgo.hour')
    if (diffHours < 24) return t('changelog.timeAgo.hours', { count: diffHours })
    if (diffDays === 1) return t('changelog.timeAgo.day')
    if (diffDays < 7) return t('changelog.timeAgo.days', { count: diffDays })
    if (diffWeeks === 1) return t('changelog.timeAgo.week')
    if (diffWeeks < 4) return t('changelog.timeAgo.weeks', { count: diffWeeks })
    if (diffMonths === 1) return t('changelog.timeAgo.month')
    return t('changelog.timeAgo.months', { count: diffMonths })
  }

  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit size={16} className="text-blue-600 dark:text-blue-400" />
      case 'pr':
        return <GitPullRequest size={16} className="text-green-600 dark:text-green-400" />
      case 'release':
        return <Tag size={16} className="text-purple-600 dark:text-purple-400" />
      default:
        return <GitCommit size={16} className="text-gray-600 dark:text-gray-400" />
    }
  }

  const filterEntries = (entries: ChangelogEntry[]): ChangelogEntry[] => {
    let filtered = entries

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(entry => {
        switch (filter) {
          case 'commits':
            return entry.type === 'commit'
          case 'prs':
            return entry.type === 'pr'
          case 'releases':
            return entry.type === 'release'
          default:
            return true
        }
      })
    }

    // Apply tab filter
    if (activeTab === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(entry => entry.date > oneWeekAgo)
    }

    return filtered
  }

  if (!isOpen) return null

  const filteredEntries = data ? filterEntries(data.entries) : []

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold theme-text-primary">{t('changelog.title')}</h2>
            {showNewBadge && (
              <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                {t('changelog.newBadge')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs and Filters */}
        <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 pb-4">
            {/* Tabs */}
            <nav className="flex space-x-8 mb-4 sm:mb-0">
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'recent'
                    ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {t('changelog.tabs.recent')}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {t('changelog.tabs.all')}
              </button>
            </nav>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="theme-filter text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('changelog.filters.all')}</option>
              <option value="commits">{t('changelog.filters.commits')}</option>
              <option value="prs">{t('changelog.filters.prs')}</option>
              <option value="releases">{t('changelog.filters.releases')}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Loading State */}
          {isLoading && !data && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <h3 className="text-lg font-medium theme-text-primary mb-2">{t('changelog.loadingTitle')}</h3>
              <p className="theme-text-secondary">{t('changelog.subtitle')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !data && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-4" />
              <h3 className="text-lg font-medium theme-text-primary mb-2">{t('changelog.errorTitle')}</h3>
              <p className="theme-text-secondary mb-4">{t('changelog.errorDescription')}</p>
              <button
                onClick={loadChangelog}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <RefreshCw size={16} />
                {t('changelog.retryButton')}
              </button>
            </div>
          )}

          {/* Empty State */}
          {data && filteredEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <GitCommit className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium theme-text-primary mb-2">{t('changelog.emptyTitle')}</h3>
              <p className="theme-text-secondary">{t('changelog.emptyDescription')}</p>
            </div>
          )}

          {/* Changelog Entries */}
          {data && filteredEntries.length > 0 && (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="theme-filter rounded-lg p-4 border border-gray-200 dark:border-[var(--card-border)] hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon(entry.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium theme-text-primary text-sm leading-tight">
                          {entry.title}
                        </h4>
                        {entry.url && (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title={t('changelog.viewOnGitHub')}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      
                      {entry.description && (
                        <p className="text-sm theme-text-secondary mt-1 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs theme-text-muted">
                        <span className="inline-flex items-center gap-1">
                          {t('changelog.types.' + entry.type)} {t('changelog.byAuthor')} {entry.author}
                        </span>
                        <span>{formatTimeAgo(entry.date)}</span>
                        {entry.labels && entry.labels.length > 0 && (
                          <div className="flex gap-1">
                            {entry.labels.slice(0, 2).map((label) => (
                              <span
                                key={label}
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {data && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[var(--card-border)] text-center">
              <p className="text-xs theme-text-muted">
                {t('changelog.lastUpdated')}: {data.lastFetched.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--card-bg)]">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}