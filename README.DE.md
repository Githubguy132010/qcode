
# QCode - Rabattcode-Manager

Eine moderne Progressive Web App (PWA) zum Speichern und Verwalten von Rabattcodes, gebaut mit Next.js 15, TypeScript und Tailwind CSS.

## ✨ Funktionen

### 🎯 Hauptfunktionen
- **Rabattcodes speichern** - Speichern Sie alle Ihre Rabattcodes mit Details
- **Intelligente Suche** - Suchen nach Code, Geschäft, Kategorie oder Beschreibung
- **Kategorisierung** - Organisieren Sie Codes nach Kategorie (Kleidung, Elektronik, etc.)
- **Ablaufdatum-Verfolgung** - Erhalten Sie Benachrichtigungen für bald ablaufende Codes
- **Favoriten** - Markieren Sie wichtige Codes als Favoriten
- **Nutzungsverfolgung** - Verfolgen Sie, wie oft Sie Ihre Codes verwenden

### 📱 Progressive Web App
- **Offline-Funktionalität** - Funktioniert ohne Internetverbindung
- **Installierbar** - Installieren Sie als App auf Ihrem Telefon/Computer
- **Responsives Design** - Perfekt auf allen Geräten
- **Native Erfahrung** - Fühlt sich wie eine echte App an

### 🎨 Benutzererfahrung
- **Modernes Design** - Saubere, benutzerfreundliche Oberfläche
- **Dunkel/Hell-Modus** - Automatische Themenunterstützung
- **Touch-freundlich** - Optimiert für Touch-Steuerungen
- **Barrierefreiheit** - Für alle zugänglich

## 🛠️ Technischer Stack

- **Framework** : Next.js 15 mit App Router
- **Sprache** : TypeScript für Typsicherheit
- **Styling** : Tailwind CSS für responsives Design
- **Icons** : Lucide React für konsistente Iconografie
- **Daten** : LocalStorage mit Cloud-Sync-Unterstützung
- **PWA** : Service Worker für Offline-Funktionalität
- **Build** : Turbopack für schnelle Entwicklung

## 🚀 Schnellstart

### Entwicklung
```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Browser öffnen auf http://localhost:3000
```

### Produktion
```bash
# Anwendung bauen
npm run build

# Produktionsserver starten
npm start
```

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root-Layout mit PWA-Konfiguration
│   ├── page.tsx           # Hauptseite
│   └── globals.css        # Globale Styles
├── components/            # React-Komponenten
│   ├── Header.tsx         # App-Header mit Navigation
│   ├── StatsOverview.tsx  # Statistik-Übersicht
│   ├── SearchAndFilter.tsx # Such- und Filter-Interface
│   ├── DiscountCodeCard.tsx # Einzelne Code-Karte
│   ├── AddCodeModal.tsx   # Modal für neue Codes
│   ├── SyncStatusIndicator.tsx # Sync-Status-Anzeige
│   └── EmptyState.tsx     # Leerer-Zustand-Anzeige
├── hooks/                 # Benutzerdefinierte React-Hooks
│   ├── useDiscountCodes.ts # Statusverwaltung für Codes
├── types/                 # TypeScript-Definitionen
│   ├── discount-code.ts   # Code-Interfaces und -Typen
└── utils/                 # Hilfsfunktionen
    ├── storage.ts         # LocalStorage-Helfer
    └── sync-utils.ts      # Sync-Hilfsfunktionen
```

## 💾 Datenmodell

```typescript
interface DiscountCode {
  id: string              // Eindeutige Kennung
  code: string           // Der Rabattcode selbst
  store: string          // Geschäftsname
  discount: string       // Rabattbetrag/Prozentsatz
  expiryDate?: Date      // Ablaufdatum (optional)
  category: string       // Kategorie
  description?: string   // Zusätzliche Beschreibung
  isFavorite: boolean    // Favoritenstatus
  isArchived: boolean    // Archivstatus
  dateAdded: Date        // Hinzugefügtes Datum
  timesUsed: number      // Anzahl der Verwendungen
  // Sync-Metadaten
  lastModified?: Date    // Letzte Änderung
  syncVersion?: number   // Version für Konfliktlösung
  deviceCreated?: string // Gerät, auf dem der Code erstellt wurde
}
```

## 🎨 Design-System

### Farben
- **Primär** : Blau (#3b82f6) - Hauptaktionen und Links
- **Erfolg** : Grün (#10b981) - Aktive Codes und Erfolg
- **Warnung** : Orange (#f59e0b) - Bald ablaufende Codes
- **Fehler** : Rot (#ef4444) - Abgelaufene Codes und Fehler
- **Grau** : Verschiedene Schattierungen für Text und Hintergründe

### Kategorien
- Kleidung
- Elektronik
- Essen und Trinken
- Sport und Fitness
- Bücher und Medien
- Reisen
- Schönheit und Pflege
- Haus und Garten
- Spielzeug
- Andere

## 🔄 Statusverwaltung

Die App verwendet benutzerdefinierte React-Hooks für zentrale Statusverwaltung:

### useDiscountCodes
- LocalStorage für Persistenz
- Optimistische Updates für schnelle UX
- Sync-Metadaten-Verfolgung

## 📱 PWA-Funktionen

### Installation
Die App kann installiert werden auf:
- iOS (Safari)
- Android (Chrome/Edge)
- Desktop (Chrome/Edge/Safari)

### Offline-Funktionalität
- Alle gespeicherten Codes sind offline verfügbar
- Neue Codes werden lokal gespeichert

### Benachrichtigungen
- Warnungen für bald ablaufende Codes
- Updates über neue Funktionen

## 🎯 Zukünftige Funktionen

- [ ] QR-Code-Scan für automatische Code-Eingabe
- [ ] Barcode-Unterstützung
- [ ] Geteilte Codes zwischen Benutzern
- [ ] Geschäftsintegrationen für automatische Codes
- [ ] Push-Benachrichtigungen für Angebote
- [x] Export/Import-Funktionalität
- [x] Analytics-Dashboard
- [ ] Theme-Anpassung
- [x] Mehrsprachige Unterstützung
- [ ] Ende-zu-Ende-Verschlüsselung für sensible Codes

## 📄 Lizenz

MIT-Lizenz - siehe [LICENSE](LICENSE)-Datei für Details.

## 🤝 Mitwirkung

Beiträge sind willkommen! Eröffnen Sie ein Issue oder reichen Sie einen Pull-Request ein.

## 📞 Kontakt

Bei Fragen oder Feedback öffnen Sie ein Issue auf GitHub.