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
              notifications: 'Notifications',
              settings: 'Settings'
            },
            navigation: {
              home: 'Home',
              analytics: 'Analytics'
            }
          }
        }
      }
    });
  });

  it('renders title, tagline, and header actions (no theme toggle expected)', () => {
    render(
      <I18nextProvider i18n={i18next}>
        <Header onNotificationClick={() => {}} onSettingsClick={() => {}} />
      </I18nextProvider>
    );

    // With the project i18n test mock, untranslated keys render as keys
    expect(screen.getByText('common.appName')).toBeInTheDocument();
    expect(screen.getByText('common.tagline')).toBeInTheDocument();

    // Header actions present (notifications and settings)
    expect(screen.getByLabelText('header.notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('header.settings')).toBeInTheDocument();
  });
});
