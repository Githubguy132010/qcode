import { Ticket, Bell, Settings, Moon, Sun, BarChart3, Home } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onNotificationClick: () => void
  onSettingsClick: () => void
  onSyncClick: () => void
}

export function Header({ onNotificationClick, onSettingsClick, onSyncClick }: HeaderProps) {
  const { t } = useTranslation()
  const { isDark, toggleDarkMode, isLoaded } = useDarkMode()
  const pathname = usePathname()

  return (
    <header className="theme-card shadow-lg border-b transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">{t('common.appName')}</h1>
                <p className="text-sm theme-text-secondary font-medium">{t('common.tagline')}</p>
              </div>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Home size={16} />
                {t('navigation.home', 'Home')}
              </Link>
              <Link
                href="/analytics"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/analytics'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <BarChart3 size={16} />
                {t('navigation.analytics', 'Analytics')}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-1">
              <Link
                href="/"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === '/' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label={t('navigation.home', 'Home')}
              >
                <Home size={20} />
              </Link>
              <Link
                href="/analytics"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === '/analytics'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label={t('navigation.analytics', 'Analytics')}
              >
                <BarChart3 size={20} />
              </Link>
            </div>
            
            <SyncStatusIndicator onClick={onSyncClick} />
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
