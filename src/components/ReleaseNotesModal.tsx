import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, GitCommit, GitPullRequest, Calendar, User, Hash } from 'lucide-react'
import { getCachedChangelog } from '@/utils/changelog'
import { formatDistanceToNow, type Locale } from 'date-fns'
import { nl } from 'date-fns/locale/nl'
import { enUS } from 'date-fns/locale/en-US'
import type { ChangelogData, ChangelogEntry } from '@/types/changelog'


interface ReleaseNotesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReleaseNotesModal({ isOpen, onClose }: ReleaseNotesModalProps) {
  const { t, i18n } = useTranslation()
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null)
  const [selectedTab, setSelectedTab] = useState<'commits' | 'summary'>('summary')

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const data = getCachedChangelog()
      setChangelogData(data)
    }
  }, [isOpen])

  if (!isOpen) return null

  const commits = changelogData?.entries.filter(entry => entry.type === 'commit') || []
  const allEntries = changelogData?.entries || []

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--card-border)] flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary">{t('releaseNotes.title')}</h2>
            <p className="text-sm theme-text-secondary mt-1">
              {t('releaseNotes.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 theme-text-muted hover:theme-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[var(--card-border)] flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                selectedTab === 'summary'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent theme-text-secondary hover:theme-text-primary hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('releaseNotes.tabs.summary')} ({allEntries.length})
            </button>
            <button
              onClick={() => setSelectedTab('commits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                selectedTab === 'commits'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent theme-text-secondary hover:theme-text-primary hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('releaseNotes.tabs.commits')} ({commits.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {selectedTab === 'summary' && (
            <div className="space-y-6">
              {/* AI Summary */}
              {changelogData?.aiSummary && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    {t('releaseNotes.summary.title')}
                  </h3>
                  <p className="text-blue-800 dark:text-blue-300 mb-4">
                    {changelogData.aiSummary.summary}
                  </p>
                  <div className="space-y-2">
                    {changelogData.aiSummary.highlights.map((highlight, index) => {
                      const words = highlight.split(' ');
                      const firstWord = words[0];
                      const restOfString = words.slice(1).join(' ');
                      return (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                          <span>{firstWord}</span>
                          <span>{restOfString}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Changes Overview */}
              <div>
                <h3 className="text-lg font-semibold theme-text-primary mb-4">{t('releaseNotes.summary.recentChanges')}</h3>
                {allEntries.length === 0 ? (
                  <div className="text-center py-8 theme-text-secondary">
                    <p>{t('releaseNotes.summary.noChanges')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allEntries.slice(0, 5).map((entry) => (
                      <EntryCard key={entry.id} entry={entry} locale={i18n.language === 'nl' ? nl : enUS} />
                    ))}
                    {allEntries.length > 5 && (
                      <p className="text-sm theme-text-muted text-center">
                        {t('releaseNotes.summary.andMore', { count: allEntries.length - 5 })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'commits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold theme-text-primary">
                  {t('releaseNotes.commits.title')} ({commits.length})
                </h3>
                {changelogData?.lastCheckDate && (
                  <p className="text-sm theme-text-muted">
                    {t('releaseNotes.commits.lastChecked', { 
                      date: formatDistanceToNow(changelogData.lastCheckDate, { 
                        addSuffix: true, 
                        locale: i18n.language === 'nl' ? nl : enUS 
                      }) 
                    })}
                  </p>
                )}
              </div>
              
              {commits.length === 0 ? (
                <div className="text-center py-8 theme-text-secondary">
                  <GitCommit size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('releaseNotes.commits.noCommits')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commits.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} detailed locale={i18n.language === 'nl' ? nl : enUS} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--card-bg)] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {t('releaseNotes.buttons.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EntryCard({ entry, detailed = false, locale }: { entry: ChangelogEntry; detailed?: boolean; locale: Locale }) {
  const Icon = entry.type === 'commit' ? GitCommit : GitPullRequest
  
  return (
    <div className="theme-filter rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          entry.type === 'commit' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
        }`}>
          <Icon size={16} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium theme-text-primary text-sm leading-snug">
              {entry.title}
            </h4>
            <time className="text-xs theme-text-muted whitespace-nowrap">
              {formatDistanceToNow(entry.date, { addSuffix: true, locale })}
            </time>
          </div>
          
          {detailed && entry.description && (
            <p className="text-sm theme-text-secondary mt-2 leading-relaxed">
              {entry.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-xs theme-text-muted">
            <div className="flex items-center gap-1">
              <User size={12} />
              {entry.author}
            </div>
            {entry.sha && (
              <div className="flex items-center gap-1">
                <Hash size={12} />
                <code className="font-mono">{entry.sha.substring(0, 7)}</code>
              </div>
            )}
            {entry.prNumber && (
              <div className="flex items-center gap-1">
                <GitPullRequest size={12} />
                #{entry.prNumber}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {entry.date.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}