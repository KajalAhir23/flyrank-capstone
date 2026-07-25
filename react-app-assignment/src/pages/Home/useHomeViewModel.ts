import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies, initialMovies } from './HomeModel'
import { addFavourite, deleteFavourite, loadFavourites } from '../Favourites/FavouritesModel'
import { useAuthContext } from '../../context/AuthContext'
import type { Movie } from '../../types/movie'

export interface HomeViewModel {
  query: string
  setQuery: (value: string) => void
  movies: Movie[]
  loading: boolean
  error: string | null
  favouriteIds: string[]
  handleSearch: (nextQuery?: string) => Promise<void>
  toggleFavourite: (movie: Movie) => Promise<void>
  handleFavouriteClick: (movie: Movie) => Promise<void>
}

export function useHomeViewModel(): HomeViewModel {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favouriteIds, setFavouriteIds] = useState<string[]>([])

  const loadMovies = async (nextQuery: string) => {
    setLoading(true)
    setError(null)

    try {
      const nextMovies = await getMovies(nextQuery)
      setMovies(nextMovies)
    } catch (err) {
      const readableError =
        err instanceof Error ? err.message : 'Unable to load movies right now.'
      setMovies([])
      setError(readableError)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (nextQuery?: string) => {
    const activeQuery = nextQuery ?? query
    await loadMovies(activeQuery)
  }

  const userId = user?.uid

  const toggleFavourite = async (movie: Movie) => {
    if (!userId) {
      throw new Error('A userId is required to toggle favourites.')
    }

    if (favouriteIds.includes(movie.imdbID)) {
      await deleteFavourite(userId, movie.imdbID)
      setFavouriteIds((currentFavouriteIds) =>
        currentFavouriteIds.filter((favouriteId) => favouriteId !== movie.imdbID),
      )
      return
    }

    await addFavourite(userId, movie)
    setFavouriteIds((currentFavouriteIds) => [...currentFavouriteIds, movie.imdbID])
  }

  const handleFavouriteClick = async (movie: Movie) => {
    if (!user) {
      navigate('/auth')
      return
    }

    await toggleFavourite(movie)
  }

  useEffect(() => {
    const loadInitialResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const [nextMovies, favourites] = await Promise.all([
          initialMovies(),
          userId ? loadFavourites(userId) : Promise.resolve([]),
        ])
        setMovies(nextMovies)
        setFavouriteIds(favourites.map((favourite) => favourite.imdbID))
      } catch (err) {
        const readableError =
          err instanceof Error ? err.message : 'Unable to load featured movies right now.'
        setError(readableError)
      } finally {
        setLoading(false)
      }
    }

    void loadInitialResults()
  }, [userId])

  return {
    query,
    setQuery,
    movies,
    loading,
    error,
    favouriteIds,
    handleSearch,
    toggleFavourite,
    handleFavouriteClick,
  }
}
