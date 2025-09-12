'use client'

import { useState, useEffect } from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { useDarkMode, CustomTheme } from '@/hooks/useDarkMode'
import { lightThemeColors, darkThemeColors } from '@/lib/theme-utils'
import { useTranslation } from 'react-i18next'

interface ThemeEditorProps {
  onClose: () => void
}

export function ThemeEditor({ onClose }: ThemeEditorProps) {
  const { t } = useTranslation()
  const { saveCustomTheme, customTheme: initialCustomTheme } = useDarkMode()
  const [currentColors, setCurrentColors] = useState<CustomTheme>(
    initialCustomTheme || lightThemeColors
  )
  const [baseTheme, setBaseTheme] = useState<'light' | 'dark'>(
    initialCustomTheme ? 'dark' : 'light'
  )

  useEffect(() => {
    // If there's an initial custom theme, use it. Otherwise, default to light.
    const defaultTheme = baseTheme === 'light' ? lightThemeColors : darkThemeColors
    setCurrentColors(initialCustomTheme || defaultTheme)
  }, [initialCustomTheme, baseTheme])

  const handleColorChange = (color: ColorResult, key: keyof CustomTheme) => {
    setCurrentColors(prev => ({ ...prev, [key]: color.hex }))
  }

  const handleBaseThemeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newBaseTheme = event.target.value as 'light' | 'dark'
    setBaseTheme(newBaseTheme)
    setCurrentColors(
      newBaseTheme === 'light' ? lightThemeColors : darkThemeColors
    )
  }

  const handleSave = () => {
    saveCustomTheme(currentColors)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('theme_editor.title', 'Theme Editor')}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="base-theme"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('theme_editor.base_theme', 'Base Theme')}
          </label>
          <select
            id="base-theme"
            value={baseTheme}
            onChange={handleBaseThemeChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="light">{t('theme_editor.light', 'Light')}</option>
            <option value="dark">{t('theme_editor.dark', 'Dark')}</option>
          </select>
        </div>

        <div className="space-y-4">
          {Object.keys(currentColors).map(key => (
            <div key={key}>
              <label className="capitalize block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t(
                  `theme_editor.${key.replace('--', '')}`,
                  key.replace('--', '').replace('-', ' ')
                )}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: currentColors[key as keyof CustomTheme] }}
                />
                <SketchPicker
                  data-testid={`sketch-picker-${key}`}
                  color={currentColors[key as keyof CustomTheme]}
                  onChangeComplete={(color: ColorResult) =>
                    handleColorChange(color, key as keyof CustomTheme)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {t('common.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  )
}
