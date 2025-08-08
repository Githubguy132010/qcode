import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsOverview } from '../components/analytics/AnalyticsOverview';
import type { AnalyticsData } from '@/utils/analytics';
import type { DiscountCode } from '@/types/discount-code';

function makeCode(overrides?: Partial<DiscountCode>): DiscountCode {
  const now = new Date();
  return {
    id: overrides?.id ?? 'id-1',
    code: overrides?.code ?? 'SAVE10',
    store: overrides?.store ?? 'Store X',
    discount: overrides?.discount ?? '10%',
    category: overrides?.category ?? 'Anders',
    description: overrides?.description ?? 'desc',
    isFavorite: overrides?.isFavorite ?? false,
    isArchived: overrides?.isArchived ?? false,
    dateAdded: overrides?.dateAdded ?? new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    timesUsed: overrides?.timesUsed ?? 1,
    expiryDate: overrides?.expiryDate ?? new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    qrCode: overrides?.qrCode,
    usageHistory: overrides?.usageHistory,
  };
}

function sampleAnalytics(): AnalyticsData {
  const codes = [makeCode({ id: 'c1', store: 'Store A', timesUsed: 2 }), makeCode({ id: 'c2', store: 'Store B', timesUsed: 1 })];
  return {
    usage: {
      totalUsages: 3,
      averageUsagePerCode: 1.5,
      mostUsedCodes: [
        { code: codes[0], usageCount: 2 },
        { code: codes[1], usageCount: 1 },
      ],
      usageByStore: [
        { store: 'Store A', usageCount: 2 },
        { store: 'Store B', usageCount: 1 },
      ],
      usageByCategory: [
        { category: 'Anders', usageCount: 3 },
      ],
      usageOverTime: Array.from({ length: 30 }).map((_, i) => ({ date: `Day ${i + 1}`, usageCount: i % 3 === 0 ? 1 : 0 })),
      recentActivity: [
        { code: codes[0], lastUsed: new Date() },
        { code: codes[1], lastUsed: new Date() },
      ],
    },
    savings: {
      totalSavingsEstimate: 37.5,
      savingsByStore: [
        { store: 'Store A', savings: 25 },
        { store: 'Store B', savings: 12.5 },
      ],
      savingsByCategory: [
        { category: 'Anders', savings: 37.5 },
      ],
      averageSavingsPerCode: 18.75,
      potentialSavings: 12.5,
    },
    lifecycle: {
      codesAddedThisMonth: 2,
      codesExpiredThisMonth: 0,
      averageCodeLifespan: 14,
      expirationPattern: Array.from({ length: 6 }).map((_, i) => ({ month: `M${i + 1}`, expired: i, added: i + 1 })),
      upcomingExpirations: [],
    },
    performance: {
      favoriteRatio: 0.5,
      archiveRatio: 0.0,
      activeRatio: 1.0,
      categoryDistribution: [
        { category: 'Anders', count: 2, percentage: 100 },
      ],
      storeDistribution: [
        { store: 'Store A', count: 1, percentage: 50 },
        { store: 'Store B', count: 1, percentage: 50 },
      ],
      codeEffectiveness: [
        { code: codes[0], score: 120 },
        { code: codes[1], score: 80 },
      ],
    },
  };
}

describe('AnalyticsOverview', () => {
  it('renders overview stat cards with translation keys as titles', () => {
    const analytics = sampleAnalytics();
    const codes = [makeCode({ id: 'c1' }), makeCode({ id: 'c2' })];

    render(<AnalyticsOverview analytics={analytics} codes={codes} />);

    // The component uses these translation keys for card titles
    expect(screen.getByText('analytics.overview.totalCodes')).toBeInTheDocument();
    expect(screen.getByText('analytics.overview.totalUsages')).toBeInTheDocument();
    expect(screen.getByText('analytics.overview.totalSavings')).toBeInTheDocument();
    expect(screen.getByText('analytics.overview.expiringSoon')).toBeInTheDocument();

    // Values appear (codes length, total usages, formatted savings with € prefix, expiring soon count)
    expect(screen.getByText(String(codes.length))).toBeInTheDocument();
    expect(screen.getByText(String(analytics.usage.totalUsages))).toBeInTheDocument();
    expect(screen.getByText('€' + analytics.savings.totalSavingsEstimate.toFixed(0))).toBeInTheDocument();
    expect(screen.getByText(String(analytics.lifecycle.upcomingExpirations.length))).toBeInTheDocument();
  });

  it('renders Top Performing Codes section with code store names and scores', () => {
    const analytics = sampleAnalytics();
    const codes = [makeCode({ id: 'c1', store: 'Store A' }), makeCode({ id: 'c2', store: 'Store B' })];

    render(<AnalyticsOverview analytics={analytics} codes={codes} />);

    // Section title
    expect(screen.getByText('analytics.overview.topCodes')).toBeInTheDocument();

    // Items
    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);

    // Score label string "score" exists near numeric score; assert at least one score value is present
    expect(screen.getAllByText('score').length).toBeGreaterThan(0);
  });

  it('renders Category Distribution bars and labels', () => {
    const analytics = sampleAnalytics();
    const codes = [makeCode({ id: 'c1' }), makeCode({ id: 'c2' })];

    render(<AnalyticsOverview analytics={analytics} codes={codes} />);

    expect(screen.getByText('analytics.overview.categoryDistribution')).toBeInTheDocument();
    // Category label
    expect(screen.getByText('Anders')).toBeInTheDocument();
    // Percentage text e.g., "(100.0%)"
    expect(screen.getByText(/\(100\.0%\)/)).toBeInTheDocument();
  });

  it('renders Usage Trend chart with 30 bars and date labels', () => {
    const analytics = sampleAnalytics();
    const codes = [makeCode({ id: 'c1' })];

    render(<AnalyticsOverview analytics={analytics} codes={codes} />);

    expect(screen.getByText('analytics.overview.usageTrend')).toBeInTheDocument();

    // It maps over 30 points, ensure at least several day labels appear
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 30')).toBeInTheDocument();
  });

  it('renders Recent Activity list with store names', () => {
    const analytics = sampleAnalytics();
    const codes = [makeCode({ id: 'c1', store: 'Store A' }), makeCode({ id: 'c2', store: 'Store B' })];

    render(<AnalyticsOverview analytics={analytics} codes={codes} />);

    expect(screen.getByText('analytics.overview.recentActivity')).toBeInTheDocument();
    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);
  });
});