import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { get, getDatabase, ref, remove, set } from 'firebase/database'
import type { Movie } from '../types/movie'

const FIREBASE_STORAGE_KEY = 'movie-favourites'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const firebaseDatabase = app ? getDatabase(app) : null

export function getFirebaseConfig() {
  return firebaseConfig
}

function getStorageKey(userId: string): string {
  if (!userId?.trim()) {
    throw new Error('A userId is required to access favourites.')
  }
  return `${FIREBASE_STORAGE_KEY}-${userId}`
}

function getStoredFavourites(userId: string): Movie[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(getStorageKey(userId))
    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue) as Movie[]
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function persistStoredFavourites(userId: string, favourites: Movie[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(favourites))
}

export async function addFavourite(userId: string, movie: Movie): Promise<void> {
  if (!userId?.trim()) {
    throw new Error('A userId is required to save a favourite.')
  }

  if (!movie?.imdbID) {
    throw new Error('A movie with an imdbID is required to save a favourite.')
  }

  const nextFavourites = [
    ...getStoredFavourites(userId).filter((favourite) => favourite.imdbID !== movie.imdbID),
    movie,
  ]
  persistStoredFavourites(userId, nextFavourites)

  if (!firebaseDatabase) {
    return
  }

  try {
    const favouriteRef = ref(firebaseDatabase, `users/${userId}/favourites/${movie.imdbID}`)
    await set(favouriteRef, movie)
  } catch (error) {
    console.warn('Falling back to local storage for favourites.', error)
  }
}

export async function removeFavourite(userId: string, imdbID: string): Promise<void> {
  if (!userId?.trim()) {
    throw new Error('A userId is required to remove a favourite.')
  }

  if (!imdbID) {
    throw new Error('An imdbID is required to remove a favourite.')
  }

  const nextFavourites = getStoredFavourites(userId).filter(
    (favourite) => favourite.imdbID !== imdbID,
  )
  persistStoredFavourites(userId, nextFavourites)

  if (!firebaseDatabase) {
    return
  }

  try {
    const favouriteRef = ref(firebaseDatabase, `users/${userId}/favourites/${imdbID}`)
    await remove(favouriteRef)
  } catch (error) {
    console.warn('Falling back to local storage for favourites removal.', error)
  }
}

export async function getFavourites(userId: string): Promise<Movie[]> {
  if (!userId?.trim()) {
    throw new Error('A userId is required to load favourites.')
  }

  if (firebaseDatabase) {
    try {
      const favouritesRef = ref(firebaseDatabase, `users/${userId}/favourites`)
      const favouritesSnapshot = await get(favouritesRef)
      const favourites = favouritesSnapshot.exists()
        ? Object.values(favouritesSnapshot.val() as Record<string, Movie>)
        : []
      persistStoredFavourites(userId, favourites)
      return favourites
    } catch (error) {
      console.warn('Unable to load Realtime Database favourites, using local storage fallback.', error)
    }
  }

  return getStoredFavourites(userId)
}
