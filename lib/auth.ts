import { FirebaseError } from 'firebase/app';
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as FirebaseError };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function getAuthToken() {
  try {
    const token = await auth.currentUser?.getIdToken(true);
    return { token, error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function sendAuthPasswordResetEmail(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function confirmAuthPasswordReset(codeParam: string, password: string) {
  try {
    await confirmPasswordReset(auth, codeParam, password);
    return { error: null };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}
