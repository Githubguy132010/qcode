[🇺🇸 English version](README.EN.md)

# QCode - Kortingscodes Beheren

Een moderne Progressive Web App (PWA) voor het opslaan en beheren van kortingscodes, gebouwd met Next.js 15, TypeScript en Tailwind CSS.

## ✨ Features

### 🎯 Hoofdfuncties
- **Kortingscodes opslaan** - Bewaar al je kortingscodes met details
- **Intelligent zoeken** - Zoek op code, winkel, categorie of beschrijving
- **Categorisering** - Organiseer codes per categorie (Kleding, Elektronica, etc.)
- **Vervaldatum tracking** - Krijg waarschuwingen voor bijna verlopende codes
- **Favorieten** - Markeer belangrijke codes als favoriet
- **Gebruik tracking** - Houd bij hoe vaak je codes gebruikt
- **Cloud synchronisatie** - Sync tussen al je apparaten via GitHub Gist of lokale bestanden

### 📱 Progressive Web App
- **Offline functionaliteit** - Werkt zonder internetverbinding
- **Installeerbaar** - Installeer als app op je telefoon/computer
- **Responsive design** - Perfect op alle apparaten
- **Native ervaring** - Voelt aan als een echte app
- **Background sync** - Automatische sync wanneer online

### 🎨 User Experience
- **Modern design** - Schone, gebruiksvriendelijke interface
- **Dark/Light mode** - Automatische thema-ondersteuning
- **Touch-friendly** - Geoptimaliseerd voor aanrakingsbediening
- **Accessibility** - Toegankelijk voor iedereen
- **Real-time sync status** - Zie direct de sync status

## ☁️ Cloud Sync Features

### Ondersteunde Providers
- **GitHub Gist** - Gebruik je GitHub account voor cloud opslag
- **Local File** - Sync via lokale bestanden (File System Access API)
- **Local Cloud** - Lokale opslag voor development/testing

### Sync Functionaliteiten
- **Automatische sync** - Configureerbare interval sync (5-240 minuten)
- **Conflict resolutie** - Smart merge, local prefer, of remote prefer
- **Background sync** - Sync gebeurt automatisch op de achtergrond
- **Multiple devices** - Sync tussen meerdere apparaten
- **Offline queue** - Wijzigingen worden gesynchroniseerd wanneer online
- **Data integriteit** - Checksums voor data validatie

### Conflict Resolutie
- **Smart Merge** (aanbevolen) - Intelligente samenvoeging van wijzigingen
- **Local Prefer** - Lokale wijzigingen hebben voorrang
- **Remote Prefer** - Cloud wijzigingen hebben voorrang

