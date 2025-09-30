import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  // This state represents the user's selection in the UI
  const [selection, setSelection] = useState<string>('auto');

  // Effect to sync the UI selection with the actual state from localStorage
  useEffect(() => {
    // This effect runs on the client side only
    const savedLang = localStorage.getItem('qcode-language');
    if (savedLang) {
      setSelection(savedLang);
    } else {
      setSelection('auto');
    }
  }, [i18n.resolvedLanguage]); // Update when language actually changes

  const changeLanguage = useCallback((lang: string) => {
    if (lang === 'auto') {
      // To go back to auto-detection, we remove the override from localStorage
      localStorage.removeItem('qcode-language');
      // Then we need to trigger a re-detection and language change.
      // A page reload is the most reliable way.
      window.location.reload();
    } else {
      // i18next will change the language and the detector will cache it.
      i18n.changeLanguage(lang);
    }
  }, [i18n]);

  return {
    selection, // The value for the UI ('auto' or a language code)
    resolvedLanguage: i18n.resolvedLanguage, // The language currently rendered
    changeLanguage,
  };
};