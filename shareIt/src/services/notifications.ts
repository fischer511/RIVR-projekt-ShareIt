import { addDoc, collection, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationItem = {
  id?: string;
  userUid: string;
  actorUid: string;
  type: 'booking_request' | 'booking_status';
  title: string;
  body: string;
  createdAt?: any;
  read?: boolean;
};

export async function createNotification(data: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
  await addDoc(collection(db, 'notifications'), {
    ...data,
    createdAt: serverTimestamp(),
    read: false,
  });
}

export async function getUserNotifications(userUid: string): Promise<NotificationItem[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userUid', '==', userUid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
}
