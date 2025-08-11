import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedSettingsModal } from '../UnifiedSettingsModal'
import { I18nProvider } from '../I18nProvider'

// Mock the hooks
jest.mock('@/hooks/useDiscountCodes', () => ({
  useDiscountCodes: () => ({ codes: [] })
}))


 // Mock react-i18next (include i18n object for hooks that read i18n.language/changeLanguage)
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        'settings.tabs.general': 'General',
        'settings.tabs.data': 'Data Management',
        'settings.tabs.advanced': 'Advanced',
        'settings.title': 'Settings',
        'settings.tabs.languages': 'Languages',
        'settings.export.codesFound': options?.count !== undefined ? `${options.count} codes found` : '0 codes found',
        'settings.export.including': 'Including all your data',
        'settings.export.subtitle': 'Export your data',
        'settings.export.title': 'Export Data',
        'settings.export.exportButton': 'Export',
        'settings.about.aboutApp': 'About QCode',
        'settings.about.aboutText': 'QCode is a discount code manager',
        'settings.about.version': 'Version 1.0.0',
        'settings.about.subtitle': 'Manage your discount codes',
        'settings.about.privacy': 'Privacy',
        'settings.about.privacyPoints.0': 'All data is stored locally',
        'settings.about.privacyPoints.1': 'No data is sent to external servers',
        'settings.about.privacyPoints.2': 'Your privacy is protected',
        'settings.about.privacyPoints.3': 'Open source and transparent',
        'common.appName': 'QCode',
        'settings.language.title': 'Change language',
        'settings.developer.title': 'Developer Settings',
        'settings.developer.subtitle': 'Advanced options for developers',
        'settings.developer.releaseNotes.title': 'Release Notes',
        'settings.developer.releaseNotes.showAdvancedLabel': 'Show Advanced Release Notes',
        'settings.developer.releaseNotes.showAdvancedDescription': 'Show technical details in release notes',
        'settings.developer.releaseNotes.showChangelogLabel': 'Show Changelog Popup',
        'settings.developer.releaseNotes.showChangelogDescription': 'Show popup when new version is available',
        'settings.developer.releaseNotes.openReleaseNotes': 'Open Release Notes',
        'settings.developer.sampleData.title': 'Sample Data',
        'settings.developer.sampleData.loadSampleTitle': 'Load Sample Data',
        'settings.developer.sampleData.loadSampleDescription': 'Load sample discount codes for testing',
        'settings.developer.sampleData.loadSampleButton': 'Load Sample Data',
        'settings.developer.development.title': 'Development Info',
        'settings.developer.development.storageUsed': 'Storage Used',
        'settings.developer.development.totalCodes': 'Total Codes',
        'settings.developer.development.userAgent': 'User Agent'
      }
      return translations[key] || defaultValue || key
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn()
    }
  })
}))

// Mock the I18nProvider to avoid i18n initialization issues
jest.mock('../I18nProvider', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => children
}))

const MockedModal = ({ isOpen = true, onClose = jest.fn(), ...props }) => (
  <I18nProvider>
    <UnifiedSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    />
  </I18nProvider>
)

describe('UnifiedSettingsModal Fixed Sizing', () => {
  test('modal has fixed dimensions classes applied', () => {
    render(<MockedModal />)

    const modal = screen.getByRole('dialog')

    expect(modal).toBeInTheDocument()
    expect(modal).toHaveClass('theme-card')
  })

  test('modal tabs are present and accessible', () => {
    render(<MockedModal />)

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()

    // Test that tab labels are present in the DOM
    const tabs = ['Data Management', 'Languages', 'Advanced']

    tabs.forEach(tabName => {
      const tabButtons = screen.getAllByText(tabName)
      expect(tabButtons.length).toBeGreaterThan(0)
    })

    // Test that the modal has the expected structure
    expect(modal).toHaveClass('theme-card')
    expect(modal).toHaveAttribute('role', 'dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  test('content area has proper overflow handling', () => {
    render(<MockedModal />)

    // Find the content area by its classes - it's the div with flex-1 overflow-y-auto
    const contentArea = document.querySelector('.flex-1.overflow-y-auto')
    expect(contentArea).toBeInTheDocument()

    // Check that the classes are applied (we can't reliably test computed styles in Jest)
    expect(contentArea).toHaveClass('flex-1', 'overflow-y-auto', 'relative', 'min-h-0')
  })

  test('modal has responsive dimensions', () => {
    render(<MockedModal />)

    const modal = screen.getByRole('dialog')
    expect(modal).toBeInTheDocument()

    // Check that responsive classes are applied
    expect(modal).toHaveClass('w-[95vw]', 'h-[85vh]')
    expect(modal).toHaveClass('sm:w-[90vw]', 'sm:h-[80vh]')
    expect(modal).toHaveClass('lg:w-[900px]', 'lg:h-[600px]')
  })

  test('languages tab shows language switcher UI', () => {
    render(<MockedModal />)

    // Open the Languages tab
    const languagesTabs = screen.getAllByText('Languages')
    fireEvent.click(languagesTabs[0])

    // Assert the Languages section is visible via a unique heading
    const heading = screen.getByRole('heading', { name: 'Change language' })
    expect(heading).toBeInTheDocument()

    // Assert that the Languages panel contains interactive controls (from LanguageSwitcher)
    const section = heading.closest('.theme-filter') ?? heading.parentElement
    const buttons = section
      ? section.querySelectorAll('button')
      : document.querySelectorAll('.theme-filter button')

    expect(buttons.length).toBeGreaterThan(0)
  })
})
