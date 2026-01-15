export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  city: string;
  location?: { lat?: number; lng?: number };
  images: string[];
  ownerUid: string;
  status: string; // 'available', 'booked', 'unavailable'
  createdAt: any; // Firestore Timestamp
  availabilityFrom?: string | null;
  availabilityTo?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
}
