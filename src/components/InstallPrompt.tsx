import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'
import { useTranslation } from 'react-i18next'

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const { t } = useTranslation()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt only if installable and not dismissed
    const dismissed = localStorage.getItem('qcode-install-dismissed')
    if (isInstallable && !dismissed && !isInstalled) {
      setShowPrompt(true)
    }
  }, [isInstallable, isInstalled])

  const handleInstallClick = async () => {
    const success = await installApp()
    if (success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('qcode-install-dismissed', 'true')
  }

  // Don't show if installed or not installable
  if (isInstalled || !showPrompt || !isInstallable) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg shadow-md">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-2">
            {t('installPrompt.title', 'Installeer QCode als app')}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            {t('installPrompt.description', 'Krijg snelle toegang vanaf je startscherm en gebruik de app offline. Geen app store nodig!')}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Download size={16} />
              {t('installPrompt.installButton', 'Installeren')}
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-all duration-200"
            >
              {t('installPrompt.dismissButton', 'Niet nu')}
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}


