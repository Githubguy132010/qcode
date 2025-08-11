import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { LanguageOption, useLanguage } from '@/hooks/useLanguage';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, changeLanguage, supportedLanguages } = useLanguage();

  const languageNames: Record<LanguageOption, string> = {
    auto: t('settings.language.auto'),
    en: t('settings.language.english'),
    nl: t('settings.language.dutch'),
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-2 sm:space-y-3">
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation ${
              language === lang
                ? 'bg-blue-600 text-white border border-blue-500 shadow-lg'
                : 'theme-card border theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {lang === 'auto' ? (
                <Globe className={`h-5 w-5 ${language === lang ? 'text-white' : 'theme-text-muted'}`} />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-lg">
                  {lang === 'en' ? '🇬🇧' : '🇳🇱'}
                </span>
              )}
              <span className={`font-medium ${language === lang ? 'text-white' : 'theme-text-primary'}`}>{languageNames[lang]}</span>
            </div>
            {language === lang && (
              <span className="h-3 w-3 rounded-full bg-white"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
