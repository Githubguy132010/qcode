'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LogIn, LogOut, Github, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="matrix(1,0,0,1,2.3,2.3)">
      <path
        d="M 19.6 9.18 C 19.6 8.58 19.54 7.98 19.44 7.38 L 10 7.38 L 10 10.88 L 15.5 10.88 C 15.26 12.28 14.48 13.48 13.34 14.28 L 13.34 16.58 L 16.14 16.58 C 18.24 14.68 19.6 12.18 19.6 9.18 Z"
        fill="#4285F4"
      />
      <path
        d="M 10 20 C 12.7 20 15.02 19.06 16.74 17.48 L 13.94 15.18 C 13.04 15.78 11.64 16.28 10 16.28 C 7.14 16.28 4.76 14.38 3.92 11.88 L 1.02 11.88 L 1.02 14.28 C 2.72 17.68 6.08 20 10 20 Z"
        fill="#34A853"
      />
      <path
        d="M 3.92 11.88 C 3.72 11.28 3.62 10.68 3.62 10 C 3.62 9.32 3.72 8.72 3.92 8.12 L 3.92 5.72 L 1.02 5.72 C 0.38 7.02 0 8.48 0 10 C 0 11.52 0.38 12.98 1.02 14.28 L 3.92 11.88 Z"
        fill="#FBBC05"
      />
      <path
        d="M 10 3.72 C 11.44 3.72 12.78 4.24 13.78 5.18 L 16.84 2.12 C 15.02 0.82 12.7 0 10 0 C 6.08 0 2.72 2.32 1.02 5.72 L 3.92 8.12 C 4.76 5.62 7.14 3.72 10 3.72 Z"
        fill="#EA4335"
      />
    </g>
  </svg>
);

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
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold theme-text-primary mb-2">{t('settings.account.signInTitle', 'Connect your account')}</h4>
            <p className="text-sm theme-text-secondary mb-4">{t('settings.account.signInSubtitle', 'Enable cloud sync to keep your discount codes safe and accessible everywhere.')}</p>
          </div>
          <motion.button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-5 rounded-lg shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github size={18} />
            {t('settings.account.signInWithGitHub', 'Sign in with GitHub')}
          </motion.button>
          <motion.button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-5 rounded-lg shadow-md border border-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GoogleIcon />
            {t('settings.account.signInWithGoogle', 'Sign in with Google')}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}