import { CustomTheme } from '@/hooks/useDarkMode'

export const lightThemeColors: CustomTheme = {
  '--background': '#fafbfc',
  '--background-light': '#f1f5f9',
  '--foreground': '#0f172a',
  '--card-bg': '#ffffff',
  '--card-border': '#e2e8f0',
  '--input-bg': '#ffffff',
  '--input-border': '#94a3b8',
  '--accent-blue': '#2563eb',
  '--accent-blue-hover': '#1d4ed8',
}

export const darkThemeColors: CustomTheme = {
  '--background': '#0f172a',
  '--background-light': '#020617',
  '--foreground': '#f8fafc',
  '--card-bg': '#1e293b',
  '--card-border': '#334155',
  '--input-bg': '#334155',
  '--input-border': '#64748b',
  '--accent-blue': '#60a5fa',
  '--accent-blue-hover': '#93c5fd',
}
