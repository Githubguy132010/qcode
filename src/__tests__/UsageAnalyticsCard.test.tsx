import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsageAnalyticsCard } from '../components/analytics/UsageAnalyticsCard';
import type { UsageAnalytics } from '@/utils/analytics';
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
    dateAdded: overrides?.dateAdded ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    timesUsed: overrides?.timesUsed ?? 1,
    expiryDate: overrides?.expiryDate ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    qrCode: overrides?.qrCode,
    usageHistory: overrides?.usageHistory,
  };
}

describe('UsageAnalyticsCard', () => {
  const codes = [makeCode({ id: 'c1', store: 'Store A' }), makeCode({ id: 'c2', store: 'Store B' })];

  const analytics: UsageAnalytics = {
    totalUsages: 5,
    averageUsagePerCode: 2.5,
    mostUsedCodes: [
      { code: codes[0], usageCount: 3 },
      { code: codes[1], usageCount: 2 },
    ],
    usageByStore: [
      { store: 'Store A', usageCount: 3 },
      { store: 'Store B', usageCount: 2 },
    ],
    usageByCategory: [
      { category: 'Anders', usageCount: 5 },
    ],
    usageOverTime: Array.from({ length: 30 }).map((_, i) => ({ date: `Day ${i + 1}`, usageCount: i % 5 === 0 ? 1 : 0 })),
    recentActivity: [
      { code: codes[0], lastUsed: new Date() },
      { code: codes[1], lastUsed: new Date() },
    ],
  };

  it('renders usage summary, most used list, by-store and by-category sections with values', () => {
    render(<UsageAnalyticsCard analytics={analytics} />);

    // Summary section labels (i18n keys)
    expect(screen.getByText('analytics.usage.summary')).toBeInTheDocument();
    expect(screen.getByText('analytics.usage.totalUsages')).toBeInTheDocument();
    expect(screen.getByText('analytics.usage.averagePerCode')).toBeInTheDocument();

    // Summary values
    expect(screen.getByText(String(analytics.totalUsages))).toBeInTheDocument();
    expect(screen.getByText(analytics.averageUsagePerCode.toFixed(1))).toBeInTheDocument();

    // Most used list
    expect(screen.getByText('analytics.usage.mostUsed')).toBeInTheDocument();
    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);
    // Usage chip label - match generic "usages" text (either key or localized)
    const usageLabels = screen.getAllByText(/usages/i);
    expect(usageLabels.length).toBeGreaterThan(0);

    // Usage by store
    expect(screen.getByText('analytics.usage.byStore')).toBeInTheDocument();
    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);

    // Usage by category
    expect(screen.getByText('analytics.usage.byCategory')).toBeInTheDocument();
    expect(screen.getByText('Anders')).toBeInTheDocument();
  });

  it('renders usage over time chart and shows date labels', () => {
    render(<UsageAnalyticsCard analytics={analytics} />);

    expect(screen.getByText('analytics.usage.overTime')).toBeInTheDocument();
    // At least first and last labels
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 30')).toBeInTheDocument();
  });

  it('renders empty state for over-time section when all points are zero', () => {
    const emptyOverTime: UsageAnalytics = {
      ...analytics,
      usageOverTime: Array.from({ length: 30 }).map((_, i) => ({ date: `Day ${i + 1}`, usageCount: 0 })),
    };

    render(<UsageAnalyticsCard analytics={emptyOverTime} />);

    expect(screen.getByText('analytics.usage.noTimeData')).toBeInTheDocument();
  });

  it('renders empty message for Most Used list when none', () => {
    const noMostUsed: UsageAnalytics = {
      ...analytics,
      mostUsedCodes: [],
    };

    render(<UsageAnalyticsCard analytics={noMostUsed} />);

    expect(screen.getByText('analytics.usage.noUsageData')).toBeInTheDocument();
  });
});