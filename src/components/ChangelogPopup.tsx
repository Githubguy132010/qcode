import { useState, useEffect } from 'react'
import { X, Sparkles, FileText } from 'lucide-react'
import { checkForUpdates, updateLastVisitDate } from '@/utils/changelog'
import type { ChangelogData } from '@/types/changelog'

interface ChangelogPopupProps {
  onAdvancedReleaseNotes: () => void
}

export function ChangelogPopup({ onAdvancedReleaseNotes }: ChangelogPopupProps) {
  const [changelogData, setChangelogData] = useState<ChangelogData | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkChangelog = async () => {
      setIsLoading(true)
      try {
        const data = await checkForUpdates()
        setChangelogData(data)
        setIsVisible(data.hasNewUpdates)
      } catch (error) {
        console.error('Failed to check for updates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkChangelog()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    updateLastVisitDate()
  }

  const handleViewAdvanced = () => {
    handleClose()
    onAdvancedReleaseNotes()
  }

  const shouldHidePopup = isLoading || !isVisible || !changelogData?.hasNewUpdates || !changelogData.aiSummary;

  if (shouldHidePopup) {
    return null
  }
  const { aiSummary, entries } = changelogData!

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="theme-card rounded-2xl shadow-2xl max-w-lg w-full border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">{aiSummary!.title}</h2>
          </div>
          
          <p className="text-white/90 leading-relaxed">
            {aiSummary!.summary}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Highlights */}
          <div className="mb-6">
            <h3 className="font-semibold theme-text-primary mb-3">What&apos;s New:</h3>
            <div className="space-y-2">
              {aiSummary!.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg theme-filter">
                  <span className="text-lg">{highlight.split(' ')[0]}</span>
                  <span className="text-sm theme-text-secondary flex-1">
                    {highlight.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Impact */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              How this affects you:
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {aiSummary!.userImpact}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Got it, thanks!
            </button>
            
            <button
              onClick={handleViewAdvanced}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FileText size={16} />
              Technical Details
            </button>
          </div>

          {/* Update count */}
          <div className="mt-4 text-center">
            <p className="text-xs theme-text-muted">
              {entries.length} update{entries.length > 1 ? 's' : ''} since your last visit
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}