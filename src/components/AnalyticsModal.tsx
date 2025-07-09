import { X } from 'lucide-react'
import { Analytics } from './Analytics'
import { useTranslation } from 'react-i18next'
import type { DiscountCode } from '@/types/discount-code'

interface AnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  codes: DiscountCode[]
  isExpired: (code: DiscountCode) => boolean
}

export function AnalyticsModal({ isOpen, onClose, codes, isExpired }: AnalyticsModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="theme-modal max-w-7xl w-full max-h-[90vh] rounded-xl shadow-2xl border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b theme-border">
          <h2 className="text-xl font-semibold theme-text-primary">
            {t('analytics.title', 'Analytics Dashboard')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary hover:theme-text-primary theme-hover rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Analytics codes={codes} isExpired={isExpired} />
        </div>
      </div>
    </div>
  )
}
