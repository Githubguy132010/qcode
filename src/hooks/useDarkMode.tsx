'use client'

export type ThemeMode = 'light' | 'dark' | 'auto'

export function useDarkMode() {
  const theme: ThemeMode = 'dark'
  const isDark = true
  const isLoaded = true
  const setThemeMode = (() => {}) as (newTheme: ThemeMode) => void
  return { theme, setThemeMode, isDark, isLoaded }
}