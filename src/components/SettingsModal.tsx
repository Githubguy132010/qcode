import { useState } from 'react'
import { X, Download, Upload, Trash2, Info, Heart, Shield, Code, Sparkles, Database } from 'lucide-react'
import { useDiscountCodes } from '@/hooks/useDiscountCodes'
import { exportCodes, importCodes } from '@/utils/storage'
import { loadDemoData } from '@/utils/demo-data'
import { isDeveloperModeEnabled, setDeveloperMode } from '@/utils/changelog'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { codes } = useDiscountCodes()
  const [activeTab, setActiveTab] = useState<'about' | 'language' | 'export' | 'import' | 'developer'>('about')
  const [developerMode, setDeveloperModeState] = useState(isDeveloperModeEnabled())

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

  const handleLoadDemoData = () => {
    if (confirm(t('settings.developer.loadDemoConfirm'))) {
      loadDemoData()
      window.location.reload()
    }
  }

  const toggleDeveloperMode = () => {
    const newMode = !developerMode
    setDeveloperMode(newMode)
    setDeveloperModeState(newMode)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--card-border)]">
          <h2 className="text-xl font-semibold theme-text-primary">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-[var(--card-border)]">
          <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('settings.tabs.about')}
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'language'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('settings.tabs.language')}
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'export'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('settings.tabs.export')}
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'import'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('settings.tabs.import')}
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'developer'
                  ? 'border-blue-600 text-blue-900 dark:border-blue-400 dark:text-blue-300 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('settings.tabs.developer')}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-blue-700 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('common.appName')}</h3>
                <p className="theme-text-secondary mb-1">{t('settings.about.version')}</p>
                <p className="text-sm theme-text-muted">
                  {t('settings.about.subtitle')}
                </p>
              </div>

              <div className="theme-filter rounded-lg p-4">
                <h4 className="font-medium theme-text-primary mb-2 flex items-center gap-2">
                  <Info size={16} />
                  {t('settings.about.aboutApp')}
                </h4>
                <p className="text-sm theme-text-secondary leading-relaxed">
                  {t('settings.about.aboutText')}
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

              <div className="text-center">
                <p className="text-sm theme-text-muted">
                  {t('settings.about.footer')}
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'language' && <LanguageSwitcher />}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium theme-text-primary mb-2">
                  {t('settings.export.title')}
                </h3>
                <p className="text-sm theme-text-secondary mb-4">
                  {t('settings.export.subtitle')}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-300 dark:border-blue-600 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-blue-100">
                      {t('settings.export.codesFound', { count: codes.length })}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-blue-200">
                      {t('settings.export.including')}
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download size={16} />
                    {t('settings.export.exportButton')}
                  </button>
                </div>
              </div>

              <div className="text-sm theme-text-muted">
                <p>{t('settings.export.tip')}</p>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium theme-text-primary mb-2">
                  {t('settings.import.title')}
                </h3>
                <p className="text-sm theme-text-secondary mb-4">
                  {t('settings.import.subtitle')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="theme-code-display border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <label htmlFor="import-file" className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
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

                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-300 dark:border-red-600 rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-slate-900 dark:text-red-100 mb-2">{t('settings.import.dangerTitle')}</h4>
                  <p className="text-sm text-slate-800 dark:text-red-200 mb-3">
                    {t('settings.import.dangerSubtitle')}
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Trash2 size={16} />
                    {t('settings.import.clearButton')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium theme-text-primary mb-2 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {t('settings.developer.title')}
                </h3>
                <p className="text-sm theme-text-secondary mb-4">
                  {t('settings.developer.subtitle')}
                </p>
              </div>

              {/* Developer Mode Toggle */}
              <div className="theme-filter rounded-lg p-4 border border-gray-200 dark:border-[var(--card-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium theme-text-primary mb-1 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('settings.developer.mode')}
                    </h4>
                    <p className="text-sm theme-text-secondary">
                      {t('settings.developer.modeDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={developerMode}
                      onChange={toggleDeveloperMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Advanced Changelog Access */}
              <div className="theme-filter rounded-lg p-4 border border-gray-200 dark:border-[var(--card-border)]">
                <h4 className="font-medium theme-text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('settings.developer.changelog')}
                </h4>
                <p className="text-sm theme-text-secondary mb-3">
                  {t('settings.developer.changelogDescription')}
                </p>
                <div className="text-xs theme-text-muted">
                  {developerMode 
                    ? t('settings.developer.changelogEnabled')
                    : t('settings.developer.changelogDisabled')
                  }
                </div>
              </div>

              {/* Sample Data Section */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-300 dark:border-purple-600 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {t('settings.developer.demoTitle')}
                </h4>
                <p className="text-sm text-slate-800 dark:text-purple-200 mb-3">
                  {t('settings.developer.demoSubtitle')}
                </p>
                <button
                  onClick={handleLoadDemoData}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Sparkles size={16} />
                  {t('settings.developer.demoButton')}
                </button>
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-300 dark:border-amber-600 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900 dark:text-amber-100 mb-2">
                  {t('settings.developer.warningTitle')}
                </h4>
                <p className="text-sm text-slate-800 dark:text-amber-200">
                  {t('settings.developer.warningText')}
                </p>
              </div>
            </div>
          )}
        </div>

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
