import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Sparkles, FileText } from 'lucide-react'
import { checkForUpdates, updateLastVisitDate } from '@/utils/changelog'
import type { ChangelogData } from '@/types/changelog'

interface ChangelogPopupProps {
  onAdvancedReleaseNotes: () => void
}

export function ChangelogPopup({ onAdvancedReleaseNotes }: ChangelogPopupProps) {
  const { t } = useTranslation()
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="rounded-3xl shadow-2xl max-w-2xl w-full theme-card animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        <div className="h-1 w-full rounded-t-3xl bg-[var(--accent-blue-500)]" />
        {/* Colorful subtle background blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-25"
               style={{ background: 'radial-gradient(closest-side, var(--accent-blue-300), transparent)' }} />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-20"
               style={{ background: 'radial-gradient(closest-side, var(--accent-purple), transparent)' }} />
          <div className="absolute top-1/3 -left-10 h-56 w-56 rounded-full blur-3xl opacity-15"
               style={{ background: 'radial-gradient(closest-side, var(--accent-orange), transparent)' }} />
        </div>
        {/* Header */}
        <div className="relative theme-card rounded-t-3xl p-8 theme-text-primary">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full theme-bg-blue-100 theme-border-blue-300 border">
              <Sparkles size={24} className="theme-blue-700" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight theme-text-primary">
              {aiSummary!.title}
            </h2>
          </div>
          
          <p className="theme-text-secondary leading-relaxed">
            {aiSummary!.summary}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">
          {/* Highlights */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-3">{t('releaseNotes.summary.title')}:</h3>
            <div className="space-y-3">
              {aiSummary!.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl theme-filter">
                  <span className="text-lg leading-6 theme-blue-600">✨</span>
                  <span className="text-base theme-text-primary flex-1">
                    {highlight.split(' ').slice(1).join(' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Impact */}
          <div className="mb-8 p-5 rounded-2xl theme-card shadow-sm">
            <h4 className="text-lg font-semibold theme-text-primary mb-2">
              {t('releaseNotes.summary.userImpactTitle')}:
            </h4>
            <p className="text-sm theme-text-secondary">
              {aiSummary!.userImpact}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClose}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] font-semibold py-3.5 px-5 rounded-xl transition-colors shadow-sm"
            >
              {t('releaseNotes.buttons.gotIt')}
            </button>
            
            <button
              onClick={handleViewAdvanced}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--accent-blue-600)] hover:bg-[var(--accent-blue-700)] text-white font-semibold py-3.5 px-5 rounded-xl transition-colors shadow-sm"
            >
              <FileText size={16} />
              {t('releaseNotes.buttons.technicalDetails')}
            </button>
          </div>

          {/* Update count */}
          <div className="mt-6 text-center">
            <p className="text-sm theme-text-muted">
              {t('releaseNotes.popup.updateCount', { count: entries.length })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}