import { act } from '@testing-library/react'
import { useDarkMode, DarkModeProvider } from '@/hooks/useDarkMode'
import { renderHook } from '@testing-library/react'

describe('Theme Switching Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document classes
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('oled')
  })

  it('should apply light theme correctly', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: DarkModeProvider,
    })
    
    act(() => {
      result.current.setThemeMode('light')
    })
    
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('oled')).toBe(false)
  })

  it('should apply dark theme correctly', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: DarkModeProvider,
    })
    
    act(() => {
      result.current.setThemeMode('dark')
    })
    
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('oled')).toBe(false)
  })

  it('should apply oled theme correctly', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: DarkModeProvider,
    })
    
    act(() => {
      result.current.setThemeMode('oled')
    })
    
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('oled')).toBe(true)
  })

  it('should apply auto theme correctly', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: DarkModeProvider,
    })
    
    act(() => {
      result.current.setThemeMode('auto')
    })
    
    // Auto theme should match system preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    expect(document.documentElement.classList.contains('dark')).toBe(systemDark)
    // OLED class should not be applied in auto mode
    expect(document.documentElement.classList.contains('oled')).toBe(false)
  })

  it('should persist theme preference in localStorage', () => {
    const { result } = renderHook(() => useDarkMode(), {
      wrapper: DarkModeProvider,
    })
    
    act(() => {
      result.current.setThemeMode('oled')
    })
    
    expect(localStorage.getItem('themeMode')).toBe('oled')
  })
})