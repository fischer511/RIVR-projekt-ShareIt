import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp, doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications';

export interface Booking {
  id?: string;
  itemId: string;
  itemTitle: string;
  itemImage?: string | null;
  ownerUid: string;
  renterUid: string;
  dates: string[]; // ISO date strings
  pricePerDay: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  createdAt?: Timestamp;
  expiresAt?: Timestamp;
  rating?: {
    score: number;
    comment?: string;
    raterUid: string;
    createdAt?: Timestamp;
  };
}

/**
 * Create a new booking request
 */
export async function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<string> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    });
    await createNotification({
      userUid: bookingData.ownerUid,
      actorUid: bookingData.renterUid,
      type: 'booking_request',
      title: 'Nova prošnja',
      body: `Prejeli ste prošnjo za predmet: ${bookingData.itemTitle}`,
    });
    console.log('Booking created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Booking;
}

export async function updateBookingStatus(bookingId: string, status: Booking['status'], actorUid?: string) {
  const booking = await getBookingById(bookingId);
  await updateDoc(doc(db, 'bookings', bookingId), { status });
  if (booking) {
    const statusLabel =
      status === 'confirmed' ? 'Potrjeno' :
      status === 'rejected' ? 'Zavrnjeno' :
      status === 'completed' ? 'Zaključeno' :
      status === 'cancelled' ? 'Preklicano' : 'Posodobljeno';
    const notifyUid = actorUid
      ? (actorUid === booking.ownerUid ? booking.renterUid : booking.ownerUid)
      : (status === 'cancelled' ? booking.ownerUid : booking.renterUid);
    await createNotification({
      userUid: notifyUid,
      actorUid: actorUid || (status === 'cancelled' ? booking.renterUid : booking.ownerUid),
      type: 'booking_status',
      title: 'Status prošnje',
      body: `Predmet "${booking.itemTitle}": ${statusLabel}`,
    });
  }
}

export async function autoCancelExpiredBookings(filters: { renterUid?: string; ownerUid?: string }) {
  try {
    const now = Timestamp.fromDate(new Date());
    const bookingsRef = collection(db, 'bookings');

    // Query pending bookings only (can't use 3 where clauses without composite index)
    // So we filter expireAt in code
    const queries = [];
    if (filters.renterUid) {
      queries.push(query(bookingsRef, where('renterUid', '==', filters.renterUid), where('status', '==', 'pending')));
    }
    if (filters.ownerUid) {
      queries.push(query(bookingsRef, where('ownerUid', '==', filters.ownerUid), where('status', '==', 'pending')));
    }

    for (const q of queries) {
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        const booking = docSnap.data() as Booking;
        // Filter expireAt in code (no composite index needed)
        if (booking.expiresAt && booking.expiresAt.toMillis?.() <= now.toMillis?.()) {
          console.log('Auto-cancelling expired booking:', docSnap.id);
          await updateDoc(doc(db, 'bookings', docSnap.id), { status: 'cancelled' });
        }
      }
    }
  } catch (error) {
    console.error('Error in autoCancelExpiredBookings:', error);
    // Don't throw - this is a background task
  }
}

export async function submitBookingRating(bookingId: string, itemId: string, score: number, comment: string | undefined, raterUid: string) {
  if (!raterUid) throw new Error('auth/not-signed-in');
  const rating = {
    score,
    comment: comment?.trim() || null,
    raterUid,
    createdAt: serverTimestamp(),
  };

  await updateDoc(doc(db, 'bookings', bookingId), { rating });

  await runTransaction(db, async (tx) => {
    const itemRef = doc(db, 'items', itemId);
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists()) return;
    const data = itemSnap.data() as any;
    const count = Number(data.ratingCount || 0);
    const avg = Number(data.ratingAvg || 0);
    const newCount = count + 1;
    const newAvg = (avg * count + score) / newCount;
    tx.update(itemRef, { ratingAvg: newAvg, ratingCount: newCount });
  });
}

/**
 * Get all bookings for a specific user (as renter)
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('renterUid', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Booking));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

/**
 * Get all booking requests for items owned by a user
 */
export async function getOwnerBookingRequests(ownerId: string): Promise<Booking[]> {
  try {
    console.log('Fetching booking requests for owner:', ownerId);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('ownerUid', '==', ownerId));
    const snapshot = await getDocs(q);
    
    console.log('Found', snapshot.docs.length, 'booking requests for owner', ownerId);
    
    const bookings = snapshot.docs.map(doc => {
      console.log('Booking:', doc.id, doc.data());
      return {
        id: doc.id,
        ...doc.data(),
      } as Booking;
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching owner booking requests:', error);
    throw error;
  }
}

/**
 * Get bookings for a specific item
 */
export async function getItemBookings(itemId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('itemId', '==', itemId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Booking));
  } catch (error) {
    console.error('Error fetching item bookings:', error);
    throw error;
  }
}
