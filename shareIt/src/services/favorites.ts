import { auth, db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { Item } from '../models/Item';
import { getItemById } from './items';

/**
 * Doda predmet v favorite uporabnika
 */
export async function addToFavorites(itemId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  try {
    await setDoc(doc(db, 'users', user.uid, 'favorites', itemId), {
      itemId,
      addedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

/**
 * Odstrani predmet iz favoritev
 */
export async function removeFromFavorites(itemId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  try {
    await deleteDoc(doc(db, 'users', user.uid, 'favorites', itemId));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

/**
 * Preveri ali je predmet v favoritih
 */
export async function isFavorite(itemId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const favorites = await getFavorites();
    return favorites.some(item => item.id === itemId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
}

/**
 * Pridobi vse favorite predmete uporabnika
 */
export async function getFavorites(): Promise<Item[]> {
  const user = auth.currentUser;
  if (!user) {
    console.error('User not authenticated');
    return [];
  }

  try {
    const favoritesQuery = query(
      collection(db, 'users', user.uid, 'favorites'),
      orderBy('addedAt', 'desc')
    );
    
    const snapshot = await getDocs(favoritesQuery);
    const favoriteItemIds = snapshot.docs.map(doc => doc.data().itemId as string);

    // Pridobi dejanske predmete
    const items = await Promise.all(
      favoriteItemIds.map(itemId => getItemById(itemId))
    );

    // Filtriraj null vrednosti (predmeti ki so bili izbrisani)
    return items.filter(item => item !== null) as Item[];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}
