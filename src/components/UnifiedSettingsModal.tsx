'use client'

import { useState, useEffect } from 'react'
import { X, Download, Upload, Trash2, Heart, Shield, Settings, Sparkles, FileText, RotateCcw, Palette, Globe, Database, Sliders } from 'lucide-react'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { useDarkMode } from '@/hooks/useDarkMode'
import { exportCodes, importCodes } from '@/utils/storage'
import { loadDemoData } from '@/utils/demo-data'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSelector } from './ThemeSelector'
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div role="dialog" aria-modal="true" aria-labelledby="settings-modal-title"
           className="theme-card rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 dark:border-white/20
                      flex flex-col lg:flex-row overflow-hidden
                      w-[95vw] h-[85vh]
                      sm:w-[90vw] sm:h-[80vh] sm:max-w-[800px] sm:max-h-[600px]
                      lg:w-[900px] lg:h-[600px]">
        {/* Mobile Header with Tab Navigation */}
        <div className="lg:hidden border-b border-[var(--settings-sidebar-border)] p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 id="settings-modal-title" className="text-lg font-semibold theme-text-primary">{t('settings.title')}</h2>
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center theme-text-secondary hover:theme-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Tab Navigation - Horizontal Scrolling */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-2 border-blue-500'
                      : 'theme-text-secondary hover:theme-text-primary theme-menu-hover border border-transparent'
                  }`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : ''} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform min-h-[44px] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 border-2 border-blue-500'
                    : 'theme-text-secondary hover:theme-text-primary theme-menu-hover hover:scale-102 hover:shadow-md'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : ''} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative min-h-0">
          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="hidden lg:block absolute top-4 right-4 w-11 h-11 flex items-center justify-center theme-text-secondary hover:theme-text-primary transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="p-3 sm:p-4 lg:p-6 lg:pr-16">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.about.aboutApp')}</h3>
                  <p className="text-sm theme-text-secondary">{t('settings.about.aboutText')}</p>
                </div>

                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold theme-text-primary mb-2">{t('common.appName')}</h3>
                  <p className="theme-text-secondary mb-1">{t('settings.about.version')}</p>
                  <p className="text-sm theme-text-muted">
                    {t('settings.about.subtitle')}
                  </p>
                </div>

                <div className="theme-filter rounded-lg p-4">
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
                </div>

                {onRestartTutorial && (
                  <div className="theme-filter rounded-lg p-4">
                    <h4 className="font-medium theme-text-primary mb-2 flex items-center gap-2">
                      <RotateCcw size={16} />
                      {t('settings.about.tutorial', 'Tutorial')}
                    </h4>
                    <p className="text-sm theme-text-secondary mb-3">
                      {t('settings.about.tutorialDescription', 'Take the app tour again to learn about all features.')}
                    </p>
                    <button
                      onClick={() => {
                        onClose()
                        onRestartTutorial()
                      }}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                    >
                      <RotateCcw size={16} />
                      {t('onboarding.navigation.restart', 'Restart Tutorial')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.export.title')}</h3>
                  <p className="text-sm theme-text-secondary mb-4">{t('settings.export.subtitle')}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 border border-blue-300 dark:border-blue-500 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {t('settings.export.codesFound', { count: codes.length })}
                      </p>
                      <p className="text-sm text-blue-100">
                        {t('settings.export.including')}
                      </p>
                    </div>
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 min-h-[44px] touch-manipulation"
                    >
                      <Download size={16} />
                      {t('settings.export.exportButton')}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.import.title')}</h3>
                  <p className="text-sm theme-text-secondary mb-4">{t('settings.import.subtitle')}</p>
                </div>

                <div className="space-y-3">
                  <div className="theme-code-display border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 theme-text-muted mb-3 sm:mb-4" />
                    <label htmlFor="import-file" className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 min-h-[44px] touch-manipulation">
                        <Upload size={16} />
                        {t('settings.import.selectButton')}
                      </span>
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
                  </div>

                  <div className="bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-700 dark:to-pink-700 border border-red-300 dark:border-red-500 rounded-xl p-4 shadow-lg">
                    <h4 className="font-semibold text-white mb-2">{t('settings.import.dangerTitle')}</h4>
                    <p className="text-sm text-red-100 mb-3">
                      {t('settings.import.dangerSubtitle')}
                    </p>
                    <button
                      onClick={handleClearAll}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 min-h-[44px] touch-manipulation"
                    >
                      <Trash2 size={16} />
                      {t('settings.import.clearButton')}
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.appearance.title')}</h3>
                  <p className="text-sm theme-text-secondary">{t('settings.appearance.subtitle')}</p>
                </div>

                <div className="theme-filter rounded-lg p-4">
                  <h4 className="font-medium theme-text-primary mb-3 flex items-center gap-2">
                    <Palette size={16} />
                    {t('settings.appearance.theme.label')}
                  </h4>
                  <ThemeSelector />
                </div>

                <div className="theme-filter rounded-lg p-4">
                  <h4 className="font-medium theme-text-primary mb-3 flex items-center gap-2">
                    <Globe size={16} />
                    {t('settings.language.title')}
                  </h4>
                  <LanguageSwitcher />
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.developer.title')}</h3>
                  <p className="text-sm theme-text-secondary">{t('settings.developer.subtitle')}</p>
                </div>

                {/* Release Notes Settings */}
                <div className="theme-filter rounded-lg p-4">
                  <h4 className="font-semibold theme-text-primary mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    {t('settings.developer.releaseNotes.title')}
                  </h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={developerSettings.showAdvancedReleaseNotes}
                        onChange={(e) => updateDeveloperSettings({ showAdvancedReleaseNotes: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 touch-manipulation"
                      />
                      <div>
                        <span className="text-sm font-medium theme-text-primary">
                          {t('settings.developer.releaseNotes.showAdvancedLabel')}
                        </span>
                        <p className="text-xs theme-text-muted">
                          {t('settings.developer.releaseNotes.showAdvancedDescription')}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={developerSettings.enableChangelogPopup}
                        onChange={(e) => updateDeveloperSettings({ enableChangelogPopup: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 touch-manipulation"
                      />
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
                      <button
                        onClick={() => {
                          onClose()
                          onAdvancedReleaseNotes()
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 min-h-[44px] touch-manipulation"
                      >
                        <FileText size={16} />
                        {t('settings.developer.releaseNotes.openReleaseNotes')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Sample Data */}
                <div className="theme-filter rounded-lg p-4">
                  <h4 className="font-semibold theme-text-primary mb-3 flex items-center gap-2">
                    <Sparkles size={16} />
                    {t('settings.developer.sampleData.title')}
                  </h4>
                  
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 border border-purple-300 dark:border-purple-500 rounded-xl p-4 shadow-lg">
                    <h5 className="font-semibold text-white mb-2">
                      {t('settings.developer.sampleData.loadSampleTitle')}
                    </h5>
                    <p className="text-sm text-purple-100 mb-3">
                      {t('settings.developer.sampleData.loadSampleDescription')}
                    </p>
                    <button
                      onClick={() => {
                        loadDemoData()
                        window.location.reload()
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 min-h-[44px] touch-manipulation"
                    >
                      <Sparkles size={16} />
                      {t('settings.developer.sampleData.loadSampleButton')}
                    </button>
                  </div>
                </div>

                {/* Development Info */}
                <div className="theme-filter rounded-lg p-4">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}