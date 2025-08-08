import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsOverview, type Stats } from '../components/StatsOverview';

describe('StatsOverview', () => {
  const baseStats: Stats = {
    total: 10,
    active: 4,
    expired: 3,
    favorites: 2,
    archived: 1,
    totalUsages: 12,
    expiringSoon: 1,
  };

  it('renders Stat cards with labels from i18n keys', () => {
    render(<StatsOverview stats={baseStats} />);

    // Labels come from the i18n mock (see src/__mocks__/i18next.ts)
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expired' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorites' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expiring soon' })).toBeInTheDocument();
  });

  it('active card is rendered as non-clickable (disabled or non-interactive)', () => {
    render(<StatsOverview stats={baseStats} />);
    const activeBtn = screen.getByRole('button', { name: 'Active' });
    // Active card should be non-clickable and visually de-emphasized; component sets disabled when count === 0,
    // but for Active it passes isClickable={false}. We assert that clicking does nothing by ensuring no error and it's present.
    expect(activeBtn).toBeInTheDocument();
    // Should not have onClick; but jsdom cannot assert lack of handler. We can assert it has "cursor-default opacity-75" class via "nonClickableClasses"
    expect(activeBtn.className).toMatch(/cursor-default/);
  });

  it('invokes onStatClick with "expired" when Expired card is clicked (when count > 0)', () => {
    const onStatClick = jest.fn();
    render(<StatsOverview stats={baseStats} onStatClick={onStatClick} />);

    const expiredBtn = screen.getByRole('button', { name: 'Expired' });
    fireEvent.click(expiredBtn);

    expect(onStatClick).toHaveBeenCalledTimes(1);
    expect(onStatClick).toHaveBeenCalledWith('expired');
  });

  it('invokes onStatClick with "favorites" when Favorites card is clicked (when count > 0)', () => {
    const onStatClick = jest.fn();
    render(<StatsOverview stats={baseStats} onStatClick={onStatClick} />);

    const favoritesBtn = screen.getByRole('button', { name: 'Favorites' });
    fireEvent.click(favoritesBtn);

    expect(onStatClick).toHaveBeenCalledTimes(1);
    expect(onStatClick).toHaveBeenCalledWith('favorites');
  });

  it('invokes onStatClick with "expiringSoon" when Expiring soon card is clicked (when count > 0)', () => {
    const onStatClick = jest.fn();
    render(<StatsOverview stats={baseStats} onStatClick={onStatClick} />);

    const soonBtn = screen.getByRole('button', { name: 'Expiring soon' });
    fireEvent.click(soonBtn);

    expect(onStatClick).toHaveBeenCalledTimes(1);
    expect(onStatClick).toHaveBeenCalledWith('expiringSoon');
  });

  it('disables click when count is zero', () => {
    const onStatClick = jest.fn();
    const statsZeroExpired: Stats = { ...baseStats, expired: 0 };
    render(<StatsOverview stats={statsZeroExpired} onStatClick={onStatClick} />);

    const expiredBtn = screen.getByRole('button', { name: 'Expired' });
    // When count === 0, component sets disabled
    expect(expiredBtn).toBeDisabled();
  });
});