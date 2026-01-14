import { Item, Booking } from '@src/models';

export const items: Item[] = [
  {
    id: 'i1',
    title: 'Cordless Drill (Makita)',
    pricePerDay: 8,
    distanceKm: 1.2,
    city: 'Ljubljana',
    category: 'tools',
    photos: [
      'https://images.unsplash.com/photo-1567016575061-39b9b33e57a9?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553694127-c66d4bdb0b46?q=80&w=1080&auto=format&fit=crop',
    ],
    ownerUid: 'mock-user-1',
    createdAt: null,
    location: null,
    description: 'Perfect for DIY, includes battery and charger.',
    availability: { fromDate: '2026-01-20', toDate: '2026-02-15' },
  },
  {
    id: 'i2',
    title: 'Mountain Bike (Hardtail)',
    pricePerDay: 15,
    distanceKm: 8.4,
    city: 'Kranj',
    category: 'sports',
    photos: [
      'https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=1080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1080&auto=format&fit=crop',
    ],
    ownerUid: 'mock-user-2',
    createdAt: null,
    location: null,
    description: 'Well-maintained bike, ideal for weekend rides.',
    availability: { fromDate: '2026-01-10', toDate: '2026-03-01' },
  },
  {
    id: 'i3',
    title: 'Pressure Washer',
    pricePerDay: 12,
    distanceKm: 5.0,
    city: 'Domžale',
    category: 'appliances',
    photos: [
      'https://images.unsplash.com/photo-1613498495643-6f6ee91d53d7?q=80&w=1080&auto=format&fit=crop',
    ],
    description: 'Great for patios and cars, hose included.',
    ownerUid: 'mock-user-3',
    createdAt: null,
    location: null,
    availability: null,
  },
];

export const bookings: Booking[] = [
  {
    id: 'b1',
    itemId: 'i1',
    itemTitle: 'Cordless Drill (Makita)',
    fromDate: '2026-01-21',
    toDate: '2026-01-24',
    status: 'Pending',
    role: 'renter',
  },
  {
    id: 'b2',
    itemId: 'i2',
    itemTitle: 'Mountain Bike (Hardtail)',
    fromDate: '2026-02-02',
    toDate: '2026-02-05',
    status: 'Accepted',
    role: 'owner',
  },
  {
    id: 'b3',
    itemId: 'i3',
    itemTitle: 'Pressure Washer',
    fromDate: '2025-12-20',
    toDate: '2025-12-22',
    status: 'Completed' as any,
    role: 'renter',
  },
];
