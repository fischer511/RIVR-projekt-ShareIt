import { db, auth } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface ChatRoom {
  id: string;
  itemId: string;
  itemTitle: string;
  participants: string[]; // [ownerUid, renterUid]
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

/**
 * Pridobi ali ustvari chat sobo med uporabnikom in lastnikom predmeta
 */
export async function getOrCreateChatRoom(
  itemId: string,
  itemTitle: string,
  ownerUid: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('auth/not-signed-in');

  // Preveri, če chat soba že obstaja
  const q = query(
    collection(db, 'chats'),
    where('itemId', '==', itemId),
    where('participants', 'array-contains', user.uid)
  );

  const snap = await getDocs(q);
  
  // Najdi sobo kjer sta oba udeleženca (owner in trenutni uporabnik)
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.participants.includes(ownerUid) && data.participants.includes(user.uid)) {
      return doc.id;
    }
  }

  // Ustvari novo chat sobo
  const chatRef = await addDoc(collection(db, 'chats'), {
    itemId,
    itemTitle,
    participants: [ownerUid, user.uid],
    createdAt: serverTimestamp(),
  });

  return chatRef.id;
}

/**
 * Pošlji sporočilo v chat sobo
 */
export async function sendMessage(chatId: string, text: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('auth/not-signed-in');

  const trimmedText = text.trim();
  if (!trimmedText) return;

  // Dodaj sporočilo v podkolekcijo messages
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: user.uid,
    text: trimmedText,
    createdAt: serverTimestamp(),
  });

  // Posodobi zadnje sporočilo v chat sobi
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: trimmedText,
    lastMessageAt: serverTimestamp(),
  });
}

/**
 * Pridobi sporočila v realnem času
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Message[];
    callback(messages);
  });
}

/**
 * Pridobi vse chat sobe trenutnega uporabnika
 */
export function subscribeToUserChats(
  callback: (chats: ChatRoom[]) => void
): () => void {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', user.uid),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ChatRoom[];
    callback(chats);
  });
}

/**
 * Pridobi podatke o chat sobi
 */
export async function getChatRoom(chatId: string): Promise<ChatRoom | null> {
  const d = await getDoc(doc(db, 'chats', chatId));
  return d.exists() ? ({ id: d.id, ...d.data() } as ChatRoom) : null;
}
