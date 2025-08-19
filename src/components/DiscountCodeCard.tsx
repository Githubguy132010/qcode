import { useState, forwardRef } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'
import type { DiscountCode } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'
import { cardVariants, springAnimation } from '@/lib/animations'

interface DiscountCodeCardProps {
  code: DiscountCode
  isExpired: boolean
  onToggleFavorite: () => void
  onToggleArchived: () => void
  onIncrementUsage: () => void
  onDelete: () => void
  viewMode?: 'list' | 'grid'
}

export const DiscountCodeCard = forwardRef<HTMLDivElement, DiscountCodeCardProps>(function DiscountCodeCard({
  code,
  isExpired,
  onToggleFavorite,
  onToggleArchived,
  onIncrementUsage,
  onDelete,
  viewMode = 'list',
}, ref) {
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
    <motion.div 
      ref={ref} 
      className={`theme-card rounded-xl shadow-lg border ${isExpired ? 'opacity-75' : ''} ${
        viewMode === 'grid'
          ? 'p-4 flex flex-col h-full'
          : 'p-6'
      }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      exit="hidden"
      layout
      transition={springAnimation}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className={`font-bold theme-text-primary ${viewMode === 'grid' ? 'text-base' : 'text-lg'}`}>{code.store}</h3>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                {t(`categories.${code.category}`, code.category)}
              </span>
              <AnimatePresence>
                {code.isFavorite && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={springAnimation}
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current drop-shadow-sm" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm theme-text-secondary">
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
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 theme-text-muted hover:theme-text-primary theme-menu-hover rounded-lg"
            whileTap={{ scale: 0.95 }}
            transition={springAnimation}
          >
            <MoreVertical size={16} />
          </motion.button>
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                className="absolute right-0 top-10 theme-menu border rounded-xl shadow-xl py-2 z-10 min-w-[180px]"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={springAnimation}
              >
                <motion.button
                  onClick={() => {
                    onToggleFavorite()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm theme-menu-hover flex items-center gap-3 theme-text-secondary"
                  whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  transition={springAnimation}
                >
                  <Heart size={14} className={code.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} />
                  {code.isFavorite ? t('codeCard.unfavorite', 'Remove from favorites') : t('codeCard.favorite', 'Add to favorites')}
                </motion.button>
                <motion.button
                  onClick={() => {
                    onToggleArchived()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm theme-menu-hover flex items-center gap-3 theme-text-secondary"
                  whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  transition={springAnimation}
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
                </motion.button>
                <motion.button
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                  whileTap={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                  transition={springAnimation}
                >
                  <Trash2 size={14} />
                  {t('common.delete', 'Delete')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Code Display */}
      <motion.div 
        className="theme-code-display border-2 border-dashed rounded-xl p-4 mb-4"
        whileHover={{ y: -2 }}
        transition={springAnimation}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs theme-text-muted mb-1 font-semibold uppercase tracking-wide">{t('codeCard.discountCodeLabel', 'DISCOUNT CODE')}</p>
            <p className={`font-mono font-bold theme-text-primary tracking-wider ${viewMode === 'grid' ? 'text-lg' : 'text-xl'}`}>{code.code}</p>
          </div>
          <motion.button
            onClick={handleCopyCode}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold"
            whileTap={{ scale: 0.95 }}
            transition={springAnimation}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="copied"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={springAnimation}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} className="text-green-500" />
                  {t('codeCard.codeCopied', 'Copied!')}
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={springAnimation}
                  className="flex items-center gap-2"
                >
                  <Copy size={16} />
                  {t('codeCard.copyCode', 'Copy code')}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Description */}
      {code.description && (
        <motion.p 
          className={`text-sm theme-text-secondary mb-4 leading-relaxed ${viewMode === 'grid' ? 'line-clamp-2' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {code.description}
        </motion.p>
      )}

      {/* Footer */}
      <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col gap-3 mt-auto' : 'justify-between'}`}>
        <div className={`flex ${viewMode === 'grid' ? 'justify-between w-full' : 'items-center gap-4'} text-xs theme-text-muted`}>
          <span className="font-medium">{t('codeCard.used', 'Used')}: {code.timesUsed}x</span>
          <span className="font-medium">{t('codeCard.added', 'Added')}: {format(code.dateAdded, 'd MMM yyyy', { locale: dateLocale })}</span>
        </div>
        <motion.button
          onClick={handleUseCode}
          disabled={isExpired}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold ${
            isExpired
              ? 'theme-filter theme-text-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
          } ${viewMode === 'grid' ? 'w-full' : ''}`}
          whileTap={!isExpired ? { scale: 0.98 } : {}}
          whileHover={!isExpired ? { y: -2, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' } : {}}
          transition={springAnimation}
        >
          {isExpired ? t('codeCard.expired', 'Expired') : t('codeCard.use', 'Use')}
        </motion.button>
      </div>
    </motion.div>
  )
})
