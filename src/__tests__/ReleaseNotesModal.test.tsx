import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReleaseNotesModal } from '../components/ReleaseNotesModal';
import type { ChangelogData } from '@/types/changelog';

// Mock getCachedChangelog to provide deterministic data
const getCachedChangelog = jest.fn();

jest.mock('@/utils/changelog', () => ({
  __esModule: true,
  getCachedChangelog: (...args: unknown[]) => (getCachedChangelog as unknown as jest.Mock)(...args),
}));

function sampleChangelog(): ChangelogData {
  const now = new Date();
  return {
    hasNewUpdates: true,
    lastCheckDate: now,
    aiSummary: {
      title: 'AI Summary Title',
      summary: 'AI Summary body text',
      highlights: ['1. First highlight', '2. Second highlight'],
      userImpact: 'Users benefit from improvements.',
    },
    entries: [
      {
        id: 'c1',
        type: 'commit',
        title: 'feat: add X',
        description: 'new feature',
        author: 'dev1',
        date: new Date(now.getTime() - 3600_000),
        url: 'https://example.com/c1',
        sha: 'abcdef1',
      },
      {
        id: 'c2',
        type: 'commit',
        title: 'fix: bug Y',
        description: 'bugfix',
        author: 'dev2',
        date: new Date(now.getTime() - 7200_000),
        url: 'https://example.com/c2',
        sha: 'abcdef2',
      },
    ],
  };
}

describe('ReleaseNotesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open and shows AI summary and entries count', () => {
    getCachedChangelog.mockReturnValueOnce(sampleChangelog());

    render(<ReleaseNotesModal isOpen={true} onClose={jest.fn()} />);

    // Title from translations (mock returns the key if not found)
    expect(screen.getByText('releaseNotes.title')).toBeInTheDocument();
    // AI Summary block should render provided title text
    expect(screen.getByText('AI Summary body text')).toBeInTheDocument();

    // Tabs show counts in labels (the keys with counts)
    expect(screen.getByText(/releaseNotes.tabs.summary/i)).toBeInTheDocument();
    expect(screen.getByText(/releaseNotes.tabs.commits/i)).toBeInTheDocument();
  });

  it('closes when the close button is clicked and calls onClose', () => {
    getCachedChangelog.mockReturnValueOnce(sampleChangelog());
    const onClose = jest.fn();

    render(<ReleaseNotesModal isOpen={true} onClose={onClose} />);

    // Close via header close button (X)
    // The header close icon is one of the buttons; also there is a footer button (Close).
    // Click footer close to be deterministic (uses translation key text)
    const footerClose = screen.getByText('releaseNotes.buttons.close');
    fireEvent.click(footerClose);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches to Commits tab and renders commit list', async () => {
    getCachedChangelog.mockReturnValueOnce(sampleChangelog());

    render(<ReleaseNotesModal isOpen={true} onClose={jest.fn()} />);

    // Click the "commits" tab
    const commitsTab = screen.getByText('releaseNotes.tabs.commits', { exact: false });
    fireEvent.click(commitsTab);

    // The commit title from the sample should be visible
    await waitFor(() => {
      expect(screen.getByText('feat: add X')).toBeInTheDocument();
      expect(screen.getByText('fix: bug Y')).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    getCachedChangelog.mockReturnValueOnce(sampleChangelog());

    const { container } = render(<ReleaseNotesModal isOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});