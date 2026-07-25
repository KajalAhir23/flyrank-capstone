import MovieCard from '../../components/MovieCard/MovieCard'
import { useHomeViewModel, type HomeViewModel } from './useHomeViewModel'

interface HomeViewProps {
  viewModel?: HomeViewModel
}

function HomeView({ viewModel }: HomeViewProps) {
  const fallbackViewModel = useHomeViewModel()
  const activeViewModel = viewModel ?? fallbackViewModel
  const { movies, loading, error, favouriteIds, handleFavouriteClick } = activeViewModel

  return (
    <main>
      {loading && <p>Loading movies...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && movies.length === 0 && <p>No movies found.</p>}

      <section className="movie-grid" aria-label="Movie list">
        {movies.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            isFavourite={favouriteIds.includes(movie.imdbID)}
            onFavourite={() => handleFavouriteClick(movie)}
          />
        ))}
      </section>
    </main>
  )
}

export default HomeView
