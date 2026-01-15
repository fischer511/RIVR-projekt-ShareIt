/** Kategorije predmetov */
export type Category = 'tools' | 'sports' | 'appliances' | 'gardening' | 'diy' | 'other';

/** Lokacija predmeta */
export type ItemLocation = {
  lat?: number;
  lng?: number;
  address?: string; // ročno vnesen naslov
};

/** Predmet shranjen v Firestore (items kolekcija) */
export type Item = {
  id: string;
  title: string;                       // naslov
  description: string;                 // opis
  photos: string[];                    // array URL-jev do slik v Firebase Storage
  category: Category;                  // kategorija
  pricePerDay: number;                 // cena na dan
  availability: {                      // razpoložljivost
    fromDate: string;                  // YYYY-MM-DD
    toDate: string;
  } | null;
  location: ItemLocation | null;       // koordinate ali naslov
  city?: string;                       // mesto (za prikaz)
  ownerUid: string;                    // UID lastnika
  createdAt: any;                      // Firestore Timestamp
  distanceKm?: number;                 // izračunana razdalja (ni shranjena, dodana na klientu)
};

/** Vhodni podatki za ustvarjanje novega predmeta */
export type ItemInput = {
  title: string;
  description: string;
  photos?: string[];                   // URL-ji po uploadu v Storage
  category: Category;
  pricePerDay: number;
  availabilityFrom?: string;           // YYYY-MM-DD
  availabilityTo?: string;
  city?: string;
  location?: ItemLocation;
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
