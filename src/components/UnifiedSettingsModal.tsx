import { useState, useEffect } from 'react'
import { X, Download, Upload, Trash2, Heart, Shield, Settings, Sparkles, FileText, RotateCcw, Palette, Globe, Database, Sliders } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { useDarkMode } from '@/hooks/useDarkMode'
import { exportCodes, importCodes } from '@/utils/storage'
import { loadDemoData } from '@/utils/demo-data'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSelector } from './ThemeSelector'
import { modalVariants } from '@/lib/animations'
import type { DeveloperSettings } from '@/types/changelog'

interface UnifiedSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onAdvancedReleaseNotes?: () => void
  onRestartTutorial?: () => void
  initialTab?: SettingsTab
}

type SettingsTab = 'general' | 'data' | 'appearance' | 'advanced'

export function UnifiedSettingsModal({
  isOpen,
  onClose,
  onAdvancedReleaseNotes,
  onRestartTutorial,
  initialTab = 'general'
}: UnifiedSettingsModalProps) {
  const { t } = useTranslation()
  const { codes } = useDiscountCodes()
  const { } = useDarkMode()
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
  
  // Reset to initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Developer settings
  const [developerSettings, setDeveloperSettings] = useState<DeveloperSettings>(() => {
    try {
      const saved = localStorage.getItem('qcode-developer-settings')
      return saved ? JSON.parse(saved) : {
        showAdvancedReleaseNotes: false,
        enableChangelogPopup: true
      }
    } catch {
      return {
        showAdvancedReleaseNotes: false,
        enableChangelogPopup: true
      }
    }
  })

  const updateDeveloperSettings = (updates: Partial<DeveloperSettings>) => {
    const newSettings = { ...developerSettings, ...updates }
    setDeveloperSettings(newSettings)
    localStorage.setItem('qcode-developer-settings', JSON.stringify(newSettings))
  }

  // Data Management functions
  const handleExport = () => {
    const exportData = exportCodes(codes)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qcode-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedCodes = importCodes(content)
        
        // Save imported codes
        localStorage.setItem('qcode-discount-codes', JSON.stringify(importedCodes))
        window.location.reload()
      } catch (error) {
        alert(t('errors.importFailed', 'Error importing: ') + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    if (confirm(t('confirmDialog.deleteAllCodes'))) {
      localStorage.removeItem('qcode-discount-codes')
      window.location.reload()
    }
  }


  if (!isOpen) return null

  const tabs = [
    { id: 'general' as SettingsTab, label: t('settings.tabs.general', 'General'), icon: Settings },
    { id: 'data' as SettingsTab, label: t('settings.tabs.data', 'Data Management'), icon: Database },
    { id: 'appearance' as SettingsTab, label: t('settings.tabs.appearance', 'Appearance'), icon: Palette },
    { id: 'advanced' as SettingsTab, label: t('settings.tabs.advanced', 'Advanced'), icon: Sliders },
  ]

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="settings-modal-title"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="theme-card rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 dark:border-white/20
                     flex flex-col lg:flex-row overflow-hidden
                     w-[95vw] h-[85vh]
                     sm:w-[90vw] sm:h-[80vh] sm:max-w-[800px] sm:max-h-[600px]
                     lg:w-[900px] lg:h-[600px]"
        >
          {/* Mobile Header with Tab Navigation */}
          <div className="lg:hidden border-b border-[var(--settings-sidebar-border)] p-3 sm:p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 id="settings-modal-title" className="text-lg font-semibold theme-text-primary">{t('settings.title')}</h2>
              <motion.button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center theme-text-secondary hover:theme-text-primary transition-colors"
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Mobile Tab Navigation - Horizontal Scrolling */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max pb-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-2 border-blue-500'
                        : 'theme-text-secondary hover:theme-text-primary theme-menu-hover border border-transparent'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: activeTab === tab.id ? 0 : -2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : ''} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0 bg-gradient-to-b from-[var(--settings-sidebar-bg)] to-[var(--filter-bg)] border-r border-[var(--settings-sidebar-border)] p-4">
            <div className="flex items-center mb-6">
              <h2 id="settings-modal-title" className="text-lg font-semibold theme-text-primary">{t('settings.title')}</h2>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-2 border-blue-500'
                      : 'theme-text-secondary hover:theme-text-primary theme-menu-hover'
                  }`}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ 
                    y: activeTab === tab.id ? 0 : -2,
                    scale: activeTab === tab.id ? 1 : 1.02
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : ''} />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto relative min-h-0">
            {/* Desktop Close Button */}
            <motion.button
              onClick={onClose}
              className="hidden lg:block absolute top-4 right-4 w-11 h-11 flex items-center justify-center theme-text-secondary hover:theme-text-primary transition-colors z-10"
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <X size={20} />
            </motion.button>
            <div className="p-3 sm:p-4 lg:p-6 lg:pr-16">
              <AnimatePresence mode="wait">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.about.aboutApp')}</h3>
                      <p className="text-sm theme-text-secondary">{t('settings.about.aboutText')}</p>
                    </div>

                    <div className="text-center py-8">
                      <motion.div 
                        className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Heart className="w-10 h-10 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-semibold theme-text-primary mb-2">{t('common.appName')}</h3>
                      <p className="theme-text-secondary mb-1">{t('settings.about.version')}</p>
                      <p className="text-sm theme-text-muted">
                        {t('settings.about.subtitle')}
                      </p>
                    </div>

                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="font-medium theme-text-primary mb-2 flex items-center gap-2">
                        <Shield size={16} />
                        {t('settings.about.privacy')}
                      </h4>
                      <ul className="text-sm theme-text-secondary space-y-1">
                        <li>• {t('settings.about.privacyPoints.0')}</li>
                        <li>• {t('settings.about.privacyPoints.1')}</li>
                        <li>• {t('settings.about.privacyPoints.2')}</li>
                        <li>• {t('settings.about.privacyPoints.3')}</li>
                      </ul>
                    </motion.div>

                    {onRestartTutorial && (
                      <motion.div 
                        className="theme-filter rounded-lg p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h4 className="font-medium theme-text-primary mb-2 flex items-center gap-2">
                          <RotateCcw size={16} />
                          {t('settings.about.tutorial', 'Tutorial')}
                        </h4>
                        <p className="text-sm theme-text-secondary mb-3">
                          {t('settings.about.tutorialDescription', 'Take the app tour again to learn about all features.')}
                        </p>
                        <motion.button
                          onClick={() => {
                            onClose()
                            onRestartTutorial()
                          }}
                          className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <RotateCcw size={16} />
                          {t('onboarding.navigation.restart', 'Restart Tutorial')}
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Data Management Tab */}
                {activeTab === 'data' && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.export.title')}</h3>
                      <p className="text-sm theme-text-secondary mb-4">{t('settings.export.subtitle')}</p>
                    </div>

                    <motion.div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 border border-blue-300 dark:border-blue-500 rounded-xl p-4 shadow-lg"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {t('settings.export.codesFound', { count: codes.length })}
                          </p>
                          <p className="text-sm text-blue-100">
                            {t('settings.export.including')}
                          </p>
                        </div>
                        <motion.button
                          onClick={handleExport}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation"
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Download size={16} />
                          {t('settings.export.exportButton')}
                        </motion.button>
                      </div>
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.import.title')}</h3>
                      <p className="text-sm theme-text-secondary mb-4">{t('settings.import.subtitle')}</p>
                    </div>

                    <div className="space-y-3">
                      <motion.div 
                        className="theme-code-display border-2 border-dashed rounded-lg p-4 sm:p-6 text-center"
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 theme-text-muted mb-3 sm:mb-4" />
                        <label htmlFor="import-file" className="cursor-pointer">
                          <motion.span 
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 shadow-md min-h-[44px] touch-manipulation"
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Upload size={16} />
                            {t('settings.import.selectButton')}
                          </motion.span>
                          <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm theme-text-muted mt-2">
                          {t('settings.import.onlyJson')}
                        </p>
                      </motion.div>

                      <motion.div 
                        className="bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 border border-red-300 dark:border-red-500 rounded-xl p-4 shadow-lg"
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <h4 className="font-semibold text-white mb-2">{t('settings.import.dangerTitle')}</h4>
                        <p className="text-sm text-red-100 mb-3">
                          {t('settings.import.dangerSubtitle')}
                        </p>
                        <motion.button
                          onClick={handleClearAll}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg min-h-[44px] touch-manipulation"
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Trash2 size={16} />
                          {t('settings.import.clearButton')}
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}


                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.appearance.title')}</h3>
                      <p className="text-sm theme-text-secondary">{t('settings.appearance.subtitle')}</p>
                    </div>

                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="font-medium theme-text-primary mb-3 flex items-center gap-2">
                        <Palette size={16} />
                        {t('settings.appearance.theme.label')}
                      </h4>
                      <ThemeSelector />
                    </motion.div>

                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-medium theme-text-primary mb-3 flex items-center gap-2">
                        <Globe size={16} />
                        {t('settings.language.title')}
                      </h4>
                      <LanguageSwitcher />
                    </motion.div>
                  </motion.div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.developer.title')}</h3>
                      <p className="text-sm theme-text-secondary">{t('settings.developer.subtitle')}</p>
                    </div>

                    {/* Release Notes Settings */}
                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h4 className="font-semibold theme-text-primary mb-3 flex items-center gap-2">
                        <FileText size={16} />
                        {t('settings.developer.releaseNotes.title')}
                      </h4>
                      
                      <div className="space-y-4">
                        <label className="m3-checkbox flex items-start gap-3 py-2 cursor-pointer touch-manipulation">
                          <input
                            type="checkbox"
                            checked={developerSettings.showAdvancedReleaseNotes}
                            onChange={(e) => updateDeveloperSettings({ showAdvancedReleaseNotes: e.target.checked })}
                            aria-checked={developerSettings.showAdvancedReleaseNotes ? 'true' : 'false'}
                            className="sr-only peer"
                          />
                          <span aria-hidden="true" className="m3-box mt-0.5"></span>
                          <div>
                            <span className="text-sm font-medium theme-text-primary">
                              {t('settings.developer.releaseNotes.showAdvancedLabel')}
                            </span>
                            <p className="text-xs theme-text-muted">
                              {t('settings.developer.releaseNotes.showAdvancedDescription')}
                            </p>
                          </div>
                        </label>

                        <label className="m3-checkbox flex items-start gap-3 py-2 cursor-pointer touch-manipulation">
                          <input
                            type="checkbox"
                            checked={developerSettings.enableChangelogPopup}
                            onChange={(e) => updateDeveloperSettings({ enableChangelogPopup: e.target.checked })}
                            aria-checked={developerSettings.enableChangelogPopup ? 'true' : 'false'}
                            className="sr-only peer"
                          />
                          <span aria-hidden="true" className="m3-box mt-0.5"></span>
                          <div>
                            <span className="text-sm font-medium theme-text-primary">
                              {t('settings.developer.releaseNotes.showChangelogLabel')}
                            </span>
                            <p className="text-xs theme-text-muted">
                              {t('settings.developer.releaseNotes.showChangelogDescription')}
                            </p>
                          </div>
                        </label>

                        {onAdvancedReleaseNotes && (
                          <motion.button
                            onClick={() => {
                              onClose()
                              onAdvancedReleaseNotes()
                            }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg min-h-[44px] touch-manipulation"
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <FileText size={16} />
                            {t('settings.developer.releaseNotes.openReleaseNotes')}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>

                    {/* Sample Data */}
                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-semibold theme-text-primary mb-3 flex items-center gap-2">
                        <Sparkles size={16} />
                        {t('settings.developer.sampleData.title')}
                      </h4>
                      
                      <motion.div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 border border-purple-300 dark:border-purple-500 rounded-xl p-4 shadow-lg"
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <h5 className="font-semibold text-white mb-2">
                          {t('settings.developer.sampleData.loadSampleTitle')}
                        </h5>
                        <p className="text-sm text-purple-100 mb-3">
                          {t('settings.developer.sampleData.loadSampleDescription')}
                        </p>
                        <motion.button
                          onClick={() => {
                            loadDemoData()
                            window.location.reload()
                          }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg min-h-[44px] touch-manipulation"
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Sparkles size={16} />
                          {t('settings.developer.sampleData.loadSampleButton')}
                        </motion.button>
                      </motion.div>
                    </motion.div>

                    {/* Development Info */}
                    <motion.div 
                      className="theme-filter rounded-lg p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-semibold theme-text-primary mb-3">
                        {t('settings.developer.development.title')}
                      </h4>
                      <div className="space-y-2 text-sm theme-text-secondary">
                        <div className="flex justify-between">
                          <span>{t('settings.developer.development.storageUsed')}</span>
                          <span>{(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('settings.developer.development.totalCodes')}</span>
                          <span>{codes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('settings.developer.development.userAgent')}</span>
                          <span className="truncate ml-2 max-w-xs">{navigator.userAgent.split(' ')[0]}</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}