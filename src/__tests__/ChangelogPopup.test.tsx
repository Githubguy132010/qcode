import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChangelogPopup } from '../components/ChangelogPopup';
import type { ChangelogData } from '@/types/changelog';

// Mock utils/changelog
const checkForUpdates = jest.fn();
const updateLastVisitDate = jest.fn();

jest.mock('@/utils/changelog', () => ({
  __esModule: true,
  checkForUpdates: (...args: unknown[]) => (checkForUpdates as unknown as jest.Mock)(...args),
  updateLastVisitDate: (...args: unknown[]) => (updateLastVisitDate as unknown as jest.Mock)(...args),
}));

function makeChangelogData(overrides?: Partial<ChangelogData>): ChangelogData {
  const base: ChangelogData = {
    hasNewUpdates: true,
    lastCheckDate: new Date(),
    entries: [
      {
        id: '1',
        type: 'commit',
        title: 'feat: add new component',
        description: 'some description',
        author: 'dev',
        date: new Date(),
        url: 'https://example.com/1',
        sha: 'abcdef1',
      },
      {
        id: '2',
        type: 'commit',
        title: 'fix: bug',
        description: 'bugfix',
        author: 'dev2',
        date: new Date(),
        url: 'https://example.com/2',
        sha: 'abcdef2',
      },
    ],
    aiSummary: {
      title: 'Release v1.0 Highlights',
      summary: 'Summary text for the release',
      highlights: ['1. New shiny thing', '2. Performance improvements'],
      userImpact: 'This release improves your experience.',
    },
  };
  return { ...base, ...overrides };
}

describe('ChangelogPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AI summary when there are new updates and hides when closing', async () => {
    checkForUpdates.mockResolvedValueOnce(makeChangelogData());

    render(<ChangelogPopup onAdvancedReleaseNotes={jest.fn()} />);

    // Wait for the title from aiSummary
    expect(await screen.findByText('Release v1.0 Highlights')).toBeInTheDocument();

    // Click "Got it, thanks!" to close
    const closeBtn = screen.getByText('releaseNotes.buttons.gotIt');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(updateLastVisitDate).toHaveBeenCalledTimes(1);
      // Popup should be removed from DOM
      expect(screen.queryByText('Release v1.0 Highlights')).not.toBeInTheDocument();
    });
  });

  it('invokes onAdvancedReleaseNotes when "Technical Details" is clicked', async () => {
    const onAdvanced = jest.fn();
    checkForUpdates.mockResolvedValueOnce(makeChangelogData());

    render(<ChangelogPopup onAdvancedReleaseNotes={onAdvanced} />);

    // Ensure it shows
    expect(await screen.findByText('Release v1.0 Highlights')).toBeInTheDocument();

    const detailsBtn = screen.getByText('releaseNotes.buttons.technicalDetails');
    fireEvent.click(detailsBtn);

    await waitFor(() => {
      expect(updateLastVisitDate).toHaveBeenCalledTimes(1);
      expect(onAdvanced).toHaveBeenCalledTimes(1);
      // Hidden after navigating to advanced
      expect(screen.queryByText('Release v1.0 Highlights')).not.toBeInTheDocument();
    });
  });

  it('returns null (no render) when no new updates or missing aiSummary', async () => {
    // Case 1: hasNewUpdates false
    checkForUpdates.mockResolvedValueOnce(makeChangelogData({ hasNewUpdates: false }));

    const { rerender } = render(<ChangelogPopup onAdvancedReleaseNotes={jest.fn()} />);
    await waitFor(() => {
      // Should not render anything
      expect(document.body).not.toHaveTextContent('Release v1.0 Highlights');
    });

    // Case 2: aiSummary undefined
    checkForUpdates.mockResolvedValueOnce(
      makeChangelogData({ aiSummary: undefined as unknown as ChangelogData['aiSummary'] })
    );
    
    rerender(<ChangelogPopup onAdvancedReleaseNotes={jest.fn()} />);
    await waitFor(() => {
      expect(document.body).not.toHaveTextContent('Release v1.0 Highlights');
    });
  });
});