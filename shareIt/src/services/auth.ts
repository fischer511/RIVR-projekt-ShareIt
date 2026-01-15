import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type AuthResult = {
  success: boolean;
  message: string;
  type?: 'success' | 'error';
};

export const registerUser = async (email, password, location): Promise<AuthResult> => {
  // 1. Validacija vnosa
  if (!email || !password || !location) {
    return { success: false, message: 'Vsa polja so obvezna.', type: 'error' };
  }
  
  // Validacija e-maila
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Prosimo, vnesite veljaven e-mail naslov (npr. ime@domena.si).', type: 'error' };
  }
  
  // Strožja validacija gesla
  if (password.length < 8) {
    return { success: false, message: 'Geslo mora vsebovati vsaj 8 znakov.', type: 'error' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasLetter || !hasNumber || !hasSpecialChar) {
    return { 
      success: false, 
      message: 'Geslo mora vsebovati:\n- vsaj 1 črko\n- vsaj 1 številko\n- vsaj 1 poseben znak (!@#$%^&* itd.)',
      type: 'error'
    };
  }

  try {
    // 2. Ustvarjanje uporabnika v Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Shranjevanje podatkov v Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      location: location,
      createdAt: serverTimestamp()
    });

    // 4. Pošiljanje email verifikacije
    try {
      await sendEmailVerification(user);
      return { 
        success: true, 
        message: 'Registracija uspešna! Preverite svoj email za verifikacijsko povezavo.',
        type: 'success'
      };
    } catch (emailError) {
      console.error('Email verification error:', emailError);
      return { 
        success: true, 
        message: 'Registracija uspešna! (Email verifikacija ni bila poslana)',
        type: 'success'
      };
    }
  } catch (error: any) {
    console.error("Napaka pri registraciji:", error);
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'Ta e-mail naslov je že v uporabi.', type: 'error' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Neveljaven e-mail naslov.', type: 'error' };
    } else {
      return { success: false, message: 'Napaka pri registraciji: ' + error.message, type: 'error' };
    }
  }
};

export const loginUser = async (email, password): Promise<AuthResult> => {
  if (!email || !password) {
    return { success: false, message: 'Vnesite e-mail in geslo.', type: 'error' };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true, message: 'Prijava uspešna!', type: 'success' };
  } catch (error: any) {
    console.error("Napaka pri prijavi:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      return { success: false, message: 'Napačno geslo ali e-mail naslov.', type: 'error' };
    } else if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'Uporabnik s tem e-mail naslovom ne obstaja.', type: 'error' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, message: 'Neveljaven e-mail naslov.', type: 'error' };
    } else if (error.code === 'auth/too-many-requests') {
      return { success: false, message: 'Preveč poskusov prijave. Poskusite ponovno kasneje.', type: 'error' };
    } else {
      return { success: false, message: 'Napaka pri prijavi: ' + error.message, type: 'error' };
    }
  }
};

export const resetPassword = async (email: string): Promise<AuthResult> => {
  if (!email) {
    return { success: false, message: 'Vnesite e-mail naslov.', type: 'error' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Prosimo, vnesite veljaven e-mail naslov.', type: 'error' };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      message: 'Email za ponastavitev gesla je bil poslan. Preverite svoj email.',
      type: 'success'
    };
  } catch (error: any) {
    console.error("Napaka pri ponastavitvi gesla:", error);
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'Uporabnik s tem e-mail naslovom ne obstaja.', type: 'error' };
    } else {
      return { success: false, message: 'Napaka: ' + error.message, type: 'error' };
    }
  }
};
