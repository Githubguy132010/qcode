
# QCode - Discount Code Manager

A modern Progressive Web App (PWA) for storing and managing discount codes, built with Next.js 15, TypeScript and Tailwind CSS.

## ✨ Features

### 🎯 Main Features
- **Store Discount Codes** - Save all your discount codes with details
- **Intelligent Search** - Search by code, store, category or description
- **Categorization** - Organize codes by category (Clothing, Electronics, etc.)
- **Expiry Date Tracking** - Get alerts for soon-to-expire codes
- **Favorites** - Mark important codes as favorites
- **Usage Tracking** - Track how often you use your codes

### 📱 Progressive Web App
- **Offline Functionality** - Works without internet connection
- **Installable** - Install as an app on your phone/computer
- **Responsive Design** - Perfect on all devices
- **Native Experience** - Feels like a real app

### 🎨 User Experience
- **Modern Design** - Clean, user-friendly interface
- **Dark/Light Mode** - Automatic theme support
- **Touch-friendly** - Optimized for touch controls
- **Accessibility** - Accessible to everyone


## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Data**: LocalStorage with cloud sync support
- **PWA**: Service Worker for offline functionality
- **Build**: Turbopack for fast development

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with PWA configuration
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx         # App header with navigation
│   ├── StatsOverview.tsx  # Statistics overview
│   ├── SearchAndFilter.tsx # Search and filter interface
│   ├── DiscountCodeCard.tsx # Individual code card
│   ├── AddCodeModal.tsx   # Modal for new codes
│   ├── SyncStatusIndicator.tsx # Sync status display
│   └── EmptyState.tsx     # Empty state display
├── hooks/                 # Custom React hooks
│   ├── useDiscountCodes.ts # State management for codes
├── types/                 # TypeScript definitions
│   ├── discount-code.ts   # Code interfaces and types
└── utils/                 # Utility functions
    ├── storage.ts         # LocalStorage helpers
    └── sync-utils.ts      # Sync utility functions
```

## 💾 Data Model

```typescript
interface DiscountCode {
  id: string              // Unique identifier
  code: string           // The discount code itself
  store: string          // Store name
  discount: string       // Discount amount/percentage
  expiryDate?: Date      // Expiry date (optional)
  category: string       // Category
  description?: string   // Extra description
  isFavorite: boolean    // Favorite status
  isArchived: boolean    // Archived status
  dateAdded: Date        // Date added
  timesUsed: number      // Number of times used
  // Sync metadata
  lastModified?: Date    // Last modification
  syncVersion?: number   // Version for conflict resolution
  deviceCreated?: string // Device where code was created
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Main actions and links
- **Success**: Green (#10b981) - Active codes and success
- **Warning**: Orange (#f59e0b) - Soon-to-expire codes
- **Error**: Red (#ef4444) - Expired codes and errors
- **Gray**: Various shades for text and backgrounds

### Categories
- Clothing
- Electronics
- Food & Drink
- Sports & Fitness
- Books & Media
- Travel
- Beauty & Personal Care
- Home & Garden
- Toys
- Other

## 🔄 State Management

The app uses custom React hooks for central state management:

### useDiscountCodes
- LocalStorage for persistence
- Optimistic updates for fast UX
- Sync metadata tracking


## 📱 PWA Features

### Installation
The app can be installed on:
- iOS (Safari)
- Android (Chrome/Edge)
- Desktop (Chrome/Edge/Safari)

### Offline Functionality
- All saved codes are available offline
- New codes are stored locally

### Notifications
- Alerts for soon-to-expire codes
- Updates about new features

## 🎯 Future Features

- [ ] QR code scanning for automatic code input
- [ ] Barcode support
- [ ] Shared codes between users
- [ ] Store integrations for automatic codes
- [ ] Push notifications for deals
- [x] Export/import functionality
- [x] Analytics dashboard
- [ ] Theme customization
- [x] Multi-language support
- [ ] End-to-end encryption for sensitive codes

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a pull request.

## 📞 Contact

For questions or feedback, open an issue on GitHub.
