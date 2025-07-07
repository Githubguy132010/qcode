import type { DiscountCode } from '@/types/discount-code'

export const generateDemoData = (): DiscountCode[] => {
  const demoData: DiscountCode[] = [
    {
      id: 'demo-1',
      code: 'WELCOME20',
      store: 'Bol.com',
      discount: '20%',
      category: 'Elektronica',
      description: 'Welkomstkorting voor nieuwe klanten',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      isFavorite: true,
      isArchived: false,
      dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      timesUsed: 0,
    },
    {
      id: 'demo-2',
      code: 'SAVE15',
      store: 'H&M',
      discount: '15%',
      category: 'Kleding',
      description: 'Korting op alle jassen en winterkleding',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      timesUsed: 2,
    },
    {
      id: 'demo-3',
      code: 'GRATIS10',
      store: 'Albert Heijn',
      discount: '€10',
      category: 'Eten & Drinken',
      description: 'Gratis €10 bij aankoop vanaf €50',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isFavorite: true,
      isArchived: false,
      dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      timesUsed: 1,
    },
    {
      id: 'demo-4',
      code: 'STUDENT25',
      store: 'Adobe',
      discount: '25%',
      category: 'Anders',
      description: 'Studentenkorting op Creative Cloud',
      expiryDate: undefined, // No expiry
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      timesUsed: 0,
    },
    {
      id: 'demo-5',
      code: 'EXPIRED50',
      store: 'Zalando',
      discount: '50%',
      category: 'Kleding',
      description: 'Was een geweldige deal, maar helaas verlopen',
      expiryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (expired)
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      timesUsed: 3,
    },
    {
      id: 'demo-6',
      code: 'BOEKEN10',
      store: 'Bol.com',
      discount: '€10',
      category: 'Boeken & Media',
      description: 'Korting op alle boeken en e-books',
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      isFavorite: false,
      isArchived: false,
      dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      timesUsed: 0,
    },
    {
      id: 'demo-7',
      code: 'FITNESS30',
      store: 'Decathlon',
      discount: '30%',
      category: 'Sport & Fitness',
      description: 'Korting op alle sportkleding en accessoires',
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow (expiring soon!)
      isFavorite: true,
      isArchived: false,
      dateAdded: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      timesUsed: 1,
    },
    {
      id: 'demo-8',
      code: 'ARCHIVED20',
      store: 'MediaMarkt',
      discount: '20%',
      category: 'Elektronica',
      description: 'Oude code die gearchiveerd is',
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Still valid but archived
      isFavorite: false,
      isArchived: true,
      dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      timesUsed: 5,
    },
  ]

  return demoData
}

export const loadDemoData = () => {
  const demoData = generateDemoData()
  localStorage.setItem('qcode-discount-codes', JSON.stringify(demoData))
  return demoData
}
