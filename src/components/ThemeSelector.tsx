'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDarkMode, type ThemeMode } from '@/hooks/useDarkMode'
import {
  Sun,
  Moon,
  Monitor,
  Circle,
  Paintbrush,
  Droplet,
  Trees,
  Flower,
} from 'lucide-react'
import { ThemeEditor } from './ThemeEditor'

interface ThemeSelectorProps {
  className?: string
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { t } = useTranslation()
  const { theme, setThemeMode, customTheme } = useDarkMode()
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const handleCustomThemeClick = () => {
    if (customTheme) {
      setThemeMode('custom')
    } else {
      setIsEditorOpen(true)
    }
  }

  const themes: {
    value: ThemeMode
    label: string
    icon: React.ReactNode
    onClick?: () => void
    hide?: boolean
  }[] = [
    {
      value: 'light',
      label: t('settings.appearance.theme.light', 'Light'),
      icon: <Sun className="w-4 h-4" />,
    },
    {
      value: 'dark',
      label: t('settings.appearance.theme.dark', 'Dark'),
      icon: <Moon className="w-4 h-4" />,
    },
    {
      value: 'oled',
      label: t('settings.appearance.theme.oled', 'OLED Dark'),
      icon: <Circle className="w-4 h-4 fill-current" />,
    },
    {
      value: 'auto',
      label: t('settings.appearance.theme.auto', 'Auto'),
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      value: 'ocean',
      label: t('settings.appearance.theme.ocean', 'Ocean'),
      icon: <Droplet className="w-4 h-4" />,
    },
    {
      value: 'forest',
      label: t('settings.appearance.theme.forest', 'Forest'),
      icon: <Trees className="w-4 h-4" />,
    },
    {
      value: 'rose',
      label: t('settings.appearance.theme.rose', 'Rose'),
      icon: <Flower className="w-4 h-4" />,
    },
    {
      value: 'custom',
      label: customTheme
        ? t('settings.appearance.theme.custom', 'Custom')
        : t('settings.appearance.theme.create_custom', 'Create Custom'),
      icon: <Paintbrush className="w-4 h-4" />,
      onClick: handleCustomThemeClick,
    },
  ]

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <div className="grid grid-cols-1 gap-2">
          {themes.map(({ value, label, icon, onClick, hide }) =>
            hide ? null : (
              <div key={value} className="flex items-center gap-2">
                <button
                  onClick={onClick || (() => setThemeMode(value))}
                  className={`flex-grow flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[44px] touch-manipulation ${
                    theme === value
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                      : 'theme-card border theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500'
                  }`}
                >
                  <span
                    className={
                      theme === value ? 'text-white' : 'theme-text-primary'
                    }
                  >
                    {icon}
                  </span>
                  <span
                    className={`font-medium ${
                      theme === value ? 'text-white' : 'theme-text-primary'
                    }`}
                  >
                    {label}
                  </span>
                </button>
                {value === 'custom' && customTheme && theme === 'custom' && (
                  <button
                    onClick={() => setIsEditorOpen(true)}
                    className="p-3 rounded-lg border-2 theme-card border theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500"
                    aria-label={t('settings.appearance.theme.edit_custom', 'Edit Custom Theme')}
                  >
                    <Paintbrush className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
      {isEditorOpen && <ThemeEditor onClose={() => setIsEditorOpen(false)} />}
    </>
  )
}