import { useState } from 'react'
import { format } from 'date-fns'
import { nl, enUS } from 'date-fns/locale'
import { 
  Heart, 
  Copy, 
  Calendar, 
  Store, 
  MoreVertical, 
  Archive, 
  Trash2,
  RotateCcw,
  CheckCircle
} from 'lucide-react'
import type { DiscountCode } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'

interface DiscountCodeCardProps {
  code: DiscountCode
  isExpired: boolean
  onToggleFavorite: () => void
  onToggleArchived: () => void
  onIncrementUsage: () => void
  onDelete: () => void
  onEdit: (updates: Partial<DiscountCode>) => void
}

export function DiscountCodeCard({
  code,
  isExpired,
  onToggleFavorite,
  onToggleArchived,
  onIncrementUsage,
  onDelete,
}: DiscountCodeCardProps) {
  const { t, i18n } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Use the appropriate locale for date formatting based on current language
  const dateLocale = i18n.language.startsWith('nl') ? nl : enUS

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleUseCode = () => {
    onIncrementUsage()
    handleCopyCode()
  }

  const getExpiryColor = () => {
    if (!code.expiryDate) return 'text-gray-500'
    if (isExpired) return 'text-red-500'
    
    const daysUntilExpiry = Math.ceil(
      (code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysUntilExpiry <= 7) return 'text-orange-500'
    return 'text-gray-500'
  }

  const getExpiryText = () => {
    if (!code.expiryDate) return t('codeCard.noExpiryDate', 'No expiry date')
    if (isExpired) return t('codeCard.expired', 'Expired')
    
    const daysUntilExpiry = Math.ceil(
      (code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysUntilExpiry === 0) return t('codeCard.expiryToday', 'Expires today')
    if (daysUntilExpiry === 1) return t('codeCard.expiryTomorrow', 'Expires tomorrow')
    if (daysUntilExpiry <= 7) return t('codeCard.expiryDays', 'Expires in {{days}} days', { days: daysUntilExpiry })
    
    return format(code.expiryDate, 'd MMM yyyy', { locale: dateLocale })
  }

  return (
    <div className={`rounded-xl shadow-lg border p-6 transition-all duration-300 bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)] ${isExpired ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-[var(--text-primary)] dark:text-[var(--text-primary)]">{code.store}</h3>
            <span className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
              {t(`categories.${code.category}`, code.category)}
            </span>
            {code.isFavorite && (
              <Heart className="w-5 h-5 text-red-500 fill-current drop-shadow-sm" />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <Store size={14} className="text-gray-400" />
              <span className="font-medium">{code.discount}</span>
            </div>
            {code.expiryDate && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span className={`font-medium ${getExpiryColor()}`}>{getExpiryText()}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white dark:bg-[var(--menu-bg)] border border-[var(--menu-border)] dark:border-[var(--menu-border)] rounded-xl shadow-xl py-2 z-10 min-w-[180px]">
              <button
                onClick={() => {
                  onToggleFavorite()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-[var(--menu-hover)] flex items-center gap-3 text-[var(--text-secondary)] dark:text-[var(--text-secondary)] transition-colors"
              >
                <Heart size={14} className={code.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} />
                {code.isFavorite ? t('codeCard.unfavorite', 'Remove from favorites') : t('codeCard.favorite', 'Add to favorites')}
              </button>
              <button
                onClick={() => {
                  onToggleArchived()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-[var(--menu-hover)] flex items-center gap-3 text-[var(--text-secondary)] dark:text-[var(--text-secondary)] transition-colors"
              >
                {code.isArchived ? (
                  <>
                    <RotateCcw size={14} className="text-gray-400" />
                    {t('codeCard.unarchive', 'Unarchive')}
                  </>
                ) : (
                  <>
                    <Archive size={14} className="text-gray-400" />
                    {t('codeCard.archive', 'Archive')}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
                {t('common.delete', 'Delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[var(--code-display-bg)] dark:to-[var(--code-display-bg-light)] border-2 border-dashed border-[var(--code-display-border)] dark:border-[var(--code-display-border)] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-1 font-semibold uppercase tracking-wide">{t('codeCard.discountCodeLabel', 'DISCOUNT CODE')}</p>
            <p className="font-mono text-xl font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] tracking-wider">{code.code}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                {t('codeCard.codeCopied', 'Copied!')}
              </>
            ) : (
              <>
                <Copy size={16} />
                {t('codeCard.copyCode', 'Copy code')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      {code.description && (
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-4 leading-relaxed">{code.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">
          <span className="font-medium">{t('codeCard.used', 'Used')}: {code.timesUsed}x</span>
          <span className="font-medium">{t('codeCard.added', 'Added')}: {format(code.dateAdded, 'd MMM yyyy', { locale: dateLocale })}</span>
        </div>
        <button
          onClick={handleUseCode}
          disabled={isExpired}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isExpired
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isExpired ? t('codeCard.expired', 'Expired') : t('codeCard.use', 'Use')}
        </button>
      </div>
    </div>
  )
}
