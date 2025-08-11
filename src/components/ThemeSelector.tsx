'use client'

import { useTranslation } from 'react-i18next'
import { useDarkMode, type ThemeMode } from '@/hooks/useDarkMode'
import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeSelectorProps {
  className?: string
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { t } = useTranslation()
  const { theme, setThemeMode } = useDarkMode()

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: t('settings.appearance.theme.light', 'Light'),
      icon: <Sun className="w-4 h-4" />
    },
    {
      value: 'dark',
      label: t('settings.appearance.theme.dark', 'Dark'),
      icon: <Moon className="w-4 h-4" />
    },
    {
      value: 'auto',
      label: t('settings.appearance.theme.auto', 'Auto'),
      icon: <Monitor className="w-4 h-4" />
    }
  ]

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-1 gap-2">
        {themes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setThemeMode(value)}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[44px] touch-manipulation ${
              theme === value
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'theme-card border theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500'
            }`}
          >
            <span className={theme === value ? 'text-white' : 'theme-text-primary'}>
              {icon}
            </span>
            <span className={`font-medium ${theme === value ? 'text-white' : 'theme-text-primary'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}