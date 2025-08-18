import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeSelector } from '../components/ThemeSelector';

// Mock useDarkMode to control current theme and capture setThemeMode calls
const setThemeModeMock = jest.fn();

jest.mock('@/hooks/useDarkMode', () => {
  return {
    __esModule: true,
    useDarkMode: () => ({
      theme: 'light' as const,
      setThemeMode: setThemeModeMock,
      isDark: false,
      isLoaded: true,
    }),
  };
});


describe('ThemeSelector', () => {
  beforeEach(() => {
    setThemeModeMock.mockClear();
  });

  it('renders Light, Dark, OLED and Auto options', () => {
    render(<ThemeSelector />);
    // With the i18n test mock, missing keys return the key itself
    expect(screen.getByText('settings.appearance.theme.light')).toBeInTheDocument();
    expect(screen.getByText('settings.appearance.theme.dark')).toBeInTheDocument();
    expect(screen.getByText('settings.appearance.theme.oled')).toBeInTheDocument();
    expect(screen.getByText('settings.appearance.theme.auto')).toBeInTheDocument();
  });

  it('applies selected styling to the active theme', () => {
    render(<ThemeSelector />);
    const lightBtn = screen.getByText('settings.appearance.theme.light').closest('button');
    expect(lightBtn).toBeInTheDocument();
    // When theme === 'light', selected classes are applied
    expect(lightBtn).toHaveClass('border-blue-500');
  });

  it('invokes setThemeMode with "dark" when Dark is clicked', () => {
    render(<ThemeSelector />);
    const darkBtn = screen.getByText('settings.appearance.theme.dark').closest('button');
    expect(darkBtn).toBeInTheDocument();
    fireEvent.click(darkBtn!);
    expect(setThemeModeMock).toHaveBeenCalledTimes(1);
    expect(setThemeModeMock).toHaveBeenCalledWith('dark');
  });

  it('invokes setThemeMode with "oled" when OLED is clicked', () => {
    render(<ThemeSelector />);
    const oledBtn = screen.getByText('settings.appearance.theme.oled').closest('button');
    expect(oledBtn).toBeInTheDocument();
    fireEvent.click(oledBtn!);
    expect(setThemeModeMock).toHaveBeenCalledTimes(1);
    expect(setThemeModeMock).toHaveBeenCalledWith('oled');
  });

  it('invokes setThemeMode with "auto" when Auto is clicked', () => {
    render(<ThemeSelector />);
    const autoBtn = screen.getByText('settings.appearance.theme.auto').closest('button');
    expect(autoBtn).toBeInTheDocument();
    fireEvent.click(autoBtn!);
    expect(setThemeModeMock).toHaveBeenCalledTimes(1);
    expect(setThemeModeMock).toHaveBeenCalledWith('auto');
  });
});