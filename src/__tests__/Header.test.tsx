import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../components/Header';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';

describe('Header', () => {
  // Setup a simple i18next instance for testing
  beforeAll(() => {
    i18next.init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            common: {
              appName: 'QCode',
              tagline: 'Manage Discount Codes'
            },
            header: {
              darkMode: 'Switch to dark theme',
              lightMode: 'Switch to light theme',
              notifications: 'Notifications',
              settings: 'Settings'
            }
          }
        }
      }
    });
  });

  it('renders the app title', () => {
    render(
      <I18nextProvider i18n={i18next}>
        <Header onSettingsClick={() => {}} />
      </I18nextProvider>
    );
    expect(screen.getByText('common.appName')).toBeInTheDocument();
  });
});
