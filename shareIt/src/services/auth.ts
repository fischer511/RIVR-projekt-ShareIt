import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { Alert } from 'react-native';

export const registerUser = async (email, password, location) => {
  // 1. Validacija vnosa
  if (!email || !password || !location) {
    Alert.alert('Napaka', 'Vsa polja so obvezna.');
    return;
  }
  // Preprosta validacija e-maila
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert('Napaka', 'Prosimo, vnesite veljaven e-mail naslov.');
    return;
  }
  // Preverjanje dolžine gesla
  if (password.length < 6) {
    Alert.alert('Napaka', 'Geslo mora vsebovati vsaj 6 znakov.');
    return;
  }

  try {
    // 2. Ustvarjanje uporabnika v Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Shranjevanje podatkov v Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      location: location,
      createdAt: serverTimestamp()
    });

    Alert.alert('Uspeh', 'Registracija uspešna!');
    return user; // Vrnemo uporabnika za morebitno avtomatsko prijavo
  } catch (error: any) {
    // Prikaz napak
    console.error("Napaka pri registraciji:", error);
    Alert.alert('Napaka pri registraciji', error.message);
  }
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    Alert.alert('Napaka', 'Vnesite e-mail in geslo.');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Napaka pri prijavi:", error);
    Alert.alert('Napaka pri prijavi', error.message);
  }
};
