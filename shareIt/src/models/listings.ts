export type Listing = {
  id: string;
  title: string;
  location?: string;
  pricePerDay?: number;
  category?: 'tools' | 'appliances' | 'sports' | 'gardening' | 'diy';
  distanceKm?: number;
  rating?: number;
  imageUrl: string;
  favorite?: boolean;
};

export const sampleListings: Listing[] = [
  {
    id: '1',
    title: 'Cordless Drill (Makita)',
    location: 'Ljubljana',
    pricePerDay: 8,
    category: 'tools',
    distanceKm: 1.2,
    rating: 4.8,
    imageUrl:
      'https://images.unsplash.com/photo-1567016575061-39b9b33e57a9?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Mountain Bike (Hardtail)',
    location: 'Kranj',
    pricePerDay: 15,
    category: 'sports',
    distanceKm: 8.4,
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=1080&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Pressure Washer',
    location: 'Domžale',
    pricePerDay: 12,
    category: 'appliances',
    distanceKm: 5.0,
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1613498495643-6f6ee91d53d7?q=80&w=1080&auto=format&fit=crop',
  },
];
