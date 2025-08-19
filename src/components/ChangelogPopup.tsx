import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Sparkles, FileText } from 'lucide-react'
import { checkForUpdates, updateLastVisitDate } from '@/utils/changelog'
import type { ChangelogData } from '@/types/changelog'
import { popupVariants } from '@/lib/animations'

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
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="theme-card rounded-2xl shadow-2xl max-w-lg w-full border border-white/20"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 text-white">
              <motion.button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <X size={20} />
              </motion.button>
              
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="bg-white/20 p-2 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Sparkles size={24} className="text-white" />
                </motion.div>
                <motion.h2 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {aiSummary!.title}
                </motion.h2>
              </div>
              
              <motion.p 
                className="text-white/90 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {aiSummary!.summary}
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Highlights */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h3 className="font-semibold theme-text-primary mb-3">{t('releaseNotes.summary.title')}:</h3>
                <div className="space-y-2">
                  {aiSummary!.highlights.map((highlight, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-3 p-3 rounded-lg theme-filter"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <span className="text-lg">{highlight.split(' ')[0]}</span>
                      <span className="text-sm theme-text-secondary flex-1">
                        {highlight.split(' ').slice(1).join(' ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* User Impact */}
              <motion.div 
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border theme-border-blue-200 dark:theme-border-blue-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-semibold theme-text-primary mb-2">
                  {t('releaseNotes.summary.userImpactTitle')}:
                </h4>
                <p className="text-sm theme-text-secondary">
                  {aiSummary!.userImpact}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <motion.button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {t('releaseNotes.buttons.gotIt')}
                </motion.button>
                
                <motion.button
                  onClick={handleViewAdvanced}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <FileText size={16} />
                  {t('releaseNotes.buttons.technicalDetails')}
                </motion.button>
              </motion.div>

              {/* Update count */}
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs theme-text-muted">
                  {t('releaseNotes.popup.updateCount', { count: entries.length })}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}