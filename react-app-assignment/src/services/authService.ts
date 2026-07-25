import { auth } from './firebaseService'
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown authentication error occurred.'
  }

  if ('code' in error) {
    switch ((error as { code: string }).code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please use another email or log in instead.'
      case 'auth/invalid-email':
        return 'The email address is not valid. Please enter a valid email.'
      case 'auth/operation-not-allowed':
        return 'Authentication is temporarily unavailable. Please try again later.'
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a stronger password.'
      case 'auth/user-disabled':
        return 'This user account has been disabled.'
      case 'auth/user-not-found':
        return 'No account found with that email address.'
      case 'auth/wrong-password':
        return 'The password is incorrect. Please try again.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.'
      default:
        return error.message || 'An authentication error occurred. Please try again.'
    }
  }

  return error.message
}

export async function registerUser(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase authentication has not been initialized.')
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase authentication has not been initialized.')
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase authentication has not been initialized.')
  }

  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null)
    return () => undefined
  }

  const unsubscribe = onAuthStateChanged(auth, callback)
  return unsubscribe
}
