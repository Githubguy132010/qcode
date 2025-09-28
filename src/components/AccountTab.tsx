'use client'

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LogOut, Github, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GoogleIcon } from './GoogleIcon'

export function AccountTab() {
  const { t } = useTranslation()
  const { user, loading, signInWithGitHub, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      key="account"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold theme-text-primary mb-2">{t('settings.account.title', 'Account')}</h3>
        <p className="text-sm theme-text-secondary">{t('settings.account.subtitle', 'Sync your data across devices by signing in.')}</p>
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="theme-filter rounded-lg p-4 flex items-center gap-4">
            <Image
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold theme-text-primary">{user.user_metadata.full_name}</p>
              <p className="text-sm theme-text-secondary">{user.email}</p>
            </div>
          </div>
          <motion.button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={18} />
            {t('settings.account.logout', 'Log Out')}
          </motion.button>
        </div>
      ) : (
        <div className="theme-filter rounded-lg p-6">
          <h4 className="text-lg font-semibold theme-text-primary mb-2 text-center">{t('settings.account.signInTitle', 'Sign in to sync')}</h4>
          <p className="text-sm theme-text-secondary mb-4 text-center">{t('settings.account.signInSubtitle', 'Enable cloud sync to keep your discount codes safe and accessible everywhere.')}</p>
          <div className="flex flex-col gap-3 justify-center">
            <motion.button
              onClick={signInWithGitHub}
              className="inline-flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Github size={18} />
              {t('settings.account.signInWithGitHub', 'Sign in with GitHub')}
            </motion.button>
            <motion.button
              onClick={signInWithGoogle}
              className="inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GoogleIcon className="h-5 w-5" />
              {t('settings.account.signInWithGoogle', 'Sign in with Google')}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}