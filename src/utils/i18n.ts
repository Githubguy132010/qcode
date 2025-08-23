import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// LanguageDetector is dynamically imported later
import enTranslation from '@/locales/en.json' assert { type: 'json' };
import nlTranslation from '@/locales/nl.json' assert { type: 'json' };
import frTranslation from '@/locales/fr.json' assert { type: 'json' };
import deTranslation from '@/locales/de.json' assert { type: 'json' };
import itTranslation from '@/locales/it.json' assert { type: 'json' };
import esTranslation from '@/locales/es.json' assert { type: 'json' };

const resources = {
  en: {
    translation: enTranslation,
  },
  nl: {
    translation: nlTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  de: {
    translation: deTranslation,
  },
  it: {
    translation: itTranslation,
  },
  es: {
    translation: esTranslation,
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

  // Client-side: apply saved or detected language without re-initializing i18n
  if (isBrowser) {
    const savedLanguage = localStorage.getItem('qcode-language');
    if (savedLanguage === 'auto') {
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguage = ['en', 'nl', 'fr', 'de', 'it', 'es'].includes(browserLang) ? browserLang : 'en';
      i18n.changeLanguage(supportedLanguage);
    } else if (savedLanguage && ['en', 'nl', 'fr', 'de', 'it', 'es'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // First-time visitor: detect system language
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguage = ['en', 'nl', 'fr', 'de', 'it', 'es'].includes(browserLang) ? browserLang : 'en';
      i18n.changeLanguage(supportedLanguage);
    }
  }
}

export default i18n;
