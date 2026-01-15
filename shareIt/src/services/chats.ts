import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Booking } from './bookings';

export type ChatThread = {
  id: string;
  bookingId: string;
  itemId: string;
  ownerUid: string;
  renterUid: string;
  participants: string[];
};

export type ChatMessage = {
  id: string;
  text: string;
  senderUid: string;
  createdAt?: any;
};

export async function getOrCreateChat(booking: Booking): Promise<string> {
  if (!booking.id) throw new Error('booking-id-missing');
  const chatRef = doc(db, 'chats', booking.id);
  await setDoc(
    chatRef,
    {
      bookingId: booking.id,
      itemId: booking.itemId,
      ownerUid: booking.ownerUid,
      renterUid: booking.renterUid,
      participants: [booking.ownerUid, booking.renterUid],
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    },
    { merge: true }
  );
  return booking.id;
}

export async function sendChatMessage(chatId: string, senderUid: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    text: trimmed,
    senderUid,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessageAt: serverTimestamp(),
    lastMessageText: trimmed,
  });
}

export function subscribeToChatMessages(chatId: string, onMessages: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
    onMessages(messages);
  });
}
