import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeSelector } from '../components/ThemeSelector';
import { setThemeModeMock } from '@/hooks/useDarkMode';

// Mock useDarkMode to control current theme and capture setThemeMode calls
jest.mock('@/hooks/useDarkMode', () => {
  const setThemeMode = jest.fn();
  return {
    __esModule: true,
    useDarkMode: () => ({
      theme: 'light' as const,
      setThemeMode,
      isDark: false,
      isLoaded: true,
    }),
    setThemeModeMock: setThemeMode,
  };
});


describe('ThemeSelector', () => {
  beforeEach(() => {
    setThemeModeMock.mockClear();
  });

  it('renders Light, Dark and Auto options', () => {
    render(<ThemeSelector />);
    // With the i18n test mock, missing keys return the key itself
    expect(screen.getByText('settings.appearance.theme.light')).toBeInTheDocument();
    expect(screen.getByText('settings.appearance.theme.dark')).toBeInTheDocument();
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

  it('invokes setThemeMode with "auto" when Auto is clicked', () => {
    render(<ThemeSelector />);
    const autoBtn = screen.getByText('settings.appearance.theme.auto').closest('button');
    expect(autoBtn).toBeInTheDocument();
    fireEvent.click(autoBtn!);
    expect(setThemeModeMock).toHaveBeenCalledTimes(1);
    expect(setThemeModeMock).toHaveBeenCalledWith('auto');
  });
});