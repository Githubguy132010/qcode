import { Plus, ShoppingBag, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
  hasAnyCodes: boolean;
  onAddCode: () => void;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasAnyCodes, onAddCode, onResetFilters }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      {hasAnyCodes ? (
        // Show "no results" message when there are codes but none match the filters
        <>
          <p className="text-lg mb-4">{t('emptyState.noResults')}</p>
          <button onClick={onResetFilters} className="text-blue-600 hover:text-blue-700 font-medium">
            {t('emptyState.resetFilters')}
          </button>
        </>
      ) : (
        // Show welcome message and add button when there are no codes at all
        <>
          <h2 className="text-xl font-semibold mb-4">{t('emptyState.welcome')}</h2>
          <p className="text-gray-600 mb-8">{t('emptyState.getStarted')}</p>
          <button onClick={onAddCode} className="w-full max-w-md flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group">
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-lg">{t('homePage.addNewCode')}</span>
          </button>
        </>
      )}
    </div>
  );
};
