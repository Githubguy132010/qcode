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
    <div className="space-y-2 sm:space-y-3">
      <div className="space-y-2">
        {supportedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`w-full flex items-center justify-between p-3 sm:p-3 rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation ${
              language === lang
                ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                : 'theme-filter border theme-border hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {lang === 'auto' ? (
                <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-lg">
                  {lang === 'en' ? '🇬🇧' : '🇳🇱'}
                </span>
              )}
              <span className="font-medium">{languageNames[lang]}</span>
            </div>
            {language === lang && (
              <span className="h-3 w-3 rounded-full bg-blue-600"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
