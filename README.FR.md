
# QCode - Gestionnaire de codes de réduction

Une application web progressive (PWA) moderne pour stocker et gérer les codes de réduction, construite avec Next.js 15, TypeScript et Tailwind CSS.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales
- **Stocker les codes de réduction** - Sauvegardez tous vos codes avec leurs détails
- **Recherche intelligente** - Recherchez par code, magasin, catégorie ou description
- **Catégorisation** - Organisez les codes par catégorie (Vêtements, Électronique, etc.)
- **Suivi des dates d'expiration** - Recevez des alertes pour les codes bientôt expirés
- **Favoris** - Marquez les codes importants comme favoris
- **Suivi d'utilisation** - Suivez la fréquence d'utilisation de vos codes

### 📱 Application Web Progressive
- **Fonctionnalité hors ligne** - Fonctionne sans connexion internet
- **Installable** - Installez comme une application sur votre téléphone/ordinateur
- **Design responsive** - Parfait sur tous les appareils
- **Expérience native** - Ressemble à une vraie application

### 🎨 Expérience utilisateur
- **Design moderne** - Interface propre et conviviale
- **Mode sombre/clair** - Support automatique des thèmes
- **Convivial tactile** - Optimisé pour les contrôles tactiles
- **Accessibilité** - Accessible à tous

## 🛠️ Pile technique

- **Framework** : Next.js 15 avec App Router
- **Langage** : TypeScript pour la sécurité des types
- **Style** : Tailwind CSS pour un design responsive
- **Icônes** : Lucide React pour une iconographie cohérente
- **Données** : LocalStorage avec support de synchronisation cloud
- **PWA** : Service Worker pour la fonctionnalité hors ligne
- **Build** : Turbopack pour un développement rapide

## 🚀 Démarrage rapide

### Développement
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir le navigateur sur http://localhost:3000
```

### Production
```bash
# Construire l'application
npm run build

# Démarrer le serveur de production
npm start
```

## 📁 Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout racine avec configuration PWA
│   ├── page.tsx           # Page principale
│   └── globals.css        # Styles globaux
├── components/            # Composants React
│   ├── Header.tsx         # En-tête de l'application avec navigation
│   ├── StatsOverview.tsx  # Vue d'ensemble des statistiques
│   ├── SearchAndFilter.tsx # Interface de recherche et filtrage
│   ├── DiscountCodeCard.tsx # Carte individuelle de code
│   ├── AddCodeModal.tsx   # Modal pour nouveaux codes
│   ├── SyncStatusIndicator.tsx # Indicateur de statut de synchronisation
│   └── EmptyState.tsx     # Affichage d'état vide
├── hooks/                 # Hooks React personnalisés
│   ├── useDiscountCodes.ts # Gestion d'état pour les codes
├── types/                 # Définitions TypeScript
│   ├── discount-code.ts   # Interfaces et types de codes
└── utils/                 # Fonctions utilitaires
    ├── storage.ts         # Helpers LocalStorage
    └── sync-utils.ts      # Utilitaires de synchronisation
```

## 💾 Modèle de données

```typescript
interface DiscountCode {
  id: string              // Identifiant unique
  code: string           // Le code de réduction lui-même
  store: string          // Nom du magasin
  discount: string       // Montant/pourcentage de réduction
  expiryDate?: Date      // Date d'expiration (optionnel)
  category: string       // Catégorie
  description?: string   // Description supplémentaire
  isFavorite: boolean    // Statut favori
  isArchived: boolean    // Statut archivé
  dateAdded: Date        // Date d'ajout
  timesUsed: number      // Nombre d'utilisations
  // Métadonnées de synchronisation
  lastModified?: Date    // Dernière modification
  syncVersion?: number   // Version pour résolution de conflits
  deviceCreated?: string // Appareil où le code a été créé
}
```

## 🎨 Système de design

### Couleurs
- **Primaire** : Bleu (#3b82f6) - Actions principales et liens
- **Succès** : Vert (#10b981) - Codes actifs et succès
- **Avertissement** : Orange (#f59e0b) - Codes bientôt expirés
- **Erreur** : Rouge (#ef4444) - Codes expirés et erreurs
- **Gris** : Diverses nuances pour le texte et les arrière-plans

### Catégories
- Vêtements
- Électronique
- Nourriture et boissons
- Sport et fitness
- Livres et médias
- Voyage
- Beauté et soins personnels
- Maison et jardin
- Jouets
- Autre

## 🔄 Gestion d'état

L'application utilise des hooks React personnalisés pour la gestion centralisée d'état :

### useDiscountCodes
- LocalStorage pour la persistance
- Mises à jour optimistes pour une UX rapide
- Suivi des métadonnées de synchronisation

## 📱 Fonctionnalités PWA

### Installation
L'application peut être installée sur :
- iOS (Safari)
- Android (Chrome/Edge)
- Bureau (Chrome/Edge/Safari)

### Fonctionnalité hors ligne
- Tous les codes sauvegardés sont disponibles hors ligne
- Les nouveaux codes sont stockés localement

### Notifications
- Alertes pour les codes bientôt expirés
- Mises à jour sur les nouvelles fonctionnalités

## 🎯 Fonctionnalités futures

- [ ] Scan de codes QR pour saisie automatique
- [ ] Support des codes-barres
- [ ] Partage de codes entre utilisateurs
- [ ] Intégrations de magasins pour codes automatiques
- [ ] Notifications push pour les offres
- [x] Fonctionnalité d'export/import
- [x] Tableau de bord d'analyse
- [ ] Personnalisation de thème
- [x] Support multilingue
- [ ] Chiffrement de bout en bout pour les codes sensibles

## 📄 Licence

Licence MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📞 Contact

Pour des questions ou des retours, ouvrez une issue sur GitHub.