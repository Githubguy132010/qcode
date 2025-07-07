'use client'

import { Cloud } from 'lucide-react'
import { useCloudSync } from '@/hooks/useCloudSync'

interface SyncStatusIndicatorProps {
  onClick: () => void
}

export function SyncStatusIndicator({ onClick }: SyncStatusIndicatorProps) {
  const { syncStatus, syncSettings } = useCloudSync()

  // Determine status color for the dot
  let statusColor = 'bg-gray-400'
  if (syncStatus.isSyncing) statusColor = 'bg-blue-500'
  else if (!syncStatus.isOnline) statusColor = 'bg-gray-400'
  else if (syncStatus.error) statusColor = 'bg-red-500'
  else if (syncStatus.conflictCount > 0) statusColor = 'bg-amber-500'
  else if (syncStatus.lastSync) statusColor = 'bg-green-500'

  // Determine status text
  let statusText = 'Not synced'
  if (syncStatus.isSyncing) statusText = 'Syncing...'
  else if (!syncStatus.isOnline) statusText = 'Offline'
  else if (syncStatus.error) statusText = 'Sync error'
  else if (syncStatus.conflictCount > 0) statusText = `${syncStatus.conflictCount} conflicts`
  else if (syncStatus.lastSync) {
    const timeDiff = Date.now() - syncStatus.lastSync.getTime()
    const minutes = Math.floor(timeDiff / (1000 * 60))
    if (minutes < 1) statusText = 'Just synced'
    else if (minutes < 60) statusText = `${minutes}m ago`
    else statusText = `${Math.floor(minutes / 60)}h ago`
  } else if (!syncSettings.autoSync) {
    statusText = 'Auto-sync off'
  }

  return (
    <button
      onClick={onClick}
      className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 flex items-center gap-2"
      aria-label="Cloud Sync Status"
      title="Cloud Sync Settings"
    >
      <span className={`w-2 h-2 rounded-full ${statusColor} mr-1`} />
      <Cloud className="w-5 h-5" />
      <span className="text-sm font-medium hidden sm:inline">
        {statusText}
      </span>
    </button>
  )
}
