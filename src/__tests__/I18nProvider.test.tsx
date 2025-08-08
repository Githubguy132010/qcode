import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider } from '../components/I18nProvider';

// Mock the i18n singleton used inside I18nProvider
const changeLanguage = jest.fn();

jest.mock('@/utils/i18n', () => ({
  __esModule: true,
  default: {
    isInitialized: true,
    language: 'en',
    changeLanguage: (...args: unknown[]) => (changeLanguage as unknown as jest.Mock)(...args),
    // Stubs so calling init/use won't explode if referenced
    use: () => ({ init: () => undefined }),
    init: () => undefined,
  },
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('uses saved explicit language ("en" or "nl") if present', async () => {
    localStorage.setItem('qcode-language', 'en');

    render(
      <I18nProvider>
        <div>content</div>
      </I18nProvider>
    );

    await waitFor(() => {
      expect(changeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('when saved language is "auto", it detects browser language and applies supported language', async () => {
    localStorage.setItem('qcode-language', 'auto');

    const originalLang = Object.getOwnPropertyDescriptor(window.navigator, 'language');
    Object.defineProperty(window.navigator, 'language', {
      value: 'nl-NL',
      configurable: true,
    });

    try {
      render(
        <I18nProvider>
          <div>content</div>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(changeLanguage).toHaveBeenCalledWith('nl');
      });
    } finally {
      if (originalLang) Object.defineProperty(window.navigator, 'language', originalLang);
    }
  });

  it('for first-time visitor (no saved language), sets storage to "auto" and applies detected language', async () => {
    // Ensure no saved setting
    localStorage.removeItem('qcode-language');

    const originalLang = Object.getOwnPropertyDescriptor(window.navigator, 'language');
    Object.defineProperty(window.navigator, 'language', {
      value: 'de-DE', // unsupported - should fallback to 'en'
      configurable: true,
    });

    try {
      render(
        <I18nProvider>
          <div>content</div>
        </I18nProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('qcode-language')).toBe('auto');
        expect(changeLanguage).toHaveBeenCalledWith('en'); // fallback from 'de' to 'en'
      });
    } finally {
      if (originalLang) Object.defineProperty(window.navigator, 'language', originalLang);
    }
  });
});