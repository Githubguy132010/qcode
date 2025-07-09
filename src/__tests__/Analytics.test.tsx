import { render, screen } from '@testing-library/react'
import { Analytics } from '../components/Analytics'
import { useTranslation } from 'react-i18next'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: { language: 'en' }
  }),
}))

// Mock date-fns locales
jest.mock('date-fns/locale', () => ({
  nl: {
    formatLong: {
      date: () => 'MMM',
      time: () => 'HH:mm',
      dateTime: () => 'MMM dd, yyyy HH:mm'
    },
    localize: {
      month: () => 'Jan'
    },
    match: {
      month: () => ({ value: 0 })
    },
    options: {}
  },
  enUS: {
    formatLong: {
      date: () => 'MMM',
      time: () => 'HH:mm',
      dateTime: () => 'MMM dd, yyyy HH:mm'
    },
    localize: {
      month: () => 'Jan'
    },
    match: {
      month: () => ({ value: 0 })
    },
    options: {}
  }
}))

// Mock date-fns format function
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date, formatStr) => 'Jan'),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  differenceInDays: jest.fn((date1, date2) => Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)))
}))

const mockCodes = [
  {
    id: '1',
    code: 'TEST10',
    store: 'Test Store',
    discount: '10%',
    category: 'Electronics',
    description: 'Test code',
    isFavorite: true,
    isArchived: false,
    dateAdded: new Date('2024-01-01'),
    timesUsed: 5,
    expiryDate: new Date('2024-12-31')
  },
  {
    id: '2',
    code: 'SAVE20',
    store: 'Another Store',
    discount: '€20',
    category: 'Clothing',
    description: 'Another test code',
    isFavorite: false,
    isArchived: false,
    dateAdded: new Date('2024-02-01'),
    timesUsed: 0,
    expiryDate: new Date('2024-06-01')
  }
]

const mockIsExpired = (code: any) => {
  return code.expiryDate && new Date() > code.expiryDate
}

describe('Analytics Component', () => {
  it('renders analytics dashboard', () => {
    render(<Analytics codes={mockCodes} isExpired={mockIsExpired} />)
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Insights into your discount code usage')).toBeInTheDocument()
  })

  it('displays key metrics', () => {
    render(<Analytics codes={mockCodes} isExpired={mockIsExpired} />)
    
    expect(screen.getByText('Total Codes')).toBeInTheDocument()
    expect(screen.getByText('Total Usage')).toBeInTheDocument()
    expect(screen.getByText('Avg Usage')).toBeInTheDocument()
    expect(screen.getByText('Est. Savings')).toBeInTheDocument()
  })

  it('shows usage breakdown', () => {
    render(<Analytics codes={mockCodes} isExpired={mockIsExpired} />)
    
    expect(screen.getByText('Usage Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Used Codes')).toBeInTheDocument()
    expect(screen.getByText('Never Used')).toBeInTheDocument()
  })

  it('displays category performance', () => {
    render(<Analytics codes={mockCodes} isExpired={mockIsExpired} />)
    
    expect(screen.getByText('Category Performance')).toBeInTheDocument()
  })

  it('shows recommendations section', () => {
    render(<Analytics codes={mockCodes} isExpired={mockIsExpired} />)
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })
})
