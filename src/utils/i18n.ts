import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// LanguageDetector is dynamically imported later
import enTranslation from '@/locales/en.json' assert { type: 'json' };
import nlTranslation from '@/locales/nl.json' assert { type: 'json' };

const resources = {
  en: {
    translation: enTranslation,
  },
  nl: {
    translation: nlTranslation,
  },
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize i18n with proper SSR handling
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      lng: 'en', // Default language for SSR
    });

  // Add language detector only on client side
  if (isBrowser) {
    import('i18next-browser-languagedetector').then((LanguageDetector) => {
      i18n.use(LanguageDetector.default);
      i18n.init({
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      });
    });

    // Try to load saved language preference
    const savedLanguage = localStorage.getItem('qcode-language');
    if (savedLanguage === 'auto') {
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguage = ['en', 'nl'].includes(browserLang) ? browserLang : 'en';
      i18n.changeLanguage(supportedLanguage);
    } else if (savedLanguage === 'en' || savedLanguage === 'nl') {
      i18n.changeLanguage(savedLanguage);
    } else {
      // First-time visitor: detect system language
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguage = ['en', 'nl'].includes(browserLang) ? browserLang : 'en';
      i18n.changeLanguage(supportedLanguage);
    }
  }
}

export default i18n;
