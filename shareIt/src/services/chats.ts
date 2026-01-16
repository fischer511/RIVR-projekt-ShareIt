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
  try {
    console.log('Creating/Getting chat for booking:', booking.id);
    console.log('Participants:', [booking.ownerUid, booking.renterUid]);
    const chatRef = doc(db, 'chats', booking.id);
    await setDoc(
      chatRef,
      {
        bookingId: booking.id,
        itemId: booking.itemId,
        itemTitle: booking.itemTitle,
        ownerUid: booking.ownerUid,
        renterUid: booking.renterUid,
        participants: [booking.ownerUid, booking.renterUid],
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log('Chat created/updated successfully');
    return booking.id;
  } catch (error) {
    console.error('Error in getOrCreateChat:', error);
    throw error;
  }
}

export async function sendChatMessage(chatId: string, senderUid: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const msgDoc = await addDoc(messagesRef, {
      text: trimmed,
      senderUid,
      createdAt: serverTimestamp(),
    });
    console.log('Message sent:', msgDoc.id);
    
    // Update parent chat document with last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessageAt: serverTimestamp(),
      lastMessageText: trimmed,
    });
    console.log('Chat document updated');
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}

export function subscribeToChatMessages(chatId: string, onMessages: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
    console.log('Messages updated:', messages.length);
    onMessages(messages);
  }, (error) => {
    console.error('Error listening to chat messages:', error);
  });
}
