import {
  addFavourite as addFavouriteService,
  getFavourites as getFavouritesService,
  removeFavourite as removeFavouriteService,
} from '../../services/firebaseService'
import type { Movie } from '../../types/movie'

export async function loadFavourites(userId: string): Promise<Movie[]> {
  return getFavouritesService(userId)
}

export async function addFavourite(userId: string, movie: Movie): Promise<void> {
  return addFavouriteService(userId, movie)
}

export async function deleteFavourite(userId: string, imdbID: string): Promise<void> {
  return removeFavouriteService(userId, imdbID)
}

export const FavouritesModel = {
  loadFavourites,
  addFavourite,
  deleteFavourite,
}
