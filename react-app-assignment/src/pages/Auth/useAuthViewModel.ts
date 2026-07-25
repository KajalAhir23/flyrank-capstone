import { useState } from 'react'
import { createAuthModel, type AuthModel } from '../../types/auth'
import { login, register } from '../../services/authActions'

const AuthMode = {
  login: 'login',
  register: 'register',
} as const

type AuthModeType = (typeof AuthMode)[keyof typeof AuthMode]

export interface AuthViewModel {
  email: string
  password: string
  mode: AuthModeType
  loading: boolean
  error: string | null
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  handleSubmit: () => Promise<void>
  toggleMode: () => void
}

export function useAuthViewModel(): AuthViewModel {
  const [model, setModel] = useState<AuthModel>(createAuthModel())
  const [mode, setMode] = useState<AuthModeType>(AuthMode.login)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setEmail = (email: string) => {
    setModel((current) => ({ ...current, email }))
  }

  const setPassword = (password: string) => {
    setModel((current) => ({ ...current, password }))
  }

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      if (mode === AuthMode.login) {
        await login(model.email, model.password)
      } else {
        await register(model.email, model.password)
      }

      setModel((current) => ({ ...current, password: '' }))
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected authentication error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setError(null)
    setMode((current) =>
      current === AuthMode.login ? AuthMode.register : AuthMode.login,
    )
  }

  return {
    email: model.email,
    password: model.password,
    mode,
    loading,
    error,
    setEmail,
    setPassword,
    handleSubmit,
    toggleMode,
  }
}
