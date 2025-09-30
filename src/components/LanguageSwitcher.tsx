'use client'

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { selection, changeLanguage } = useLanguage();
  const [customLang, setCustomLang] = useState('');

  const handleSetLanguage = () => {
    if (customLang.trim()) {
      changeLanguage(customLang.trim());
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium theme-text-primary">
        {t('settings.language.title')}
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => changeLanguage('auto')}
          className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation ${
            selection === 'auto'
              ? 'bg-blue-600 text-white border border-blue-500 shadow-lg'
              : 'theme-card border theme-text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <Globe className={`h-5 w-5 ${selection === 'auto' ? 'text-white' : 'theme-text-muted'}`} />
            <span className={`font-medium ${selection === 'auto' ? 'text-white' : 'theme-text-primary'}`}>{t('settings.language.auto')}</span>
          </div>
          {selection === 'auto' && (
            <span className="h-3 w-3 rounded-full bg-white"></span>
          )}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm theme-text-secondary">
          Or enter a language code (e.g., &quot;fr&quot;, &quot;es&quot;, &quot;de&quot;):
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customLang}
            onChange={(e) => setCustomLang(e.target.value)}
            placeholder="e.g., fr"
            className="flex-grow p-2 border rounded-md theme-bg-subtle theme-text-primary focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSetLanguage}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Set
          </button>
        </div>
        {selection !== 'auto' && (
           <p className="text-sm theme-text-secondary">
             Current language: <span className="font-semibold">{selection}</span>
           </p>
        )}
      </div>
    </div>
  );
}