import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { DiscountCode } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'

interface NotificationBannerProps {
  expiringSoon: DiscountCode[]
  onClose: () => void
}

export function NotificationBanner({ expiringSoon, onClose }: NotificationBannerProps) {
  const { t } = useTranslation()
  const [dismissedCodes, setDismissedCodes] = useState<Set<string>>(new Set())

  const visibleCodes = expiringSoon.filter(code => !dismissedCodes.has(code.id))

  const handleDismiss = () => {
    // Dismiss all currently visible codes
    const newDismissed = new Set(dismissedCodes)
    visibleCodes.forEach(code => newDismissed.add(code.id))
    setDismissedCodes(newDismissed)
    onClose()
  }

  const handleDismissCode = (codeId: string) => {
    const newDismissed = new Set(dismissedCodes)
    newDismissed.add(codeId)
    setDismissedCodes(newDismissed)
  }

  // Show a message if there are no notifications
  if (visibleCodes.length === 0) {
    return (
      <div className="rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 ring-2 ring-orange-400 dark:ring-amber-500 flex items-center justify-between bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
            {t('notifications.none', 'No notifications')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-200 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-300 dark:hover:bg-orange-900/50 transition-all duration-200"
        >
          <span className="sr-only">{t('common.close')}</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl shadow-lg border p-6 mb-6 transition-all duration-300 ring-2 ring-orange-400 dark:ring-amber-500 bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)]">
      <div className="flex">
        <div className="flex-shrink-0">
          <div className="bg-orange-500 dark:from-orange-500 dark:to-amber-500 p-2 rounded-lg shadow-md">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-bold mb-2 leading-tight text-[var(--text-primary)] dark:text-[var(--text-primary)]">
            {visibleCodes.length === 1 
              ? t('notifications.singleExpiring', 'Discount code expiring soon') 
              : t('notifications.multipleExpiring', '{{count}} discount codes expiring soon', { count: visibleCodes.length })
            }
          </h3>
          <div className="space-y-2">
            {visibleCodes.slice(0, 3).map((code) => {
              const daysUntilExpiry = code.expiryDate 
                ? Math.ceil((code.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0

              return (
                <div key={code.id} className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[var(--code-display-bg)] dark:to-[var(--code-display-bg-light)] border border-[var(--code-display-border)] dark:border-[var(--code-display-border)] rounded-xl">
                  <span className="text-sm text-[var(--text-primary)] dark:text-[var(--text-primary)]">
                    <strong className="font-semibold">{code.store}</strong> 
                    <span className="font-mono text-xs ml-1">({code.code})</span> - 
                    <span className="ml-1">
                      {daysUntilExpiry === 0 ? t('notifications.expiryToday', ' expires today') : 
                       daysUntilExpiry === 1 ? t('notifications.expiryTomorrow', ' expires tomorrow') : 
                       t('notifications.expiryDays', ' expires in {{days}} days', { days: daysUntilExpiry })}
                    </span>
                  </span>
                  <button
                    onClick={() => handleDismissCode(code.id)}
                    className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30 p-1 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
            {visibleCodes.length > 3 && (
              <p className="text-xs font-medium mt-2 text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
                {t('notifications.andMore', 'And {{count}} more...', { count: visibleCodes.length - 3 })}
              </p>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-200 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-300 dark:hover:bg-orange-900/50 transition-all duration-200"
          >
            <span className="sr-only">{t('common.close')}</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for requesting notification permissions
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return 'denied'
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      })
    }
    return null
  }

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
  }
}
