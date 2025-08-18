import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Mock useLanguage so we can control current language and assert interactions
const changeLanguageMock = jest.fn();

jest.mock('@/hooks/useLanguage', () => {
  return {
    __esModule: true,
    useLanguage: () => ({
      language: 'en',
      currentLanguage: 'en',
      changeLanguage: changeLanguageMock,
      supportedLanguages: ['auto', 'en', 'nl'] as const,
    }),
  };
});


describe('LanguageSwitcher', () => {
  beforeEach(() => {
    changeLanguageMock.mockClear();
  });

  it('renders all supported language options', () => {
    render(<LanguageSwitcher />);

    // With the default i18n test mock, t() returns the key when not found.
    // The component uses these keys:
    expect(screen.getByText('settings.language.auto')).toBeInTheDocument();
    expect(screen.getByText('settings.language.english')).toBeInTheDocument();
    expect(screen.getByText('settings.language.dutch')).toBeInTheDocument();
  });

  it('highlights the currently selected language', () => {
    render(<LanguageSwitcher />);

    // Find the button that contains the English label and assert active styles are present
    const englishButton = screen.getByText('settings.language.english').closest('button');
    expect(englishButton).toBeInTheDocument();
    // Active styles include a specific border color in the class string
    expect(englishButton).toHaveClass('border-blue-500');
  });

  it('changes language when a different option is clicked', () => {
    render(<LanguageSwitcher />);

    // Click on Dutch
    const dutchButton = screen.getByText('settings.language.dutch').closest('button');
    expect(dutchButton).toBeInTheDocument();

    fireEvent.click(dutchButton!);

    expect(changeLanguageMock).toHaveBeenCalledTimes(1);
    expect(changeLanguageMock).toHaveBeenCalledWith('nl');
  });

  it('supports selecting Auto language', () => {
    render(<LanguageSwitcher />);

    const autoButton = screen.getByText('settings.language.auto').closest('button');
    expect(autoButton).toBeInTheDocument();

    fireEvent.click(autoButton!);

    expect(changeLanguageMock).toHaveBeenCalledTimes(1);
    expect(changeLanguageMock).toHaveBeenCalledWith('auto');
  });
});