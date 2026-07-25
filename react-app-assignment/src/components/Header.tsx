import { useRef, type KeyboardEvent } from 'react'
import { NavLink } from 'react-router-dom'
import type { User } from 'firebase/auth'
import './Header.css'

interface HeaderProps {
  query: string
  setQuery: (value: string) => void
  onSearch: (nextQuery?: string) => Promise<void>
  user: User | null
  onLogout: () => Promise<void>
}

function Header({ query, setQuery, onSearch, user, onLogout }: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    const nextQuery = searchInputRef.current?.value.trim() ?? ''
    setQuery(nextQuery)
    void onSearch(nextQuery)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
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
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="header__search-button"
          type="button"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {user && (
        <div className="header__actions">
          <button
            className="header__logout-button"
            type="button"
            onClick={() => void onLogout()}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
