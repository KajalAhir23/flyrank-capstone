import { type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import FavouritesView from './pages/Favourites/FavouritesView'
import HomeView from './pages/Home/HomeView'
import AuthView from './pages/Auth/AuthView'
import { useHomeViewModel } from './pages/Home/useHomeViewModel'
import { useAuthContext } from './context/AuthContext'

function AuthRoute() {
  const { user, authLoading } = useAuthContext()

  if (authLoading) {
    return <div>Loading authentication...</div>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <AuthView />
}

function ProtectedRoute({ element }: { element: ReactElement }) {
  const { user, authLoading } = useAuthContext()

  if (authLoading) {
    return <div>Loading authentication...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return element
}

function AppContent() {
  const homeViewModel = useHomeViewModel()
  const { user, logout } = useAuthContext()

  return (
    <>
      <Header
        query={homeViewModel.query}
        setQuery={homeViewModel.setQuery}
        onSearch={homeViewModel.handleSearch}
        user={user}
        onLogout={logout}
      />

      <Routes>
        <Route path="/" element={<HomeView viewModel={homeViewModel} />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/favourites"
          element={<ProtectedRoute element={<FavouritesView />} />}
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
