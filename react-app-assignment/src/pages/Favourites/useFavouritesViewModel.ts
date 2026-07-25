import { useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { deleteFavourite, loadFavourites } from './FavouritesModel'
import type { Movie } from '../../types/movie'

export interface FavouritesViewModel {
  favourites: Movie[]
  loading: boolean
  error: string | null
  removeFromFavourites: (imdbID: string) => Promise<void>
}

export function useFavouritesViewModel(): FavouritesViewModel {
  const [favourites, setFavourites] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthContext()

  useEffect(() => {
    const loadFavouriteMovies = async () => {
      setLoading(true)
      setError(null)

      try {
        const nextFavourites = user?.uid ? await loadFavourites(user.uid) : []
        setFavourites(nextFavourites)
      } catch (err) {
        const readableError =
          err instanceof Error ? err.message : 'Unable to load favourites right now.'
        setError(readableError)
      } finally {
        setLoading(false)
      }
    }

    void loadFavouriteMovies()
  }, [user?.uid])

  const removeFromFavourites = async (imdbID: string) => {
    try {
      if (!user?.uid) {
        throw new Error('A userId is required to remove a favourite.')
      }

      await deleteFavourite(user.uid, imdbID)
      setFavourites((currentFavourites) =>
        currentFavourites.filter((movie) => movie.imdbID !== imdbID),
      )
    } catch (err) {
      const readableError =
        err instanceof Error ? err.message : 'Unable to remove this favourite right now.'
      setError(readableError)
    }
  }

  return {
    favourites,
    loading,
    error,
    removeFromFavourites,
  }
}
