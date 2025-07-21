[🇳🇱 Nederlandse versie](README.NL.md)

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
- **Cloud Synchronization** - Sync across all your devices via GitHub Gist or local files
- **AI Release Notes** - Intelligent summaries of app updates using Gemini AI

### 📱 Progressive Web App
- **Offline Functionality** - Works without internet connection
- **Installable** - Install as an app on your phone/computer
- **Responsive Design** - Perfect on all devices
- **Native Experience** - Feels like a real app
- **Background Sync** - Automatic sync when online

### 🎨 User Experience
- **Modern Design** - Clean, user-friendly interface
- **Dark/Light Mode** - Automatic theme support
- **Touch-friendly** - Optimized for touch controls
- **Accessibility** - Accessible to everyone
- **Real-time Sync Status** - See sync status immediately

## ☁️ Cloud Sync Features

### Supported Providers
- **GitHub Gist** - Use your GitHub account for cloud storage
- **Local File** - Sync via local files (File System Access API)
- **Local Cloud** - Local storage for development/testing

### Sync Features
- **Automatic Sync** - Configurable interval sync (5-240 minutes)
- **Conflict Resolution** - Smart merge, local prefer, or remote prefer
- **Background Sync** - Sync happens automatically in the background
- **Multiple Devices** - Sync between multiple devices
- **Offline Queue** - Changes are synchronized when online
- **Data Integrity** - Checksums for data validation

### Conflict Resolution
- **Smart Merge** (recommended) - Intelligent merging of changes
- **Local Prefer** - Local changes take precedence
- **Remote Prefer** - Cloud changes take precedence

### Setup GitHub Sync
1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Create a new token with 'gist' scope
3. Add the token in Cloud Sync settings
4. Automatic sync will be enabled

## 🤖 AI-Powered Features

### AI Release Notes
QCode uses Google's Gemini 2.0 Flash Lite to generate intelligent, user-friendly summaries of app updates:

- **Smart Summaries** - AI analyzes commits and pull requests to create engaging release notes
- **User-Focused** - Converts technical changes into user benefits
- **Automatic Generation** - No manual effort required for release note creation
- **Fallback Support** - Works without AI when needed

### Features
- **Intelligent Analysis** - Understands the context of code changes
- **User Benefits** - Focuses on how changes affect the user experience
- **Emoji Enhancement** - Uses emojis to make updates more engaging
- **Rate Limited** - Respects API limits with intelligent fallbacks

### Setup AI Features
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY=your_key_here` to your `.env.local` file
3. AI-powered release notes will be automatically generated
4. If no API key is provided, fallback summaries are used

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Data**: LocalStorage with cloud sync support
- **PWA**: Service Worker for offline functionality
- **Build**: Turbopack for fast development
- **Cloud Sync**: GitHub Gist API, File System Access API
- **AI**: Google Gemini 2.0 Flash Lite for intelligent release notes

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
│   ├── CloudSync.tsx      # Cloud sync interface
│   ├── SyncStatusIndicator.tsx # Sync status display
│   └── EmptyState.tsx     # Empty state display
├── hooks/                 # Custom React hooks
│   ├── useDiscountCodes.ts # State management for codes
│   └── useCloudSync.ts    # Cloud sync functionality
├── types/                 # TypeScript definitions
│   ├── discount-code.ts   # Code interfaces and types
│   └── cloud-sync.ts      # Cloud sync interfaces
└── utils/                 # Utility functions
    ├── storage.ts         # LocalStorage helpers
    ├── cloud-providers.ts # Cloud provider implementations
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
- Automatic cloud sync integration
- Sync metadata tracking

### useCloudSync
- Multi-provider support
- Automatic sync scheduling
- Conflict detection and resolution
- Real-time sync status
- Background sync queue

## 📱 PWA Features

### Installation
The app can be installed on:
- iOS (Safari)
- Android (Chrome/Edge)
- Desktop (Chrome/Edge/Safari)

### Offline Functionality
- All saved codes are available offline
- New codes are stored locally
- Background sync queue for changes
- Automatic sync when connection is restored
- Sync status indication in the interface

### Notifications
- Alerts for soon-to-expire codes
- Updates about new features

## 🎯 Future Features

- [x] Cloud synchronization between devices
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
