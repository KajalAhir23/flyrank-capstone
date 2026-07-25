import type { Movie, OmdbSearchResponse } from '../types/movie'

const API_URL = 'https://www.omdbapi.com/'

export async function searchMovies(query: string): Promise<Movie[]> {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY

  console.log('[omdbMovieService] searchMovies called with query:', query)

  if (!apiKey) {
    console.error('[omdbMovieService] VITE_OMDB_API_KEY is not configured')
    throw new Error('OMDb API key is not configured.')
  }

  const url = `${API_URL}?apikey=${encodeURIComponent(apiKey)}&s=${encodeURIComponent(query)}`
  console.log('[omdbMovieService] Fetching:', `${API_URL}?apikey=***&s=${encodeURIComponent(query)}`)

  const response = await fetch(url)

  if (!response.ok) {
    console.error(
      '[omdbMovieService] HTTP error:',
      response.status,
      response.statusText,
    )
    throw new Error(
      `Failed to search movies: HTTP ${response.status} ${response.statusText}`,
    )
  }

  const data: OmdbSearchResponse = await response.json()
  console.log('[omdbMovieService] Response:', data)

  if (data.Response === 'False') {
    console.error('[omdbMovieService] OMDb error:', data.Error)
    throw new Error(data.Error ?? 'Failed to search movies.')
  }

  const movies = data.Search ?? []
  console.log('[omdbMovieService] Returning movies:', movies.length, movies)

  return movies
}
