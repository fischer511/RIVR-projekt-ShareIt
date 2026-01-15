export interface User {
  uid: string;
  email: string;
  name?: string;
  city?: string;
  location?: { lat: number; lng: number } | string;
  photoUrl?: string;
}
