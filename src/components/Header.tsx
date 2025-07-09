import { Ticket, Bell, Settings, Moon, Sun, BarChart3 } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  onNotificationClick: () => void
  onSettingsClick: () => void
  onSyncClick: () => void
  onAnalyticsClick: () => void
}

export function Header({ onNotificationClick, onSettingsClick, onSyncClick, onAnalyticsClick }: HeaderProps) {
  const { t } = useTranslation()
  const { isDark, toggleDarkMode, isLoaded } = useDarkMode()

  return (
    <header className="theme-card shadow-lg border-b transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{t('common.appName')}</h1>
              <p className="text-sm theme-text-secondary font-medium">{t('common.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SyncStatusIndicator onClick={onSyncClick} />
            <button 
              onClick={onAnalyticsClick}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label={t('header.analytics', 'Analytics')}
            >
              <BarChart3 size={20} />
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label={isDark ? t('header.lightMode') : t('header.darkMode')}
              disabled={!isLoaded}
            >
              {isLoaded && (isDark ? <Sun size={20} /> : <Moon size={20} />)}
            </button>
            <button 
              onClick={onNotificationClick}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label={t('header.notifications')}
            >
              <Bell size={20} />
            </button>
            <button 
              onClick={onSettingsClick}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label={t('header.settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
