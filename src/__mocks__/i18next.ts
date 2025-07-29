import i18next from 'i18next';

// Mock translation data that matches the actual locale files
const mockTranslations = {
  'stats.title': 'Overview',
  'stats.totalCodes': 'Total codes',
  'stats.activeCodes': 'Active',
  'stats.expiredCodes': 'Expired',
  'stats.favoriteCodes': 'Favorites',
  'stats.expiringSoon': 'Expiring soon',
  'stats.archivedCodes': 'Archived codes',
  'stats.clickToView': 'Click to view {{type}} codes',
  'stats.viewExpired': 'expired',
  'stats.viewFavorites': 'favorite',
  'stats.viewExpiringSoon': 'expiring soon',
  'codeCard.timesUsed': 'Used {{count}} times',
  'codeCard.timesUsed_other': 'Used {{count}} times',
  'dashboard.tabs.overview': 'Overview',
  'dashboard.tabs.search': 'Search',
  'dashboard.tabs.notifications': 'Notifications',
  'filters.title': 'Search & Filter',
  'filters.searchPlaceholder': 'Search by code or store...',
  'notifications.singleExpiring': 'Discount code expiring soon',
  'notifications.multipleExpiring': '{{count}} discount codes expiring soon',
  'notifications.noExpiring': 'All caught up!',
  'notifications.noExpiringDescription': 'No discount codes are expiring soon.',
};

// Interface for translation options
interface TranslationOptions {
  type?: string;
  count?: number;
  days?: number;
  [key: string]: string | number | undefined;
}

// Create a mock i18next instance for tests
// Only run this mock during test environment
if (process.env.NODE_ENV === 'test') {
  jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (key: string, options?: TranslationOptions) => {
          // Get the base translation
          let translation = mockTranslations[key as keyof typeof mockTranslations] || key;
          
          // Handle placeholder interpolation
          if (options && typeof translation === 'string') {
            // Replace {{type}} placeholder
            if (options.type) {
              translation = translation.replace(/\{\{type\}\}/g, options.type);
            }
            // Replace {{count}} placeholder
            if (options.count !== undefined) {
              translation = translation.replace(/\{\{count\}\}/g, options.count.toString());
            }
            // Replace other placeholders like {{days}}
            if (options.days !== undefined) {
              translation = translation.replace(/\{\{days\}\}/g, options.days.toString());
            }
          }
          
          return translation;
        },
        i18n: {
          changeLanguage: () => new Promise(() => {}),
          language: 'en',
        },
      };
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  }));
}

export default i18next;
