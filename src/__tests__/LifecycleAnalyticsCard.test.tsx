import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LifecycleAnalyticsCard } from '../components/analytics/LifecycleAnalyticsCard';
import type { LifecycleAnalytics } from '@/utils/analytics';
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
    dateAdded: overrides?.dateAdded ?? new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    timesUsed: overrides?.timesUsed ?? 1,
    expiryDate: overrides?.expiryDate ?? new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    qrCode: overrides?.qrCode,
    usageHistory: overrides?.usageHistory,
  };
}

describe('LifecycleAnalyticsCard', () => {
  it('renders lifecycle summary values and upcoming expirations', () => {
    const analytics: LifecycleAnalytics = {
      codesAddedThisMonth: 3,
      codesExpiredThisMonth: 1,
      averageCodeLifespan: 12,
      expirationPattern: Array.from({ length: 6 }).map((_, i) => ({
        month: `M${i + 1}`,
        expired: i,
        added: i + 1,
      })),
      upcomingExpirations: [
        { code: makeCode({ id: 'a1', store: 'Soon A' }), daysUntilExpiry: 2 },
        { code: makeCode({ id: 'b2', store: 'Soon B' }), daysUntilExpiry: 5 },
      ],
    };

    render(<LifecycleAnalyticsCard analytics={analytics} />);

    // Section titles use i18n keys; with mock they render key strings
    expect(screen.getByText('analytics.lifecycle.summary')).toBeInTheDocument();
    expect(screen.getByText('analytics.lifecycle.upcomingExpirations')).toBeInTheDocument();
    expect(screen.getByText('analytics.lifecycle.expirationPattern')).toBeInTheDocument();
    expect(screen.getByText('analytics.lifecycle.insights')).toBeInTheDocument();

    // Numbers visible in the summary cards
    expect(screen.getByText(String(analytics.codesAddedThisMonth))).toBeInTheDocument();
    expect(screen.getByText(String(analytics.codesExpiredThisMonth))).toBeInTheDocument();

    // Average lifespan number is rendered (rounded in component, but we can still find the raw number as substring)
    expect(screen.getByText((content) => content.includes(String(Math.round(analytics.averageCodeLifespan))))).toBeInTheDocument();

    // Upcoming expirations show store names
    expect(screen.getByText('Soon A')).toBeInTheDocument();
    expect(screen.getByText('Soon B')).toBeInTheDocument();

    // One of the day badges should include the numeric days and the fallback key for "days"
    // e.g., "2 analytics.lifecycle.daysLeft"
    expect(screen.getAllByText(/2/).length).toBeGreaterThan(0);
  });

  it('renders empty state message when no upcoming expirations', () => {
    const analytics: LifecycleAnalytics = {
      codesAddedThisMonth: 0,
      codesExpiredThisMonth: 0,
      averageCodeLifespan: 0,
      expirationPattern: [],
      upcomingExpirations: [],
    };

    render(<LifecycleAnalyticsCard analytics={analytics} />);

    // The empty state uses this i18n key
    expect(
      screen.getByText('analytics.lifecycle.noUpcomingExpirations')
    ).toBeInTheDocument();
  });
});