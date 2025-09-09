'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'qcode-store-preferences'

// For now, we only support Amazon, but this can be extended.
export const SUPPORTED_STORES = ['Amazon', 'Coolblue'] as const
export type SupportedStore = typeof SUPPORTED_STORES[number]

export function useStorePreferences() {
  const [selectedStores, setSelectedStores] = useState<SupportedStore[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load preferences from localStorage
  useEffect(() => {
    if (!isClient) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedStores = JSON.parse(stored)
        // Basic validation
        if (Array.isArray(parsedStores)) {
          setSelectedStores(parsedStores.filter(store => SUPPORTED_STORES.includes(store)))
        }
      }
    } catch (error) {
      console.error('Error loading store preferences:', error)
    }
  }, [isClient])

  // Save preferences to localStorage
  const savePreferences = useCallback((newStores: SupportedStore[]) => {
    if (!isClient) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStores))
      setSelectedStores(newStores)
    } catch (error) {
      console.error('Error saving store preferences:', error)
    }
  }, [isClient])

  // Toggle a store's selection status
  const toggleStore = useCallback((store: SupportedStore) => {
    const newStores = selectedStores.includes(store)
      ? selectedStores.filter(s => s !== store)
      : [...selectedStores, store]
    savePreferences(newStores)
  }, [selectedStores, savePreferences])

  return {
    selectedStores,
    toggleStore,
    supportedStores: SUPPORTED_STORES,
  }
}
