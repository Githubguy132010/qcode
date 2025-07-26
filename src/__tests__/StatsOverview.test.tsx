import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsOverview } from '../components/StatsOverview';

describe('StatsOverview', () => {
  it('renders stats labels', () => {
    render(
      <StatsOverview
        stats={{
          total: 5,
          active: 3,
          expired: 2,
          favorites: 1,
          archived: 0,
          totalUsages: 10,
          expiringSoon: 1,
        }}
      />
    );
  // Check for translated labels since our mock now properly interpolates
  expect(screen.getByText(/Total codes/i)).toBeInTheDocument();
  expect(screen.getByText(/Active/i)).toBeInTheDocument();
  expect(screen.getByText(/Expired/i)).toBeInTheDocument();
  expect(screen.getByText(/Favorites/i)).toBeInTheDocument();
  expect(screen.getByText(/Expiring soon/i)).toBeInTheDocument();
  expect(screen.getByText(/Used 10 times/i)).toBeInTheDocument();
  });

  it('generates correct aria-labels for clickable stats without redundant text', () => {
    render(
      <StatsOverview
        stats={{
          total: 10,
          active: 5,
          expired: 3,
          favorites: 2,
          archived: 0,
          totalUsages: 15,
          expiringSoon: 1,
        }}
        onStatClick={jest.fn()}
      />
    );

    // Find clickable buttons and check their aria-labels using actual translated text
    const expiredButton = screen.getByRole('button', { name: /Expired.*3.*Click to view expired codes/i });
    const favoritesButton = screen.getByRole('button', { name: /Favorites.*2.*Click to view favorite codes/i });
    const expiringSoonButton = screen.getByRole('button', { name: /Expiring soon.*1.*Click to view expiring soon codes/i });

    expect(expiredButton).toBeInTheDocument();
    expect(favoritesButton).toBeInTheDocument();
    expect(expiringSoonButton).toBeInTheDocument();

    // Verify aria-labels are constructed correctly with clean map-based approach
    // The refactored code should use the filterTypeToTranslationKey mapping
    const expiredLabel = expiredButton.getAttribute('aria-label');
    const favoritesLabel = favoritesButton.getAttribute('aria-label');
    const expiringSoonLabel = expiringSoonButton.getAttribute('aria-label');

    // Check that aria-labels contain the expected pattern with proper translation
    expect(expiredLabel).toMatch(/Expired.*3.*Click to view expired codes/);
    expect(favoritesLabel).toMatch(/Favorites.*2.*Click to view favorite codes/);
    expect(expiringSoonLabel).toMatch(/Expiring soon.*1.*Click to view expiring soon codes/);

    // Most importantly: verify there's no redundant "codes codes" text
    // The old implementation would have created malformed strings like "expired codes codes"
    expect(expiredLabel).not.toMatch(/expired codes codes|codes.*codes/i);
    expect(favoritesLabel).not.toMatch(/favorite codes codes|codes.*codes/i);
    expect(expiringSoonLabel).not.toMatch(/expiring soon codes codes|codes.*codes/i);
  });

  it('does not add aria-label content for non-clickable stats', () => {
    render(
      <StatsOverview
        stats={{
          total: 10,
          active: 5,
          expired: 0,
          favorites: 0,
          archived: 0,
          totalUsages: 15,
          expiringSoon: 0,
        }}
      />
    );

    // Active codes should not be clickable and should not have clickToView in aria-label
    const activeButton = screen.getByRole('button', { name: /Active.*5$/i });
    expect(activeButton).toBeInTheDocument();
    expect(activeButton.getAttribute('aria-label')).not.toMatch(/Click to view/i);
  });
});
