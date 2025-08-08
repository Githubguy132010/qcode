import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CombinedDashboard } from '../components/CombinedDashboard';
import type { SearchFilters, DiscountCode } from '@/types/discount-code';

function makeCode(partial?: Partial<DiscountCode>): DiscountCode {
  const now = new Date();
  return {
    id: partial?.id ?? 'id-1',
    code: partial?.code ?? 'SAVE20',
    store: partial?.store ?? 'TestStore',
    discount: partial?.discount ?? '20%',
    category: partial?.category ?? 'Anders',
    description: partial?.description ?? 'desc',
    isFavorite: partial?.isFavorite ?? false,
    isArchived: partial?.isArchived ?? false,
    dateAdded: partial?.dateAdded ?? new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    timesUsed: partial?.timesUsed ?? 1,
    expiryDate: partial?.expiryDate ?? new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    qrCode: partial?.qrCode,
    usageHistory: partial?.usageHistory,
  };
}

function makeFilters(partial?: Partial<SearchFilters>): SearchFilters {
  return {
    searchTerm: partial?.searchTerm ?? '',
    category: partial?.category ?? 'all',
    sortBy: partial?.sortBy ?? 'dateAdded',
    filterBy: partial?.filterBy ?? 'all',
  };
}

describe('CombinedDashboard', () => {

  const stats = {
    total: 2,
    active: 2,
    expired: 0,
    favorites: 1,
    archived: 0,
    totalUsages: 3,
    expiringSoon: 2,
  };

  const expiringSoon = [
    makeCode({ id: 'e1', store: 'Soon 1', expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) }),
    makeCode({ id: 'e2', store: 'Soon 2', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }),
  ];

  it('renders Search tab by default and updates filters on input change', () => {
    const onFiltersChange = jest.fn();
    const filters = makeFilters({ searchTerm: '' });

    render(
      <CombinedDashboard
        filters={filters}
        onFiltersChange={onFiltersChange}
        stats={stats}
        expiringSoon={expiringSoon}
      />
    );

    // Search input placeholder is a translation key; mock returns the key when missing
    const searchInput = screen.getByPlaceholderText('filters.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'nike' } });

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange.mock.calls[0][0]).toEqual(expect.objectContaining({ searchTerm: 'nike' }));
  });

  it('reset button calls onReset on Search tab', () => {
    const onFiltersChange = jest.fn();
    const onReset = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
        stats={stats}
        expiringSoon={expiringSoon}
      />
    );

    const resetBtn = screen.getByTitle('filters.reset');
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('view mode toggle calls onViewModeChange', () => {
    const onFiltersChange = jest.fn();
    const onViewModeChange = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        stats={stats}
        expiringSoon={expiringSoon}
        onViewModeChange={onViewModeChange}
        viewMode="list"
      />
    );

    // Toggle Grid
    const gridBtn = screen.getByTitle('view.gridView');
    fireEvent.click(gridBtn);
    expect(onViewModeChange).toHaveBeenCalledWith('grid');

    // Toggle List
    const listBtn = screen.getByTitle('view.listView');
    fireEvent.click(listBtn);
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('Stats tab shows counts and allows clicking statistic buttons (except active)', () => {
    const onFiltersChange = jest.fn();
    const onStatClick = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        stats={stats}
        onStatClick={onStatClick}
        expiringSoon={expiringSoon}
        initialTab="stats"
      />
    );

    // Switch to Stats tab if not already
    const statsTab = screen.getByText('dashboard.tabs.stats');
    fireEvent.click(statsTab);

    // There are buttons with numbers; assert the "Expired" is clickable
    // We don't have accessible names for each stat, so click via the value element
    // Find a button containing the value for expiringSoon (2)
    // Click any button that is not disabled and not the "active" stat (which is disabled via code)
    // Instead directly call onStatClick through known label: "stats.expiringSoon"
    // The UI uses a card grid; ensure clicking one triggers handler
    // We'll click the "Expiring Soon" card by finding text key near number
    const expiringSoonLabel = screen.getByText((content, node) => {
      const hasText = (n: Element) => n.textContent === 'Expiring soon';
      const nodeHasText = hasText(node as Element);
      const childrenDontHaveText = Array.from((node as Element).children).every((child) => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    });
    const expiringSoonCard = expiringSoonLabel.closest('button');
    expect(expiringSoonCard).toBeInTheDocument();
    fireEvent.click(expiringSoonCard!);
    expect(onStatClick).toHaveBeenCalledWith('expiringSoon');
  });

  it('Notifications tab shows items and supports "Dismiss all"', () => {
    const onFiltersChange = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        stats={stats}
        expiringSoon={expiringSoon}
        initialTab="notifications"
      />
    );

    // Ensure we are on Notifications tab
    const notifTab = screen.getByText('dashboard.tabs.notifications');
    fireEvent.click(notifTab);

    // There should be a Dismiss all button
    const dismissAll = screen.getByText('dashboard.notifications.dismissAll');
    fireEvent.click(dismissAll);

    // After dismissing, should show "All clear!" message (fallback key text)
    expect(screen.getByText('dashboard.notifications.allClear')).toBeInTheDocument();
    expect(screen.getByText('dashboard.notifications.noExpiring')).toBeInTheDocument();
  });

  it('Notifications item click calls onCodeClick', () => {
    const onFiltersChange = jest.fn();
    const onCodeClick = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        stats={stats}
        expiringSoon={expiringSoon}
        onCodeClick={onCodeClick}
        initialTab="notifications"
      />
    );

    const notifTab = screen.getByText('dashboard.tabs.notifications');
    fireEvent.click(notifTab);

    // Click the first visible notification item (role="button" on the inner div)
    // Find by store text
    const item = screen.getByText('Soon 1').closest('[role="button"]');
    expect(item).toBeInTheDocument();
    fireEvent.click(item!);

    expect(onCodeClick).toHaveBeenCalledTimes(1);
    expect(onCodeClick).toHaveBeenCalledWith('e1');
  });

  it('Search tab category select updates filters on change', () => {
    const onFiltersChange = jest.fn();
    render(
      <CombinedDashboard
        filters={makeFilters()}
        onFiltersChange={onFiltersChange}
        stats={stats}
        expiringSoon={expiringSoon}
      />
    );

    // Category select has value 'all' initially; change to a specific one
    // The option keys are category translation keys; selecting value 'Elektronica'
    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0];
    fireEvent.change(categorySelect, { target: { value: 'Elektronica' } });

    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'Elektronica' }));
  });
});