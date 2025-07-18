import { useState, useEffect } from 'react'
import { X, Sparkles, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { 
  hasNewChangelog,
  getCachedChangelogData,
  setLastSeenVersion,
  getRecentEntries,
  generateAISummary,
  isDeveloperModeEnabled
} from '@/utils/changelog'

interface ChangelogPopupProps {
  onShowTechnicalDetails: () => void
}

export function ChangelogPopup({ onShowTechnicalDetails }: ChangelogPopupProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>('')
  
  useEffect(() => {
    // Check if there are new updates when component mounts
    checkForUpdates()
  }, [])

  const checkForUpdates = () => {
    if (hasNewChangelog()) {
      const data = getCachedChangelogData()
      if (data) {
        const recentEntries = getRecentEntries(data)
        const summary = generateAISummary(recentEntries)
        setAiSummary(summary)
        setIsVisible(true)
      }
    }
  }

  const handleClose = () => {
    // Mark updates as seen
    setLastSeenVersion(new Date().toISOString())
    setIsVisible(false)
  }

  const handleShowTechnicalDetails = () => {
    handleClose()
    onShowTechnicalDetails()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold theme-text-primary">{t('changelog.aiSummaryTitle')}</h2>
              <p className="text-sm theme-text-secondary">{t('changelog.subtitle')}</p>
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
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="whitespace-pre-line theme-text-secondary leading-relaxed text-base">
              {aiSummary}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-[var(--card-border)] bg-gray-50 dark:bg-[var(--card-bg)]">
          <button
            onClick={handleClose}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {t('common.close')}
          </button>
          {(isDeveloperModeEnabled() || true) && ( // Allow access for now, will be controlled by settings later
            <button
              onClick={handleShowTechnicalDetails}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Settings size={16} />
              {t('changelog.technicalDetails')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}