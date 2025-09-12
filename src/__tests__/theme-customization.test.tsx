import { render, fireEvent, screen, act } from '@testing-library/react'
import { DarkModeProvider, useDarkMode, CustomTheme } from '@/hooks/useDarkMode'
import { ThemeSelector } from '@/components/ThemeSelector'
import { ThemeEditor } from '@/components/ThemeEditor'
import { renderHook } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../__mocks__/i18next'

// Mock react-color
jest.mock('react-color', () => ({
  SketchPicker: (props: any) => {
    return (
      <input
        type="text"
        data-testid={props['data-testid']} // Use the passed data-testid
        value={props.color}
        onChange={e => props.onChangeComplete({ hex: e.target.value })}
      />
    )
  },
}))

describe('Theme Customization', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.cssText = ''
  })

  // useDarkMode Hook Tests
  describe('useDarkMode Hook', () => {
    it('should handle custom theme correctly', () => {
      const { result } = renderHook(() => useDarkMode(), {
        wrapper: DarkModeProvider,
      })
      const customTheme: CustomTheme = {
        '--background': '#ff0000',
        '--background-light': '#ff0000',
        '--foreground': '#00ff00',
        '--card-bg': '#0000ff',
        '--card-border': '#ffff00',
        '--input-bg': '#ff00ff',
        '--input-border': '#00ffff',
        '--accent-blue': '#ffA500',
        '--accent-blue-hover': '#ffA500',
      }

      act(() => {
        result.current.saveCustomTheme(customTheme)
      })

      expect(localStorage.getItem('themeMode')).toBe('custom')
      expect(localStorage.getItem('customTheme')).toBe(JSON.stringify(customTheme))
      expect(document.documentElement.style.getPropertyValue('--background')).toBe('#ff0000')
    })

    it('should apply predefined themes', () => {
      const { result } = renderHook(() => useDarkMode(), {
        wrapper: DarkModeProvider,
      })

      act(() => {
        result.current.setThemeMode('ocean')
      })
      expect(document.documentElement.classList.contains('ocean')).toBe(true)

      act(() => {
        result.current.setThemeMode('forest')
      })
      expect(document.documentElement.classList.contains('forest')).toBe(true)

      act(() => {
        result.current.setThemeMode('rose')
      })
      expect(document.documentElement.classList.contains('rose')).toBe(true)
    })
  })

  // Component Tests
  describe('Theme Components', () => {
    it('should open ThemeEditor from ThemeSelector', async () => {
      render(
        <DarkModeProvider>
          <I18nextProvider i18n={i18n}>
            <ThemeSelector />
          </I18nextProvider>
        </DarkModeProvider>
      )

      const createCustomButton = screen.getByText(
        'settings.appearance.theme.create_custom'
      )
      fireEvent.click(createCustomButton)

      // Wait for the editor to appear
      const pickers = await screen.findAllByTestId(/sketch-picker/);
      expect(pickers.length).toBeGreaterThan(0);
    })

    it('should save custom theme from ThemeEditor', async () => {
      const TestComponent = () => {
        const { theme } = useDarkMode()
        return (
          <div>
            <ThemeSelector />
            <div data-testid="current-theme">{theme}</div>
          </div>
        )
      }
      render(
        <DarkModeProvider>
          <I18nextProvider i18n={i18n}>
            <TestComponent />
          </I18nextProvider>
        </DarkModeProvider>
      )

      const createCustomButton = screen.getByText(
        'settings.appearance.theme.create_custom'
      )
      fireEvent.click(createCustomButton)

      // Wait for the editor to appear and interact with it
      const colorPicker = await screen.findByTestId('sketch-picker---background')
      act(() => {
        fireEvent.change(colorPicker, { target: { value: '#123456' } })
      })

      const saveButton = screen.getByText('common.save')
      act(() => {
        fireEvent.click(saveButton)
      })

      // Check if theme is updated
      expect(screen.getByTestId('current-theme').textContent).toBe('custom')
      expect(localStorage.getItem('themeMode')).toBe('custom')
      expect(localStorage.getItem('customTheme')).toContain('#123456')
    })
  })
})
