import { Ticket, Settings, Moon, Sun, BarChart3, Home } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onSettingsClick: () => void
  'data-tutorial'?: string
}

export function Header({ onSettingsClick, ...props }: HeaderProps) {
  const { t } = useTranslation()
  const { isDark, setThemeMode, isLoaded } = useDarkMode()
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
                <h1 className="text-xl font-bold theme-text-primary">{t('common.appName')}</h1>
                <p className="text-sm theme-text-secondary font-medium">{t('common.tagline')}</p>
              </div>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/'
                    ? 'theme-bg-blue-100 theme-blue-700 dark:theme-bg-blue-900 dark:theme-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary theme-menu-hover'
                }`}
              >
                <Home size={16} />
                {t('navigation.home')}
              </Link>
              <Link
                href="/analytics"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/analytics'
                    ? 'theme-bg-blue-100 theme-blue-700 dark:theme-bg-blue-900 dark:theme-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary theme-menu-hover'
                }`}
              >
                <BarChart3 size={16} />
                {t('navigation.analytics')}
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2" {...props}>
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-0.5 sm:gap-1">
              <Link
                href="/"
                className={`p-1.5 sm:p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === '/'
                    ? 'theme-bg-blue-100 theme-blue-700 dark:theme-bg-blue-900 dark:theme-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary theme-menu-hover'
                }`}
                aria-label={t('navigation.home')}
              >
                <Home size={16} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="/analytics"
                className={`p-1.5 sm:p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === '/analytics'
                    ? 'theme-bg-blue-100 theme-blue-700 dark:theme-bg-blue-900 dark:theme-blue-400'
                    : 'theme-text-secondary hover:theme-text-primary theme-menu-hover'
                }`}
                aria-label={t('navigation.analytics')}
              >
                <BarChart3 size={16} className="sm:w-5 sm:h-5" />
              </Link>
            </div>
            
            <button
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              className="p-1.5 sm:p-2.5 theme-text-secondary hover:theme-text-primary theme-menu-hover rounded-lg transition-all duration-200"
              aria-label={isDark ? t('header.lightMode') : t('header.darkMode')}
              disabled={!isLoaded}
            >
              {isLoaded && (isDark ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />)}
            </button>
            <button
              onClick={onSettingsClick}
              className="p-1.5 sm:p-2.5 theme-text-secondary hover:theme-text-primary theme-menu-hover rounded-lg transition-all duration-200"
              aria-label={t('header.settings')}
              data-tutorial="settings-button"
            >
              <Settings size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
