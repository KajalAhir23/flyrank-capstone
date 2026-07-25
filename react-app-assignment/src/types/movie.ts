export interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

export interface OmdbSearchResponse {
  Search?: Movie[]
  totalResults?: string
  Response: 'True' | 'False'
  Error?: string
}
