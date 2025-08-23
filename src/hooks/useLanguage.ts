import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';

export type LanguageOption = 'auto' | 'en' | 'nl' | 'fr' | 'de' | 'it' | 'es';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageOption>('auto');
  
  // Get the currently active language
  const currentLanguage = i18n.language || 'en';
  
  // Initialize language state from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('qcode-language') as LanguageOption | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // First-time visitor: default to 'auto' (detect system language)
      setLanguage('auto');
      localStorage.setItem('qcode-language', 'auto');
    }
  }, []);

  // Handle language change
  const changeLanguage = useCallback((newLanguage: LanguageOption) => {
    setLanguage(newLanguage);
    localStorage.setItem('qcode-language', newLanguage);
    
    // If auto, use browser language or default to English
    if (newLanguage === 'auto') {
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguage = ['en', 'nl', 'fr', 'de', 'it', 'es'].includes(browserLang) ? browserLang : 'en';
      i18n.changeLanguage(supportedLanguage);
    } else {
      i18n.changeLanguage(newLanguage);
    }
  }, [i18n]);

  return {
    language,
    currentLanguage,
    changeLanguage,
    supportedLanguages: ['auto', 'en', 'nl', 'fr', 'de', 'it', 'es'] as const,
  };
};
