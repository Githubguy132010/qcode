'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

export function HtmlLanguageAttribute({ children }: { children: React.ReactNode }) {
  const { resolvedLanguage } = useLanguage()

  useEffect(() => {
    if (resolvedLanguage) {
      document.documentElement.lang = resolvedLanguage
    }
  }, [resolvedLanguage])

  return <>{children}</>
}