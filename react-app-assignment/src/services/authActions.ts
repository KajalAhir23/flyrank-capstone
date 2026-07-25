import type { User } from 'firebase/auth'
import { loginUser, logoutUser, registerUser } from './authService'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function validateCredentials(email: string, password: string): void {
  if (!email) {
    throw new Error('Email is required.')
  }

  if (!password) {
    throw new Error('Password is required.')
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.')
  }
}

export async function register(email: string, password: string): Promise<User> {
  const normalizedEmail = normalizeEmail(email)
  validateCredentials(normalizedEmail, password)
  return registerUser(normalizedEmail, password)
}

export async function login(email: string, password: string): Promise<User> {
  const normalizedEmail = normalizeEmail(email)
  validateCredentials(normalizedEmail, password)
  return loginUser(normalizedEmail, password)
}

export async function logout(): Promise<void> {
  return logoutUser()
}
