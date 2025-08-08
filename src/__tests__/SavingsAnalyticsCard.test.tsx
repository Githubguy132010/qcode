import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SavingsAnalyticsCard } from '../components/analytics/SavingsAnalyticsCard';
import type { SavingsAnalytics } from '@/utils/analytics';

describe('SavingsAnalyticsCard', () => {
  const analytics: SavingsAnalytics = {
    totalSavingsEstimate: 37.5,
    averageSavingsPerCode: 12.5,
    potentialSavings: 50,
    savingsByStore: [
      { store: 'Store A', savings: 25 },
      { store: 'Store B', savings: 12.5 },
    ],
    savingsByCategory: [
      { category: 'Anders', savings: 20 },
      { category: 'Kleding', savings: 17.5 },
    ],
  };

  it('renders summary values and sections (translation keys)', () => {
    render(<SavingsAnalyticsCard analytics={analytics} />);

    // Summary section labels use i18n keys
    expect(screen.getByText('analytics.savings.summary')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.totalSaved')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.averagePerCode')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.potential')).toBeInTheDocument();

    // Values rendered (formatted with €)
    expect(screen.getAllByText(`€${analytics.totalSavingsEstimate.toFixed(2)}`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`€${analytics.averageSavingsPerCode.toFixed(2)}`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`€${analytics.potentialSavings.toFixed(2)}`).length).toBeGreaterThan(0);

    // Breakdown section and lists
    expect(screen.getByText('analytics.savings.breakdown')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.byStore')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.byCategory')).toBeInTheDocument();

    // Store names and amounts
    expect(screen.getByText('Store A')).toBeInTheDocument();
    expect(screen.getByText('€25.00')).toBeInTheDocument();

    // Category labels and amounts
    expect(screen.getByText('Anders')).toBeInTheDocument();
    expect(screen.getByText('€20.00')).toBeInTheDocument();
  });

  it('renders empty state message when there are no savings yet', () => {
    const empty: SavingsAnalytics = {
      totalSavingsEstimate: 0,
      averageSavingsPerCode: 0,
      potentialSavings: 0,
      savingsByStore: [{ store: 'Store A', savings: 0 }],
      savingsByCategory: [{ category: 'Anders', savings: 0 }],
    };

    render(<SavingsAnalyticsCard analytics={empty} />);

    expect(screen.getByText('analytics.savings.noSavings')).toBeInTheDocument();
    expect(screen.getByText('analytics.savings.startUsing')).toBeInTheDocument();
  });
});