export type Category = 'tools' | 'sports' | 'appliances' | 'gardening' | 'diy';

export type Item = {
  id: string;
  title: string;
  pricePerDay: number;
  distanceKm: number;
  city: string;
  category: Category;
  images: string[];
  description: string;
  availability?: { fromDate: string; toDate: string };
};

export type BookingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Returned' | 'Cancelled';

export type Booking = {
  id: string;
  itemId: string;
  itemTitle: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  status: BookingStatus;
  role: 'renter' | 'owner';
};
// Placeholder types/interfaces

export interface User {
  id: string;
}

export interface Booking {
  id: string;
  userId: string;
}
