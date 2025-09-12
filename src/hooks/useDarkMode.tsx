'use client'

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react'

// Added 'custom' and predefined themes to ThemeMode
export type ThemeMode =
  | 'light'
  | 'dark'
  | 'auto'
  | 'oled'
  | 'custom'
  | 'ocean'
  | 'forest'
  | 'rose'

// Interface for custom theme properties
export interface CustomTheme {
  '--background': string
  '--background-light': string
  '--foreground': string
  '--card-bg': string
  '--card-border': string
  '--input-bg': string
  '--input-border': string
  '--accent-blue': string
  '--accent-blue-hover': string
}

interface DarkModeContextType {
  theme: ThemeMode
  setThemeMode: (theme: ThemeMode) => void
  isDark: boolean
  isLoaded: boolean
  customTheme: CustomTheme | null
  saveCustomTheme: (theme: CustomTheme) => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
)

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('auto')
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const applyCustomTheme = useCallback((themeColors: CustomTheme) => {
    const root = document.documentElement
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.classList.add('custom-theme')
  }, [])

  const clearCustomTheme = useCallback(() => {
    const root = document.documentElement
    const customVars: (keyof CustomTheme)[] = [
      '--background',
      '--background-light',
      '--foreground',
      '--card-bg',
      '--card-border',
      '--input-bg',
      '--input-border',
      '--accent-blue',
      '--accent-blue-hover',
    ]
    customVars.forEach(key => root.style.removeProperty(key))
    root.classList.remove('custom-theme')
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'custom') {
        const savedCustomTheme = localStorage.getItem('customTheme')
        if (savedCustomTheme) {
          try {
            const parsedTheme = JSON.parse(savedCustomTheme)
            setCustomTheme(parsedTheme)
            applyCustomTheme(parsedTheme)
          } catch (e) {
            console.error('Failed to parse custom theme from localStorage', e)
            localStorage.removeItem('customTheme')
          }
        }
      }
    } else {
      setTheme('auto')
    }
    setIsLoaded(true)
  }, [applyCustomTheme])

  useEffect(() => {
    if (!isLoaded) return

    if (theme === 'custom' && customTheme) {
      applyCustomTheme(customTheme)
    } else {
      clearCustomTheme()
    }

    let shouldBeDark = false
    if (theme === 'auto') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else if (theme === 'custom') {
      const bg = customTheme ? customTheme['--background'] : '#ffffff'
      const color = bg.charAt(0) === '#' ? bg.substring(1, 7) : bg
      const r = parseInt(color.substring(0, 2), 16)
      const g = parseInt(color.substring(2, 4), 16)
      const b = parseInt(color.substring(4, 6), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      shouldBeDark = brightness < 128
    } else {
      shouldBeDark = theme === 'dark' || theme === 'oled'
    }
    setIsDark(shouldBeDark)

    document.documentElement.classList.remove(
      'dark',
      'oled',
      'ocean',
      'forest',
      'rose'
    )
    document.documentElement.classList.toggle('dark', shouldBeDark)

    if (theme === 'oled') {
      document.documentElement.classList.add('oled')
    } else if (['ocean', 'forest', 'rose'].includes(theme)) {
      document.documentElement.classList.add(theme)
    }

    localStorage.setItem('themeMode', theme)
    if (theme === 'custom' && customTheme) {
      localStorage.setItem('customTheme', JSON.stringify(customTheme))
    } else {
      localStorage.removeItem('customTheme')
    }
  }, [theme, customTheme, isLoaded, applyCustomTheme, clearCustomTheme])

  useEffect(() => {
    if (!isLoaded || theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
      document.documentElement.classList.toggle('dark', e.matches)
      document.documentElement.classList.remove('oled')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, isLoaded])

  const setThemeMode = (newTheme: ThemeMode) => {
    setTheme(newTheme)
  }

  const saveCustomTheme = (newCustomTheme: CustomTheme) => {
    setCustomTheme(newCustomTheme)
    setTheme('custom')
  }

  return (
    <DarkModeContext.Provider
      value={{
        theme,
        setThemeMode,
        isDark,
        isLoaded,
        customTheme,
        saveCustomTheme,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  )
}