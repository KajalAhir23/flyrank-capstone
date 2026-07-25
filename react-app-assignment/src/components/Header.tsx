import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { searchMovies } from '../services/omdbMovieService'
import './Header.css'

function Header() {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    const query = searchInputRef.current?.value.trim() ?? ''
    console.log('[Header] Search clicked, query:', query)

    if (!query) {
      console.warn('[Header] Empty search query')
      return
    }

    try {
      const movies = await searchMovies(query)
      console.log('[Header] Search succeeded:', movies)
    } catch (error) {
      console.error('[Header] Search failed:', error)
    }
  }

  return (
    <header className="header">
      <nav className="header__nav" aria-label="Main navigation">
        <NavLink
          className={({ isActive }) =>
            `header__link${isActive ? ' header__link--active' : ''}`
          }
          to="/"
        >
          Home
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `header__link${isActive ? ' header__link--active' : ''}`
          }
          to="/favourites"
        >
          Favourites
        </NavLink>
      </nav>

      <div className="header__search">
        <input
          ref={searchInputRef}
          className="header__search-input"
          type="search"
          placeholder="Search movies..."
          aria-label="Search movies"
        />
        <button
          className="header__search-button"
          type="button"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </header>
  )
}

export default Header
