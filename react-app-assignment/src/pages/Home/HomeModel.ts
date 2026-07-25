import { searchMovies } from '../../services/omdbMovieService'
import type { Movie } from '../../types/movie'

const INITIAL_SEED_KEYWORDS = [
  'Batman',
  'Avengers',
  'Harry Potter',
  'Star Wars',
  'Spider-Man',
  'Marvel',
  'Disney',
  'Matrix',
  'Lord of the Rings',
  'Fast',
  'Mission Impossible',
  'Pixar',
  'Horror',
  'Comedy',
  'Action',
]

function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const temp = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = temp
  }

  return shuffled
}

function deduplicateMovies(movies: Movie[]): Movie[] {
  const uniqueMovies = new Map<string, Movie>()

  movies.forEach((movie) => {
    if (movie.imdbID && !uniqueMovies.has(movie.imdbID)) {
      uniqueMovies.set(movie.imdbID, movie)
    }
  })

  return Array.from(uniqueMovies.values())
}

export async function getMovies(query: string): Promise<Movie[]> {
  const cleanedQuery = query.trim()

  if (cleanedQuery.length < 2) {
    throw new Error('Please enter at least two characters to search.')
  }

  return searchMovies(cleanedQuery)
}

export async function initialMovies(): Promise<Movie[]> {
  const shuffledKeywords = shuffleItems(INITIAL_SEED_KEYWORDS)
  const keywordBatch = shuffledKeywords.slice(0, 6)
  const requests = keywordBatch.map((keyword) => searchMovies(keyword).catch(() => []))
  const results = await Promise.all(requests)
  let mergedMovies = deduplicateMovies(results.flat())

  if (mergedMovies.length < 20) {
    const extraKeywords = shuffledKeywords.slice(6, 12)
    const extraRequests = extraKeywords.map((keyword) => searchMovies(keyword).catch(() => []))
    const extraResults = await Promise.all(extraRequests)
    mergedMovies = deduplicateMovies([...mergedMovies, ...extraResults.flat()])
  }

  const shuffledMovies = shuffleItems(mergedMovies)
  return shuffledMovies.slice(0, 20)
}

export const HomeModel = {
  getMovies,
  initialMovies,
}
