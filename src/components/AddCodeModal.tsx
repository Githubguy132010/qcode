import { useState } from 'react'
import { X } from 'lucide-react'
import type { DiscountCodeFormData } from '@/types/discount-code'
import { DISCOUNT_CATEGORIES, CATEGORY_TRANSLATION_KEYS } from '@/types/discount-code'
import { useTranslation } from 'react-i18next'
import QRScan from './QRScan'

interface AddCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (formData: DiscountCodeFormData) => void
}

export function AddCodeModal({ isOpen, onClose, onAdd }: AddCodeModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<DiscountCodeFormData>({
    code: '',
    store: '',
    discount: '',
    expiryDate: '',
    category: DISCOUNT_CATEGORIES[0],
    description: '',
  })

  const [errors, setErrors] = useState<Partial<DiscountCodeFormData>>({})
  const [showQRScanner, setShowQRScanner] = useState(false)

  const validateForm = () => {
    const newErrors: Partial<DiscountCodeFormData> = {}

    if (!formData.code.trim()) {
      newErrors.code = t('validation.codeRequired', 'Discount code is required')
    }

    if (!formData.store.trim()) {
      newErrors.store = t('validation.storeRequired', 'Store is required')
    }

    if (!formData.discount.trim()) {
      newErrors.discount = t('validation.discountRequired', 'Discount is required')
    }

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (expiryDate < today) {
        newErrors.expiryDate = t('validation.expiryDateInPast', 'Expiry date cannot be in the past')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onAdd(formData)
    
    // Reset form
    setFormData({
      code: '',
      store: '',
      discount: '',
      expiryDate: '',
      category: DISCOUNT_CATEGORIES[0],
      description: '',
    })
    setErrors({})
    onClose()
  }

  const handleChange = (field: keyof DiscountCodeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Voeg deze functie toe om QR-scan resultaat te verwerken
  const handleQRScan = (value: string) => {
    setFormData(prev => ({ ...prev, code: value }))
    setShowQRScanner(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {showQRScanner && (
        <QRScan
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
      <div className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[var(--card-bg)] dark:border-[var(--card-border)] border">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">
            {t('addCode.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.codeLabel')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder={t('addCode.codePlaceholder')}
                className={`w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent ${
                  errors.code ? 'border-red-500' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="px-3 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white rounded-lg flex items-center"
                title="Scan QR code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25v-1.5A1.5 1.5 0 0 1 5.25 2.25h1.5m10.5 0h1.5a1.5 1.5 0 0 1 1.5 1.5v1.5m0 10.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-1.5m-10.5 0h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h.008v.008H7.5V12zm3 0h.008v.008H10.5V12zm3 0h.008v.008H13.5V12zm3 0h.008v.008H16.5V12z" />
                </svg>
              </button>
            </div>
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
          </div>

          {/* Store */}
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.storeLabel')}
            </label>
            <input
              type="text"
              id="store"
              value={formData.store}
              onChange={(e) => handleChange('store', e.target.value)}
              placeholder={t('addCode.storePlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent ${
                errors.store ? 'border-red-500' : ''
              }`}
            />
            {errors.store && (
              <p className="text-red-500 text-sm mt-1">{errors.store}</p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.discountLabel')}
            </label>
            <input
              type="text"
              id="discount"
              value={formData.discount}
              onChange={(e) => handleChange('discount', e.target.value)}
              placeholder={t('addCode.discountPlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent ${
                errors.discount ? 'border-red-500' : ''
              }`}
            />
            {errors.discount && (
              <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.categoryLabel')}
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent"
            >
              {DISCOUNT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(CATEGORY_TRANSLATION_KEYS[category])}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.expiryDateLabel')}
            </label>
            <input
              type="date"
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent ${
                errors.expiryDate ? 'border-red-500' : ''
              }`}
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-1">
              {t('addCode.descriptionLabel')}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('addCode.descriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-[var(--input-bg)] dark:bg-[var(--input-bg)] border-[var(--input-border)] dark:border-[var(--input-border)] text-[var(--text-primary)] dark:text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--input-border)] text-[var(--text-secondary)] dark:text-[var(--text-secondary)] rounded-lg hover:bg-[var(--filter-bg)] transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white rounded-lg transition-colors"
            >
              {t('addCode.saveButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
