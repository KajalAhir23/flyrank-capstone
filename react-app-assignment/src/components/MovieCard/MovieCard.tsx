import type { Movie } from '../../types/movie'
import './MovieCard.css'

interface MovieCardProps {
  movie: Movie
  isFavourite?: boolean
  onFavourite?: () => void
}

function MovieCard({ movie, isFavourite = false, onFavourite }: MovieCardProps) {
  return (
    <article className="movie-card">
      <button className="movie-card__favorite" type="button" onClick={onFavourite}>
        <span aria-hidden="true">{isFavourite ? '♥' : '♡'}</span>
        <span>{isFavourite ? 'Saved' : 'Favourite'}</span>
      </button>
      <img className="movie-card__poster" src={movie.Poster} alt={movie.Title} />
      <div className="movie-card__content">
        <h2 className="movie-card__title">{movie.Title}</h2>
        <p className="movie-card__meta">{movie.Year}</p>
        <p className="movie-card__meta">{movie.Type}</p>
      </div>
    </article>
  )
}

export default MovieCard
