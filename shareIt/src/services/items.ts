import { auth, db } from './firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, where, doc, getDoc, limit, startAfter, QueryDocumentSnapshot, DocumentData, updateDoc, deleteDoc } from 'firebase/firestore';
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
  // Email verification disabled for school project
  // if (!user.emailVerified) throw new Error('auth/email-not-verified');

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

export type ItemsPage = {
  items: Item[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

export async function queryItemsPage(filters: { category?: string }, pageSize = 10, cursor?: QueryDocumentSnapshot<DocumentData> | null): Promise<ItemsPage> {
  let q = query(
    collection(db, 'items'),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  if (cursor) {
    q = query(q, startAfter(cursor));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
  const lastDoc = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;

  return {
    items,
    lastDoc,
    hasMore: snap.docs.length === pageSize,
  };
}

export async function getItemById(id: string): Promise<Item | null> {
  const d = await getDoc(doc(db, 'items', id));
  return d.exists() ? ({ id: d.id, ...d.data() } as Item) : null;
}

export async function getUserProfile(uid: string) {
  const d = await getDoc(doc(db, 'users', uid));
  return d.exists() ? d.data() : null;
}

export async function getItemsByOwner(ownerUid: string): Promise<Item[]> {
  const q = query(collection(db, 'items'), where('ownerUid', '==', ownerUid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

export async function updateItem(itemId: string, data: Partial<Item>) {
  await updateDoc(doc(db, 'items', itemId), data);
}

export async function deleteItem(itemId: string) {
  await deleteDoc(doc(db, 'items', itemId));
}
