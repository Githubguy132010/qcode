'use client'

import { useState } from 'react'
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle, X, Github, HardDrive, Smartphone } from 'lucide-react'
import { useCloudSync } from '@/hooks/useCloudSync'
import { ConflictResolution } from '@/types/cloud-sync'

interface CloudSyncProps {
  onManualSync: () => Promise<boolean>
  isOpen: boolean
  onClose: () => void
}

export function CloudSync({ onManualSync, isOpen, onClose }: CloudSyncProps) {
  const cloudSync = useCloudSync()
  const [showProviderSetup, setShowProviderSetup] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [isTokenVisible, setIsTokenVisible] = useState(false)

  if (!isOpen) return null

  const handleManualSync = async () => {
    await onManualSync()
  }

  const handleAddGithubProvider = () => {
    if (githubToken.trim()) {
      cloudSync.addGitHubProvider(githubToken.trim())
      setGithubToken('')
      setShowProviderSetup(false)
    }
  }

  const handleToggleProvider = (providerId: string) => {
    const currentEnabled = cloudSync.syncSettings.enabledProviders
    const newEnabled = currentEnabled.includes(providerId)
      ? currentEnabled.filter(id => id !== providerId)
      : [...currentEnabled, providerId]
    
    cloudSync.saveSyncSettings({
      ...cloudSync.syncSettings,
      enabledProviders: newEnabled
    })
  }

  const handleConflictResolutionChange = (resolution: ConflictResolution) => {
    cloudSync.saveSyncSettings({
      ...cloudSync.syncSettings,
      conflictResolution: resolution
    })
  }

  const handleAutoSyncToggle = () => {
    cloudSync.saveSyncSettings({
      ...cloudSync.syncSettings,
      autoSync: !cloudSync.syncSettings.autoSync
    })
  }

  const handleSyncIntervalChange = (interval: number) => {
    cloudSync.saveSyncSettings({
      ...cloudSync.syncSettings,
      syncInterval: interval
    })
  }

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'github-gist':
        return <Github className="w-4 h-4" />
      case 'local-cloud':
        return <HardDrive className="w-4 h-4" />
      case 'file-system':
        return <Smartphone className="w-4 h-4" />
      default:
        return <Cloud className="w-4 h-4" />
    }
  }

  const getStatusIcon = () => {
    if (cloudSync.syncStatus.isSyncing) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
    }
    if (!cloudSync.syncStatus.isOnline) {
      return <CloudOff className="w-5 h-5 text-gray-400" />
    }
    if (cloudSync.syncStatus.error) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
    if (cloudSync.syncStatus.lastSync) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <Cloud className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h2 className="text-xl font-semibold dark:text-white">Cloud Sync</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sync Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium dark:text-white">Sync Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                <div className="font-medium dark:text-white">
                  {cloudSync.syncStatus.isSyncing ? 'Syncing...' :
                   !cloudSync.syncStatus.isOnline ? 'Offline' :
                   cloudSync.syncStatus.error ? 'Error' :
                   cloudSync.syncStatus.lastSync ? 'Synced' : 'Not synced'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Last Sync</div>
                <div className="font-medium dark:text-white">
                  {cloudSync.syncStatus.lastSync 
                    ? cloudSync.syncStatus.lastSync.toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
            
            {cloudSync.syncStatus.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="text-red-800 dark:text-red-400 text-sm">
                  {cloudSync.syncStatus.error}
                </div>
              </div>
            )}

            {cloudSync.syncStatus.conflictCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="text-amber-800 dark:text-amber-400 text-sm">
                  {cloudSync.syncStatus.conflictCount} conflicts need resolution
                </div>
              </div>
            )}
          </div>

          {/* Manual Sync */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium dark:text-white">Manual Sync</h3>
            <button
              onClick={handleManualSync}
              disabled={cloudSync.syncStatus.isSyncing || !cloudSync.syncStatus.isOnline}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${cloudSync.syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              {cloudSync.syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Auto Sync Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium dark:text-white">Auto Sync</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={cloudSync.syncSettings.autoSync}
                  onChange={handleAutoSyncToggle}
                  className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="dark:text-white">Enable automatic sync</span>
              </label>
              
              {cloudSync.syncSettings.autoSync && (
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-2">
                    Sync Interval
                  </label>
                  <select
                    value={cloudSync.syncSettings.syncInterval}
                    onChange={(e) => handleSyncIntervalChange(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                    <option value={240}>Every 4 hours</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Conflict Resolution */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium dark:text-white">Conflict Resolution</h3>
            <div className="space-y-2">
              {(['local', 'remote', 'merge'] as ConflictResolution[]).map((resolution) => (
                <label key={resolution} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="conflictResolution"
                    value={resolution}
                    checked={cloudSync.syncSettings.conflictResolution === resolution}
                    onChange={() => handleConflictResolutionChange(resolution)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="dark:text-white capitalize">
                    {resolution === 'local' && 'Prefer local changes'}
                    {resolution === 'remote' && 'Prefer remote changes'}
                    {resolution === 'merge' && 'Smart merge (recommended)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cloud Providers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium dark:text-white">Cloud Providers</h3>
              <button
                onClick={() => setShowProviderSetup(!showProviderSetup)}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Add Provider
              </button>
            </div>
            
            <div className="space-y-2">
              {cloudSync.providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(provider.id)}
                    <span className="font-medium dark:text-white">{provider.name}</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cloudSync.syncSettings.enabledProviders.includes(provider.id)}
                      onChange={() => handleToggleProvider(provider.id)}
                      className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm dark:text-gray-300">Enabled</span>
                  </label>
                </div>
              ))}
            </div>

            {showProviderSetup && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                <h4 className="font-medium dark:text-white">Add GitHub Gist Provider</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-1">
                      GitHub Personal Access Token
                    </label>
                    <div className="relative">
                      <input
                        type={isTokenVisible ? 'text' : 'password'}
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setIsTokenVisible(!isTokenVisible)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {isTokenVisible ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Create a token at github.com/settings/tokens with &apos;gist&apos; scope
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddGithubProvider}
                      disabled={!githubToken.trim()}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Add Provider
                    </button>
                    <button
                      onClick={() => setShowProviderSetup(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Events */}
          {cloudSync.syncEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium dark:text-white">Recent Activity</h3>
                <button
                  onClick={cloudSync.clearSyncEvents}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cloudSync.syncEvents.map((event, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-block w-2 h-2 rounded-full
                        ${event.type === 'sync_success' ? 'bg-green-500' :
                          event.type === 'sync_error' ? 'bg-red-500' :
                          event.type === 'conflict_detected' ? 'bg-amber-500' :
                          'bg-blue-500'}
                      `} />
                      <span className="dark:text-gray-300">{event.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
