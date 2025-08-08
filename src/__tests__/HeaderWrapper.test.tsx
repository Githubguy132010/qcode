import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeaderWrapper } from '../components/HeaderWrapper';

// Mock Header to avoid Next.js router/link complexity and to expose a simple open-settings trigger
jest.mock('../components/Header', () => ({
  __esModule: true,
  Header: ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <button onClick={onSettingsClick}>open-settings</button>
  ),
}));

// Mock UnifiedSettingsModal to verify it opens and can trigger restart tutorial
jest.mock('../components/UnifiedSettingsModal', () => ({
  __esModule: true,
  UnifiedSettingsModal: ({
    isOpen,
    onRestartTutorial,
  }: {
    isOpen: boolean;
    onRestartTutorial?: () => void;
  }) => (
    <div>
      {isOpen && (
        <div data-testid="settings-modal">
          Settings Modal
          {onRestartTutorial && (
            <button onClick={onRestartTutorial}>restart-tutorial</button>
          )}
        </div>
      )}
    </div>
  ),
}));

describe('HeaderWrapper', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('opens settings modal when header settings is clicked', () => {
    render(<HeaderWrapper />);

    // Modal should not be in the DOM initially
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();

    // Click the mocked header button to open settings
    fireEvent.click(screen.getByText('open-settings'));

    // Modal should now be visible
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
  });

  it('restart tutorial clears flags', () => {
    // Spy on localStorage.removeItem (avoid mocking window.location which can be readonly in JSDOM)
    const removeSpy = jest.spyOn(Storage.prototype, 'removeItem');
    // Silence jsdom reload error triggered by window.location.reload in JSDOM
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<HeaderWrapper />);

    // Open settings
    fireEvent.click(screen.getByText('open-settings'));

    // Click the restart button provided by the mocked modal
    fireEvent.click(screen.getByText('restart-tutorial'));

    // Should clear tutorial flags
    expect(removeSpy).toHaveBeenCalledWith('qcode-tutorial-completed');
    expect(removeSpy).toHaveBeenCalledWith('qcode-tutorial-skipped');
  });
});