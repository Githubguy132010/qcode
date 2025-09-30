import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HtmlLanguageAttribute } from '../components/HtmlLanguageAttribute';
import { useLanguage } from '@/hooks/useLanguage';

// Mock the useLanguage hook
jest.mock('@/hooks/useLanguage');
const mockedUseLanguage = useLanguage as jest.Mock;

describe('HtmlLanguageAttribute', () => {
  beforeEach(() => {
    // Reset document lang and mocks
    document.documentElement.lang = '';
    jest.clearAllMocks();
  });

  it('sets document.documentElement.lang to the resolvedLanguage from the hook', async () => {
    mockedUseLanguage.mockReturnValue({
      resolvedLanguage: 'fr',
    });

    render(
      <HtmlLanguageAttribute>
        <div>content</div>
      </HtmlLanguageAttribute>
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('fr');
    });
  });

  it('updates document.documentElement.lang when the resolvedLanguage changes', async () => {
    const { rerender } = render(
      <HtmlLanguageAttribute>
        <div>content</div>
      </HtmlLanguageAttribute>
    );

    mockedUseLanguage.mockReturnValue({
      resolvedLanguage: 'de',
    });

    rerender(
        <HtmlLanguageAttribute>
            <div>content</div>
        </HtmlLanguageAttribute>
    )

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('de');
    });
  });

  it('does not set lang if resolvedLanguage is undefined', async () => {
    mockedUseLanguage.mockReturnValue({
      resolvedLanguage: undefined,
    });

    render(
      <HtmlLanguageAttribute>
        <div>content</div>
      </HtmlLanguageAttribute>
    );

    // The lang attribute should not be set
    expect(document.documentElement.lang).toBe('');
  });
});