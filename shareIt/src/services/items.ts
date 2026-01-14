import { auth } from './firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Item, ItemInput } from '../models';

/**
 * Ustvari nov predmet v Firestore (items kolekcija).
 * Vrne ID ustvarjenega dokumenta.
 */
export async function createItem(input: ItemInput): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('auth/not-signed-in');

  // if (!user.emailVerified) throw new Error('auth/email-not-verified');

  const payload = {
    ownerUid: user.uid,
    title: input.title,
    description: input.description,
    category: input.category,
    pricePerDay: input.pricePerDay,
    availability: input.availabilityFrom && input.availabilityTo
      ? { fromDate: input.availabilityFrom, toDate: input.availabilityTo }
      : null,
    city: input.city ?? null,
    location: input.location ?? null,
    photos: input.photos ?? [],
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'items'), payload);
  return ref.id;
}

/**
 * Pridobi vse predmete (najnovejši najprej).
 */
export async function listItems(): Promise<Item[]> {
  const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

/**
 * Pridobi posamezen predmet po ID-ju.
 */
export async function getItemById(id: string): Promise<Item | null> {
  const d = await getDoc(doc(db, 'items', id));
  return d.exists() ? ({ id: d.id, ...d.data() } as Item) : null;
}
