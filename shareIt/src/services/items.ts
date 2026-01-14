import { auth, db } from './firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { Item } from '../models/Item';

export type NewItemInput = {
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  availabilityFrom?: string; 
  availabilityTo?: string;   
  city?: string;
  location?: { lat?: number; lng?: number };
  images?: string[];
};

export async function createItem(input: NewItemInput) {
  const user = auth.currentUser;
  if (!user) throw new Error('auth/not-signed-in');
  if (!user.emailVerified) throw new Error('auth/email-not-verified');

  const payload = {
    ownerUid: user.uid,
    title: input.title,
    description: input.description,
    category: input.category,
    pricePerDay: input.pricePerDay,
    availabilityFrom: input.availabilityFrom ?? null,
    availabilityTo: input.availabilityTo ?? null,
    city: input.city ?? null,
    location: input.location ?? null,
    images: input.images ?? [],
    createdAt: serverTimestamp(),
    status: 'available',
  };

  const ref = await addDoc(collection(db, 'items'), payload);
  return ref.id;
}

export async function queryItems(filters: { category?: string }): Promise<Item[]> {
  let q = query(collection(db, 'items'), 
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc')
  );

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

export async function getItemById(id: string): Promise<Item | null> {
  const d = await getDoc(doc(db, 'items', id));
  return d.exists() ? ({ id: d.id, ...d.data() } as Item) : null;
}

export async function getUserProfile(uid: string) {
  const d = await getDoc(doc(db, 'users', uid));
  return d.exists() ? d.data() : null;
}
