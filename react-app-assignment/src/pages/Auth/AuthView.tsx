import { useAuthViewModel } from './useAuthViewModel'
import './AuthView.css'

function AuthView() {
  const {
    email,
    password,
    mode,
    loading,
    error,
    setEmail,
    setPassword,
    handleSubmit,
    toggleMode,
  } = useAuthViewModel()

  return (
    <main className="auth-page">
      <header className="auth-page__header">
        <h1 className="auth-page__title">{mode === 'login' ? 'Login' : 'Create account'}</h1>
      </header>

      <form
        className="auth-page__form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
      >
        <div className="auth-page__field">
          <label className="auth-page__label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="auth-page__input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="auth-page__field">
          <label className="auth-page__label" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
            className="auth-page__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="auth-page__error" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <button className="auth-page__submit" type="submit" disabled={loading}>
          {loading
            ? 'Submitting…'
            : mode === 'login'
            ? 'Login'
            : 'Create account'}
        </button>
      </form>

      <button
        className="auth-page__toggle"
        type="button"
        onClick={toggleMode}
        disabled={loading}
      >
        {mode === 'login'
          ? 'Need an account? Create one'
          : 'Already have an account? Login'}
      </button>
    </main>
  )
}

export default AuthView
