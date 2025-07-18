import { useState, useEffect } from 'react'
import { X, ExternalLink, Github, Calendar, GitCommit } from 'lucide-react'
import { checkForNewChanges, generateAISummary, markChangelogAsViewed } from '@/utils/github-integration'

interface ChangelogPopupProps {
  isOpen: boolean
  onClose: () => void
  onViewAdvanced: () => void
}

interface ChangelogData {
  hasNewChanges: boolean
  latestRelease?: {
    id: number
    tag_name: string
    name: string
    body: string
    published_at: string
    html_url?: string
  }
  recentCommits: Array<{
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
    html_url?: string
  }>
  lastChecked: string
}

export function ChangelogPopup({ isOpen, onClose, onViewAdvanced }: ChangelogPopupProps) {
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadChangelogData()
    }
  }, [isOpen])

  const loadChangelogData = async () => {
    setIsLoading(true)
    try {
      const data = await checkForNewChanges()
      setChangelogData(data)
      
      if (data.hasNewChanges || data.latestRelease || data.recentCommits.length > 0) {
        const summary = generateAISummary(data)
        setAiSummary(summary)
      }
    } catch (error) {
      console.error('Error loading changelog data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    markChangelogAsViewed()
    onClose()
  }

  const handleViewAdvanced = () => {
    onViewAdvanced()
    handleClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Github size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary">
                What&apos;s New in QCode
              </h2>
              <p className="text-sm theme-text-secondary">
                Latest updates and improvements
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="ml-3 theme-text-secondary">Loading updates...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Summary Section */}
              {aiSummary && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-300 dark:border-blue-600 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    ✨ Summary for You
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line leading-relaxed">
                    {aiSummary}
                  </div>
                </div>
              )}

              {/* Technical Details Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {showTechnicalDetails ? '← Hide technical details' : 'Show technical details →'}
                </button>
              </div>

              {/* Technical Details */}
              {showTechnicalDetails && (
                <div className="space-y-4">
                  {/* Latest Release */}
                  {changelogData?.latestRelease && (
                    <div className="theme-filter rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold theme-text-primary flex items-center gap-2">
                          <Calendar size={16} />
                          Latest Release: {changelogData.latestRelease.name || changelogData.latestRelease.tag_name}
                        </h4>
                        {changelogData.latestRelease.html_url && (
                          <a
                            href={changelogData.latestRelease.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs theme-text-muted mb-3">
                        Released on {formatDate(changelogData.latestRelease.published_at)}
                      </p>
                      {changelogData.latestRelease.body && (
                        <div className="text-sm theme-text-secondary whitespace-pre-line max-h-40 overflow-y-auto">
                          {changelogData.latestRelease.body}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Commits */}
                  {changelogData?.recentCommits && changelogData.recentCommits.length > 0 && (
                    <div className="theme-filter rounded-lg p-4">
                      <h4 className="font-semibold theme-text-primary mb-3 flex items-center gap-2">
                        <GitCommit size={16} />
                        Recent Changes
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {changelogData.recentCommits.slice(0, 5).map((commit) => (
                          <div key={commit.sha} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={commit.author?.avatar_url || '/icon-192x192.png'}
                              alt={commit.author?.login || 'Author'}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm theme-text-primary font-medium truncate">
                                {commit.commit.message.split('\n')[0]}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs theme-text-muted">
                                  by {commit.author?.login || commit.commit.author.name}
                                </span>
                                <span className="text-xs theme-text-muted">•</span>
                                <span className="text-xs theme-text-muted">
                                  {formatDate(commit.commit.author.date)}
                                </span>
                              </div>
                            </div>
                            {commit.html_url && (
                              <a
                                href={commit.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No New Changes */}
              {!changelogData?.hasNewChanges && !changelogData?.latestRelease && changelogData?.recentCommits.length === 0 && (
                <div className="text-center py-8">
                  <Github size={48} className="mx-auto theme-text-secondary mb-4" />
                  <h3 className="text-lg font-semibold theme-text-primary mb-2">
                    You&apos;re up to date!
                  </h3>
                  <p className="theme-text-secondary">
                    No new updates available at the moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--card-bg)]">
          <div className="flex gap-3">
            <button
              onClick={handleViewAdvanced}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              View Advanced Dashboard
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}