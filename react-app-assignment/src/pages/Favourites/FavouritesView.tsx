import MovieCard from '../../components/MovieCard/MovieCard'
import { useFavouritesViewModel } from './useFavouritesViewModel'
import './FavouritesView.css'

function FavouritesView() {
  const { favourites, loading, error, removeFromFavourites } = useFavouritesViewModel()

  return (
    <main className="favourites-page">
      <div className="favourites-page__header">
        <h1 className="favourites-page__title">My Favourites</h1>
      </div>

      {loading && <p className="favourites-page__state">Loading favourites...</p>}
      {error && (
        <p className="favourites-page__state" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && favourites.length === 0 && (
        <p className="favourites-page__state">No favourites yet</p>
      )}

      <section className="movie-grid favourites-page__grid" aria-label="Favourites list">
        {favourites.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            isFavourite
            onFavourite={() => void removeFromFavourites(movie.imdbID)}
          />
        ))}
      </section>
    </main>
  )
}

export default FavouritesView
