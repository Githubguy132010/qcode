import { useMemo } from 'react'
import { format, subDays, startOfDay, differenceInDays, parseISO } from 'date-fns'
import { nl, enUS } from 'date-fns/locale'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Store, 
  Tag, 
  PieChart,
  Activity,
  Clock,
  Percent,
  Euro,
  ShoppingBag
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DiscountCode } from '@/types/discount-code'

interface AnalyticsProps {
  codes: DiscountCode[]
  isExpired: (code: DiscountCode) => boolean
}

interface UsageData {
  date: string
  count: number
}

interface CategoryStats {
  category: string
  totalCodes: number
  usedCodes: number
  totalUsage: number
  averageDiscount: string
}

interface MonthlyTrend {
  month: string
  codesAdded: number
  codesUsed: number
}

export function Analytics({ codes, isExpired }: AnalyticsProps) {
  const { t, i18n } = useTranslation()
  const dateLocale = i18n.language.startsWith('nl') ? nl : enUS

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
    const sevenDaysAgo = subDays(now, 7)

    // Basic metrics
    const totalCodes = codes.length
    const activeCodes = codes.filter(code => !isExpired(code) && !code.isArchived).length
    const expiredCodes = codes.filter(code => isExpired(code) && !code.isArchived).length
    const archivedCodes = codes.filter(code => code.isArchived).length
    const totalUsage = codes.reduce((sum, code) => sum + code.timesUsed, 0)
    const averageUsagePerCode = totalCodes > 0 ? (totalUsage / totalCodes).toFixed(1) : '0'

    // Usage trends
    const recentlyUsedCodes = codes.filter(code => code.timesUsed > 0)
    const heavilyUsedCodes = codes.filter(code => code.timesUsed >= 3)
    const neverUsedCodes = codes.filter(code => code.timesUsed === 0)

    // Time-based analysis
    const codesAddedLast7Days = codes.filter(code => code.dateAdded >= sevenDaysAgo).length
    const codesAddedLast30Days = codes.filter(code => code.dateAdded >= thirtyDaysAgo).length
    
    // Savings estimation
    const estimatedSavings = codes.reduce((total, code) => {
      if (code.timesUsed === 0) return total
      
      const discountText = code.discount.toLowerCase()
      if (discountText.includes('€')) {
        const amount = parseFloat(discountText.replace(/[^0-9.]/g, ''))
        return total + (amount * code.timesUsed)
      } else if (discountText.includes('%')) {
        // Estimate €15 average per percentage point
        const percentage = parseFloat(discountText.replace(/[^0-9.]/g, ''))
        return total + (percentage * 1.5 * code.timesUsed)
      }
      return total + (10 * code.timesUsed) // Default €10 per use
    }, 0)

    // Category breakdown
    const categoryStats: CategoryStats[] = Array.from(
      codes.reduce((map, code) => {
        if (!map.has(code.category)) {
          map.set(code.category, {
            category: code.category,
            totalCodes: 0,
            usedCodes: 0,
            totalUsage: 0,
            averageDiscount: ''
          })
        }
        
        const stats = map.get(code.category)!
        stats.totalCodes++
        if (code.timesUsed > 0) stats.usedCodes++
        stats.totalUsage += code.timesUsed
        
        return map
      }, new Map<string, CategoryStats>())
    ).map(([_, stats]) => stats).sort((a, b) => b.totalUsage - a.totalUsage)

    // Monthly trends (last 6 months)
    const monthlyTrends: MonthlyTrend[] = []
    for (let i = 5; i >= 0; i--) {
      const date = subDays(now, i * 30)
      const monthStart = startOfDay(date)
      const monthEnd = subDays(monthStart, -30)
      
      const codesAdded = codes.filter(code => 
        code.dateAdded >= monthStart && code.dateAdded < monthEnd
      ).length
      
      monthlyTrends.push({
        month: format(monthStart, 'MMM', { locale: dateLocale }),
        codesAdded,
        codesUsed: 0 // Could be enhanced with usage date tracking
      })
    }

    // Store performance
    const storeStats = Array.from(
      codes.reduce((map, code) => {
        if (!map.has(code.store)) {
          map.set(code.store, {
            store: code.store,
            totalCodes: 0,
            totalUsage: 0,
            activeCodes: 0
          })
        }
        
        const stats = map.get(code.store)!
        stats.totalCodes++
        stats.totalUsage += code.timesUsed
        if (!isExpired(code) && !code.isArchived) stats.activeCodes++
        
        return map
      }, new Map<string, any>())
    ).map(([_, stats]) => stats).sort((a, b) => b.totalUsage - a.totalUsage).slice(0, 5)

    // Expiry analysis
    const expiringSoon = codes.filter(code => {
      if (!code.expiryDate || isExpired(code) || code.isArchived) return false
      const daysUntilExpiry = differenceInDays(code.expiryDate, now)
      return daysUntilExpiry <= 7
    }).length

    return {
      totalCodes,
      activeCodes,
      expiredCodes,
      archivedCodes,
      totalUsage,
      averageUsagePerCode,
      recentlyUsedCodes: recentlyUsedCodes.length,
      heavilyUsedCodes: heavilyUsedCodes.length,
      neverUsedCodes: neverUsedCodes.length,
      codesAddedLast7Days,
      codesAddedLast30Days,
      estimatedSavings,
      categoryStats,
      monthlyTrends,
      storeStats,
      expiringSoon
    }
  }, [codes, isExpired, dateLocale])

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    colorClass = "from-blue-500 to-blue-600",
    trend
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: any
    colorClass?: string
    trend?: { value: number; isPositive?: boolean }
  }) => (
    <div className="theme-card rounded-xl shadow-lg border p-6 transition-all duration-300 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`bg-gradient-to-br ${colorClass} p-2.5 rounded-lg shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-medium theme-text-secondary">{title}</h3>
          </div>
          <p className="text-2xl font-bold theme-text-primary mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm theme-text-muted">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">{t('analytics.title', 'Analytics Dashboard')}</h2>
          <p className="text-sm theme-text-secondary">{t('analytics.subtitle', 'Insights into your discount code usage')}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('analytics.totalCodes', 'Total Codes')}
          value={analytics.totalCodes}
          subtitle={t('analytics.allTimeTotal', 'All time total')}
          icon={Tag}
          colorClass="from-blue-500 to-blue-600"
        />
        <StatCard
          title={t('analytics.totalUsage', 'Total Usage')}
          value={analytics.totalUsage}
          subtitle={t('analytics.timesUsed', 'Times used')}
          icon={Activity}
          colorClass="from-green-500 to-green-600"
        />
        <StatCard
          title={t('analytics.averageUsage', 'Avg Usage')}
          value={analytics.averageUsagePerCode}
          subtitle={t('analytics.perCode', 'Uses per code')}
          icon={Target}
          colorClass="from-orange-500 to-orange-600"
        />
        <StatCard
          title={t('analytics.estimatedSavings', 'Est. Savings')}
          value={`€${analytics.estimatedSavings.toFixed(0)}`}
          subtitle={t('analytics.totalSaved', 'Total saved')}
          icon={Euro}
          colorClass="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Usage Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="theme-card rounded-xl shadow-lg border p-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            {t('analytics.usageBreakdown', 'Usage Breakdown')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.usedCodes', 'Used Codes')}</span>
              <span className="font-semibold theme-text-primary">{analytics.recentlyUsedCodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.heavilyUsed', 'Heavily Used (3+)')}</span>
              <span className="font-semibold theme-text-primary">{analytics.heavilyUsedCodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.neverUsed', 'Never Used')}</span>
              <span className="font-semibold theme-text-primary">{analytics.neverUsedCodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.expiringSoon', 'Expiring Soon')}</span>
              <span className="font-semibold text-orange-600">{analytics.expiringSoon}</span>
            </div>
          </div>
        </div>

        <div className="theme-card rounded-xl shadow-lg border p-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            {t('analytics.recentActivity', 'Recent Activity')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.addedLast7Days', 'Added Last 7 Days')}</span>
              <span className="font-semibold theme-text-primary">{analytics.codesAddedLast7Days}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.addedLast30Days', 'Added Last 30 Days')}</span>
              <span className="font-semibold theme-text-primary">{analytics.codesAddedLast30Days}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.activeCodes', 'Active Codes')}</span>
              <span className="font-semibold text-green-600">{analytics.activeCodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm theme-text-secondary">{t('analytics.expiredCodes', 'Expired Codes')}</span>
              <span className="font-semibold text-red-600">{analytics.expiredCodes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="theme-card rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center gap-2">
          <Tag className="h-5 w-5 text-indigo-500" />
          {t('analytics.categoryPerformance', 'Category Performance')}
        </h3>
        <div className="space-y-4">
          {analytics.categoryStats.slice(0, 6).map((category, index) => (
            <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  index === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                  index === 2 ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium theme-text-primary">{t(`categories.${category.category}`, category.category)}</p>
                  <p className="text-sm theme-text-secondary">{category.totalCodes} codes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold theme-text-primary">{category.totalUsage} uses</p>
                <p className="text-sm theme-text-secondary">{category.usedCodes} active</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Stores */}
      <div className="theme-card rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-6 flex items-center gap-2">
          <Store className="h-5 w-5 text-green-500" />
          {t('analytics.topStores', 'Top Performing Stores')}
        </h3>
        <div className="space-y-4">
          {analytics.storeStats.map((store, index) => (
            <div key={store.store} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white text-sm font-bold`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium theme-text-primary">{store.store}</p>
                  <p className="text-sm theme-text-secondary">{store.totalCodes} codes total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold theme-text-primary">{store.totalUsage} uses</p>
                <p className="text-sm theme-text-secondary">{store.activeCodes} active</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="theme-card rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-purple-500" />
          {t('analytics.recommendations', 'Recommendations')}
        </h3>
        <div className="space-y-3">
          {analytics.neverUsedCodes > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('analytics.recommendation.neverUsed', 'You have {{count}} unused codes. Consider using them before they expire!', { count: analytics.neverUsedCodes })}
              </p>
            </div>
          )}
          {analytics.expiringSoon > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {t('analytics.recommendation.expiringSoon', '{{count}} codes are expiring soon. Use them now!', { count: analytics.expiringSoon })}
              </p>
            </div>
          )}
          {analytics.heavilyUsedCodes > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('analytics.recommendation.heavilyUsed', 'Great job! You\'ve used {{count}} codes frequently.', { count: analytics.heavilyUsedCodes })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
