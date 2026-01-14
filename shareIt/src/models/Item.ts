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
  createdAt: any; // Firestore Timestamp
}
