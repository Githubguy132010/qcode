
# QCode - Gestore codici sconto

Una moderna Progressive Web App (PWA) per archiviare e gestire i codici sconto, costruita con Next.js 15, TypeScript e Tailwind CSS.

## ✨ Funzionalità

### 🎯 Funzionalità principali
- **Archiviare codici sconto** - Salva tutti i tuoi codici con i dettagli
- **Ricerca intelligente** - Cerca per codice, negozio, categoria o descrizione
- **Categorizzazione** - Organizza i codici per categoria (Abbigliamento, Elettronica, ecc.)
- **Tracciamento date di scadenza** - Ricevi avvisi per i codici in scadenza
- **Preferiti** - Contrassegna i codici importanti come preferiti
- **Tracciamento utilizzo** - Tieni traccia di quante volte usi i tuoi codici

### 📱 Progressive Web App
- **Funzionalità offline** - Funziona senza connessione internet
- **Installabile** - Installa come app sul tuo telefono/computer
- **Design responsive** - Perfetto su tutti i dispositivi
- **Esperienza nativa** - Sembra una vera app

### 🎨 Esperienza utente
- **Design moderno** - Interfaccia pulita e user-friendly
- **Modalità scura/chiara** - Supporto automatico dei temi
- **Touch-friendly** - Ottimizzato per controlli touch
- **Accessibilità** - Accessibile a tutti

## 🛠️ Stack tecnico

- **Framework** : Next.js 15 con App Router
- **Linguaggio** : TypeScript per sicurezza dei tipi
- **Styling** : Tailwind CSS per design responsive
- **Icone** : Lucide React per iconografia coerente
- **Dati** : LocalStorage con supporto sincronizzazione cloud
- **PWA** : Service Worker per funzionalità offline
- **Build** : Turbopack per sviluppo veloce

## 🚀 Avvio rapido

### Sviluppo
```bash
# Installare le dipendenze
pnpm install

# Avviare il server di sviluppo
pnpm run dev

# Aprire il browser su http://localhost:3000
```

### Produzione
```bash
# Costruire l'applicazione
pnpm run build

# Avviare il server di produzione
pnpm start
```

## 📁 Struttura del progetto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout radice con configurazione PWA
│   ├── page.tsx           # Pagina principale
│   └── globals.css        # Stili globali
├── components/            # Componenti React
│   ├── Header.tsx         # Header dell'app con navigazione
│   ├── StatsOverview.tsx  # Panoramica statistiche
│   ├── SearchAndFilter.tsx # Interfaccia ricerca e filtro
│   ├── DiscountCodeCard.tsx # Scheda codice individuale
│   ├── AddCodeModal.tsx   # Modal per nuovi codici
│   ├── SyncStatusIndicator.tsx # Indicatore stato sincronizzazione
│   └── EmptyState.tsx     # Visualizzazione stato vuoto
├── hooks/                 # Hook React personalizzati
│   ├── useDiscountCodes.ts # Gestione stato per i codici
├── types/                 # Definizioni TypeScript
│   ├── discount-code.ts   # Interfacce e tipi di codici
└── utils/                 # Funzioni utilitarie
    ├── storage.ts         # Helper LocalStorage
    └── sync-utils.ts      # Utilità di sincronizzazione
```

## 💾 Modello dati

```typescript
interface DiscountCode {
  id: string              // Identificatore unico
  code: string           // Il codice sconto stesso
  store: string          // Nome del negozio
  discount: string       // Importo/percentuale sconto
  expiryDate?: Date      // Data di scadenza (opzionale)
  category: string       // Categoria
  description?: string   // Descrizione aggiuntiva
  isFavorite: boolean    // Stato preferito
  isArchived: boolean    // Stato archiviato
  dateAdded: Date        // Data di aggiunta
  timesUsed: number      // Numero di utilizzi
  // Metadati sincronizzazione
  lastModified?: Date    // Ultima modifica
  syncVersion?: number   // Versione per risoluzione conflitti
  deviceCreated?: string // Dispositivo dove il codice è stato creato
}
```

## 🎨 Sistema di design

### Colori
- **Primario** : Blu (#3b82f6) - Azioni principali e link
- **Successo** : Verde (#10b981) - Codici attivi e successo
- **Avvertimento** : Arancione (#f59e0b) - Codici in scadenza
- **Errore** : Rosso (#ef4444) - Codici scaduti ed errori
- **Grigio** : Varie sfumature per testo e sfondi

### Categorie
- Abbigliamento
- Elettronica
- Cibo e bevande
- Sport e fitness
- Libri e media
- Viaggi
- Bellezza e cura personale
- Casa e giardino
- Giocattoli
- Altro

## 🔄 Gestione stato

L'app utilizza hook React personalizzati per la gestione centralizzata dello stato:

### useDiscountCodes
- LocalStorage per persistenza
- Aggiornamenti ottimistici per UX veloce
- Tracciamento metadati sincronizzazione

## 📱 Funzionalità PWA

### Installazione
L'app può essere installata su:
- iOS (Safari)
- Android (Chrome/Edge)
- Desktop (Chrome/Edge/Safari)

### Funzionalità offline
- Tutti i codici salvati sono disponibili offline
- I nuovi codici sono archiviati localmente

### Notifiche
- Avvisi per codici in scadenza
- Aggiornamenti su nuove funzionalità

## 🎯 Funzionalità future

- [ ] Scansione codici QR per inserimento automatico
- [ ] Supporto codici a barre
- [ ] Condivisione codici tra utenti
- [ ] Integrazioni negozi per codici automatici
- [ ] Notifiche push per offerte
- [x] Funzionalità esporta/importa
- [x] Dashboard analitico
- [ ] Personalizzazione tema
- [x] Supporto multilingue
- [ ] Crittografia end-to-end per codici sensibili

## 📄 Licenza

Licenza MIT - vedere il file [LICENSE](LICENSE) per i dettagli.

## 🤝 Contribuzione

I contributi sono benvenuti! Apri un issue o invia una pull request.

## 📞 Contatto

Per domande o feedback, apri un issue su GitHub.