### Setup GitHub Sync
1. Ga naar [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Maak een nieuwe token met 'gist' scope
3. Voeg de token toe in de Cloud Sync instellingen
4. Automatische sync wordt ingeschakeld

## 🛠️ Technische Stack

- **Framework**: Next.js 15 met App Router
- **Taal**: TypeScript voor type-veiligheid
- **Styling**: Tailwind CSS voor responsive design
- **Icons**: Lucide React voor consistente iconografie
- **Data**: LocalStorage met cloud sync ondersteuning
- **PWA**: Service Worker voor offline functionaliteit
- **Build**: Turbopack voor snelle ontwikkeling
- **Cloud Sync**: GitHub Gist API, File System Access API

## 🚀 Snel starten

### Ontwikkeling
```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open browser naar http://localhost:3000
```

### Productie
```bash
# Bouw de applicatie
npm run build

# Start productie server
npm start
```

## 📁 Project Structuur

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout met PWA configuratie
│   ├── page.tsx           # Hoofdpagina
│   └── globals.css        # Globale styles
├── components/            # React componenten
│   ├── Header.tsx         # App header met navigatie
│   ├── UnifiedDashboardCard.tsx # Unified dashboard met tabbladen
│   ├── DiscountCodeCard.tsx # Individuele code kaart
│   ├── AddCodeModal.tsx   # Modal voor nieuwe codes
│   ├── CloudSync.tsx      # Cloud sync interface
│   ├── SyncStatusIndicator.tsx # Sync status weergave
│   ├── OnboardingTutorial.tsx # Interactieve tutorial
│   └── EmptyState.tsx     # Lege status weergave
├── hooks/                 # Custom React hooks
│   ├── useDiscountCodes.ts # State management voor codes
│   └── useCloudSync.ts    # Cloud sync functionaliteit
├── types/                 # TypeScript definities
│   ├── discount-code.ts   # Code interfaces en types
│   └── cloud-sync.ts      # Cloud sync interfaces
└── utils/                 # Utility functies
    ├── storage.ts         # LocalStorage helpers
    ├── cloud-providers.ts # Cloud provider implementaties
    └── sync-utils.ts      # Sync utility functies
```

## 💾 Data Model

```typescript
interface DiscountCode {
  id: string              // Unieke identifier
  code: string           // De kortingscode zelf
  store: string          // Winkel naam
  discount: string       // Korting bedrag/percentage
  expiryDate?: Date      // Vervaldatum (optioneel)
  category: string       // Categorie
  description?: string   // Extra beschrijving
  isFavorite: boolean    // Favoriet status
  isArchived: boolean    // Gearchiveerd status
  dateAdded: Date        // Datum toegevoegd
  timesUsed: number      // Aantal keer gebruikt
  // Sync metadata
  lastModified?: Date    // Laatste wijziging
  syncVersion?: number   // Versie voor conflict resolutie
  deviceCreated?: string // Apparaat waar code gemaakt is
}
```

## 🎨 Design Systeem

### Kleuren
- **Primary**: Blue (#3b82f6) - Hoofdacties en links
- **Success**: Green (#10b981) - Actieve codes en succes
- **Warning**: Orange (#f59e0b) - Bijna verlopende codes
- **Error**: Red (#ef4444) - Verlopen codes en fouten
- **Gray**: Verschillende tinten voor tekst en achtergronden

### Categorieën
- Kleding
- Elektronica
- Eten & Drinken
- Sport & Fitness
- Boeken & Media
- Reizen
- Beauty & Verzorging
- Wonen & Tuin
- Speelgoed
- Anders

## 🔄 State Management

De app gebruikt custom React hooks voor centraal state management:

### useDiscountCodes
- LocalStorage voor persistentie
- Optimistische updates voor snelle UX
- Automatische cloud sync integratie
- Sync metadata tracking

### useCloudSync
- Multi-provider ondersteuning
- Automatische sync scheduling
- Conflict detectie en resolutie
- Real-time sync status
- Background sync queue

## 📱 PWA Features

### Installatie
De app kan geïnstalleerd worden op:
- iOS (Safari)
- Android (Chrome/Edge)
- Desktop (Chrome/Edge/Safari)

### Offline Functionaliteit
- Alle opgeslagen codes zijn offline beschikbaar
- Nieuwe codes worden lokaal opgeslagen
- Background sync queue voor wijzigingen
- Automatische sync wanneer verbinding hersteld is
- Sync status indicatie in de interface

### Notificaties
- Waarschuwingen voor bijna verlopende codes
- Updates over nieuwe features

## 🎯 Toekomstige Features

- [x] Cloud synchronisatie tussen apparaten
- [ ] QR code scanning voor automatische code input
- [ ] Barcode ondersteuning
- [ ] Gedeelde codes tussen gebruikers
- [ ] Winkel integraties voor automatische codes
- [ ] Push notificaties voor deals
- [x] Export/import functionaliteit
- [x] Analytics dashboard
- [ ] Thema aanpassingen
- [x] Multi-taal ondersteuning
- [ ] End-to-end encryptie voor gevoelige codes

## 📄 Licentie

MIT License - zie [LICENSE](LICENSE) bestand voor details.

## 🤝 Bijdragen

Bijdragen zijn welkom! Open een issue of stuur een pull request.

## 📞 Contact

Voor vragen of feedback, open een issue op GitHub.
