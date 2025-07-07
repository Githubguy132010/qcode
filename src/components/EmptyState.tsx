import { Plus, ShoppingBag, Sparkles } from 'lucide-react'
import { loadDemoData } from '@/utils/demo-data'
import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
  hasAnyCodes: boolean
  onAddCode: () => void
}

export function EmptyState({ hasAnyCodes, onAddCode }: EmptyStateProps) {
  const { t } = useTranslation()
  if (!hasAnyCodes) {
    // No codes at all
    return (
      <div className="rounded-xl shadow-lg border p-12 text-center transition-all duration-300 bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-700">
          <ShoppingBag size={36} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
          {t('homePage.welcome', 'Welcome to QCode!')}
        </h3>
        <p className="mb-8 max-w-md mx-auto leading-relaxed text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
          {t('homePage.welcomeMessage', 'Begin by adding your first discount code. Keep all your discounts in one place and never miss a deal!')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onAddCode}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={20} />
            {t('homePage.noCodes.addButton')}
          </button>
          <button
            onClick={loadDemoData}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Sparkles size={20} />
            {t('settings.import.demoButton')}
          </button>
        </div>
      </div>
    )
  }

  // Has codes but none match current filters
  return (
    <div className="rounded-xl shadow-lg border p-8 text-center transition-all duration-300 bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[var(--code-display-bg)] dark:to-[var(--code-display-bg-light)] border-2 border-dashed border-[var(--code-display-border)] dark:border-[var(--code-display-border)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag size={28} className="text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)] dark:text-[var(--text-primary)]">
        {t('homePage.noCodesFiltered.title')}
      </h3>
      <p className="mb-6 leading-relaxed text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
        {t('homePage.noCodesFiltered.subtitle')}
      </p>
      <button
        onClick={onAddCode}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-all duration-200"
      >
        <Plus size={16} />
        {t('homePage.addNewCode')}
      </button>
    </div>
  )
}
