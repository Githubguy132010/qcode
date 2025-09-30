import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';

// Mock the useLanguage hook
jest.mock('@/hooks/useLanguage');
const mockedUseLanguage = useLanguage as jest.Mock;

// Mock i18next's useTranslation hook to prevent errors
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key itself for testing
  }),
}));

describe('LanguageSwitcher', () => {
  let changeLanguageMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    changeLanguageMock = jest.fn();
    mockedUseLanguage.mockReturnValue({
      selection: 'auto',
      resolvedLanguage: 'en',
      changeLanguage: changeLanguageMock,
    });
  });

  it('renders the title, automatic option, and custom input field', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText('settings.language.title')).toBeInTheDocument();
    expect(screen.getByText('settings.language.auto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., fr')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set' })).toBeInTheDocument();
  });

  it('highlights the "Automatic" button when the selection is "auto"', () => {
    render(<LanguageSwitcher />);
    const autoButton = screen.getByText('settings.language.auto').closest('button');
    expect(autoButton).toHaveClass('bg-blue-600');
  });

  it('calls changeLanguage with "auto" when the automatic button is clicked', () => {
    render(<LanguageSwitcher />);
    const autoButton = screen.getByText('settings.language.auto').closest('button');
    fireEvent.click(autoButton!);
    expect(changeLanguageMock).toHaveBeenCalledWith('auto');
  });

  it('allows user to type a custom language and set it', () => {
    render(<LanguageSwitcher />);
    const input = screen.getByPlaceholderText('e.g., fr');
    const setButton = screen.getByRole('button', { name: 'Set' });

    fireEvent.change(input, { target: { value: 'de' } });
    fireEvent.click(setButton);

    expect(changeLanguageMock).toHaveBeenCalledWith('de');
  });

  it('does not call changeLanguage if the custom language input is empty', () => {
    render(<LanguageSwitcher />);
    const setButton = screen.getByRole('button', { name: 'Set' });
    fireEvent.click(setButton);
    expect(changeLanguageMock).not.toHaveBeenCalled();
  });

  it('displays the current language when a custom language is selected', () => {
    mockedUseLanguage.mockReturnValue({
      selection: 'fr',
      resolvedLanguage: 'fr',
      changeLanguage: changeLanguageMock,
    });

    render(<LanguageSwitcher />);

    expect(screen.getByText(/Current language:/)).toBeInTheDocument();
    expect(screen.getByText('fr')).toBeInTheDocument();
  });

  it('does not highlight the "Automatic" button when a custom language is selected', () => {
    mockedUseLanguage.mockReturnValue({
      selection: 'fr',
      resolvedLanguage: 'fr',
      changeLanguage: changeLanguageMock,
    });

    render(<LanguageSwitcher />);

    const autoButton = screen.getByText('settings.language.auto').closest('button');
    expect(autoButton).not.toHaveClass('bg-blue-600');
  });
});