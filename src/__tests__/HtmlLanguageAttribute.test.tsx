import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HtmlLanguageAttribute } from '../components/HtmlLanguageAttribute';
import React from 'react';

// Mock useLanguage to control currentLanguage returned to the component
const useLanguageMock = jest.fn();

jest.mock('@/hooks/useLanguage', () => ({
  __esModule: true,
  useLanguage: () => useLanguageMock(),
}));

describe('HtmlLanguageAttribute', () => {
  beforeEach(() => {
    // Reset document lang and mocks
    document.documentElement.lang = '';
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('sets document.documentElement.lang based on currentLanguage (first 2 chars)', async () => {
    useLanguageMock.mockReturnValue({
      currentLanguage: 'en-US',
    });

    render(
      <HtmlLanguageAttribute>
        <div>content</div>
      </HtmlLanguageAttribute>
    );

    // Effect runs asynchronously
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
    });
  });

  it('on first-time visitors (no saved language), uses browser language to set document lang', async () => {
    // Simulate first-time visitor: no saved language
    localStorage.removeItem('qcode-language');

    // Ensure the hook still returns something (component calls substring(0, 2) on it in the first effect)
    useLanguageMock.mockReturnValue({
      currentLanguage: 'en-US',
    });

    // Override navigator.language to nl-NL
    const originalLang = Object.getOwnPropertyDescriptor(window.navigator, 'language');
    Object.defineProperty(window.navigator, 'language', {
      value: 'nl-NL',
      configurable: true,
    });

    try {
      render(
        <HtmlLanguageAttribute>
          <div>content</div>
        </HtmlLanguageAttribute>
      );

      // Two effects run: first sets 'en', second (first-time visitor) sets 'nl'
      await waitFor(() => {
        expect(document.documentElement.lang).toBe('nl');
      });
    } finally {
      // Restore navigator.language
      if (originalLang) {
        Object.defineProperty(window.navigator, 'language', originalLang);
      }
    }
  });
});