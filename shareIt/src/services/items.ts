import { auth } from './firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type NewItemInput = {
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  availabilityFrom?: string; // YYYY-MM-DD
  availabilityTo?: string;   // YYYY-MM-DD
  city?: string;
  location?: { lat?: number; lng?: number };
  images?: string[]; // storage paths or urls
};

export async function createItem(input: NewItemInput) {
  const user = auth.currentUser;
  if (!user) throw new Error('auth/not-signed-in');

  // Client-side check; rules also enforce verified email
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
  };

  const ref = await addDoc(collection(db, 'items'), payload);
  return ref.id;
}

export async function listItems() {
  const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getItemById(id: string) {
  const d = await getDoc(doc(db, 'items', id));
  return d.exists() ? { id: d.id, ...(d.data() as any) } : null;
}
