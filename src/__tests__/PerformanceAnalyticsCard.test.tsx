import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceAnalyticsCard } from '../components/analytics/PerformanceAnalyticsCard';
import type { PerformanceAnalytics } from '@/utils/analytics';
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

describe('PerformanceAnalyticsCard', () => {
  const analytics: PerformanceAnalytics = {
    favoriteRatio: 0.25,
    archiveRatio: 0.1,
    activeRatio: 0.75,
    categoryDistribution: [
      { category: 'Anders', count: 5, percentage: 50 },
      { category: 'Kleding', count: 5, percentage: 50 },
    ],
    storeDistribution: [
      { store: 'Store A', count: 6, percentage: 60 },
      { store: 'Store B', count: 4, percentage: 40 },
    ],
    codeEffectiveness: [
      { code: makeCode({ id: 'c1', store: 'Store A', isFavorite: true, timesUsed: 3 }), score: 120 },
      { code: makeCode({ id: 'c2', store: 'Store B', isArchived: true, timesUsed: 2 }), score: 80 },
    ],
  };

  it('renders section titles (i18n keys) and percentage dials', () => {
    render(<PerformanceAnalyticsCard analytics={analytics} />);

    // Section titles (with i18n keys)
    expect(screen.getByText('analytics.performance.overview')).toBeInTheDocument();
    expect(screen.getByText('analytics.performance.topCodes')).toBeInTheDocument();
    expect(screen.getByText('analytics.performance.categoryDistribution')).toBeInTheDocument();
    expect(screen.getByText('analytics.performance.storeDistribution')).toBeInTheDocument();
    expect(screen.getByText('analytics.performance.metricsBreakdown')).toBeInTheDocument();
    expect(screen.getByText('analytics.performance.insights')).toBeInTheDocument();

    // Percentage values displayed inside the circular charts (rounded)
    expect(screen.getAllByText(/%$/).length).toBeGreaterThan(0);
    // At least verify one expected percent
    expect(screen.getByText(`${Math.round(analytics.activeRatio * 100)}%`)).toBeInTheDocument();
  });

  it('lists top performing codes with stores and scores', () => {
    render(<PerformanceAnalyticsCard analytics={analytics} />);

    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);

    // "score" label appears near values
    expect(screen.getAllByText('score').length).toBeGreaterThan(0);
    // Score numbers present
    expect(screen.getByText(String(analytics.codeEffectiveness[0].score))).toBeInTheDocument();
  });

  it('renders category and store distribution labels', () => {
    render(<PerformanceAnalyticsCard analytics={analytics} />);

    // Category labels and percentages
    expect(screen.getByText('Anders')).toBeInTheDocument();
    expect(screen.getByText('Kleding')).toBeInTheDocument();
    expect(screen.getAllByText(/\(50\.0%\)/).length).toBeGreaterThan(0);

    // Store labels and percentages
    expect(screen.getAllByText('Store A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Store B').length).toBeGreaterThan(0);
    expect(screen.getByText(/\(60\.0%\)/)).toBeInTheDocument();
  });
});